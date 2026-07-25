import {supabase} from './supabase';
import {FamilyProfile} from './types';

interface FamilyRow{id:string;name:string;location:string|null;adults:number;children:number;meals_to_plan:FamilyProfile['mealsToPlan'];budget_level:FamilyProfile['budgetLevel'];cooking_time_preference:FamilyProfile['cookingTimePreference']}
function toProfile(row:FamilyRow):FamilyProfile{return{id:row.id,name:row.name,location:row.location??'',adults:row.adults,children:row.children,mealsToPlan:row.meals_to_plan,budgetLevel:row.budget_level,cookingTimePreference:row.cooking_time_preference}}

export async function loadFamilyProfile():Promise<FamilyProfile|undefined>{
 if(!supabase)return;
 const {data,error}=await supabase.from('family_members').select('family:families(id,name,location,adults,children,meals_to_plan,budget_level,cooking_time_preference)').limit(1).maybeSingle();
 if(error)throw error;
 const family=(data as unknown as {family?:FamilyRow|null}|null)?.family;
 return family?toProfile(family):undefined;
}

export async function syncFamilyProfile(profile:FamilyProfile):Promise<FamilyProfile|undefined>{
 if(!supabase)return;
 const {data,error}=await supabase.rpc('upsert_family_profile',{profile_name:profile.name,profile_location:profile.location,profile_adults:profile.adults,profile_children:profile.children,profile_meals_to_plan:profile.mealsToPlan,profile_budget_level:profile.budgetLevel,profile_cooking_time_preference:profile.cookingTimePreference});
 if(error)throw error;
 return toProfile(data as FamilyRow);
}
