import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const sourcePath=resolve('src/ready-made-expansion-2.ts');
const outputPath=resolve('supabase/migrations/202607280013_expand_ready_made_breakfasts_2.sql');
const source=readFileSync(sourcePath,'utf8');
const seedLines=source.split(/\r?\n/)
 .map(line=>line.trim())
 .filter(line=>line.startsWith("{id:'buy-")&&line.endsWith('},'));
const seeds=seedLines.map(line=>Function(`"use strict";return (${line.slice(0,-1)});`)());

if(seeds.length!==100)throw new Error(`Expected 100 seeds, found ${seeds.length}. Keep each seed on one line.`);
if(new Set(seeds.map(seed=>seed.id)).size!==seeds.length)throw new Error('Duplicate ready-made seed id.');

const nutritionProfiles={
 noodle:{caloriesKcal:510,proteinGrams:27,carbsGrams:65,fatGrams:16,fiberGrams:5,sodiumMg:1050},
 porridge:{caloriesKcal:390,proteinGrams:22,carbsGrams:50,fatGrams:11,fiberGrams:3,sodiumMg:760},
 bread:{caloriesKcal:480,proteinGrams:22,carbsGrams:58,fatGrams:18,fiberGrams:4,sodiumMg:850},
 sticky:{caloriesKcal:470,proteinGrams:14,carbsGrams:76,fatGrams:13,fiberGrams:5,sodiumMg:400},
 rice:{caloriesKcal:560,proteinGrams:26,carbsGrams:72,fatGrams:19,fiberGrams:5,sodiumMg:850},
 'savory-cake':{caloriesKcal:390,proteinGrams:15,carbsGrams:55,fatGrams:13,fiberGrams:3,sodiumMg:720},
 sweet:{caloriesKcal:350,proteinGrams:8,carbsGrams:59,fatGrams:10,fiberGrams:3,sodiumMg:220},
};
const quote=value=>`'${String(value).replaceAll("'","''")}'`;
const textArray=values=>`array[${values.map(quote).join(',')}]`;
const rows=seeds.map((seed,index)=>{
 const nutrition={...nutritionProfiles[seed.profile],perServing:true,estimateMethod:'editorial_serving_profile'};
 return ` (${[
  quote(seed.id),quote(seed.title),quote(seed.summary),textArray(seed.sideDishes),
  seed.minutes,seed.price,textArray(['ready-made',...seed.tags]),
  `${quote(JSON.stringify(nutrition))}::jsonb`,95-(index%21),
 ].join(',')})`;
});

const sql=`-- Generated from src/ready-made-expansion-2.ts. Do not edit rows manually.
with seed(id,title,summary,side_dishes,minutes,price,tags,nutrition,popularity) as(values
${rows.join(',\n')}
)
insert into public.meals(
 id,type,title,summary,side_dishes,image_path,image_url,cooking_time_minutes,estimated_cost,servings,
 missing_ingredients,tags,active,slug,cuisine,difficulty,nutrition,content_status,
 source_type,source_name,content_license,popularity_score,content_version,
 meal_source,purchase_time_minutes,price_per_serving
)
select
 seed.id,'breakfast',seed.title,seed.summary,seed.side_dishes,
 'ready-made/'||seed.id||'.webp',null,seed.minutes,seed.price*4,4,
 '{}',seed.tags,true,seed.id,'vietnamese','easy',seed.nutrition,
 'published','editorial','Daily Meals Việt Nam','internal-use',seed.popularity,2,
 'ready_made',seed.minutes,seed.price
from seed
on conflict(id) do update set
 title=excluded.title,summary=excluded.summary,side_dishes=excluded.side_dishes,
 image_path=excluded.image_path,image_url=null,cooking_time_minutes=excluded.cooking_time_minutes,
 estimated_cost=excluded.estimated_cost,servings=excluded.servings,missing_ingredients='{}',
 tags=excluded.tags,nutrition=excluded.nutrition,popularity_score=excluded.popularity_score,
 content_version=excluded.content_version,meal_source='ready_made',
 purchase_time_minutes=excluded.purchase_time_minutes,price_per_serving=excluded.price_per_serving,
 active=true,content_status='published',updated_at=now();

delete from public.recipe_ingredients as ingredient
using public.meals as meal
where ingredient.meal_id=meal.id and meal.meal_source='ready_made';

delete from public.recipe_steps as step
using public.meals as meal
where step.meal_id=meal.id and meal.meal_source='ready_made';
`;

writeFileSync(outputPath,sql,'utf8');
console.log(`Generated ${outputPath} with ${seeds.length} meals.`);
