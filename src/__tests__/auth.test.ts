import * as WebBrowser from 'expo-web-browser';
import {useAuthStore} from '../auth';
import {supabase} from '../supabase';

jest.mock('expo-crypto',()=>({randomUUID:()=> 'local-installation'}));
jest.mock('expo-secure-store',()=>({WHEN_UNLOCKED_THIS_DEVICE_ONLY:'device-only',getItemAsync:jest.fn(),setItemAsync:jest.fn()}));
jest.mock('expo-linking',()=>({createURL:(path:string)=>`dailymeals://${path}`}));
jest.mock('expo-web-browser',()=>({maybeCompleteAuthSession:jest.fn(),openAuthSessionAsync:jest.fn()}));
jest.mock('../supabase',()=>({
 supabase:{auth:{
  getSession:jest.fn(),
  signInAnonymously:jest.fn(),
  getUser:jest.fn(),
  linkIdentity:jest.fn(),
  exchangeCodeForSession:jest.fn(),
  getUserIdentities:jest.fn(),
  signOut:jest.fn(),
 }},
}));

const auth=supabase!.auth;
const guest={id:'same-user-id',is_anonymous:true,user_metadata:{}};
const registered={...guest,is_anonymous:false,user_metadata:{full_name:'Minh'}};

describe('Google account linking',()=>{
 beforeEach(()=>{
  jest.clearAllMocks();
  useAuthStore.setState({status:'guest',account:{id:guest.id,type:'guest'},installationId:guest.id,devices:[],error:undefined});
  (auth.getUser as jest.Mock).mockResolvedValue({data:{user:guest},error:null});
  (auth.linkIdentity as jest.Mock).mockResolvedValue({data:{url:'https://accounts.google.test/oauth'},error:null});
 });

 it('does not report success when the user closes Google',async()=>{
  (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({type:'cancel'});
  await expect(useAuthStore.getState().linkProvider('google')).resolves.toBe(false);
  expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
  expect(useAuthStore.getState().status).toBe('guest');
 });

 it('keeps the same user id after linking Google',async()=>{
  (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({type:'success',url:'dailymeals://auth/callback?code=pkce-code'});
  (auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({data:{user:registered,session:{}},error:null});
  (auth.getUserIdentities as jest.Mock).mockResolvedValue({data:{identities:[{provider:'google'}]},error:null});
  await expect(useAuthStore.getState().linkProvider('google')).resolves.toBe(true);
  expect(auth.exchangeCodeForSession).toHaveBeenCalledWith('pkce-code');
  expect(useAuthStore.getState()).toMatchObject({status:'registered',installationId:guest.id,account:{id:guest.id,type:'registered',displayName:'Minh'}});
 });

 it('rejects a callback that changes ownership of the local data',async()=>{
  (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({type:'success',url:'dailymeals://auth/callback?code=pkce-code'});
  (auth.exchangeCodeForSession as jest.Mock).mockResolvedValue({data:{user:{...registered,id:'different-user-id'},session:{}},error:null});
  await expect(useAuthStore.getState().linkProvider('google')).rejects.toThrow('không khớp với dữ liệu hiện tại');
  expect(auth.getUserIdentities).not.toHaveBeenCalled();
  expect(useAuthStore.getState().status).toBe('guest');
 });
});
