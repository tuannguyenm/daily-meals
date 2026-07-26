import {readCatalog,validateCatalog} from './catalog-lib.mjs';

const input=process.argv[2];
if(!input){
 console.error('Usage: npm run catalog:validate -- path/to/catalog.json');
 process.exit(1);
}

try{
 const {absolute,catalog}=readCatalog(input);
 const errors=validateCatalog(catalog,absolute);
 if(errors.length){
  console.error(`Catalog không hợp lệ (${errors.length} lỗi):`);
  errors.forEach(error=>console.error(`- ${error}`));
  process.exit(1);
 }
 console.log(`Catalog hợp lệ: ${catalog.meals.length} món (${absolute})`);
}catch(error){
 console.error(error instanceof Error?error.message:String(error));
 process.exit(1);
}
