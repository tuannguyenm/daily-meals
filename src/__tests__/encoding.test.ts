import fs from 'node:fs';
import path from 'node:path';

const roots=['app','src','supabase'];
const extensions=new Set(['.ts','.tsx','.sql','.md','.json','.toml']);
const mojibake=/[\u00c2\u00c3\ufffd]|\u00c4[\u0080-\u00bf]|\u00e1[\u00ba\u00bb]/;

function sourceFiles(root:string):string[]{
 return fs.readdirSync(root,{withFileTypes:true}).flatMap(entry=>{
  const file=path.join(root,entry.name);
  if(entry.isDirectory())return sourceFiles(file);
  return extensions.has(path.extname(entry.name))?[file]:[];
 });
}

describe('Vietnamese source encoding',()=>{
 it('keeps all source and Supabase files valid UTF-8 without mojibake',()=>{
  const invalid=roots.flatMap(sourceFiles).filter(file=>mojibake.test(fs.readFileSync(file,'utf8')));
  expect(invalid).toEqual([]);
 });
});
