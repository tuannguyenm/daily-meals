import {Redirect} from 'expo-router';
import {useEffect,useState} from 'react';
import {useAppStore} from '../src/store';
export default function Index(){const completed=useAppStore(state=>state.onboardingCompleted),family=useAppStore(state=>state.family),[hydrated,setHydrated]=useState(useAppStore.persist.hasHydrated());useEffect(()=>useAppStore.persist.onFinishHydration(()=>setHydrated(true)),[]);if(!hydrated)return null;return <Redirect href={completed||family?'/tabs/ai':'/onboarding/welcome'}/>}
