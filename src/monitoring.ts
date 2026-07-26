import * as Sentry from '@sentry/react-native';

const dsn=process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
export const monitoringEnabled=Boolean(dsn);

if(monitoringEnabled){
 Sentry.init({
  dsn,
  environment:__DEV__?'development':'production',
  enableAutoSessionTracking:true,
  tracesSampleRate:__DEV__?0:0.1,
  profilesSampleRate:0,
  sendDefaultPii:false,
  beforeSend(event){
   if(event.user)event.user={id:event.user.id};
   return event;
  },
 });
}

export function captureException(error:unknown,context?:Record<string,unknown>){
 if(!monitoringEnabled)return;
 Sentry.withScope(scope=>{if(context)scope.setContext('daily_meals',context);Sentry.captureException(error)});
}

export function addMonitoringBreadcrumb(message:string,data?:Record<string,string|number|boolean>){
 if(!monitoringEnabled)return;
 Sentry.addBreadcrumb({category:'daily-meals',message,level:'info',data});
}

export function setMonitoringUser(userId?:string){
 if(!monitoringEnabled)return;
 Sentry.setUser(userId?{id:userId}:null);
}

export{Sentry};
