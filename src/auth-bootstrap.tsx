import {PropsWithChildren,useEffect,useRef} from 'react';
import {useAuthStore} from './auth';
import {loadFamilyProfile,syncFamilyProfile} from './backend';
import {useAppStore} from './store';
export function AuthBootstrap({children}:PropsWithChildren){const initialize=useAuthStore(state=>state.initialize),status=useAuthStore(state=>state.status),family=useAppStore(state=>state.family),lastSync=useRef<string|undefined>(undefined);useEffect(()=>{void initialize()},[initialize]);useEffect(()=>{if(status!=='guest'&&status!=='registered')return;let active=true;if(!family){void loadFamilyProfile().then(remote=>{if(active&&remote)useAppStore.setState({family:remote,onboardingCompleted:true})});return()=>{active=false}}if(lastSync.current===family.id)return;lastSync.current=family.id;void syncFamilyProfile(family).then(remote=>{if(active&&remote)useAppStore.setState({family:remote})}).catch(()=>{lastSync.current=undefined});return()=>{active=false}},[family,status]);return children}
