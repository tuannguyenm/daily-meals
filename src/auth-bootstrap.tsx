import {PropsWithChildren,useEffect,useRef} from 'react';
import {useAuthStore} from './auth';
import {isCloudFamilyId,loadFamilyProfile,syncFamilyProfile} from './backend';
import {hydrateCloudData} from './cloud-sync';
import {useAppStore} from './store';
export function AuthBootstrap({children}:PropsWithChildren){
 const initialize=useAuthStore(state=>state.initialize),status=useAuthStore(state=>state.status),family=useAppStore(state=>state.family);
 const lastSync=useRef<string|undefined>(undefined),lastHydrated=useRef<string|undefined>(undefined);
 useEffect(()=>{void initialize()},[initialize]);
 useEffect(()=>{
  if(status!=='guest'&&status!=='registered')return;
  let active=true;
  if(!family){
   void loadFamilyProfile().then(remote=>{if(active&&remote)useAppStore.setState({family:remote,onboardingCompleted:true})}).catch(()=>useAppStore.getState().setCloudStatus('offline','Không thể tải thông tin gia đình.'));
   return()=>{active=false};
  }
  if(lastSync.current===family.id)return;
  lastSync.current=family.id;
  void syncFamilyProfile(family).then(remote=>{if(active&&remote)useAppStore.setState({family:remote})}).catch(()=>{lastSync.current=undefined;useAppStore.getState().setCloudStatus('offline','Không thể đồng bộ thông tin gia đình.')});
  return()=>{active=false};
 },[family,status]);
 useEffect(()=>{
  const familyId=family?.id;
  if((status!=='guest'&&status!=='registered')||!isCloudFamilyId(familyId)||lastHydrated.current===familyId)return;
  lastHydrated.current=familyId;
  void hydrateCloudData(familyId).catch(()=>{lastHydrated.current=undefined});
 },[family?.id,status]);
 return children;
}
