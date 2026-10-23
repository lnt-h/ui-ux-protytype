'use strict';
// Rebuild the handoff inventory without depending on the caller's directory.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const destination='evidence/bundle-manifest.json';
const manifest={};
function visit(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    if(['.git','.DS_Store','node_modules'].includes(entry.name))continue;
    const absolute=path.join(directory,entry.name);
    if(entry.isDirectory()){visit(absolute);continue;}
    const relative=path.relative(root,absolute).split(path.sep).join('/');
    if(relative===destination||!entry.isFile())continue;
    const bytes=fs.readFileSync(absolute);
    manifest[relative]={bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  }
}
visit(root);
fs.writeFileSync(path.join(root,destination),JSON.stringify(manifest,null,2)+'\n');
console.log(`Inventoried ${Object.keys(manifest).length} files.`);
