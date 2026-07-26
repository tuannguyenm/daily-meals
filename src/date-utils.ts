export function localDateKey(date=new Date()){
 const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,'0'),day=String(date.getDate()).padStart(2,'0');
 return`${year}-${month}-${day}`;
}

export function dateFromKey(value:string){
 const [year,month,day]=value.split('-').map(Number);
 return new Date(year,month-1,day,12);
}

export function addDays(value:string|Date,days:number){
 const date=typeof value==='string'?dateFromKey(value):new Date(value);
 date.setDate(date.getDate()+days);
 return localDateKey(date);
}

export function startOfWeek(value:string|Date=new Date()){
 const date=typeof value==='string'?dateFromKey(value):new Date(value);
 const offset=(date.getDay()+6)%7;
 date.setDate(date.getDate()-offset);
 return localDateKey(date);
}

export function weekDateKeys(value:string|Date=new Date()){
 const start=startOfWeek(value);
 return Array.from({length:7},(_,index)=>addDays(start,index));
}
