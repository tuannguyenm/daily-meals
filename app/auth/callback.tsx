import {router,useLocalSearchParams} from 'expo-router';
import {useEffect,useRef} from 'react';
import {ActivityIndicator,StyleSheet,Text,View} from 'react-native';
import {Button,Screen} from '../../src/components';
import {useAuthStore} from '../../src/auth';
import {colors} from '../../src/theme';

function first(value:string|string[]|undefined){return Array.isArray(value)?value[0]:value}

export default function AuthCallback(){
 const params=useLocalSearchParams<{code?:string;error?:string;error_description?:string}>(),complete=useAuthStore(state=>state.completeOAuthRedirect);
 const status=useAuthStore(state=>state.status),error=useAuthStore(state=>state.error),started=useRef(false);
 useEffect(()=>{
  if(started.current)return;
  started.current=true;
  const query=new URLSearchParams();
  for(const key of ['code','error','error_description'] as const){const value=first(params[key]);if(value)query.set(key,value)}
  const url=`dailymeals://auth/callback?${query.toString()}`;
  void complete(url).then(()=>router.replace('/settings')).catch(()=>undefined);
 },[complete,params]);
 const failed=Boolean(error);
 return <Screen><View style={x.container}>{failed?<><Text style={x.title}>Không thể liên kết Google</Text><Text style={x.copy}>{error}</Text><Button title="Quay lại cài đặt" onPress={()=>router.replace('/settings')}/></>:<><ActivityIndicator size="large" color={colors.primary}/><Text style={x.title}>Đang hoàn tất đăng nhập...</Text><Text style={x.copy}>{status==='registered'?'Đã liên kết. Đang quay lại cài đặt.':'Dữ liệu gia đình của bạn đang được giữ nguyên.'}</Text></>}</View></Screen>;
}

const x=StyleSheet.create({container:{flex:1,minHeight:420,alignItems:'center',justifyContent:'center',padding:24,gap:16},title:{fontSize:22,fontWeight:'800',color:colors.primaryDark,textAlign:'center'},copy:{fontSize:14,lineHeight:21,color:colors.muted,textAlign:'center'}});
