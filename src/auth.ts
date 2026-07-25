import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import {Platform} from 'react-native';
import {create} from 'zustand';
import {hasProviderIdentity,OAuthProvider,oauthErrorMessage,parseOAuthRedirect} from './auth-oauth';
import {supabase} from './supabase';

type AccountType='guest'|'registered';
export interface AuthAccount{id:string;type:AccountType;displayName?:string|null}
export interface AuthDevice{id:string;deviceName:string|null;platform:string;lastSeenAt:string;current:boolean}
interface AuthState{
 status:'idle'|'loading'|'guest'|'registered'|'offline'|'error';
 account?:AuthAccount;
 installationId?:string;
 devices:AuthDevice[];
 error?:string;
 initialize:()=>Promise<void>;
 linkProvider:(provider:OAuthProvider)=>Promise<boolean>;
 completeOAuthRedirect:(url:string,provider?:OAuthProvider,expectedUserId?:string)=>Promise<boolean>;
 loadDevices:()=>Promise<void>;
 revokeDevice:(id:string)=>Promise<void>;
 logout:()=>Promise<void>;
}
const localInstallationKey='daily-meals.local-installation-id';

async function readSecure(key:string){if(Platform.OS==='web')return typeof localStorage==='undefined'?null:localStorage.getItem(key);return SecureStore.getItemAsync(key)}
async function writeSecure(key:string,value:string){if(Platform.OS==='web'){localStorage.setItem(key,value);return}await SecureStore.setItemAsync(key,value,{keychainAccessible:SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY})}
async function localInstallationId(){let id=await readSecure(localInstallationKey);if(!id){id=Crypto.randomUUID();await writeSecure(localInstallationKey,id)}return id}
function accountState(user:{id:string;is_anonymous?:boolean;user_metadata?:Record<string,unknown>}):Partial<AuthState>{const type=user.is_anonymous?'guest':'registered';return{status:type,account:{id:user.id,type,displayName:typeof user.user_metadata?.full_name==='string'?user.user_metadata.full_name:null},installationId:user.id,error:undefined}}
function currentDevice(userId:string):AuthDevice{return{id:userId,deviceName:`Daily Meals · ${Platform.OS}`,platform:Platform.OS,lastSeenAt:new Date().toISOString(),current:true}}

WebBrowser.maybeCompleteAuthSession();

export const useAuthStore=create<AuthState>((set,get)=>({
 status:'idle',devices:[],
 initialize:async()=>{
  if(get().status==='loading')return;
  set({status:'loading',error:undefined});
  if(!supabase){const id=await localInstallationId();set({status:'offline',installationId:id,account:{id:`local:${id}`,type:'guest'}});return}
  try{
   let {data:{session},error}=await supabase.auth.getSession();
   if(error)throw error;
   if(!session){const result=await supabase.auth.signInAnonymously();if(result.error)throw result.error;session=result.data.session}
   if(!session?.user)throw new Error('Supabase không tạo được phiên đăng nhập.');
   set({...accountState(session.user),devices:[currentDevice(session.user.id)]});
  }catch(error){set({status:'error',error:error instanceof Error?error.message:'Không thể đăng nhập Supabase.'})}
 },
 completeOAuthRedirect:async(url,provider='google',expectedUserId)=>{
  if(!supabase)throw new Error('Supabase chưa được cấu hình.');
  try{
   const {code}=parseOAuthRedirect(url);
   const exchange=await supabase.auth.exchangeCodeForSession(code);
   if(exchange.error)throw exchange.error;
   const user=exchange.data.user;
   if(!user)throw new Error('Không nhận được tài khoản sau khi xác thực.');
   if(expectedUserId&&user.id!==expectedUserId)throw new Error('Tài khoản trả về không khớp với dữ liệu hiện tại.');
   const identityResult=await supabase.auth.getUserIdentities();
   if(identityResult.error)throw identityResult.error;
   if(!hasProviderIdentity(identityResult.data?.identities??[],provider))throw new Error('Google chưa được liên kết với tài khoản này.');
   set({...accountState(user),devices:[currentDevice(user.id)]});
   return true;
  }catch(reason){
   const message=oauthErrorMessage(reason);
   set({error:message});
   throw new Error(message);
  }
 },
 linkProvider:async provider=>{
  if(!supabase)throw new Error('Supabase chưa được cấu hình.');
  const {data:{user:beforeUser},error:beforeError}=await supabase.auth.getUser();
  if(beforeError)throw beforeError;
  if(!beforeUser)throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng thử lại.');
  const redirectTo=Linking.createURL('auth/callback');
  try{
   set({error:undefined});
   const {data,error}=await supabase.auth.linkIdentity({provider,options:{redirectTo,skipBrowserRedirect:true}});
   if(error)throw error;
   if(!data.url)throw new Error('Không tạo được liên kết đăng nhập.');
   const result=await WebBrowser.openAuthSessionAsync(data.url,redirectTo);
   if(result.type!=='success')return false;
   return get().completeOAuthRedirect(result.url,provider,beforeUser.id);
  }catch(reason){
   const message=oauthErrorMessage(reason);
   set({error:message});
   throw new Error(message);
  }
 },
 loadDevices:async()=>{
  if(!supabase)return;
  const {data:{user}}=await supabase.auth.getUser();
  set({devices:user?[currentDevice(user.id)]:[]});
 },
 revokeDevice:async id=>{if(id===get().installationId)await get().logout()},
 logout:async()=>{
  if(supabase){const {error}=await supabase.auth.signOut();if(error)throw error}
  set({status:'idle',account:undefined,installationId:undefined,devices:[]});
  await get().initialize();
 },
}));
