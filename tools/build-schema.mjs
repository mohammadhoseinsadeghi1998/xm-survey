import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),context);
const s=context.window.SURVEY;
const schema={version:s.version,competencies:s.competencies.map(c=>c.slice(0,2)),challengeLabels:s.challengeLabels,questions:s.questions};
const output='// GENERATED from data.js. Run: node tools/build-schema.mjs\nconst SCHEMA = '+JSON.stringify(schema,null,2)+';\n';
const target=path.join(root,'google-apps-script/Schema.gs');
if(process.argv.includes('--check')) {
  if(fs.readFileSync(target,'utf8')!==output) throw new Error('Schema.gs is stale; run node tools/build-schema.mjs');
  console.log('Schema matches data.js');
} else {
  fs.writeFileSync(target,output);
  console.log('Generated google-apps-script/Schema.gs');
}
