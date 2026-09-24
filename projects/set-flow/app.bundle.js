(()=>{function tn(i,t,e,n,{collisionBox:s=e,clearance:r=0,tags:a=[],visual:o={}}={}){return Object.freeze({type:i,displayName:t,dimensions:Object.freeze({...e}),cost:n,collisionBox:Object.freeze({...s}),clearance:r,tags:Object.freeze([...a]),visual:Object.freeze({...o})})}var fc=Object.freeze({"ambient-light":tn("ambient-light","\u73AF\u5883\u8865\u5149",{width:.18,depth:.18,height:.18},680,{tags:["lighting","overhead"],visual:{primitive:"orb",color:"#83aeb5"}}),backdrop:tn("backdrop","\u80CC\u666F\u677F",{width:2.8,depth:.12,height:2.5},2600,{clearance:.2,tags:["set","surface","locked-candidate"],visual:{primitive:"wall",color:"#809193"}}),camera:tn("camera","\u6444\u5F71\u673A",{width:.34,depth:.54,height:.34},7200,{clearance:.65,tags:["camera","operator-zone"],visual:{primitive:"camera",color:"#d9b85d"}}),"changing-zone-marker":tn("changing-zone-marker","\u6362\u88C5\u533A\u6807\u8BB0",{width:1.1,depth:1.1,height:.04},0,{clearance:.35,tags:["marker","clearance","non-physical"],visual:{primitive:"marker",color:"#748485"}}),"garment-rack":tn("garment-rack","\u670D\u88C5\u9648\u5217\u67B6",{width:1.5,depth:.52,height:1.9},1200,{clearance:.55,tags:["set","wardrobe","clearance"],visual:{primitive:"rack",color:"#aab7b6"}}),"key-light":tn("key-light","\u4E3B\u9762\u5149",{width:.42,depth:.32,height:1.9},3200,{collisionBox:{width:.65,depth:.65,height:1.9},clearance:.45,tags:["lighting","stand"],visual:{primitive:"light",color:"#ffd4a8"}}),"light-stand":tn("light-stand","\u706F\u67B6",{width:.52,depth:.52,height:2.1},860,{clearance:.35,tags:["lighting","stand","tripod"],visual:{primitive:"stand",color:"#748485"}}),"live-table":tn("live-table","\u76F4\u64AD\u684C",{width:1.4,depth:.62,height:.78},1800,{clearance:.45,tags:["furniture","product-surface"],visual:{primitive:"table",color:"#7d8a8b"}}),monitor:tn("monitor","\u8FD4\u770B\u5C4F",{width:.62,depth:.18,height:.42},2400,{clearance:.25,tags:["display","power"],visual:{primitive:"monitor",color:"#5eb8c2"}}),presenter:tn("presenter","\u4E3B\u64AD\u6D3B\u52A8\u533A",{width:.65,depth:.65,height:1.7},0,{collisionBox:{width:.78,depth:.78,height:1.7},clearance:.6,tags:["person","clearance","camera-subject"],visual:{primitive:"presenter",color:"#ffd4a8"}}),"rim-light":tn("rim-light","\u8F6E\u5ED3\u5149",{width:.32,depth:.26,height:1.85},2200,{collisionBox:{width:.55,depth:.55,height:1.85},clearance:.4,tags:["lighting","stand"],visual:{primitive:"light",color:"#b7d9dc"}}),table:tn("table","\u5DE5\u4F5C\u53F0",{width:1.4,depth:.62,height:.78},1800,{clearance:.45,tags:["furniture","product-surface"],visual:{primitive:"table",color:"#7d8a8b"}})});function wo(i){return typeof structuredClone=="function"?structuredClone(i):JSON.parse(JSON.stringify(i))}function Oi(i){let t=fc[i];if(!t)throw new RangeError(`\u672A\u77E5\u8D44\u4EA7\u7C7B\u578B\uFF1A${i}`);return wo(t)}function pc(i,t={}){let e=Oi(i),n=String(t.id||"").trim();if(!n)throw new TypeError("\u65B0\u589E\u8D44\u4EA7\u9700\u8981\u552F\u4E00\u6807\u8BC6");let s=t.position||{};return{id:n,type:e.type,name:String(t.name||e.displayName),dimensions:wo(e.dimensions),transform:{position:{x:Number.isFinite(s.x)?s.x:0,y:Number.isFinite(s.y)?s.y:e.dimensions.height/2,z:Number.isFinite(s.z)?s.z:0},rotation:{x:Number.isFinite(t.rotation?.x)?t.rotation.x:0,y:Number.isFinite(t.rotation?.y)?t.rotation.y:0,z:Number.isFinite(t.rotation?.z)?t.rotation.z:0}},cost:e.cost,locked:!!t.locked,tags:wo(e.tags)}}function mc(){return Object.keys(fc).sort().map(Oi)}var _c=new Set(["9:16","16:9","1:1"]),od=new Set(["vertical-live","broadcast","product"]);function ld(){return globalThis.crypto?.randomUUID?globalThis.crypto.randomUUID():`set-flow-${Date.now()}-${Math.random().toString(16).slice(2)}`}function on(i){return structuredClone(i)}function gc(i=0,t=0,e=0){return{x:i,y:t,z:e}}function xc(i={}){let t=new Date().toISOString(),e={id:ld(),name:"Untitled live studio",schemaVersion:1,updatedAt:t,room:{width:3.8,depth:5.6,height:2.8,unit:"m"},brief:{category:"garment",presenterCount:1,aspect:"9:16",needsMovement:!0},assets:[],cameras:[],budget:{limit:2e4,currency:"CNY"},versions:[],settings:{gridStep:.1,measurementUnit:"m",quality:"balanced"}};return{...e,...on(i),room:{...e.room,...on(i.room||{})},brief:{...e.brief,...on(i.brief||{})},budget:{...e.budget,...on(i.budget||{})},settings:{...e.settings,...on(i.settings||{})},assets:on(i.assets||e.assets),cameras:on(i.cameras||e.cameras),versions:on(i.versions||e.versions)}}function Jt(i){return on(i)}function me(i,t,e,n){i.push({path:t,code:e,message:n})}function gr(i,t,e){(!Number.isFinite(t)||t<=0)&&me(i,e,"positive-number-required","\u8BF7\u8F93\u5165\u5927\u4E8E 0 \u7684\u6709\u6548\u6570\u503C")}function _r(i,t,e){if(!t||typeof t!="object"){me(i,e,"vector-required","\u7F3A\u5C11\u4E09\u7EF4\u5750\u6807");return}for(let n of["x","y","z"])Number.isFinite(t[n])||me(i,`${e}.${n}`,"finite-number-required","\u5750\u6807\u5FC5\u987B\u662F\u6709\u6548\u6570\u503C")}function cd(i,t){if(!Array.isArray(i.assets)){me(t,"assets","array-required","\u8D44\u4EA7\u5217\u8868\u683C\u5F0F\u65E0\u6548");return}let e=new Set;i.assets.forEach((n,s)=>{let r=`assets[${s}]`;!n?.id||typeof n.id!="string"?me(t,`${r}.id`,"id-required","\u8D44\u4EA7\u7F3A\u5C11\u552F\u4E00\u6807\u8BC6"):e.has(n.id)?me(t,`${r}.id`,"duplicate-id","\u8D44\u4EA7\u6807\u8BC6\u4E0D\u80FD\u91CD\u590D"):e.add(n.id),(!n?.type||typeof n.type!="string")&&me(t,`${r}.type`,"type-required","\u8D44\u4EA7\u7F3A\u5C11\u7C7B\u578B");for(let a of["width","depth","height"])gr(t,n?.dimensions?.[a],`${r}.dimensions.${a}`);_r(t,n?.transform?.position,`${r}.transform.position`),_r(t,n?.transform?.rotation,`${r}.transform.rotation`),(!Number.isFinite(n?.cost)||n.cost<0)&&me(t,`${r}.cost`,"non-negative-number-required","\u8D44\u4EA7\u4EF7\u683C\u4E0D\u80FD\u4E3A\u8D1F\u6570")})}function hd(i,t){if(!Array.isArray(i.cameras)){me(t,"cameras","array-required","\u673A\u4F4D\u5217\u8868\u683C\u5F0F\u65E0\u6548");return}let e=new Set;i.cameras.forEach((n,s)=>{let r=`cameras[${s}]`;!n?.id||typeof n.id!="string"?me(t,`${r}.id`,"id-required","\u673A\u4F4D\u7F3A\u5C11\u552F\u4E00\u6807\u8BC6"):e.has(n.id)?me(t,`${r}.id`,"duplicate-id","\u673A\u4F4D\u6807\u8BC6\u4E0D\u80FD\u91CD\u590D"):e.add(n.id),(!Number.isFinite(n?.focalLength)||n.focalLength<12||n.focalLength>200)&&me(t,`${r}.focalLength`,"focal-length-out-of-range","\u7B49\u6548\u7126\u8DDD\u5E94\u5728 12 \u81F3 200 mm \u4E4B\u95F4"),_c.has(n?.aspect)||me(t,`${r}.aspect`,"unsupported-aspect","\u673A\u4F4D\u753B\u5E45\u4EC5\u652F\u6301 9:16\u300116:9 \u6216 1:1"),od.has(n?.safeZonePreset)||me(t,`${r}.safeZonePreset`,"unsupported-safe-zone","\u673A\u4F4D\u5B89\u5168\u533A\u9884\u8BBE\u65E0\u6548"),_r(t,n?.position,`${r}.position`),_r(t,n?.target,`${r}.target`)})}function gn(i){let t=[];return!i||typeof i!="object"?(me(t,"project","object-required","\u5DE5\u7A0B\u6587\u4EF6\u683C\u5F0F\u65E0\u6548"),{valid:!1,errors:t}):(i.schemaVersion!==1&&me(t,"schemaVersion","unsupported-schema","\u4EC5\u652F\u6301\u5DE5\u7A0B\u7248\u672C 1"),(!i.id||typeof i.id!="string")&&me(t,"id","id-required","\u5DE5\u7A0B\u7F3A\u5C11\u552F\u4E00\u6807\u8BC6"),(!i.name||typeof i.name!="string")&&me(t,"name","name-required","\u5DE5\u7A0B\u540D\u79F0\u4E0D\u80FD\u4E3A\u7A7A"),gr(t,i.room?.width,"room.width"),gr(t,i.room?.depth,"room.depth"),gr(t,i.room?.height,"room.height"),i.room?.unit!=="m"&&me(t,"room.unit","unsupported-unit","\u7B2C\u4E00\u7248\u4EC5\u652F\u6301\u7C73\u5236\u5355\u4F4D"),(!Number.isInteger(i.brief?.presenterCount)||i.brief.presenterCount<1||i.brief.presenterCount>2)&&me(t,"brief.presenterCount","presenter-count-out-of-range","\u7B2C\u4E00\u7248\u652F\u6301\u4E00\u81F3\u4E24\u540D\u4E3B\u64AD"),_c.has(i.brief?.aspect)||me(t,"brief.aspect","unsupported-aspect","\u76F4\u64AD\u753B\u5E45\u4EC5\u652F\u6301 9:16\u300116:9 \u6216 1:1"),(!Number.isFinite(i.budget?.limit)||i.budget.limit<0)&&me(t,"budget.limit","non-negative-number-required","\u9884\u7B97\u4E0D\u80FD\u4E3A\u8D1F\u6570"),i.budget?.currency!=="CNY"&&me(t,"budget.currency","unsupported-currency","\u7B2C\u4E00\u7248\u9884\u7B97\u4EC5\u652F\u6301\u4EBA\u6C11\u5E01"),cd(i,t),hd(i,t),{valid:t.length===0,errors:t})}function yc(i=gc(),t=gc()){return{position:on(i),rotation:on(t)}}function Hn(i,t,e,n,s,r,a={}){return{id:i,type:t,name:e,dimensions:n,transform:yc(s,a.rotation),cost:r,locked:!!a.locked,tags:[...a.tags||[]]}}function vc(){return xc({id:"set-flow-garment-demo",name:"Garment studio / Working draft",updatedAt:"2026-08-11T00:00:00.000Z",room:{width:3.8,depth:5.6,height:2.8,unit:"m"},brief:{category:"garment",presenterCount:2,aspect:"9:16",needsMovement:!0},budget:{limit:2e4,currency:"CNY"},assets:[Hn("backdrop-1","backdrop","\u4E3B\u80CC\u666F\u677F",{width:2.8,depth:.12,height:2.5},{x:.35,y:1.25,z:-2.55},2600,{locked:!0}),Hn("rack-1","garment-rack","\u670D\u88C5\u9648\u5217\u67B6",{width:1.5,depth:.52,height:1.9},{x:1,y:.95,z:-1.85},1200),Hn("table-1","live-table","\u76F4\u64AD\u684C",{width:1.4,depth:.62,height:.78},{x:.55,y:.39,z:-.35},1800),Hn("presenter-1","presenter","\u4E3B\u64AD A",{width:.65,depth:.65,height:1.7},{x:-.45,y:.85,z:-.5},0,{tags:["clearance:0.6"]}),Hn("presenter-2","presenter","\u4E3B\u64AD B",{width:.65,depth:.65,height:1.72},{x:.45,y:.86,z:-.55},0,{tags:["clearance:0.6"]}),Hn("key-light-1","key-light","\u4E3B\u9762\u5149",{width:.42,depth:.32,height:1.9},{x:-1.15,y:.95,z:.35},3200,{rotation:{x:0,y:.35,z:0}}),Hn("light-stand-2","light-stand","\u53F3\u4FA7\u706F\u67B6",{width:.52,depth:.52,height:2.1},{x:.62,y:1.05,z:-.48},860),Hn("monitor-1","monitor","\u8FD4\u770B\u5C4F",{width:.62,depth:.18,height:.42},{x:-1.25,y:1.25,z:-1.7},2400,{rotation:{x:0,y:.55,z:0}})],cameras:[{id:"camera-primary",name:"CAM A / \u4E3B\u673A\u4F4D",role:"primary",position:{x:0,y:1.42,z:2.35},target:{x:0,y:1.05,z:-.55},focalLength:28,aspect:"9:16",safeZonePreset:"vertical-live"},{id:"camera-detail",name:"CAM B / \u7279\u5199\u673A\u4F4D",role:"detail",position:{x:1.45,y:1.32,z:1.2},target:{x:1.35,y:1.05,z:-1.8},focalLength:50,aspect:"9:16",safeZonePreset:"vertical-live"}]})}function ud(i,t,e){let n=Math.round(t*100);return{id:`boundary:${i.id}`,type:"boundary",severity:t>=.3?"critical":"warning",assetIds:[i.id],cameraId:null,evidence:{outsideDistance:t,axes:e},message:`${i.name} \u8D85\u51FA\u623F\u95F4\u8FB9\u754C ${n} cm`,suggestion:"\u5C06\u5BF9\u8C61\u79FB\u56DE\u623F\u95F4\u8F6E\u5ED3\u5185\uFF0C\u5E76\u4E3A\u73B0\u573A\u5B89\u88C5\u4FDD\u7559\u989D\u5916\u51C0\u7A7A"}}function dd(i){let t=i.transform.rotation.y||0,e=Math.abs(Math.cos(t)),n=Math.abs(Math.sin(t));return{x:e*i.dimensions.width/2+n*i.dimensions.depth/2,z:n*i.dimensions.width/2+e*i.dimensions.depth/2,y:i.dimensions.height/2}}function Mc(i){let t=i.room.width/2,e=i.room.depth/2,n=[];for(let s of i.assets){let r=dd(s),a=s.transform.position,o={left:Math.max(0,-t-(a.x-r.x)),right:Math.max(0,a.x+r.x-t),back:Math.max(0,-e-(a.z-r.z)),front:Math.max(0,a.z+r.z-e),floor:Math.max(0,-(a.y-r.y)),ceiling:Math.max(0,a.y+r.y-i.room.height)},c=Object.entries(o).filter(([,u])=>u>1e-6).map(([u])=>u),h=Math.max(...Object.values(o));h>1e-6&&n.push(ud(s,Number(h.toFixed(3)),c))}return n}function Ms(i,t){return{x:t.x-i.x,y:t.y-i.y,z:t.z-i.z}}function Ss(i,t){return i.x*t.x+i.y*t.y+i.z*t.z}function Sc(i,t){return{x:i.y*t.z-i.z*t.y,y:i.z*t.x-i.x*t.z,z:i.x*t.y-i.y*t.x}}function To(i){return Math.hypot(i.x,i.y,i.z)}function Eo(i){let t=To(i)||1;return{x:i.x/t,y:i.y/t,z:i.z/t}}function fd(i){return i==="16:9"?16/9:i==="1:1"?1:9/16}function pd(i){return 2*Math.atan(24/(2*i.focalLength))}function bc(i,t){let e=Eo(Ms(t.position,t.target)),n=Eo(Sc(e,{x:0,y:1,z:0}));To(n)<1e-5&&(n={x:1,y:0,z:0});let s=Eo(Sc(n,e)),r=Ms(t.position,i),a=Ss(r,e);if(a<=0)return{x:1/0,y:1/0,depth:a,visible:!1};let o=a*Math.tan(pd(t)/2),c=o*fd(t.aspect),h=Ss(r,n)/c,u=Ss(r,s)/o;return{x:h,y:u,depth:a,visible:Math.abs(h)<=1&&Math.abs(u)<=1}}function md(i){let t=i.assets.filter(n=>n.type==="presenter"),e=[];for(let n of t){let s=n.transform.position,r=i.cameras.filter(a=>bc(s,a).visible).map(a=>a.id);r.length>0||e.push({id:`camera-coverage:${n.id}`,type:"camera-coverage",severity:"critical",assetIds:[n.id],cameraId:null,evidence:{coveredBy:r,cameraCount:i.cameras.length},message:`${n.name}\u6CA1\u6709\u8FDB\u5165\u4EFB\u4F55\u673A\u4F4D\u7684\u6709\u6548\u753B\u9762`,suggestion:"\u8C03\u6574\u673A\u4F4D\u76EE\u6807\u3001\u7126\u8DDD\u6216\u4E3B\u64AD\u7AD9\u4F4D\uFF0C\u786E\u4FDD\u81F3\u5C11\u4E00\u4E2A\u673A\u4F4D\u5B8C\u6574\u8986\u76D6"})}return e}function gd(i){let t=i.assets.filter(n=>n.type==="presenter"),e=[];for(let n of i.cameras)for(let s of t){let r=bc(s.transform.position,n);!r.visible||r.x<.68||e.push({id:`platform-overlay:${n.id}:${s.id}`,type:"platform-overlay",severity:"warning",assetIds:[s.id],cameraId:n.id,evidence:{normalizedX:Number(r.x.toFixed(3)),zoneStart:.68},message:`${s.name}\u8FDB\u5165${n.name}\u53F3\u4FA7\u5E73\u53F0 UI \u5B89\u5168\u533A`,suggestion:"\u5411\u753B\u9762\u4E2D\u5FC3\u8C03\u6574\u7AD9\u4F4D\u6216\u91CD\u65B0\u6784\u56FE\uFF0C\u4E3A\u8BC4\u8BBA\u548C\u4E92\u52A8\u63A7\u4EF6\u7559\u51FA\u7A7A\u95F4"})}return e}function _d(i,t,e){let n=Ms(t,e),s=Ms(t,i),r=Ss(n,n)||1,a=Math.max(0,Math.min(1,Ss(s,n)/r)),o={x:t.x+n.x*a,y:t.y+n.y*a,z:t.z+n.z*a};return{distance:To(Ms(o,i)),t:a}}function xd(i){let t=[];for(let e of i.cameras){let n=i.assets.filter(s=>!["presenter","backdrop"].includes(s.type)).map(s=>({asset:s,..._d(s.transform.position,e.position,e.target)})).filter(({asset:s,distance:r,t:a})=>a>.08&&a<.92&&r<Math.max(s.dimensions.width,s.dimensions.depth,s.dimensions.height)*.38).sort((s,r)=>s.distance-r.distance)[0];n&&t.push({id:`camera-obstruction:${e.id}:${n.asset.id}`,type:"camera-obstruction",severity:"warning",assetIds:[n.asset.id],cameraId:e.id,evidence:{lineDistance:Number(n.distance.toFixed(3)),lineProgress:Number(n.t.toFixed(3))},message:`${n.asset.name}\u9760\u8FD1${e.name}\u7684\u89C6\u7EBF\u4E2D\u5FC3`,suggestion:"\u68C0\u67E5\u5B9E\u673A\u753B\u9762\u4E2D\u7684\u906E\u6321\uFF1B\u5FC5\u8981\u65F6\u79FB\u52A8\u8BBE\u5907\u6216\u62AC\u9AD8\u673A\u4F4D"})}return t}function wc(i){return[...md(i),...gd(i),...xd(i)]}function yd(i){try{return Oi(i.type)}catch{return{collisionBox:i.dimensions,clearance:0,tags:[]}}}function Ec(i){let t=yd(i),e=t.collisionBox||i.dimensions,n=i.type==="presenter"?Number(t.clearance||0)/2:0,s=i.transform.rotation.y||0,r=Math.abs(Math.cos(s)),a=Math.abs(Math.sin(s)),o=r*e.width/2+a*e.depth/2+n,c=a*e.width/2+r*e.depth/2+n,h=e.height/2,u=i.transform.position;return{minX:u.x-o,maxX:u.x+o,minY:u.y-h,maxY:u.y+h,minZ:u.z-c,maxZ:u.z+c,tags:t.tags||[]}}function vd(i,t){return{x:Math.min(i.maxX,t.maxX)-Math.max(i.minX,t.minX),y:Math.min(i.maxY,t.maxY)-Math.max(i.minY,t.minY),z:Math.min(i.maxZ,t.maxZ)-Math.max(i.minZ,t.minZ)}}function Tc(i){let t=[];for(let e=0;e<i.assets.length;e+=1){let n=i.assets[e],s=Ec(n);if(!s.tags.includes("non-physical"))for(let r=e+1;r<i.assets.length;r+=1){let a=i.assets[r];if(n.type==="presenter"&&a.type==="presenter"||[n.type,a.type].includes("presenter")&&[n.type,a.type].some(d=>["table","live-table"].includes(d)))continue;let o=Ec(a);if(o.tags.includes("non-physical"))continue;let c=vd(s,o);if(c.x<=.05||c.y<=0||c.z<=.05)continue;let h=Number(Math.min(c.x,c.z).toFixed(3)),u=[n.id,a.id].sort(),f=n.type==="presenter"||a.type==="presenter";t.push({id:`collision:${u.join(":")}`,type:"collision",severity:f?"critical":"warning",assetIds:u,cameraId:null,evidence:{overlapDepth:h,overlap:c},message:`${n.name}\u4E0E${a.name}\u7684${f?"\u6D3B\u52A8\u51C0\u7A7A":"\u78B0\u649E\u76D2"}\u91CD\u53E0 ${Math.round(h*100)} cm`,suggestion:f?"\u79FB\u52A8\u8BBE\u5907\u6216\u7F29\u5C0F\u6D3B\u52A8\u533A\u57DF\u540E\u91CD\u65B0\u68C0\u67E5":"\u8C03\u6574\u5BF9\u8C61\u4F4D\u7F6E\uFF0C\u907F\u514D\u5B89\u88C5\u548C\u4F7F\u7528\u7A7A\u95F4\u4E92\u76F8\u5360\u7528"})}}return t}var Ac={critical:0,warning:1,info:2};function Md(i){let t=i.assets.reduce((n,s)=>n+Number(s.cost||0),0);if(t<=i.budget.limit)return[];let e=t-i.budget.limit;return[{id:"budget:equipment",type:"budget",severity:e>i.budget.limit*.2?"critical":"warning",assetIds:i.assets.filter(n=>n.cost>0).map(n=>n.id),cameraId:null,evidence:{total:t,limit:i.budget.limit,overBy:e},message:`\u8BBE\u5907\u9884\u7B97\u8D85\u51FA \xA5${e.toLocaleString("zh-CN")}`,suggestion:"\u66FF\u6362\u9AD8\u6210\u672C\u8BBE\u5907\u6216\u63D0\u9AD8\u9884\u7B97\u4E0A\u9650\uFF0C\u5E76\u4FDD\u7559\u5B89\u88C5\u4E0E\u8017\u6750\u4F59\u91CF"}]}function xr(i){let t=new Map;for(let e of[...Mc(i),...Tc(i),...wc(i),...Md(i)])t.set(e.id,e);return[...t.values()].sort((e,n)=>Ac[e.severity]-Ac[n.severity]||e.type.localeCompare(n.type)||e.id.localeCompare(n.id))}function Cc(i){return String(i||"set-flow-project").trim().replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-+|-+$/g,"")||"set-flow-project"}function Sd(i){let t=gn(i);return t.valid?{ok:!0,filename:`${Cc(i.id)}.setflow.json`,text:`${JSON.stringify(i,null,2)}
`}:{ok:!1,code:"invalid-project",errors:t.errors}}function bd(i){return i.assets.map(t=>({id:t.id,name:t.name,type:t.type,quantity:1,unitCost:t.cost,subtotal:t.cost}))}function wd(i){let t=String(i??"");return/[",\r\n]/.test(t)?`"${t.replaceAll('"','""')}"`:t}function Ed(i){let t=["ID","\u540D\u79F0","\u7C7B\u578B","\u6570\u91CF","\u5355\u4EF7","\u5C0F\u8BA1"],e=i.map(n=>[n.id,n.name,n.type,n.quantity,n.unitCost,n.subtotal]);return`${[t,...e].map(n=>n.map(wd).join(",")).join(`\r
`)}\r
`}function _n(i){return String(i??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function Td(i,{issues:t=[],captures:e={}}={}){let n=i.assets.reduce((a,o)=>a+Number(o.cost||0),0),s=(a,o)=>e[a]?`<figure><img src="${_n(e[a])}" alt="${_n(o)}"><figcaption>${_n(o)}</figcaption></figure>`:`<figure class="missing"><div>\u672A\u83B7\u53D6\u753B\u9762</div><figcaption>${_n(o)}</figcaption></figure>`,r=t.length?t.map(a=>`<tr><td>${_n(a.severity)}</td><td>${_n(a.message)}</td><td>${_n(a.suggestion)}</td></tr>`).join(""):'<tr><td colspan="3">\u5F53\u524D\u89C4\u5219\u672A\u53D1\u73B0\u95EE\u9898</td></tr>';return`<!doctype html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>${_n(i.name)} / SET//FLOW \u6267\u884C\u62A5\u544A</title>
<style>
@page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#172125;background:#fff;font:12px/1.55 "Microsoft YaHei UI",sans-serif}header{display:flex;justify-content:space-between;align-items:end;padding-bottom:12px;border-bottom:2px solid #172125}h1{margin:0;font-size:26px}header p{margin:0;color:#526165}.metrics{display:grid;grid-template-columns:repeat(4,1fr);margin:14px 0;border:1px solid #aab7b6}.metrics div{padding:9px 11px;border-right:1px solid #aab7b6}.metrics div:last-child{border:0}.metrics span,figcaption{display:block;color:#526165;font:9px/1.2 Consolas,monospace;letter-spacing:.08em;text-transform:uppercase}.metrics strong{display:block;margin-top:4px}.views{display:grid;grid-template-columns:2fr 1fr 1fr;gap:9px}figure{margin:0;padding:7px;border:1px solid #aab7b6;background:#eef2f1}figure img,figure>div{width:100%;height:220px;display:block;object-fit:contain;background:#0e1518}figcaption{padding-top:6px}h2{margin:16px 0 7px;font-size:15px}table{width:100%;border-collapse:collapse}th,td{padding:7px 8px;border:1px solid #c6cfcd;text-align:left;vertical-align:top}th{background:#eef2f1}.disclaimer{margin-top:12px;padding-top:8px;border-top:1px solid #aab7b6;color:#526165;font-size:10px}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style></head><body>
<header><div><span>SET//FLOW / EXECUTION REPORT</span><h1>${_n(i.name)}</h1></div><p>\u5DE5\u7A0B\u66F4\u65B0\u65F6\u95F4 ${_n(i.updatedAt)}</p></header>
<section class="metrics"><div><span>\u623F\u95F4</span><strong>${i.room.width.toFixed(2)} \xD7 ${i.room.depth.toFixed(2)} \xD7 ${i.room.height.toFixed(2)} m</strong></div><div><span>\u673A\u4F4D</span><strong>${i.cameras.length}</strong></div><div><span>\u8BBE\u5907</span><strong>${i.assets.length}</strong></div><div><span>\u8BBE\u5907\u9884\u7B97</span><strong>\xA5${n.toLocaleString("zh-CN")} / \xA5${i.budget.limit.toLocaleString("zh-CN")}</strong></div></section>
<section class="views">${s("top","\u4E09\u7EF4\u603B\u89C8")}${s("camera-primary","CAM A / \u4E3B\u673A\u4F4D")}${s("camera-detail","CAM B / \u7279\u5199\u673A\u4F4D")}</section>
<h2>\u68C0\u67E5\u7ED3\u679C / ${t.length} \u9879</h2><table><thead><tr><th>\u7EA7\u522B</th><th>\u8BC1\u636E\u7ED3\u8BBA</th><th>\u5904\u7406\u5EFA\u8BAE</th></tr></thead><tbody>${r}</tbody></table>
<p class="disclaimer">\u672C\u62A5\u544A\u7528\u4E8E\u76F4\u64AD\u7A7A\u95F4\u9884\u6F14\u4E0E\u6C9F\u901A\uFF0C\u51E0\u4F55\u89C4\u5219\u548C\u673A\u4F4D\u9884\u89C8\u4E0D\u80FD\u66FF\u4EE3\u73B0\u573A\u5B89\u5168\u68C0\u67E5\u3001\u7ED3\u6784\u627F\u91CD\u786E\u8BA4\u3001\u7535\u6C14\u68C0\u67E5\u53CA\u4E13\u4E1A\u65BD\u5DE5\u590D\u6838\u3002</p>
</body></html>`}function Rc(i,{issues:t=[],captures:e={}}={}){let n=Sd(i);if(!n.ok)return n;let s=Cc(i.id),r=[{role:"project",filename:n.filename,mime:"application/json",text:n.text},{role:"equipment",filename:`${s}-equipment.csv`,mime:"text/csv;charset=utf-8",text:`\uFEFF${Ed(bd(i))}`},{role:"report",filename:`${s}-report.html`,mime:"text/html;charset=utf-8",text:Td(i,{issues:t,captures:e})}],a=[];for(let[o,c,h]of[["top-view","top","top-view"],["camera-primary","camera-primary","camera-a"],["camera-detail","camera-detail","camera-b"]])e[c]?r.push({role:o,filename:`${s}-${h}.png`,mime:"image/png",dataUrl:e[c]}):a.push(c);return{ok:!0,files:r,missingCaptures:a}}var ei={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ni={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ih=0,ol=1,sh=2;var ll=1,ga=2,Mn=3,Dn=0,Be=1,ze=2,Bn=0,gi=1,cl=2,hl=3,ul=4,rh=5,Zn=100,ah=101,oh=102,lh=103,ch=104,hh=200,uh=201,dh=202,fh=203,Wr=204,Xr=205,ph=206,mh=207,gh=208,_h=209,xh=210,yh=211,vh=212,Mh=213,Sh=214,_a=0,xa=1,ya=2,_i=3,va=4,Ma=5,Sa=6,ba=7,dl=0,bh=1,wh=2,zn=0,Eh=1,Th=2,Ah=3,ls=4,Ch=5,Rh=6,Ih=7;var fl=300,Ei=301,Ti=302,wa=303,Ea=304,Ks=306,qr=1e3,$n=1001,Yr=1002,nn=1003,Ph=1004;var js=1005;var dn=1006,Ta=1007;var ii=1008;var mn=1009,pl=1010,ml=1011,cs=1012,Aa=1013,si=1014,Sn=1015,hs=1016,Ca=1017,Ra=1018,us=1020,gl=35902,_l=1021,xl=1022,sn=1023,Qi=1026,ds=1027,yl=1028,Ia=1029,vl=1030,Pa=1031;var La=1033,Qs=33776,tr=33777,er=33778,nr=33779,Da=35840,Ua=35841,Na=35842,Fa=35843,Oa=36196,Ba=37492,za=37496,ka=37808,Ha=37809,Va=37810,Ga=37811,Wa=37812,Xa=37813,qa=37814,Ya=37815,$a=37816,Za=37817,Ja=37818,Ka=37819,ja=37820,Qa=37821,ir=36492,to=36494,eo=36495,Ml=36283,no=36284,io=36285,so=36286;var Is=2300,$r=2301,Gr=2302,jo=2400,Qo=2401,tl=2402;var Lh=3200,Dh=3201;var Sl=0,Uh=1,kn="",Ce="srgb",xi="srgb-linear",Ps="linear",Qt="srgb";var mi=7680;var el=519,Nh=512,Fh=513,Oh=514,bl=515,Bh=516,zh=517,kh=518,Hh=519,nl=35044;var wl="300 es",xn=2e3,Ls=2001;var yn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Re=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ic=1234567,Ki=Math.PI/180,ts=180/Math.PI;function fs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Re[i&255]+Re[i>>8&255]+Re[i>>16&255]+Re[i>>24&255]+"-"+Re[t&255]+Re[t>>8&255]+"-"+Re[t>>16&15|64]+Re[t>>24&255]+"-"+Re[e&63|128]+Re[e>>8&255]+"-"+Re[e>>16&255]+Re[e>>24&255]+Re[n&255]+Re[n>>8&255]+Re[n>>16&255]+Re[n>>24&255]).toLowerCase()}function kt(i,t,e){return Math.max(t,Math.min(e,i))}function El(i,t){return(i%t+t)%t}function Ad(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Cd(i,t,e){return i!==t?(e-i)/(t-i):0}function Rs(i,t,e){return(1-e)*i+e*t}function Rd(i,t,e,n){return Rs(i,t,1-Math.exp(-e*n))}function Id(i,t=1){return t-Math.abs(El(i,t*2)-t)}function Pd(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Ld(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Dd(i,t){return i+Math.floor(Math.random()*(t-i+1))}function Ud(i,t){return i+Math.random()*(t-i)}function Nd(i){return i*(.5-Math.random())}function Fd(i){i!==void 0&&(Ic=i);let t=Ic+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Od(i){return i*Ki}function Bd(i){return i*ts}function zd(i){return(i&i-1)===0&&i!==0}function kd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Hd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Vd(i,t,e,n,s){let r=Math.cos,a=Math.sin,o=r(e/2),c=a(e/2),h=r((t+n)/2),u=a((t+n)/2),f=r((t-n)/2),d=a((t-n)/2),m=r((n-t)/2),_=a((n-t)/2);switch(s){case"XYX":i.set(o*u,c*f,c*d,o*h);break;case"YZY":i.set(c*d,o*u,c*f,o*h);break;case"ZXZ":i.set(c*f,c*d,o*u,o*h);break;case"XZX":i.set(o*u,c*_,c*m,o*h);break;case"YXY":i.set(c*m,o*u,c*_,o*h);break;case"ZYZ":i.set(c*_,c*m,o*u,o*h);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ji(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ne(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var sr={DEG2RAD:Ki,RAD2DEG:ts,generateUUID:fs,clamp:kt,euclideanModulo:El,mapLinear:Ad,inverseLerp:Cd,lerp:Rs,damp:Rd,pingpong:Id,smoothstep:Pd,smootherstep:Ld,randInt:Dd,randFloat:Ud,randFloatSpread:Nd,seededRandom:Fd,degToRad:Od,radToDeg:Bd,isPowerOfTwo:zd,ceilPowerOfTwo:kd,floorPowerOfTwo:Hd,setQuaternionFromProperEuler:Vd,normalize:Ne,denormalize:Ji},Et=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=kt(this.x,t.x,e.x),this.y=kt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=kt(this.x,t,e),this.y=kt(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},ge=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let c=n[s+0],h=n[s+1],u=n[s+2],f=n[s+3],d=r[a+0],m=r[a+1],_=r[a+2],x=r[a+3];if(o===0){t[e+0]=c,t[e+1]=h,t[e+2]=u,t[e+3]=f;return}if(o===1){t[e+0]=d,t[e+1]=m,t[e+2]=_,t[e+3]=x;return}if(f!==x||c!==d||h!==m||u!==_){let p=1-o,l=c*d+h*m+u*_+f*x,g=l>=0?1:-1,y=1-l*l;if(y>Number.EPSILON){let T=Math.sqrt(y),E=Math.atan2(T,l*g);p=Math.sin(p*E)/T,o=Math.sin(o*E)/T}let v=o*g;if(c=c*p+d*v,h=h*p+m*v,u=u*p+_*v,f=f*p+x*v,p===1-o){let T=1/Math.sqrt(c*c+h*h+u*u+f*f);c*=T,h*=T,u*=T,f*=T}}t[e]=c,t[e+1]=h,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],c=n[s+1],h=n[s+2],u=n[s+3],f=r[a],d=r[a+1],m=r[a+2],_=r[a+3];return t[e]=o*_+u*f+c*m-h*d,t[e+1]=c*_+u*d+h*f-o*m,t[e+2]=h*_+u*m+o*d-c*f,t[e+3]=u*_-o*f-c*d-h*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,h=o(n/2),u=o(s/2),f=o(r/2),d=c(n/2),m=c(s/2),_=c(r/2);switch(a){case"XYZ":this._x=d*u*f+h*m*_,this._y=h*m*f-d*u*_,this._z=h*u*_+d*m*f,this._w=h*u*f-d*m*_;break;case"YXZ":this._x=d*u*f+h*m*_,this._y=h*m*f-d*u*_,this._z=h*u*_-d*m*f,this._w=h*u*f+d*m*_;break;case"ZXY":this._x=d*u*f-h*m*_,this._y=h*m*f+d*u*_,this._z=h*u*_+d*m*f,this._w=h*u*f-d*m*_;break;case"ZYX":this._x=d*u*f-h*m*_,this._y=h*m*f+d*u*_,this._z=h*u*_-d*m*f,this._w=h*u*f+d*m*_;break;case"YZX":this._x=d*u*f+h*m*_,this._y=h*m*f+d*u*_,this._z=h*u*_-d*m*f,this._w=h*u*f-d*m*_;break;case"XZY":this._x=d*u*f-h*m*_,this._y=h*m*f-d*u*_,this._z=h*u*_+d*m*f,this._w=h*u*f+d*m*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],h=e[2],u=e[6],f=e[10],d=n+o+f;if(d>0){let m=.5/Math.sqrt(d+1);this._w=.25/m,this._x=(u-c)*m,this._y=(r-h)*m,this._z=(a-s)*m}else if(n>o&&n>f){let m=2*Math.sqrt(1+n-o-f);this._w=(u-c)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+h)/m}else if(o>f){let m=2*Math.sqrt(1+o-n-f);this._w=(r-h)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(c+u)/m}else{let m=2*Math.sqrt(1+f-n-o);this._w=(a-s)/m,this._x=(r+h)/m,this._y=(c+u)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(kt(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,h=e._z,u=e._w;return this._x=n*u+a*o+s*h-r*c,this._y=s*u+a*c+r*o-n*h,this._z=r*u+a*h+n*c-s*o,this._w=a*u-n*o-s*c-r*h,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let c=1-o*o;if(c<=Number.EPSILON){let m=1-e;return this._w=m*a+e*this._w,this._x=m*n+e*this._x,this._y=m*s+e*this._y,this._z=m*r+e*this._z,this.normalize(),this}let h=Math.sqrt(c),u=Math.atan2(h,o),f=Math.sin((1-e)*u)/h,d=Math.sin(e*u)/h;return this._w=a*f+this._w*d,this._x=n*f+this._x*d,this._y=s*f+this._y*d,this._z=r*f+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},C=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Pc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Pc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,h=2*(a*s-o*n),u=2*(o*e-r*s),f=2*(r*n-a*e);return this.x=e+c*h+a*f-o*u,this.y=n+c*u+o*h-r*f,this.z=s+c*f+r*u-a*h,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=kt(this.x,t.x,e.x),this.y=kt(this.y,t.y,e.y),this.z=kt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=kt(this.x,t,e),this.y=kt(this.y,t,e),this.z=kt(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ao.copy(this).projectOnVector(t),this.sub(Ao)}reflect(t){return this.sub(Ao.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(kt(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ao=new C,Pc=new ge,Ft=class i{constructor(t,e,n,s,r,a,o,c,h){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,h)}set(t,e,n,s,r,a,o,c,h){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=c,u[6]=n,u[7]=a,u[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],u=n[4],f=n[7],d=n[2],m=n[5],_=n[8],x=s[0],p=s[3],l=s[6],g=s[1],y=s[4],v=s[7],T=s[2],E=s[5],R=s[8];return r[0]=a*x+o*g+c*T,r[3]=a*p+o*y+c*E,r[6]=a*l+o*v+c*R,r[1]=h*x+u*g+f*T,r[4]=h*p+u*y+f*E,r[7]=h*l+u*v+f*R,r[2]=d*x+m*g+_*T,r[5]=d*p+m*y+_*E,r[8]=d*l+m*v+_*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],u=t[8];return e*a*u-e*o*h-n*r*u+n*o*c+s*r*h-s*a*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],u=t[8],f=u*a-o*h,d=o*c-u*r,m=h*r-a*c,_=e*f+n*d+s*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/_;return t[0]=f*x,t[1]=(s*h-u*n)*x,t[2]=(o*n-s*a)*x,t[3]=d*x,t[4]=(u*e-s*c)*x,t[5]=(s*r-o*e)*x,t[6]=m*x,t[7]=(n*c-h*e)*x,t[8]=(a*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let c=Math.cos(r),h=Math.sin(r);return this.set(n*c,n*h,-n*(c*a+h*o)+a+t,-s*h,s*c,-s*(-h*a+c*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Co.makeScale(t,e)),this}rotate(t){return this.premultiply(Co.makeRotation(-t)),this}translate(t,e){return this.premultiply(Co.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Co=new Ft;function Tl(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Ds(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Vh(){let i=Ds("canvas");return i.style.display="block",i}var Lc={};function yi(i){i in Lc||(Lc[i]=!0,console.warn(i))}function Gh(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Wh(i){let t=i.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Xh(i){let t=i.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var Dc=new Ft().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Uc=new Ft().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Gd(){let i={enabled:!0,workingColorSpace:xi,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Qt&&(s.r=Ln(s.r),s.g=Ln(s.g),s.b=Ln(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Qt&&(s.r=ji(s.r),s.g=ji(s.g),s.b=ji(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===kn?Ps:this.spaces[s].transfer},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return yi("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return yi("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[xi]:{primaries:t,whitePoint:n,transfer:Ps,toXYZ:Dc,fromXYZ:Uc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ce},outputColorSpaceConfig:{drawingBufferColorSpace:Ce}},[Ce]:{primaries:t,whitePoint:n,transfer:Qt,toXYZ:Dc,fromXYZ:Uc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ce}}}),i}var Gt=Gd();function Ln(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ji(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Bi,Zr=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Bi===void 0&&(Bi=Ds("canvas")),Bi.width=t.width,Bi.height=t.height;let s=Bi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Bi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Ds("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ln(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ln(e[n]/255)*255):e[n]=Ln(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Wd=0,es=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=fs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Ro(s[a].image)):r.push(Ro(s[a]))}else r=Ro(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Ro(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Zr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Xd=0,Io=new C,Ye=class i extends yn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=$n,s=$n,r=dn,a=ii,o=sn,c=mn,h=i.DEFAULT_ANISOTROPY,u=kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=fs(),this.name="",this.source=new es(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Et(0,0),this.repeat=new Et(1,1),this.center=new Et(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ft,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Io).x}get height(){return this.source.getSize(Io).y}get depth(){return this.source.getSize(Io).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==fl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case qr:t.x=t.x-Math.floor(t.x);break;case $n:t.x=t.x<0?0:1;break;case Yr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case qr:t.y=t.y-Math.floor(t.y);break;case $n:t.y=t.y<0?0:1;break;case Yr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ye.DEFAULT_IMAGE=null;Ye.DEFAULT_MAPPING=fl;Ye.DEFAULT_ANISOTROPY=1;var jt=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,h=c[0],u=c[4],f=c[8],d=c[1],m=c[5],_=c[9],x=c[2],p=c[6],l=c[10];if(Math.abs(u-d)<.01&&Math.abs(f-x)<.01&&Math.abs(_-p)<.01){if(Math.abs(u+d)<.1&&Math.abs(f+x)<.1&&Math.abs(_+p)<.1&&Math.abs(h+m+l-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let y=(h+1)/2,v=(m+1)/2,T=(l+1)/2,E=(u+d)/4,R=(f+x)/4,L=(_+p)/4;return y>v&&y>T?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=E/n,r=R/n):v>T?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=E/s,r=L/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=R/r,s=L/r),this.set(n,s,r,e),this}let g=Math.sqrt((p-_)*(p-_)+(f-x)*(f-x)+(d-u)*(d-u));return Math.abs(g)<.001&&(g=1),this.x=(p-_)/g,this.y=(f-x)/g,this.z=(d-u)/g,this.w=Math.acos((h+m+l-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=kt(this.x,t.x,e.x),this.y=kt(this.y,t.y,e.y),this.z=kt(this.z,t.z,e.z),this.w=kt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=kt(this.x,t,e),this.y=kt(this.y,t,e),this.z=kt(this.z,t,e),this.w=kt(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(kt(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Jr=class extends yn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:dn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new jt(0,0,t,e),this.scissorTest=!1,this.viewport=new jt(0,0,t,e);let s={width:t,height:e,depth:n.depth},r=new Ye(s);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){let e={minFilter:dn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new es(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},vn=class extends Jr{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Us=class extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=$n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Kr=class extends Ye{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=nn,this.minFilter=nn,this.wrapR=$n,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var $e=class{constructor(t=new C(1/0,1/0,1/0),e=new C(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ln.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ln.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=ln.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,ln):ln.fromBufferAttribute(r,a),ln.applyMatrix4(t.matrixWorld),this.expandByPoint(ln);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),yr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),yr.copy(n.boundingBox)),yr.applyMatrix4(t.matrixWorld),this.union(yr)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ln),ln.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(bs),vr.subVectors(this.max,bs),zi.subVectors(t.a,bs),ki.subVectors(t.b,bs),Hi.subVectors(t.c,bs),Vn.subVectors(ki,zi),Gn.subVectors(Hi,ki),ui.subVectors(zi,Hi);let e=[0,-Vn.z,Vn.y,0,-Gn.z,Gn.y,0,-ui.z,ui.y,Vn.z,0,-Vn.x,Gn.z,0,-Gn.x,ui.z,0,-ui.x,-Vn.y,Vn.x,0,-Gn.y,Gn.x,0,-ui.y,ui.x,0];return!Po(e,zi,ki,Hi,vr)||(e=[1,0,0,0,1,0,0,0,1],!Po(e,zi,ki,Hi,vr))?!1:(Mr.crossVectors(Vn,Gn),e=[Mr.x,Mr.y,Mr.z],Po(e,zi,ki,Hi,vr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ln).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ln).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Tn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Tn=[new C,new C,new C,new C,new C,new C,new C,new C],ln=new C,yr=new $e,zi=new C,ki=new C,Hi=new C,Vn=new C,Gn=new C,ui=new C,bs=new C,vr=new C,Mr=new C,di=new C;function Po(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){di.fromArray(i,r);let o=s.x*Math.abs(di.x)+s.y*Math.abs(di.y)+s.z*Math.abs(di.z),c=t.dot(di),h=e.dot(di),u=n.dot(di);if(Math.max(-Math.max(c,h,u),Math.min(c,h,u))>o)return!1}return!0}var qd=new $e,ws=new C,Lo=new C,Un=class{constructor(t=new C,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):qd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ws.subVectors(t,this.center);let e=ws.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(ws,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Lo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ws.copy(t.center).add(Lo)),this.expandByPoint(ws.copy(t.center).sub(Lo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},An=new C,Do=new C,Sr=new C,Wn=new C,Uo=new C,br=new C,No=new C,Jn=class{constructor(t=new C,e=new C(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,An)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=An.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(An.copy(this.origin).addScaledVector(this.direction,e),An.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Do.copy(t).add(e).multiplyScalar(.5),Sr.copy(e).sub(t).normalize(),Wn.copy(this.origin).sub(Do);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Sr),o=Wn.dot(this.direction),c=-Wn.dot(Sr),h=Wn.lengthSq(),u=Math.abs(1-a*a),f,d,m,_;if(u>0)if(f=a*c-o,d=a*o-c,_=r*u,f>=0)if(d>=-_)if(d<=_){let x=1/u;f*=x,d*=x,m=f*(f+a*d+2*o)+d*(a*f+d+2*c)+h}else d=r,f=Math.max(0,-(a*d+o)),m=-f*f+d*(d+2*c)+h;else d=-r,f=Math.max(0,-(a*d+o)),m=-f*f+d*(d+2*c)+h;else d<=-_?(f=Math.max(0,-(-a*r+o)),d=f>0?-r:Math.min(Math.max(-r,-c),r),m=-f*f+d*(d+2*c)+h):d<=_?(f=0,d=Math.min(Math.max(-r,-c),r),m=d*(d+2*c)+h):(f=Math.max(0,-(a*r+o)),d=f>0?r:Math.min(Math.max(-r,-c),r),m=-f*f+d*(d+2*c)+h);else d=a>0?-r:r,f=Math.max(0,-(a*d+o)),m=-f*f+d*(d+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Do).addScaledVector(Sr,d),m}intersectSphere(t,e){An.subVectors(t.center,this.origin);let n=An.dot(this.direction),s=An.dot(An)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,c,h=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,d=this.origin;return h>=0?(n=(t.min.x-d.x)*h,s=(t.max.x-d.x)*h):(n=(t.max.x-d.x)*h,s=(t.min.x-d.x)*h),u>=0?(r=(t.min.y-d.y)*u,a=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,a=(t.min.y-d.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-d.z)*f,c=(t.max.z-d.z)*f):(o=(t.max.z-d.z)*f,c=(t.min.z-d.z)*f),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,An)!==null}intersectTriangle(t,e,n,s,r){Uo.subVectors(e,t),br.subVectors(n,t),No.crossVectors(Uo,br);let a=this.direction.dot(No),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Wn.subVectors(this.origin,t);let c=o*this.direction.dot(br.crossVectors(Wn,br));if(c<0)return null;let h=o*this.direction.dot(Uo.cross(Wn));if(h<0||c+h>a)return null;let u=-o*Wn.dot(No);return u<0?null:this.at(u/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ee=class i{constructor(t,e,n,s,r,a,o,c,h,u,f,d,m,_,x,p){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,h,u,f,d,m,_,x,p)}set(t,e,n,s,r,a,o,c,h,u,f,d,m,_,x,p){let l=this.elements;return l[0]=t,l[4]=e,l[8]=n,l[12]=s,l[1]=r,l[5]=a,l[9]=o,l[13]=c,l[2]=h,l[6]=u,l[10]=f,l[14]=d,l[3]=m,l[7]=_,l[11]=x,l[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Vi.setFromMatrixColumn(t,0).length(),r=1/Vi.setFromMatrixColumn(t,1).length(),a=1/Vi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),h=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let d=a*u,m=a*f,_=o*u,x=o*f;e[0]=c*u,e[4]=-c*f,e[8]=h,e[1]=m+_*h,e[5]=d-x*h,e[9]=-o*c,e[2]=x-d*h,e[6]=_+m*h,e[10]=a*c}else if(t.order==="YXZ"){let d=c*u,m=c*f,_=h*u,x=h*f;e[0]=d+x*o,e[4]=_*o-m,e[8]=a*h,e[1]=a*f,e[5]=a*u,e[9]=-o,e[2]=m*o-_,e[6]=x+d*o,e[10]=a*c}else if(t.order==="ZXY"){let d=c*u,m=c*f,_=h*u,x=h*f;e[0]=d-x*o,e[4]=-a*f,e[8]=_+m*o,e[1]=m+_*o,e[5]=a*u,e[9]=x-d*o,e[2]=-a*h,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let d=a*u,m=a*f,_=o*u,x=o*f;e[0]=c*u,e[4]=_*h-m,e[8]=d*h+x,e[1]=c*f,e[5]=x*h+d,e[9]=m*h-_,e[2]=-h,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let d=a*c,m=a*h,_=o*c,x=o*h;e[0]=c*u,e[4]=x-d*f,e[8]=_*f+m,e[1]=f,e[5]=a*u,e[9]=-o*u,e[2]=-h*u,e[6]=m*f+_,e[10]=d-x*f}else if(t.order==="XZY"){let d=a*c,m=a*h,_=o*c,x=o*h;e[0]=c*u,e[4]=-f,e[8]=h*u,e[1]=d*f+x,e[5]=a*u,e[9]=m*f-_,e[2]=_*f-m,e[6]=o*u,e[10]=x*f+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Yd,t,$d)}lookAt(t,e,n){let s=this.elements;return Xe.subVectors(t,e),Xe.lengthSq()===0&&(Xe.z=1),Xe.normalize(),Xn.crossVectors(n,Xe),Xn.lengthSq()===0&&(Math.abs(n.z)===1?Xe.x+=1e-4:Xe.z+=1e-4,Xe.normalize(),Xn.crossVectors(n,Xe)),Xn.normalize(),wr.crossVectors(Xe,Xn),s[0]=Xn.x,s[4]=wr.x,s[8]=Xe.x,s[1]=Xn.y,s[5]=wr.y,s[9]=Xe.y,s[2]=Xn.z,s[6]=wr.z,s[10]=Xe.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],u=n[1],f=n[5],d=n[9],m=n[13],_=n[2],x=n[6],p=n[10],l=n[14],g=n[3],y=n[7],v=n[11],T=n[15],E=s[0],R=s[4],L=s[8],w=s[12],S=s[1],P=s[5],H=s[9],z=s[13],W=s[2],$=s[6],U=s[10],G=s[14],O=s[3],X=s[7],K=s[11],rt=s[15];return r[0]=a*E+o*S+c*W+h*O,r[4]=a*R+o*P+c*$+h*X,r[8]=a*L+o*H+c*U+h*K,r[12]=a*w+o*z+c*G+h*rt,r[1]=u*E+f*S+d*W+m*O,r[5]=u*R+f*P+d*$+m*X,r[9]=u*L+f*H+d*U+m*K,r[13]=u*w+f*z+d*G+m*rt,r[2]=_*E+x*S+p*W+l*O,r[6]=_*R+x*P+p*$+l*X,r[10]=_*L+x*H+p*U+l*K,r[14]=_*w+x*z+p*G+l*rt,r[3]=g*E+y*S+v*W+T*O,r[7]=g*R+y*P+v*$+T*X,r[11]=g*L+y*H+v*U+T*K,r[15]=g*w+y*z+v*G+T*rt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],h=t[13],u=t[2],f=t[6],d=t[10],m=t[14],_=t[3],x=t[7],p=t[11],l=t[15];return _*(+r*c*f-s*h*f-r*o*d+n*h*d+s*o*m-n*c*m)+x*(+e*c*m-e*h*d+r*a*d-s*a*m+s*h*u-r*c*u)+p*(+e*h*f-e*o*m-r*a*f+n*a*m+r*o*u-n*h*u)+l*(-s*o*u-e*c*f+e*o*d+s*a*f-n*a*d+n*c*u)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],u=t[8],f=t[9],d=t[10],m=t[11],_=t[12],x=t[13],p=t[14],l=t[15],g=f*p*h-x*d*h+x*c*m-o*p*m-f*c*l+o*d*l,y=_*d*h-u*p*h-_*c*m+a*p*m+u*c*l-a*d*l,v=u*x*h-_*f*h+_*o*m-a*x*m-u*o*l+a*f*l,T=_*f*c-u*x*c-_*o*d+a*x*d+u*o*p-a*f*p,E=e*g+n*y+s*v+r*T;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let R=1/E;return t[0]=g*R,t[1]=(x*d*r-f*p*r-x*s*m+n*p*m+f*s*l-n*d*l)*R,t[2]=(o*p*r-x*c*r+x*s*h-n*p*h-o*s*l+n*c*l)*R,t[3]=(f*c*r-o*d*r-f*s*h+n*d*h+o*s*m-n*c*m)*R,t[4]=y*R,t[5]=(u*p*r-_*d*r+_*s*m-e*p*m-u*s*l+e*d*l)*R,t[6]=(_*c*r-a*p*r-_*s*h+e*p*h+a*s*l-e*c*l)*R,t[7]=(a*d*r-u*c*r+u*s*h-e*d*h-a*s*m+e*c*m)*R,t[8]=v*R,t[9]=(_*f*r-u*x*r-_*n*m+e*x*m+u*n*l-e*f*l)*R,t[10]=(a*x*r-_*o*r+_*n*h-e*x*h-a*n*l+e*o*l)*R,t[11]=(u*o*r-a*f*r-u*n*h+e*f*h+a*n*m-e*o*m)*R,t[12]=T*R,t[13]=(u*x*s-_*f*s+_*n*d-e*x*d-u*n*p+e*f*p)*R,t[14]=(_*o*s-a*x*s-_*n*c+e*x*c+a*n*p-e*o*p)*R,t[15]=(a*f*s-u*o*s+u*n*c-e*f*c-a*n*d+e*o*d)*R,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,c=t.z,h=r*a,u=r*o;return this.set(h*a+n,h*o-s*c,h*c+s*o,0,h*o+s*c,u*o+n,u*c-s*a,0,h*c-s*o,u*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,h=r+r,u=a+a,f=o+o,d=r*h,m=r*u,_=r*f,x=a*u,p=a*f,l=o*f,g=c*h,y=c*u,v=c*f,T=n.x,E=n.y,R=n.z;return s[0]=(1-(x+l))*T,s[1]=(m+v)*T,s[2]=(_-y)*T,s[3]=0,s[4]=(m-v)*E,s[5]=(1-(d+l))*E,s[6]=(p+g)*E,s[7]=0,s[8]=(_+y)*R,s[9]=(p-g)*R,s[10]=(1-(d+x))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Vi.set(s[0],s[1],s[2]).length(),a=Vi.set(s[4],s[5],s[6]).length(),o=Vi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],cn.copy(this);let h=1/r,u=1/a,f=1/o;return cn.elements[0]*=h,cn.elements[1]*=h,cn.elements[2]*=h,cn.elements[4]*=u,cn.elements[5]*=u,cn.elements[6]*=u,cn.elements[8]*=f,cn.elements[9]*=f,cn.elements[10]*=f,e.setFromRotationMatrix(cn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=xn){let c=this.elements,h=2*r/(e-t),u=2*r/(n-s),f=(e+t)/(e-t),d=(n+s)/(n-s),m,_;if(o===xn)m=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===Ls)m=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=xn){let c=this.elements,h=1/(e-t),u=1/(n-s),f=1/(a-r),d=(e+t)*h,m=(n+s)*u,_,x;if(o===xn)_=(a+r)*f,x=-2*f;else if(o===Ls)_=r*f,x=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*h,c[4]=0,c[8]=0,c[12]=-d,c[1]=0,c[5]=2*u,c[9]=0,c[13]=-m,c[2]=0,c[6]=0,c[10]=x,c[14]=-_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Vi=new C,cn=new ee,Yd=new C(0,0,0),$d=new C(1,1,1),Xn=new C,wr=new C,Xe=new C,Nc=new ee,Fc=new ge,Ze=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],h=s[5],u=s[9],f=s[2],d=s[6],m=s[10];switch(e){case"XYZ":this._y=Math.asin(kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,h),this._z=0);break;case"YXZ":this._x=Math.asin(-kt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(kt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-f,m),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-kt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(d,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(kt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,h),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-kt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,h),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Nc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Nc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Fc.setFromEuler(this),this.setFromQuaternion(Fc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ze.DEFAULT_ORDER="XYZ";var ns=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Zd=0,Oc=new C,Gi=new ge,Cn=new ee,Er=new C,Es=new C,Jd=new C,Kd=new ge,Bc=new C(1,0,0),zc=new C(0,1,0),kc=new C(0,0,1),Hc={type:"added"},jd={type:"removed"},Wi={type:"childadded",child:null},Fo={type:"childremoved",child:null},ve=class i extends yn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Zd++}),this.uuid=fs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new C,e=new Ze,n=new ge,s=new C(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ee},normalMatrix:{value:new Ft}}),this.matrix=new ee,this.matrixWorld=new ee,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ns,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Gi.setFromAxisAngle(t,e),this.quaternion.multiply(Gi),this}rotateOnWorldAxis(t,e){return Gi.setFromAxisAngle(t,e),this.quaternion.premultiply(Gi),this}rotateX(t){return this.rotateOnAxis(Bc,t)}rotateY(t){return this.rotateOnAxis(zc,t)}rotateZ(t){return this.rotateOnAxis(kc,t)}translateOnAxis(t,e){return Oc.copy(t).applyQuaternion(this.quaternion),this.position.add(Oc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Bc,t)}translateY(t){return this.translateOnAxis(zc,t)}translateZ(t){return this.translateOnAxis(kc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Cn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Er.copy(t):Er.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Es.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Cn.lookAt(Es,Er,this.up):Cn.lookAt(Er,Es,this.up),this.quaternion.setFromRotationMatrix(Cn),s&&(Cn.extractRotation(s.matrixWorld),Gi.setFromRotationMatrix(Cn),this.quaternion.premultiply(Gi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Hc),Wi.child=t,this.dispatchEvent(Wi),Wi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(jd),Fo.child=t,this.dispatchEvent(Fo),Fo.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Cn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Cn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Cn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Hc),Wi.child=t,this.dispatchEvent(Wi),Wi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Es,t,Jd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Es,Kd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let h=0,u=c.length;h<u;h++){let f=c[h];r(t.shapes,f)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),h=a(t.textures),u=a(t.images),f=a(t.shapes),d=a(t.skeletons),m=a(t.animations),_=a(t.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),d.length>0&&(n.skeletons=d),m.length>0&&(n.animations=m),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let c=[];for(let h in o){let u=o[h];delete u.metadata,c.push(u)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};ve.DEFAULT_UP=new C(0,1,0);ve.DEFAULT_MATRIX_AUTO_UPDATE=!0;ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var hn=new C,Rn=new C,Oo=new C,In=new C,Xi=new C,qi=new C,Vc=new C,Bo=new C,zo=new C,ko=new C,Ho=new jt,Vo=new jt,Go=new jt,Pn=class i{constructor(t=new C,e=new C,n=new C){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),hn.subVectors(t,e),s.cross(hn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){hn.subVectors(s,e),Rn.subVectors(n,e),Oo.subVectors(t,e);let a=hn.dot(hn),o=hn.dot(Rn),c=hn.dot(Oo),h=Rn.dot(Rn),u=Rn.dot(Oo),f=a*h-o*o;if(f===0)return r.set(0,0,0),null;let d=1/f,m=(h*c-o*u)*d,_=(a*u-o*c)*d;return r.set(1-m-_,_,m)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,In)===null?!1:In.x>=0&&In.y>=0&&In.x+In.y<=1}static getInterpolation(t,e,n,s,r,a,o,c){return this.getBarycoord(t,e,n,s,In)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,In.x),c.addScaledVector(a,In.y),c.addScaledVector(o,In.z),c)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ho.setScalar(0),Vo.setScalar(0),Go.setScalar(0),Ho.fromBufferAttribute(t,e),Vo.fromBufferAttribute(t,n),Go.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ho,r.x),a.addScaledVector(Vo,r.y),a.addScaledVector(Go,r.z),a}static isFrontFacing(t,e,n,s){return hn.subVectors(n,e),Rn.subVectors(t,e),hn.cross(Rn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return hn.subVectors(this.c,this.b),Rn.subVectors(this.a,this.b),hn.cross(Rn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Xi.subVectors(s,n),qi.subVectors(r,n),Bo.subVectors(t,n);let c=Xi.dot(Bo),h=qi.dot(Bo);if(c<=0&&h<=0)return e.copy(n);zo.subVectors(t,s);let u=Xi.dot(zo),f=qi.dot(zo);if(u>=0&&f<=u)return e.copy(s);let d=c*f-u*h;if(d<=0&&c>=0&&u<=0)return a=c/(c-u),e.copy(n).addScaledVector(Xi,a);ko.subVectors(t,r);let m=Xi.dot(ko),_=qi.dot(ko);if(_>=0&&m<=_)return e.copy(r);let x=m*h-c*_;if(x<=0&&h>=0&&_<=0)return o=h/(h-_),e.copy(n).addScaledVector(qi,o);let p=u*_-m*f;if(p<=0&&f-u>=0&&m-_>=0)return Vc.subVectors(r,s),o=(f-u)/(f-u+(m-_)),e.copy(s).addScaledVector(Vc,o);let l=1/(p+x+d);return a=x*l,o=d*l,e.copy(n).addScaledVector(Xi,a).addScaledVector(qi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},qh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},qn={h:0,s:0,l:0},Tr={h:0,s:0,l:0};function Wo(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var Ot=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ce){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Gt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Gt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Gt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Gt.workingColorSpace){if(t=El(t,1),e=kt(e,0,1),n=kt(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Wo(a,r,t+1/3),this.g=Wo(a,r,t),this.b=Wo(a,r,t-1/3)}return Gt.colorSpaceToWorking(this,s),this}setStyle(t,e=Ce){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ce){let n=qh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ln(t.r),this.g=Ln(t.g),this.b=Ln(t.b),this}copyLinearToSRGB(t){return this.r=ji(t.r),this.g=ji(t.g),this.b=ji(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ce){return Gt.workingToColorSpace(Ie.copy(this),t),Math.round(kt(Ie.r*255,0,255))*65536+Math.round(kt(Ie.g*255,0,255))*256+Math.round(kt(Ie.b*255,0,255))}getHexString(t=Ce){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Gt.workingColorSpace){Gt.workingToColorSpace(Ie.copy(this),e);let n=Ie.r,s=Ie.g,r=Ie.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,h,u=(o+a)/2;if(o===a)c=0,h=0;else{let f=a-o;switch(h=u<=.5?f/(a+o):f/(2-a-o),a){case n:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-n)/f+2;break;case r:c=(n-s)/f+4;break}c/=6}return t.h=c,t.s=h,t.l=u,t}getRGB(t,e=Gt.workingColorSpace){return Gt.workingToColorSpace(Ie.copy(this),e),t.r=Ie.r,t.g=Ie.g,t.b=Ie.b,t}getStyle(t=Ce){Gt.workingToColorSpace(Ie.copy(this),t);let e=Ie.r,n=Ie.g,s=Ie.b;return t!==Ce?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(qn),this.setHSL(qn.h+t,qn.s+e,qn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(qn),t.getHSL(Tr);let n=Rs(qn.h,Tr.h,e),s=Rs(qn.s,Tr.s,e),r=Rs(qn.l,Tr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ie=new Ot;Ot.NAMES=qh;var Qd=0,Nn=class extends yn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Qd++}),this.uuid=fs(),this.name="",this.type="Material",this.blending=gi,this.side=Dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Wr,this.blendDst=Xr,this.blendEquation=Zn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ot(0,0,0),this.blendAlpha=0,this.depthFunc=_i,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=el,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=mi,this.stencilZFail=mi,this.stencilZPass=mi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==gi&&(n.blending=this.blending),this.side!==Dn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Wr&&(n.blendSrc=this.blendSrc),this.blendDst!==Xr&&(n.blendDst=this.blendDst),this.blendEquation!==Zn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==_i&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==el&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==mi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==mi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==mi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Je=class extends Nn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ze,this.combine=dl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var Me=new C,Ar=new Et,tf=0,Fe=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:tf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=nl,this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Ar.fromBufferAttribute(this,e),Ar.applyMatrix3(t),this.setXY(e,Ar.x,Ar.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.applyMatrix3(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.applyMatrix4(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.applyNormalMatrix(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Me.fromBufferAttribute(this,e),Me.transformDirection(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Ji(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ne(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Ji(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Ji(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Ji(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Ji(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ne(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ne(e,this.array),n=Ne(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Ne(e,this.array),n=Ne(n,this.array),s=Ne(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Ne(e,this.array),n=Ne(n,this.array),s=Ne(s,this.array),r=Ne(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==nl&&(t.usage=this.usage),t}};var Ns=class extends Fe{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Fs=class extends Fe{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Wt=class extends Fe{constructor(t,e,n){super(new Float32Array(t),e,n)}},ef=0,en=new ee,Xo=new ve,Yi=new C,qe=new $e,Ts=new $e,Ae=new C,xe=class i extends yn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ef++}),this.uuid=fs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Tl(t)?Fs:Ns)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ft().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return en.makeRotationFromQuaternion(t),this.applyMatrix4(en),this}rotateX(t){return en.makeRotationX(t),this.applyMatrix4(en),this}rotateY(t){return en.makeRotationY(t),this.applyMatrix4(en),this}rotateZ(t){return en.makeRotationZ(t),this.applyMatrix4(en),this}translate(t,e,n){return en.makeTranslation(t,e,n),this.applyMatrix4(en),this}scale(t,e,n){return en.makeScale(t,e,n),this.applyMatrix4(en),this}lookAt(t){return Xo.lookAt(t),Xo.updateMatrix(),this.applyMatrix4(Xo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Yi).negate(),this.translate(Yi.x,Yi.y,Yi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Wt(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new $e);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new C(-1/0,-1/0,-1/0),new C(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];qe.setFromBufferAttribute(r),this.morphTargetsRelative?(Ae.addVectors(this.boundingBox.min,qe.min),this.boundingBox.expandByPoint(Ae),Ae.addVectors(this.boundingBox.max,qe.max),this.boundingBox.expandByPoint(Ae)):(this.boundingBox.expandByPoint(qe.min),this.boundingBox.expandByPoint(qe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Un);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new C,1/0);return}if(t){let n=this.boundingSphere.center;if(qe.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Ts.setFromBufferAttribute(o),this.morphTargetsRelative?(Ae.addVectors(qe.min,Ts.min),qe.expandByPoint(Ae),Ae.addVectors(qe.max,Ts.max),qe.expandByPoint(Ae)):(qe.expandByPoint(Ts.min),qe.expandByPoint(Ts.max))}qe.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Ae.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Ae));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let h=0,u=o.count;h<u;h++)Ae.fromBufferAttribute(o,h),c&&(Yi.fromBufferAttribute(t,h),Ae.add(Yi)),s=Math.max(s,n.distanceToSquared(Ae))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Fe(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],c=[];for(let L=0;L<n.count;L++)o[L]=new C,c[L]=new C;let h=new C,u=new C,f=new C,d=new Et,m=new Et,_=new Et,x=new C,p=new C;function l(L,w,S){h.fromBufferAttribute(n,L),u.fromBufferAttribute(n,w),f.fromBufferAttribute(n,S),d.fromBufferAttribute(r,L),m.fromBufferAttribute(r,w),_.fromBufferAttribute(r,S),u.sub(h),f.sub(h),m.sub(d),_.sub(d);let P=1/(m.x*_.y-_.x*m.y);isFinite(P)&&(x.copy(u).multiplyScalar(_.y).addScaledVector(f,-m.y).multiplyScalar(P),p.copy(f).multiplyScalar(m.x).addScaledVector(u,-_.x).multiplyScalar(P),o[L].add(x),o[w].add(x),o[S].add(x),c[L].add(p),c[w].add(p),c[S].add(p))}let g=this.groups;g.length===0&&(g=[{start:0,count:t.count}]);for(let L=0,w=g.length;L<w;++L){let S=g[L],P=S.start,H=S.count;for(let z=P,W=P+H;z<W;z+=3)l(t.getX(z+0),t.getX(z+1),t.getX(z+2))}let y=new C,v=new C,T=new C,E=new C;function R(L){T.fromBufferAttribute(s,L),E.copy(T);let w=o[L];y.copy(w),y.sub(T.multiplyScalar(T.dot(w))).normalize(),v.crossVectors(E,w);let P=v.dot(c[L])<0?-1:1;a.setXYZW(L,y.x,y.y,y.z,P)}for(let L=0,w=g.length;L<w;++L){let S=g[L],P=S.start,H=S.count;for(let z=P,W=P+H;z<W;z+=3)R(t.getX(z+0)),R(t.getX(z+1)),R(t.getX(z+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Fe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,m=n.count;d<m;d++)n.setXYZ(d,0,0,0);let s=new C,r=new C,a=new C,o=new C,c=new C,h=new C,u=new C,f=new C;if(t)for(let d=0,m=t.count;d<m;d+=3){let _=t.getX(d+0),x=t.getX(d+1),p=t.getX(d+2);s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,x),a.fromBufferAttribute(e,p),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),o.fromBufferAttribute(n,_),c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,p),o.add(u),c.add(u),h.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(x,c.x,c.y,c.z),n.setXYZ(p,h.x,h.y,h.z)}else for(let d=0,m=e.count;d<m;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),u.subVectors(a,r),f.subVectors(s,r),u.cross(f),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ae.fromBufferAttribute(t,e),Ae.normalize(),t.setXYZ(e,Ae.x,Ae.y,Ae.z)}toNonIndexed(){function t(o,c){let h=o.array,u=o.itemSize,f=o.normalized,d=new h.constructor(c.length*u),m=0,_=0;for(let x=0,p=c.length;x<p;x++){o.isInterleavedBufferAttribute?m=c[x]*o.data.stride+o.offset:m=c[x]*u;for(let l=0;l<u;l++)d[_++]=h[m++]}return new Fe(d,u,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],h=t(c,n);e.setAttribute(o,h)}let r=this.morphAttributes;for(let o in r){let c=[],h=r[o];for(let u=0,f=h.length;u<f;u++){let d=h[u],m=t(d,n);c.push(m)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let h=a[o];e.addGroup(h.start,h.count,h.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(t[h]=c[h]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let h=n[c];t.data.attributes[c]=h.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],u=[];for(let f=0,d=h.length;f<d;f++){let m=h[f];u.push(m.toJSON(t.data))}u.length>0&&(s[c]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let h in s){let u=s[h];this.setAttribute(h,u.clone(e))}let r=t.morphAttributes;for(let h in r){let u=[],f=r[h];for(let d=0,m=f.length;d<m;d++)u.push(f[d].clone(e));this.morphAttributes[h]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let h=0,u=a.length;h<u;h++){let f=a[h];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Gc=new ee,fi=new Jn,Cr=new Un,Wc=new C,Rr=new C,Ir=new C,Pr=new C,qo=new C,Lr=new C,Xc=new C,Dr=new C,st=class extends ve{constructor(t=new xe,e=new Je){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Lr.set(0,0,0);for(let c=0,h=r.length;c<h;c++){let u=o[c],f=r[c];u!==0&&(qo.fromBufferAttribute(f,t),a?Lr.addScaledVector(qo,u):Lr.addScaledVector(qo.sub(e),u))}e.add(Lr)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Cr.copy(n.boundingSphere),Cr.applyMatrix4(r),fi.copy(t.ray).recast(t.near),!(Cr.containsPoint(fi.origin)===!1&&(fi.intersectSphere(Cr,Wc)===null||fi.origin.distanceToSquared(Wc)>(t.far-t.near)**2))&&(Gc.copy(r).invert(),fi.copy(t.ray).applyMatrix4(Gc),!(n.boundingBox!==null&&fi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,fi)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,h=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,d=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,x=d.length;_<x;_++){let p=d[_],l=a[p.materialIndex],g=Math.max(p.start,m.start),y=Math.min(o.count,Math.min(p.start+p.count,m.start+m.count));for(let v=g,T=y;v<T;v+=3){let E=o.getX(v),R=o.getX(v+1),L=o.getX(v+2);s=Ur(this,l,t,n,h,u,f,E,R,L),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let _=Math.max(0,m.start),x=Math.min(o.count,m.start+m.count);for(let p=_,l=x;p<l;p+=3){let g=o.getX(p),y=o.getX(p+1),v=o.getX(p+2);s=Ur(this,a,t,n,h,u,f,g,y,v),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let _=0,x=d.length;_<x;_++){let p=d[_],l=a[p.materialIndex],g=Math.max(p.start,m.start),y=Math.min(c.count,Math.min(p.start+p.count,m.start+m.count));for(let v=g,T=y;v<T;v+=3){let E=v,R=v+1,L=v+2;s=Ur(this,l,t,n,h,u,f,E,R,L),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=p.materialIndex,e.push(s))}}else{let _=Math.max(0,m.start),x=Math.min(c.count,m.start+m.count);for(let p=_,l=x;p<l;p+=3){let g=p,y=p+1,v=p+2;s=Ur(this,a,t,n,h,u,f,g,y,v),s&&(s.faceIndex=Math.floor(p/3),e.push(s))}}}};function nf(i,t,e,n,s,r,a,o){let c;if(t.side===Be?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,t.side===Dn,o),c===null)return null;Dr.copy(o),Dr.applyMatrix4(i.matrixWorld);let h=e.ray.origin.distanceTo(Dr);return h<e.near||h>e.far?null:{distance:h,point:Dr.clone(),object:i}}function Ur(i,t,e,n,s,r,a,o,c,h){i.getVertexPosition(o,Rr),i.getVertexPosition(c,Ir),i.getVertexPosition(h,Pr);let u=nf(i,t,e,n,Rr,Ir,Pr,Xc);if(u){let f=new C;Pn.getBarycoord(Xc,Rr,Ir,Pr,f),s&&(u.uv=Pn.getInterpolatedAttribute(s,o,c,h,f,new Et)),r&&(u.uv1=Pn.getInterpolatedAttribute(r,o,c,h,f,new Et)),a&&(u.normal=Pn.getInterpolatedAttribute(a,o,c,h,f,new C),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let d={a:o,b:c,c:h,normal:new C,materialIndex:0};Pn.getNormal(Rr,Ir,Pr,d.normal),u.face=d,u.barycoord=f}return u}var ae=class i extends xe{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],h=[],u=[],f=[],d=0,m=0;_("z","y","x",-1,-1,n,e,t,a,r,0),_("z","y","x",1,-1,n,e,-t,a,r,1),_("x","z","y",1,1,t,n,e,s,a,2),_("x","z","y",1,-1,t,n,-e,s,a,3),_("x","y","z",1,-1,t,e,n,s,r,4),_("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Wt(h,3)),this.setAttribute("normal",new Wt(u,3)),this.setAttribute("uv",new Wt(f,2));function _(x,p,l,g,y,v,T,E,R,L,w){let S=v/R,P=T/L,H=v/2,z=T/2,W=E/2,$=R+1,U=L+1,G=0,O=0,X=new C;for(let K=0;K<U;K++){let rt=K*P-z;for(let yt=0;yt<$;yt++){let Vt=yt*S-H;X[x]=Vt*g,X[p]=rt*y,X[l]=W,h.push(X.x,X.y,X.z),X[x]=0,X[p]=0,X[l]=E>0?1:-1,u.push(X.x,X.y,X.z),f.push(yt/R),f.push(1-K/L),G+=1}}for(let K=0;K<L;K++)for(let rt=0;rt<R;rt++){let yt=d+rt+$*K,Vt=d+rt+$*(K+1),Y=d+(rt+1)+$*(K+1),it=d+(rt+1)+$*K;c.push(yt,Vt,it),c.push(Vt,Y,it),O+=6}o.addGroup(m,O,w),m+=O,d+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Ai(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Pe(i){let t={};for(let e=0;e<i.length;e++){let n=Ai(i[e]);for(let s in n)t[s]=n[s]}return t}function sf(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Al(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Gt.workingColorSpace}var Yh={clone:Ai,merge:Pe},rf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,af=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,fn=class extends Nn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=rf,this.fragmentShader=af,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ai(t.uniforms),this.uniformsGroups=sf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Os=class extends ve{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ee,this.projectionMatrix=new ee,this.projectionMatrixInverse=new ee,this.coordinateSystem=xn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Yn=new C,qc=new Et,Yc=new Et,be=class extends Os{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=ts*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ki*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ts*2*Math.atan(Math.tan(Ki*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Yn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z),Yn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Yn.x,Yn.y).multiplyScalar(-t/Yn.z)}getViewSize(t,e){return this.getViewBounds(t,qc,Yc),e.subVectors(Yc,qc)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ki*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,h=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*n/h,s*=a.width/c,n*=a.height/h}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},$i=-90,Zi=1,jr=class extends ve{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new be($i,Zi,t,e);s.layers=this.layers,this.add(s);let r=new be($i,Zi,t,e);r.layers=this.layers,this.add(r);let a=new be($i,Zi,t,e);a.layers=this.layers,this.add(a);let o=new be($i,Zi,t,e);o.layers=this.layers,this.add(o);let c=new be($i,Zi,t,e);c.layers=this.layers,this.add(c);let h=new be($i,Zi,t,e);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,c]=e;for(let h of e)this.remove(h);if(t===xn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Ls)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let h of e)this.add(h),h.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,h,u]=this.children,f=t.getRenderTarget(),d=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,c),t.setRenderTarget(n,4,s),t.render(e,h),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(f,d,m),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Bs=class extends Ye{constructor(t=[],e=Ei,n,s,r,a,o,c,h,u){super(t,e,n,s,r,a,o,c,h,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Qr=class extends vn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Bs(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ae(5,5,5),r=new fn({name:"CubemapFromEquirect",uniforms:Ai(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Be,blending:Bn});r.uniforms.tEquirect.value=e;let a=new st(s,r),o=e.minFilter;return e.minFilter===ii&&(e.minFilter=dn),new jr(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}},un=class extends ve{constructor(){super(),this.isGroup=!0,this.type="Group"}},of={type:"move"},is=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new C,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new C),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new C,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new C),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,h=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(h&&t.hand){a=!0;for(let x of t.hand.values()){let p=e.getJointPose(x,n),l=this._getHandJoint(h,x);p!==null&&(l.matrix.fromArray(p.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,l.jointRadius=p.radius),l.visible=p!==null}let u=h.joints["index-finger-tip"],f=h.joints["thumb-tip"],d=u.position.distanceTo(f.position),m=.02,_=.005;h.inputState.pinching&&d>m+_?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!h.inputState.pinching&&d<=m-_&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(of)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new un;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},zs=class i{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ot(t),this.density=e}clone(){return new i(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var ks=class extends ve{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ze,this.environmentIntensity=1,this.environmentRotation=new Ze,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var Yo=new C,lf=new C,cf=new Ft,He=class{constructor(t=new C(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Yo.subVectors(n,e).cross(lf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(Yo),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||cf.getNormalMatrix(t),s=this.coplanarPoint(Yo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},pi=new Un,hf=new Et(.5,.5),Nr=new C,ss=class{constructor(t=new He,e=new He,n=new He,s=new He,r=new He,a=new He){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=xn){let n=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],c=s[3],h=s[4],u=s[5],f=s[6],d=s[7],m=s[8],_=s[9],x=s[10],p=s[11],l=s[12],g=s[13],y=s[14],v=s[15];if(n[0].setComponents(c-r,d-h,p-m,v-l).normalize(),n[1].setComponents(c+r,d+h,p+m,v+l).normalize(),n[2].setComponents(c+a,d+u,p+_,v+g).normalize(),n[3].setComponents(c-a,d-u,p-_,v-g).normalize(),n[4].setComponents(c-o,d-f,p-x,v-y).normalize(),e===xn)n[5].setComponents(c+o,d+f,p+x,v+y).normalize();else if(e===Ls)n[5].setComponents(o,f,x,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),pi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),pi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(pi)}intersectsSprite(t){pi.center.set(0,0,0);let e=hf.distanceTo(t.center);return pi.radius=.7071067811865476+e,pi.applyMatrix4(t.matrixWorld),this.intersectsSphere(pi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Nr.x=s.normal.x>0?t.max.x:t.min.x,Nr.y=s.normal.y>0?t.max.y:t.min.y,Nr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Nr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var pn=class extends Nn{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ot(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},ta=new C,ea=new C,$c=new ee,As=new Jn,Fr=new Un,$o=new C,Zc=new C,Oe=class extends ve{constructor(t=new xe,e=new pn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)ta.fromBufferAttribute(e,s-1),ea.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=ta.distanceTo(ea);t.setAttribute("lineDistance",new Wt(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fr.copy(n.boundingSphere),Fr.applyMatrix4(s),Fr.radius+=r,t.ray.intersectsSphere(Fr)===!1)return;$c.copy(s).invert(),As.copy(t.ray).applyMatrix4($c);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){let m=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let x=m,p=_-1;x<p;x+=h){let l=u.getX(x),g=u.getX(x+1),y=Or(this,t,As,c,l,g,x);y&&e.push(y)}if(this.isLineLoop){let x=u.getX(_-1),p=u.getX(m),l=Or(this,t,As,c,x,p,_-1);l&&e.push(l)}}else{let m=Math.max(0,a.start),_=Math.min(d.count,a.start+a.count);for(let x=m,p=_-1;x<p;x+=h){let l=Or(this,t,As,c,x,x+1,x);l&&e.push(l)}if(this.isLineLoop){let x=Or(this,t,As,c,_-1,m,_-1);x&&e.push(x)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Or(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(ta.fromBufferAttribute(o,s),ea.fromBufferAttribute(o,r),e.distanceSqToSegment(ta,ea,$o,Zc)>n)return;$o.applyMatrix4(i.matrixWorld);let h=t.ray.origin.distanceTo($o);if(!(h<t.near||h>t.far))return{distance:h,point:Zc.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Jc=new C,Kc=new C,vi=class extends Oe{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Jc.fromBufferAttribute(e,s),Kc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Jc.distanceTo(Kc);t.setAttribute("lineDistance",new Wt(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Hs=class extends Ye{constructor(t,e,n=si,s,r,a,o=nn,c=nn,h,u=Qi,f=1){if(u!==Qi&&u!==ds)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:f};super(d,s,r,a,o,c,u,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new es(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}};var ye=class i extends xe{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let h=this;s=Math.floor(s),r=Math.floor(r);let u=[],f=[],d=[],m=[],_=0,x=[],p=n/2,l=0;g(),a===!1&&(t>0&&y(!0),e>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new Wt(f,3)),this.setAttribute("normal",new Wt(d,3)),this.setAttribute("uv",new Wt(m,2));function g(){let v=new C,T=new C,E=0,R=(e-t)/n;for(let L=0;L<=r;L++){let w=[],S=L/r,P=S*(e-t)+t;for(let H=0;H<=s;H++){let z=H/s,W=z*c+o,$=Math.sin(W),U=Math.cos(W);T.x=P*$,T.y=-S*n+p,T.z=P*U,f.push(T.x,T.y,T.z),v.set($,R,U).normalize(),d.push(v.x,v.y,v.z),m.push(z,1-S),w.push(_++)}x.push(w)}for(let L=0;L<s;L++)for(let w=0;w<r;w++){let S=x[w][L],P=x[w+1][L],H=x[w+1][L+1],z=x[w][L+1];(t>0||w!==0)&&(u.push(S,P,z),E+=3),(e>0||w!==r-1)&&(u.push(P,H,z),E+=3)}h.addGroup(l,E,0),l+=E}function y(v){let T=_,E=new Et,R=new C,L=0,w=v===!0?t:e,S=v===!0?1:-1;for(let H=1;H<=s;H++)f.push(0,p*S,0),d.push(0,S,0),m.push(.5,.5),_++;let P=_;for(let H=0;H<=s;H++){let W=H/s*c+o,$=Math.cos(W),U=Math.sin(W);R.x=w*U,R.y=p*S,R.z=w*$,f.push(R.x,R.y,R.z),d.push(0,S,0),E.x=$*.5+.5,E.y=U*.5*S+.5,m.push(E.x,E.y),_++}for(let H=0;H<s;H++){let z=T+H,W=P+H;v===!0?u.push(W,W+1,z):u.push(W+1,W,z),L+=3}h.addGroup(l,L,v===!0?1:2),l+=L}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Vs=class i extends ye{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},na=class i extends xe{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),h(n),u(),this.setAttribute("position",new Wt(r,3)),this.setAttribute("normal",new Wt(r.slice(),3)),this.setAttribute("uv",new Wt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(g){let y=new C,v=new C,T=new C;for(let E=0;E<e.length;E+=3)m(e[E+0],y),m(e[E+1],v),m(e[E+2],T),c(y,v,T,g)}function c(g,y,v,T){let E=T+1,R=[];for(let L=0;L<=E;L++){R[L]=[];let w=g.clone().lerp(v,L/E),S=y.clone().lerp(v,L/E),P=E-L;for(let H=0;H<=P;H++)H===0&&L===E?R[L][H]=w:R[L][H]=w.clone().lerp(S,H/P)}for(let L=0;L<E;L++)for(let w=0;w<2*(E-L)-1;w++){let S=Math.floor(w/2);w%2===0?(d(R[L][S+1]),d(R[L+1][S]),d(R[L][S])):(d(R[L][S+1]),d(R[L+1][S+1]),d(R[L+1][S]))}}function h(g){let y=new C;for(let v=0;v<r.length;v+=3)y.x=r[v+0],y.y=r[v+1],y.z=r[v+2],y.normalize().multiplyScalar(g),r[v+0]=y.x,r[v+1]=y.y,r[v+2]=y.z}function u(){let g=new C;for(let y=0;y<r.length;y+=3){g.x=r[y+0],g.y=r[y+1],g.z=r[y+2];let v=p(g)/2/Math.PI+.5,T=l(g)/Math.PI+.5;a.push(v,1-T)}_(),f()}function f(){for(let g=0;g<a.length;g+=6){let y=a[g+0],v=a[g+2],T=a[g+4],E=Math.max(y,v,T),R=Math.min(y,v,T);E>.9&&R<.1&&(y<.2&&(a[g+0]+=1),v<.2&&(a[g+2]+=1),T<.2&&(a[g+4]+=1))}}function d(g){r.push(g.x,g.y,g.z)}function m(g,y){let v=g*3;y.x=t[v+0],y.y=t[v+1],y.z=t[v+2]}function _(){let g=new C,y=new C,v=new C,T=new C,E=new Et,R=new Et,L=new Et;for(let w=0,S=0;w<r.length;w+=9,S+=6){g.set(r[w+0],r[w+1],r[w+2]),y.set(r[w+3],r[w+4],r[w+5]),v.set(r[w+6],r[w+7],r[w+8]),E.set(a[S+0],a[S+1]),R.set(a[S+2],a[S+3]),L.set(a[S+4],a[S+5]),T.copy(g).add(y).add(v).divideScalar(3);let P=p(T);x(E,S+0,g,P),x(R,S+2,y,P),x(L,S+4,v,P)}}function x(g,y,v,T){T<0&&g.x===1&&(a[y]=g.x-1),v.x===0&&v.z===0&&(a[y]=T/2/Math.PI+.5)}function p(g){return Math.atan2(g.z,-g.x)}function l(g){return Math.atan2(-g.y,Math.sqrt(g.x*g.x+g.z*g.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.details)}};var Br=new C,zr=new C,Zo=new C,kr=new Pn,Gs=class extends xe{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){let s=Math.pow(10,4),r=Math.cos(Ki*e),a=t.getIndex(),o=t.getAttribute("position"),c=a?a.count:o.count,h=[0,0,0],u=["a","b","c"],f=new Array(3),d={},m=[];for(let _=0;_<c;_+=3){a?(h[0]=a.getX(_),h[1]=a.getX(_+1),h[2]=a.getX(_+2)):(h[0]=_,h[1]=_+1,h[2]=_+2);let{a:x,b:p,c:l}=kr;if(x.fromBufferAttribute(o,h[0]),p.fromBufferAttribute(o,h[1]),l.fromBufferAttribute(o,h[2]),kr.getNormal(Zo),f[0]=`${Math.round(x.x*s)},${Math.round(x.y*s)},${Math.round(x.z*s)}`,f[1]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,f[2]=`${Math.round(l.x*s)},${Math.round(l.y*s)},${Math.round(l.z*s)}`,!(f[0]===f[1]||f[1]===f[2]||f[2]===f[0]))for(let g=0;g<3;g++){let y=(g+1)%3,v=f[g],T=f[y],E=kr[u[g]],R=kr[u[y]],L=`${v}_${T}`,w=`${T}_${v}`;w in d&&d[w]?(Zo.dot(d[w].normal)<=r&&(m.push(E.x,E.y,E.z),m.push(R.x,R.y,R.z)),d[w]=null):L in d||(d[L]={index0:h[g],index1:h[y],normal:Zo.clone()})}}for(let _ in d)if(d[_]){let{index0:x,index1:p}=d[_];Br.fromBufferAttribute(o,x),zr.fromBufferAttribute(o,p),m.push(Br.x,Br.y,Br.z),m.push(zr.x,zr.y,zr.z)}this.setAttribute("position",new Wt(m,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};var Kn=class i extends na{constructor(t=1,e=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},Fn=class i extends xe{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),c=Math.floor(s),h=o+1,u=c+1,f=t/o,d=e/c,m=[],_=[],x=[],p=[];for(let l=0;l<u;l++){let g=l*d-a;for(let y=0;y<h;y++){let v=y*f-r;_.push(v,-g,0),x.push(0,0,1),p.push(y/o),p.push(1-l/c)}}for(let l=0;l<c;l++)for(let g=0;g<o;g++){let y=g+h*l,v=g+h*(l+1),T=g+1+h*(l+1),E=g+1+h*l;m.push(y,v,E),m.push(v,T,E)}this.setIndex(m),this.setAttribute("position",new Wt(_,3)),this.setAttribute("normal",new Wt(x,3)),this.setAttribute("uv",new Wt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},Ws=class i extends xe{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],c=[],h=[],u=[],f=t,d=(e-t)/s,m=new C,_=new Et;for(let x=0;x<=s;x++){for(let p=0;p<=n;p++){let l=r+p/n*a;m.x=f*Math.cos(l),m.y=f*Math.sin(l),c.push(m.x,m.y,m.z),h.push(0,0,1),_.x=(m.x/e+1)/2,_.y=(m.y/e+1)/2,u.push(_.x,_.y)}f+=d}for(let x=0;x<s;x++){let p=x*(n+1);for(let l=0;l<n;l++){let g=l+p,y=g,v=g+n+1,T=g+n+2,E=g+1;o.push(y,v,E),o.push(v,T,E)}}this.setIndex(o),this.setAttribute("position",new Wt(c,3)),this.setAttribute("normal",new Wt(h,3)),this.setAttribute("uv",new Wt(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var jn=class i extends xe{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),h=0,u=[],f=new C,d=new C,m=[],_=[],x=[],p=[];for(let l=0;l<=n;l++){let g=[],y=l/n,v=0;l===0&&a===0?v=.5/e:l===n&&c===Math.PI&&(v=-.5/e);for(let T=0;T<=e;T++){let E=T/e;f.x=-t*Math.cos(s+E*r)*Math.sin(a+y*o),f.y=t*Math.cos(a+y*o),f.z=t*Math.sin(s+E*r)*Math.sin(a+y*o),_.push(f.x,f.y,f.z),d.copy(f).normalize(),x.push(d.x,d.y,d.z),p.push(E+v,1-y),g.push(h++)}u.push(g)}for(let l=0;l<n;l++)for(let g=0;g<e;g++){let y=u[l][g+1],v=u[l][g],T=u[l+1][g],E=u[l+1][g+1];(l!==0||a>0)&&m.push(y,v,E),(l!==n-1||c<Math.PI)&&m.push(v,T,E)}this.setIndex(m),this.setAttribute("position",new Wt(_,3)),this.setAttribute("normal",new Wt(x,3)),this.setAttribute("uv",new Wt(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var On=class i extends xe{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r},n=Math.floor(n),s=Math.floor(s);let a=[],o=[],c=[],h=[],u=new C,f=new C,d=new C;for(let m=0;m<=n;m++)for(let _=0;_<=s;_++){let x=_/s*r,p=m/n*Math.PI*2;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),o.push(f.x,f.y,f.z),u.x=t*Math.cos(x),u.y=t*Math.sin(x),d.subVectors(f,u).normalize(),c.push(d.x,d.y,d.z),h.push(_/s),h.push(m/n)}for(let m=1;m<=n;m++)for(let _=1;_<=s;_++){let x=(s+1)*m+_-1,p=(s+1)*(m-1)+_-1,l=(s+1)*(m-1)+_,g=(s+1)*m+_;a.push(x,p,g),a.push(p,l,g)}this.setIndex(a),this.setAttribute("position",new Wt(o,3)),this.setAttribute("normal",new Wt(c,3)),this.setAttribute("uv",new Wt(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var Xs=class extends Nn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Sl,this.normalScale=new Et(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ze,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var ia=class extends Nn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Lh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},sa=class extends Nn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Hr(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function uf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Mi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},ra=class extends Mi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:jo,endingEnd:jo}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Qo:r=t,o=2*e-n;break;case tl:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Qo:a=t,c=2*n-e;break;case tl:a=1,c=n+s[1]-s[0];break;default:a=t-1,c=e}let h=(n-e)*.5,u=this.valueSize;this._weightPrev=h/(e-o),this._weightNext=h/(c-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,u=this._offsetPrev,f=this._offsetNext,d=this._weightPrev,m=this._weightNext,_=(n-e)/(s-e),x=_*_,p=x*_,l=-d*p+2*d*x-d*_,g=(1+d)*p+(-1.5-2*d)*x+(-.5+d)*_+1,y=(-1-m)*p+(1.5+m)*x+.5*_,v=m*p-m*x;for(let T=0;T!==o;++T)r[T]=l*a[u+T]+g*a[h+T]+y*a[c+T]+v*a[f+T];return r}},aa=class extends Mi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,u=(n-e)/(s-e),f=1-u;for(let d=0;d!==o;++d)r[d]=a[h+d]*f+a[c+d]*u;return r}},oa=class extends Mi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Ke=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Hr(e,this.TimeBufferType),this.values=Hr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Hr(t.times,Array),values:Hr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new oa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new aa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ra(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Is:e=this.InterpolantFactoryMethodDiscrete;break;case $r:e=this.InterpolantFactoryMethodLinear;break;case Gr:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Is;case this.InterpolantFactoryMethodLinear:return $r;case this.InterpolantFactoryMethodSmooth:return Gr}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(s!==void 0&&uf(s))for(let o=0,c=s.length;o!==c;++o){let h=s[o];if(isNaN(h)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,h),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Gr,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,h=t[o],u=t[o+1];if(h!==u&&(o!==1||h!==t[0]))if(s)c=!0;else{let f=o*n,d=f-n,m=f+n;for(let _=0;_!==n;++_){let x=e[f+_];if(x!==e[d+_]||x!==e[m+_]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let f=o*n,d=a*n;for(let m=0;m!==n;++m)e[d+m]=e[f+m]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,c=a*n,h=0;h!==n;++h)e[c+h]=e[o+h];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Ke.prototype.ValueTypeName="";Ke.prototype.TimeBufferType=Float32Array;Ke.prototype.ValueBufferType=Float32Array;Ke.prototype.DefaultInterpolation=$r;var Qn=class extends Ke{constructor(t,e,n){super(t,e,n)}};Qn.prototype.ValueTypeName="bool";Qn.prototype.ValueBufferType=Array;Qn.prototype.DefaultInterpolation=Is;Qn.prototype.InterpolantFactoryMethodLinear=void 0;Qn.prototype.InterpolantFactoryMethodSmooth=void 0;var la=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}};la.prototype.ValueTypeName="color";var ca=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}};ca.prototype.ValueTypeName="number";var ha=class extends Mi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-e)/(s-e),h=t*o;for(let u=h+o;h!==u;h+=4)ge.slerpFlat(r,0,a,h-o,a,h,c);return r}},qs=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new ha(this.times,this.values,this.getValueSize(),t)}};qs.prototype.ValueTypeName="quaternion";qs.prototype.InterpolantFactoryMethodSmooth=void 0;var ti=class extends Ke{constructor(t,e,n){super(t,e,n)}};ti.prototype.ValueTypeName="string";ti.prototype.ValueBufferType=Array;ti.prototype.DefaultInterpolation=Is;ti.prototype.InterpolantFactoryMethodLinear=void 0;ti.prototype.InterpolantFactoryMethodSmooth=void 0;var ua=class extends Ke{constructor(t,e,n,s){super(t,e,n,s)}};ua.prototype.ValueTypeName="vector";var da=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,c,h=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,f){return h.push(u,f),this},this.removeHandler=function(u){let f=h.indexOf(u);return f!==-1&&h.splice(f,2),this},this.getHandler=function(u){for(let f=0,d=h.length;f<d;f+=2){let m=h[f],_=h[f+1];if(m.global&&(m.lastIndex=0),m.test(u))return _}return null}}},$h=new da,fa=class{constructor(t){this.manager=t!==void 0?t:$h,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};fa.DEFAULT_MATERIAL_NAME="__DEFAULT";var rs=class extends ve{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ot(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},Ys=class extends rs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ve.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ot(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},Jo=new ee,jc=new C,Qc=new C,pa=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Et(512,512),this.mapType=mn,this.map=null,this.mapPass=null,this.matrix=new ee,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ss,this._frameExtents=new Et(1,1),this._viewportCount=1,this._viewports=[new jt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;jc.setFromMatrixPosition(t.matrixWorld),e.position.copy(jc),Qc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Qc),e.updateMatrixWorld(),Jo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Jo),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Jo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var th=new ee,Cs=new C,Ko=new C,il=class extends pa{constructor(){super(new be(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Et(4,2),this._viewportCount=6,this._viewports=[new jt(2,1,1,1),new jt(0,1,1,1),new jt(3,1,1,1),new jt(1,1,1,1),new jt(3,0,1,1),new jt(1,0,1,1)],this._cubeDirections=[new C(1,0,0),new C(-1,0,0),new C(0,0,1),new C(0,0,-1),new C(0,1,0),new C(0,-1,0)],this._cubeUps=[new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,1,0),new C(0,0,1),new C(0,0,-1)]}updateMatrices(t,e=0){let n=this.camera,s=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Cs.setFromMatrixPosition(t.matrixWorld),n.position.copy(Cs),Ko.copy(n.position),Ko.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(Ko),n.updateMatrixWorld(),s.makeTranslation(-Cs.x,-Cs.y,-Cs.z),th.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(th)}},Si=class extends rs{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new il}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}},$s=class extends Os{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,a=r+h*this.view.width,o-=u*this.view.offsetY,c=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},sl=class extends pa{constructor(){super(new $s(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Zs=class extends rs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ve.DEFAULT_UP),this.updateMatrix(),this.target=new ve,this.shadow=new sl}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}};var ma=class extends be{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Cl="\\[\\]\\.:\\/",df=new RegExp("["+Cl+"]","g"),Rl="[^"+Cl+"]",ff="[^"+Cl.replace("\\.","")+"]",pf=/((?:WC+[\/:])*)/.source.replace("WC",Rl),mf=/(WCOD+)?/.source.replace("WCOD",ff),gf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Rl),_f=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Rl),xf=new RegExp("^"+pf+mf+gf+_f+"$"),yf=["material","materials","bones","map"],rl=class{constructor(t,e,n){let s=n||ce.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},ce=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(df,"")}static parseTrackName(t){let e=xf.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);yf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=n(o.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===h){h=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(h!==void 0){if(t[h]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[h]}}let a=t[s];if(a===void 0){let h=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+h+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ce.Composite=rl;ce.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ce.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ce.prototype.GetterByBindingType=[ce.prototype._getValue_direct,ce.prototype._getValue_array,ce.prototype._getValue_arrayElement,ce.prototype._getValue_toArray];ce.prototype.SetterByBindingTypeAndVersioning=[[ce.prototype._setValue_direct,ce.prototype._setValue_direct_setNeedsUpdate,ce.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ce.prototype._setValue_array,ce.prototype._setValue_array_setNeedsUpdate,ce.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ce.prototype._setValue_arrayElement,ce.prototype._setValue_arrayElement_setNeedsUpdate,ce.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ce.prototype._setValue_fromArray,ce.prototype._setValue_fromArray_setNeedsUpdate,ce.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ix=new Float32Array(1);var eh=new ee,bi=class{constructor(t,e,n=0,s=1/0){this.ray=new Jn(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ns,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return eh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(eh),this}intersectObject(t,e=!0,n=[]){return al(t,this,n,e),n.sort(nh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)al(t[s],this,n,e);return n.sort(nh),n}};function nh(i,t){return i.distance-t.distance}function al(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)al(r[a],t,e,!0)}}var as=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=kt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(kt(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Js=class extends vi{constructor(t=10,e=10,n=4473924,s=8947848){n=new Ot(n),s=new Ot(s);let r=e/2,a=t/e,o=t/2,c=[],h=[];for(let d=0,m=0,_=-o;d<=e;d++,_+=a){c.push(-o,0,_,o,0,_),c.push(_,0,-o,_,0,o);let x=d===r?n:s;x.toArray(h,m),m+=3,x.toArray(h,m),m+=3,x.toArray(h,m),m+=3,x.toArray(h,m),m+=3}let u=new xe;u.setAttribute("position",new Wt(c,3)),u.setAttribute("color",new Wt(h,3));let f=new pn({vertexColors:!0,toneMapped:!1});super(u,f),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}};var Vr=new $e,os=class extends vi{constructor(t,e=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=new Float32Array(24),r=new xe;r.setIndex(new Fe(n,1)),r.setAttribute("position",new Fe(s,3)),super(r,new pn({color:e,toneMapped:!1})),this.object=t,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&Vr.setFromObject(this.object),Vr.isEmpty())return;let t=Vr.min,e=Vr.max,n=this.geometry.attributes.position,s=n.array;s[0]=e.x,s[1]=e.y,s[2]=e.z,s[3]=t.x,s[4]=e.y,s[5]=e.z,s[6]=t.x,s[7]=t.y,s[8]=e.z,s[9]=e.x,s[10]=t.y,s[11]=e.z,s[12]=e.x,s[13]=e.y,s[14]=t.z,s[15]=t.x,s[16]=e.y,s[17]=t.z,s[18]=t.x,s[19]=t.y,s[20]=t.z,s[21]=e.x,s[22]=t.y,s[23]=t.z,n.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(t){return this.object=t,this.update(),this}copy(t,e){return super.copy(t,e),this.object=t.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}};var wi=class extends yn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Il(i,t,e,n){let s=vf(n);switch(e){case _l:return i*t;case yl:return i*t/s.components*s.byteLength;case Ia:return i*t/s.components*s.byteLength;case vl:return i*t*2/s.components*s.byteLength;case Pa:return i*t*2/s.components*s.byteLength;case xl:return i*t*3/s.components*s.byteLength;case sn:return i*t*4/s.components*s.byteLength;case La:return i*t*4/s.components*s.byteLength;case Qs:case tr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case er:case nr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ua:case Fa:return Math.max(i,16)*Math.max(t,8)/4;case Da:case Na:return Math.max(i,8)*Math.max(t,8)/2;case Oa:case Ba:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case za:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ka:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ha:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Va:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ga:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Wa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Xa:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case qa:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case $a:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Za:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Ja:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case ja:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Qa:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ir:case to:case eo:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Ml:case no:return Math.ceil(i/4)*Math.ceil(t/4)*8;case io:case so:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function vf(i){switch(i){case mn:case pl:return{byteLength:1,components:1};case cs:case ml:case hs:return{byteLength:2,components:1};case Ca:case Ra:return{byteLength:2,components:4};case si:case Aa:case Sn:return{byteLength:4,components:1};case gl:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"178"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="178");function xu(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Sf(i){let t=new WeakMap;function e(o,c){let h=o.array,u=o.usage,f=h.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,h,u),o.onUploadCallback();let m;if(h instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)m=i.HALF_FLOAT;else if(h instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)m=i.SHORT;else if(h instanceof Uint32Array)m=i.UNSIGNED_INT;else if(h instanceof Int32Array)m=i.INT;else if(h instanceof Int8Array)m=i.BYTE;else if(h instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:d,type:m,bytesPerElement:h.BYTES_PER_ELEMENT,version:o.version,size:f}}function n(o,c,h){let u=c.array,f=c.updateRanges;if(i.bindBuffer(h,o),f.length===0)i.bufferSubData(h,0,u);else{f.sort((m,_)=>m.start-_.start);let d=0;for(let m=1;m<f.length;m++){let _=f[d],x=f[m];x.start<=_.start+_.count+1?_.count=Math.max(_.count,x.start+x.count-_.start):(++d,f[d]=x)}f.length=d+1;for(let m=0,_=f.length;m<_;m++){let x=f[m];i.bufferSubData(h,x.start*u.BYTES_PER_ELEMENT,u,x.start,x.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=t.get(o);c&&(i.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let h=t.get(o);if(h===void 0)t.set(o,e(o,c));else if(h.version<o.version){if(h.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,o,c),h.version=o.version}}return{get:s,remove:r,update:a}}var bf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ef=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Tf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Af=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Cf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Rf=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,If=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Pf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Lf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Df=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Uf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Nf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ff=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Of=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Bf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,zf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Hf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Vf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Gf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Wf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Xf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,qf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Yf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,$f=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Zf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Jf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Kf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,jf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Qf="gl_FragColor = linearToOutputTexel( gl_FragColor );",tp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ep=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,np=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ip=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,sp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,rp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ap=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,op=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,lp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,cp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,hp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,up=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,dp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,fp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,pp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,mp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,gp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_p=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,xp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,yp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,vp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Mp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Sp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,bp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,wp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ep=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Tp=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ap=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cp=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ip=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Pp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Lp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Dp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Up=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Np=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Fp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Op=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,zp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,kp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Hp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Vp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Xp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,qp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Yp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,$p=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Zp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Jp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Kp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,jp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Qp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,tm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,em=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,nm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,im=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,sm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,rm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,am=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,om=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,lm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,cm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,hm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,um=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,dm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,fm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,pm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,mm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,gm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,_m=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,xm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ym=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,vm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Mm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Sm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,bm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Em=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Am=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Rm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Im=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Pm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Lm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Dm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Um=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Nm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Fm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Om=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,km=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Hm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Gm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Wm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Ym=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$m=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Km=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Qm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,tg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,eg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,zt={alphahash_fragment:bf,alphahash_pars_fragment:wf,alphamap_fragment:Ef,alphamap_pars_fragment:Tf,alphatest_fragment:Af,alphatest_pars_fragment:Cf,aomap_fragment:Rf,aomap_pars_fragment:If,batching_pars_vertex:Pf,batching_vertex:Lf,begin_vertex:Df,beginnormal_vertex:Uf,bsdfs:Nf,iridescence_fragment:Ff,bumpmap_pars_fragment:Of,clipping_planes_fragment:Bf,clipping_planes_pars_fragment:zf,clipping_planes_pars_vertex:kf,clipping_planes_vertex:Hf,color_fragment:Vf,color_pars_fragment:Gf,color_pars_vertex:Wf,color_vertex:Xf,common:qf,cube_uv_reflection_fragment:Yf,defaultnormal_vertex:$f,displacementmap_pars_vertex:Zf,displacementmap_vertex:Jf,emissivemap_fragment:Kf,emissivemap_pars_fragment:jf,colorspace_fragment:Qf,colorspace_pars_fragment:tp,envmap_fragment:ep,envmap_common_pars_fragment:np,envmap_pars_fragment:ip,envmap_pars_vertex:sp,envmap_physical_pars_fragment:mp,envmap_vertex:rp,fog_vertex:ap,fog_pars_vertex:op,fog_fragment:lp,fog_pars_fragment:cp,gradientmap_pars_fragment:hp,lightmap_pars_fragment:up,lights_lambert_fragment:dp,lights_lambert_pars_fragment:fp,lights_pars_begin:pp,lights_toon_fragment:gp,lights_toon_pars_fragment:_p,lights_phong_fragment:xp,lights_phong_pars_fragment:yp,lights_physical_fragment:vp,lights_physical_pars_fragment:Mp,lights_fragment_begin:Sp,lights_fragment_maps:bp,lights_fragment_end:wp,logdepthbuf_fragment:Ep,logdepthbuf_pars_fragment:Tp,logdepthbuf_pars_vertex:Ap,logdepthbuf_vertex:Cp,map_fragment:Rp,map_pars_fragment:Ip,map_particle_fragment:Pp,map_particle_pars_fragment:Lp,metalnessmap_fragment:Dp,metalnessmap_pars_fragment:Up,morphinstance_vertex:Np,morphcolor_vertex:Fp,morphnormal_vertex:Op,morphtarget_pars_vertex:Bp,morphtarget_vertex:zp,normal_fragment_begin:kp,normal_fragment_maps:Hp,normal_pars_fragment:Vp,normal_pars_vertex:Gp,normal_vertex:Wp,normalmap_pars_fragment:Xp,clearcoat_normal_fragment_begin:qp,clearcoat_normal_fragment_maps:Yp,clearcoat_pars_fragment:$p,iridescence_pars_fragment:Zp,opaque_fragment:Jp,packing:Kp,premultiplied_alpha_fragment:jp,project_vertex:Qp,dithering_fragment:tm,dithering_pars_fragment:em,roughnessmap_fragment:nm,roughnessmap_pars_fragment:im,shadowmap_pars_fragment:sm,shadowmap_pars_vertex:rm,shadowmap_vertex:am,shadowmask_pars_fragment:om,skinbase_vertex:lm,skinning_pars_vertex:cm,skinning_vertex:hm,skinnormal_vertex:um,specularmap_fragment:dm,specularmap_pars_fragment:fm,tonemapping_fragment:pm,tonemapping_pars_fragment:mm,transmission_fragment:gm,transmission_pars_fragment:_m,uv_pars_fragment:xm,uv_pars_vertex:ym,uv_vertex:vm,worldpos_vertex:Mm,background_vert:Sm,background_frag:bm,backgroundCube_vert:wm,backgroundCube_frag:Em,cube_vert:Tm,cube_frag:Am,depth_vert:Cm,depth_frag:Rm,distanceRGBA_vert:Im,distanceRGBA_frag:Pm,equirect_vert:Lm,equirect_frag:Dm,linedashed_vert:Um,linedashed_frag:Nm,meshbasic_vert:Fm,meshbasic_frag:Om,meshlambert_vert:Bm,meshlambert_frag:zm,meshmatcap_vert:km,meshmatcap_frag:Hm,meshnormal_vert:Vm,meshnormal_frag:Gm,meshphong_vert:Wm,meshphong_frag:Xm,meshphysical_vert:qm,meshphysical_frag:Ym,meshtoon_vert:$m,meshtoon_frag:Zm,points_vert:Jm,points_frag:Km,shadow_vert:jm,shadow_frag:Qm,sprite_vert:tg,sprite_frag:eg},ot={common:{diffuse:{value:new Ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ft}},envmap:{envMap:{value:null},envMapRotation:{value:new Ft},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ft}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ft}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ft},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ft},normalScale:{value:new Et(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ft},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ft}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ft}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ft}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0},uvTransform:{value:new Ft}},sprite:{diffuse:{value:new Ot(16777215)},opacity:{value:1},center:{value:new Et(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}}},bn={basic:{uniforms:Pe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.fog]),vertexShader:zt.meshbasic_vert,fragmentShader:zt.meshbasic_frag},lambert:{uniforms:Pe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)}}]),vertexShader:zt.meshlambert_vert,fragmentShader:zt.meshlambert_frag},phong:{uniforms:Pe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)},specular:{value:new Ot(1118481)},shininess:{value:30}}]),vertexShader:zt.meshphong_vert,fragmentShader:zt.meshphong_frag},standard:{uniforms:Pe([ot.common,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.roughnessmap,ot.metalnessmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag},toon:{uniforms:Pe([ot.common,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.gradientmap,ot.fog,ot.lights,{emissive:{value:new Ot(0)}}]),vertexShader:zt.meshtoon_vert,fragmentShader:zt.meshtoon_frag},matcap:{uniforms:Pe([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,{matcap:{value:null}}]),vertexShader:zt.meshmatcap_vert,fragmentShader:zt.meshmatcap_frag},points:{uniforms:Pe([ot.points,ot.fog]),vertexShader:zt.points_vert,fragmentShader:zt.points_frag},dashed:{uniforms:Pe([ot.common,ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:zt.linedashed_vert,fragmentShader:zt.linedashed_frag},depth:{uniforms:Pe([ot.common,ot.displacementmap]),vertexShader:zt.depth_vert,fragmentShader:zt.depth_frag},normal:{uniforms:Pe([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,{opacity:{value:1}}]),vertexShader:zt.meshnormal_vert,fragmentShader:zt.meshnormal_frag},sprite:{uniforms:Pe([ot.sprite,ot.fog]),vertexShader:zt.sprite_vert,fragmentShader:zt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ft},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:zt.background_vert,fragmentShader:zt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ft}},vertexShader:zt.backgroundCube_vert,fragmentShader:zt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:zt.cube_vert,fragmentShader:zt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:zt.equirect_vert,fragmentShader:zt.equirect_frag},distanceRGBA:{uniforms:Pe([ot.common,ot.displacementmap,{referencePosition:{value:new C},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:zt.distanceRGBA_vert,fragmentShader:zt.distanceRGBA_frag},shadow:{uniforms:Pe([ot.lights,ot.fog,{color:{value:new Ot(0)},opacity:{value:1}}]),vertexShader:zt.shadow_vert,fragmentShader:zt.shadow_frag}};bn.physical={uniforms:Pe([bn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ft},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ft},clearcoatNormalScale:{value:new Et(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ft},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ft},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ft},sheen:{value:0},sheenColor:{value:new Ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ft},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ft},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ft},transmissionSamplerSize:{value:new Et},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ft},attenuationDistance:{value:0},attenuationColor:{value:new Ot(0)},specularColor:{value:new Ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ft},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ft},anisotropyVector:{value:new Et},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ft}}]),vertexShader:zt.meshphysical_vert,fragmentShader:zt.meshphysical_frag};var ro={r:0,b:0,g:0},Ci=new Ze,ng=new ee;function ig(i,t,e,n,s,r,a){let o=new Ot(0),c=r===!0?0:1,h,u,f=null,d=0,m=null;function _(y){let v=y.isScene===!0?y.background:null;return v&&v.isTexture&&(v=(y.backgroundBlurriness>0?e:t).get(v)),v}function x(y){let v=!1,T=_(y);T===null?l(o,c):T&&T.isColor&&(l(T,1),v=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?n.buffers.color.setClear(0,0,0,1,a):E==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function p(y,v){let T=_(v);T&&(T.isCubeTexture||T.mapping===Ks)?(u===void 0&&(u=new st(new ae(1,1,1),new fn({name:"BackgroundCubeMaterial",uniforms:Ai(bn.backgroundCube.uniforms),vertexShader:bn.backgroundCube.vertexShader,fragmentShader:bn.backgroundCube.fragmentShader,side:Be,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(E,R,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Ci.copy(v.backgroundRotation),Ci.x*=-1,Ci.y*=-1,Ci.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Ci.y*=-1,Ci.z*=-1),u.material.uniforms.envMap.value=T,u.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(ng.makeRotationFromEuler(Ci)),u.material.toneMapped=Gt.getTransfer(T.colorSpace)!==Qt,(f!==T||d!==T.version||m!==i.toneMapping)&&(u.material.needsUpdate=!0,f=T,d=T.version,m=i.toneMapping),u.layers.enableAll(),y.unshift(u,u.geometry,u.material,0,0,null)):T&&T.isTexture&&(h===void 0&&(h=new st(new Fn(2,2),new fn({name:"BackgroundMaterial",uniforms:Ai(bn.background.uniforms),vertexShader:bn.background.vertexShader,fragmentShader:bn.background.fragmentShader,side:Dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(h)),h.material.uniforms.t2D.value=T,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.toneMapped=Gt.getTransfer(T.colorSpace)!==Qt,T.matrixAutoUpdate===!0&&T.updateMatrix(),h.material.uniforms.uvTransform.value.copy(T.matrix),(f!==T||d!==T.version||m!==i.toneMapping)&&(h.material.needsUpdate=!0,f=T,d=T.version,m=i.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null))}function l(y,v){y.getRGB(ro,Al(i)),n.buffers.color.setClear(ro.r,ro.g,ro.b,v,a)}function g(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,v=1){o.set(y),c=v,l(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(y){c=y,l(o,c)},render:x,addToRenderList:p,dispose:g}}function sg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,a=!1;function o(S,P,H,z,W){let $=!1,U=f(z,H,P);r!==U&&(r=U,h(r.object)),$=m(S,z,H,W),$&&_(S,z,H,W),W!==null&&t.update(W,i.ELEMENT_ARRAY_BUFFER),($||a)&&(a=!1,v(S,P,H,z),W!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(W).buffer))}function c(){return i.createVertexArray()}function h(S){return i.bindVertexArray(S)}function u(S){return i.deleteVertexArray(S)}function f(S,P,H){let z=H.wireframe===!0,W=n[S.id];W===void 0&&(W={},n[S.id]=W);let $=W[P.id];$===void 0&&($={},W[P.id]=$);let U=$[z];return U===void 0&&(U=d(c()),$[z]=U),U}function d(S){let P=[],H=[],z=[];for(let W=0;W<e;W++)P[W]=0,H[W]=0,z[W]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:H,attributeDivisors:z,object:S,attributes:{},index:null}}function m(S,P,H,z){let W=r.attributes,$=P.attributes,U=0,G=H.getAttributes();for(let O in G)if(G[O].location>=0){let K=W[O],rt=$[O];if(rt===void 0&&(O==="instanceMatrix"&&S.instanceMatrix&&(rt=S.instanceMatrix),O==="instanceColor"&&S.instanceColor&&(rt=S.instanceColor)),K===void 0||K.attribute!==rt||rt&&K.data!==rt.data)return!0;U++}return r.attributesNum!==U||r.index!==z}function _(S,P,H,z){let W={},$=P.attributes,U=0,G=H.getAttributes();for(let O in G)if(G[O].location>=0){let K=$[O];K===void 0&&(O==="instanceMatrix"&&S.instanceMatrix&&(K=S.instanceMatrix),O==="instanceColor"&&S.instanceColor&&(K=S.instanceColor));let rt={};rt.attribute=K,K&&K.data&&(rt.data=K.data),W[O]=rt,U++}r.attributes=W,r.attributesNum=U,r.index=z}function x(){let S=r.newAttributes;for(let P=0,H=S.length;P<H;P++)S[P]=0}function p(S){l(S,0)}function l(S,P){let H=r.newAttributes,z=r.enabledAttributes,W=r.attributeDivisors;H[S]=1,z[S]===0&&(i.enableVertexAttribArray(S),z[S]=1),W[S]!==P&&(i.vertexAttribDivisor(S,P),W[S]=P)}function g(){let S=r.newAttributes,P=r.enabledAttributes;for(let H=0,z=P.length;H<z;H++)P[H]!==S[H]&&(i.disableVertexAttribArray(H),P[H]=0)}function y(S,P,H,z,W,$,U){U===!0?i.vertexAttribIPointer(S,P,H,W,$):i.vertexAttribPointer(S,P,H,z,W,$)}function v(S,P,H,z){x();let W=z.attributes,$=H.getAttributes(),U=P.defaultAttributeValues;for(let G in $){let O=$[G];if(O.location>=0){let X=W[G];if(X===void 0&&(G==="instanceMatrix"&&S.instanceMatrix&&(X=S.instanceMatrix),G==="instanceColor"&&S.instanceColor&&(X=S.instanceColor)),X!==void 0){let K=X.normalized,rt=X.itemSize,yt=t.get(X);if(yt===void 0)continue;let Vt=yt.buffer,Y=yt.type,it=yt.bytesPerElement,St=Y===i.INT||Y===i.UNSIGNED_INT||X.gpuType===Aa;if(X.isInterleavedBufferAttribute){let ut=X.data,bt=ut.stride,Yt=X.offset;if(ut.isInstancedInterleavedBuffer){for(let It=0;It<O.locationSize;It++)l(O.location+It,ut.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ut.meshPerAttribute*ut.count)}else for(let It=0;It<O.locationSize;It++)p(O.location+It);i.bindBuffer(i.ARRAY_BUFFER,Vt);for(let It=0;It<O.locationSize;It++)y(O.location+It,rt/O.locationSize,Y,K,bt*it,(Yt+rt/O.locationSize*It)*it,St)}else{if(X.isInstancedBufferAttribute){for(let ut=0;ut<O.locationSize;ut++)l(O.location+ut,X.meshPerAttribute);S.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let ut=0;ut<O.locationSize;ut++)p(O.location+ut);i.bindBuffer(i.ARRAY_BUFFER,Vt);for(let ut=0;ut<O.locationSize;ut++)y(O.location+ut,rt/O.locationSize,Y,K,rt*it,rt/O.locationSize*ut*it,St)}}else if(U!==void 0){let K=U[G];if(K!==void 0)switch(K.length){case 2:i.vertexAttrib2fv(O.location,K);break;case 3:i.vertexAttrib3fv(O.location,K);break;case 4:i.vertexAttrib4fv(O.location,K);break;default:i.vertexAttrib1fv(O.location,K)}}}}g()}function T(){L();for(let S in n){let P=n[S];for(let H in P){let z=P[H];for(let W in z)u(z[W].object),delete z[W];delete P[H]}delete n[S]}}function E(S){if(n[S.id]===void 0)return;let P=n[S.id];for(let H in P){let z=P[H];for(let W in z)u(z[W].object),delete z[W];delete P[H]}delete n[S.id]}function R(S){for(let P in n){let H=n[P];if(H[S.id]===void 0)continue;let z=H[S.id];for(let W in z)u(z[W].object),delete z[W];delete H[S.id]}}function L(){w(),a=!0,r!==s&&(r=s,h(r.object))}function w(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:L,resetDefaultState:w,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfProgram:R,initAttributes:x,enableAttribute:p,disableUnusedAttributes:g}}function rg(i,t,e){let n;function s(h){n=h}function r(h,u){i.drawArrays(n,h,u),e.update(u,n,1)}function a(h,u,f){f!==0&&(i.drawArraysInstanced(n,h,u,f),e.update(u,n,f))}function o(h,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,h,0,u,0,f);let m=0;for(let _=0;_<f;_++)m+=u[_];e.update(m,n,1)}function c(h,u,f,d){if(f===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<h.length;_++)a(h[_],u[_],d[_]);else{m.multiDrawArraysInstancedWEBGL(n,h,0,u,0,d,0,f);let _=0;for(let x=0;x<f;x++)_+=u[x]*d[x];e.update(_,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function ag(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==sn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let L=R===hs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==mn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Sn&&!L)}function c(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=e.precision!==void 0?e.precision:"highp",u=c(h);u!==h&&(console.warn("THREE.WebGLRenderer:",h,"not supported, using",u,"instead."),h=u);let f=e.logarithmicDepthBuffer===!0,d=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),p=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),l=i.getParameter(i.MAX_VERTEX_ATTRIBS),g=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=_>0,E=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:h,logarithmicDepthBuffer:f,reverseDepthBuffer:d,maxTextures:m,maxVertexTextures:_,maxTextureSize:x,maxCubemapSize:p,maxAttributes:l,maxVertexUniforms:g,maxVaryings:y,maxFragmentUniforms:v,vertexTextures:T,maxSamples:E}}function og(i){let t=this,e=null,n=0,s=!1,r=!1,a=new He,o=new Ft,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,d){let m=f.length!==0||d||n!==0||s;return s=d,n=f.length,m},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,d){e=u(f,d,0)},this.setState=function(f,d,m){let _=f.clippingPlanes,x=f.clipIntersection,p=f.clipShadows,l=i.get(f);if(!s||_===null||_.length===0||r&&!p)r?u(null):h();else{let g=r?0:n,y=g*4,v=l.clippingState||null;c.value=v,v=u(_,d,y,m);for(let T=0;T!==y;++T)v[T]=e[T];l.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=g}};function h(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(f,d,m,_){let x=f!==null?f.length:0,p=null;if(x!==0){if(p=c.value,_!==!0||p===null){let l=m+x*4,g=d.matrixWorldInverse;o.getNormalMatrix(g),(p===null||p.length<l)&&(p=new Float32Array(l));for(let y=0,v=m;y!==x;++y,v+=4)a.copy(f[y]).applyMatrix4(g,o),a.normal.toArray(p,v),p[v+3]=a.constant}c.value=p,c.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,p}}function lg(i){let t=new WeakMap;function e(a,o){return o===wa?a.mapping=Ei:o===Ea&&(a.mapping=Ti),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===wa||o===Ea)if(t.has(a)){let c=t.get(a).texture;return e(c,a.mapping)}else{let c=a.image;if(c&&c.height>0){let h=new Qr(c.height);return h.fromEquirectangularTexture(i,a),t.set(a,h),a.addEventListener("dispose",s),e(h.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let c=t.get(o);c!==void 0&&(t.delete(o),c.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var ms=4,Zh=[.125,.215,.35,.446,.526,.582],Pi=20,Pl=new $s,Jh=new Ot,Ll=null,Dl=0,Ul=0,Nl=!1,Ii=(1+Math.sqrt(5))/2,ps=1/Ii,Kh=[new C(-Ii,ps,0),new C(Ii,ps,0),new C(-ps,0,Ii),new C(ps,0,Ii),new C(0,Ii,-ps),new C(0,Ii,ps),new C(-1,1,-1),new C(1,1,-1),new C(-1,1,1),new C(1,1,1)],cg=new C,lo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=cg}=r;Ll=this._renderer.getRenderTarget(),Dl=this._renderer.getActiveCubeFace(),Ul=this._renderer.getActiveMipmapLevel(),Nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,o),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=tu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Ll,Dl,Ul),this._renderer.xr.enabled=Nl,t.scissorTest=!1,ao(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ei||t.mapping===Ti?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Ll=this._renderer.getRenderTarget(),Dl=this._renderer.getActiveCubeFace(),Ul=this._renderer.getActiveMipmapLevel(),Nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:dn,minFilter:dn,generateMipmaps:!1,type:hs,format:sn,colorSpace:xi,depthBuffer:!1},s=jh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=jh(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=hg(r)),this._blurMaterial=ug(r,t,e)}return s}_compileMaterial(t){let e=new st(this._lodPlanes[0],t);this._renderer.compile(e,Pl)}_sceneToCubeUV(t,e,n,s,r){let c=new be(90,1,e,n),h=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],f=this._renderer,d=f.autoClear,m=f.toneMapping;f.getClearColor(Jh),f.toneMapping=zn,f.autoClear=!1;let _=new Je({name:"PMREM.Background",side:Be,depthWrite:!1,depthTest:!1}),x=new st(new ae,_),p=!1,l=t.background;l?l.isColor&&(_.color.copy(l),t.background=null,p=!0):(_.color.copy(Jh),p=!0);for(let g=0;g<6;g++){let y=g%3;y===0?(c.up.set(0,h[g],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+u[g],r.y,r.z)):y===1?(c.up.set(0,0,h[g]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+u[g],r.z)):(c.up.set(0,h[g],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+u[g]));let v=this._cubeSize;ao(s,y*v,g>2?v:0,v,v),f.setRenderTarget(s),p&&f.render(x,c),f.render(t,c)}x.geometry.dispose(),x.material.dispose(),f.toneMapping=m,f.autoClear=d,t.background=l}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ei||t.mapping===Ti;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=tu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qh());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new st(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;let c=this._cubeSize;ao(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(a,Pl)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=Kh[(s-r-1)%Kh.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let c=this._renderer,h=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,f=new st(this._lodPlanes[s],h),d=h.uniforms,m=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Pi-1),x=r/_,p=isFinite(r)?1+Math.floor(u*x):Pi;p>Pi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Pi}`);let l=[],g=0;for(let R=0;R<Pi;++R){let L=R/x,w=Math.exp(-L*L/2);l.push(w),R===0?g+=w:R<p&&(g+=2*w)}for(let R=0;R<l.length;R++)l[R]=l[R]/g;d.envMap.value=t.texture,d.samples.value=p,d.weights.value=l,d.latitudinal.value=a==="latitudinal",o&&(d.poleAxis.value=o);let{_lodMax:y}=this;d.dTheta.value=_,d.mipInt.value=y-n;let v=this._sizeLods[s],T=3*v*(s>y-ms?s-y+ms:0),E=4*(this._cubeSize-v);ao(e,T,E,3*v,2*v),c.setRenderTarget(e),c.render(f,Pl)}};function hg(i){let t=[],e=[],n=[],s=i,r=i-ms+1+Zh.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let c=1/o;a>i-ms?c=Zh[a-i+ms-1]:a===0&&(c=0),n.push(c);let h=1/(o-2),u=-h,f=1+h,d=[u,u,f,u,f,f,u,u,f,f,u,f],m=6,_=6,x=3,p=2,l=1,g=new Float32Array(x*_*m),y=new Float32Array(p*_*m),v=new Float32Array(l*_*m);for(let E=0;E<m;E++){let R=E%3*2/3-1,L=E>2?0:-1,w=[R,L,0,R+2/3,L,0,R+2/3,L+1,0,R,L,0,R+2/3,L+1,0,R,L+1,0];g.set(w,x*_*E),y.set(d,p*_*E);let S=[E,E,E,E,E,E];v.set(S,l*_*E)}let T=new xe;T.setAttribute("position",new Fe(g,x)),T.setAttribute("uv",new Fe(y,p)),T.setAttribute("faceIndex",new Fe(v,l)),t.push(T),s>ms&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function jh(i,t,e){let n=new vn(i,t,e);return n.texture.mapping=Ks,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ao(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function ug(i,t,e){let n=new Float32Array(Pi),s=new C(0,1,0);return new fn({name:"SphericalGaussianBlur",defines:{n:Pi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Xl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Qh(){return new fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function tu(){return new fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bn,depthTest:!1,depthWrite:!1})}function Xl(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function dg(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){let c=o.mapping,h=c===wa||c===Ea,u=c===Ei||c===Ti;if(h||u){let f=t.get(o),d=f!==void 0?f.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==d)return e===null&&(e=new lo(i)),f=h?e.fromEquirectangular(o,f):e.fromCubemap(o,f),f.texture.pmremVersion=o.pmremVersion,t.set(o,f),f.texture;if(f!==void 0)return f.texture;{let m=o.image;return h&&m&&m.height>0||u&&m&&s(m)?(e===null&&(e=new lo(i)),f=h?e.fromEquirectangular(o):e.fromCubemap(o),f.texture.pmremVersion=o.pmremVersion,t.set(o,f),o.addEventListener("dispose",r),f.texture):null}}}return o}function s(o){let c=0,h=6;for(let u=0;u<h;u++)o[u]!==void 0&&c++;return c===h}function r(o){let c=o.target;c.removeEventListener("dispose",r);let h=t.get(c);h!==void 0&&(t.delete(c),h.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function fg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&yi("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function pg(i,t,e,n){let s={},r=new WeakMap;function a(f){let d=f.target;d.index!==null&&t.remove(d.index);for(let _ in d.attributes)t.remove(d.attributes[_]);d.removeEventListener("dispose",a),delete s[d.id];let m=r.get(d);m&&(t.remove(m),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function o(f,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,e.memory.geometries++),d}function c(f){let d=f.attributes;for(let m in d)t.update(d[m],i.ARRAY_BUFFER)}function h(f){let d=[],m=f.index,_=f.attributes.position,x=0;if(m!==null){let g=m.array;x=m.version;for(let y=0,v=g.length;y<v;y+=3){let T=g[y+0],E=g[y+1],R=g[y+2];d.push(T,E,E,R,R,T)}}else if(_!==void 0){let g=_.array;x=_.version;for(let y=0,v=g.length/3-1;y<v;y+=3){let T=y+0,E=y+1,R=y+2;d.push(T,E,E,R,R,T)}}else return;let p=new(Tl(d)?Fs:Ns)(d,1);p.version=x;let l=r.get(f);l&&t.remove(l),r.set(f,p)}function u(f){let d=r.get(f);if(d){let m=f.index;m!==null&&d.version<m.version&&h(f)}else h(f);return r.get(f)}return{get:o,update:c,getWireframeAttribute:u}}function mg(i,t,e){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function c(d,m){i.drawElements(n,m,r,d*a),e.update(m,n,1)}function h(d,m,_){_!==0&&(i.drawElementsInstanced(n,m,r,d*a,_),e.update(m,n,_))}function u(d,m,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,m,0,r,d,0,_);let p=0;for(let l=0;l<_;l++)p+=m[l];e.update(p,n,1)}function f(d,m,_,x){if(_===0)return;let p=t.get("WEBGL_multi_draw");if(p===null)for(let l=0;l<d.length;l++)h(d[l]/a,m[l],x[l]);else{p.multiDrawElementsInstancedWEBGL(n,m,0,r,d,0,x,0,_);let l=0;for(let g=0;g<_;g++)l+=m[g]*x[g];e.update(l,n,1)}}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=h,this.renderMultiDraw=u,this.renderMultiDrawInstances=f}function gg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function _g(i,t,e){let n=new WeakMap,s=new jt;function r(a,o,c){let h=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=u!==void 0?u.length:0,d=n.get(o);if(d===void 0||d.count!==f){let w=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let m=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],l=o.morphAttributes.normal||[],g=o.morphAttributes.color||[],y=0;m===!0&&(y=1),_===!0&&(y=2),x===!0&&(y=3);let v=o.attributes.position.count*y,T=1;v>t.maxTextureSize&&(T=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let E=new Float32Array(v*T*4*f),R=new Us(E,v,T,f);R.type=Sn,R.needsUpdate=!0;let L=y*4;for(let S=0;S<f;S++){let P=p[S],H=l[S],z=g[S],W=v*T*4*S;for(let $=0;$<P.count;$++){let U=$*L;m===!0&&(s.fromBufferAttribute(P,$),E[W+U+0]=s.x,E[W+U+1]=s.y,E[W+U+2]=s.z,E[W+U+3]=0),_===!0&&(s.fromBufferAttribute(H,$),E[W+U+4]=s.x,E[W+U+5]=s.y,E[W+U+6]=s.z,E[W+U+7]=0),x===!0&&(s.fromBufferAttribute(z,$),E[W+U+8]=s.x,E[W+U+9]=s.y,E[W+U+10]=s.z,E[W+U+11]=z.itemSize===4?s.w:1)}}d={count:f,texture:R,size:new Et(v,T)},n.set(o,d),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let m=0;for(let x=0;x<h.length;x++)m+=h[x];let _=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(i,"morphTargetBaseInfluence",_),c.getUniforms().setValue(i,"morphTargetInfluences",h)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function xg(i,t,e,n){let s=new WeakMap;function r(c){let h=n.render.frame,u=c.geometry,f=t.get(c,u);if(s.get(f)!==h&&(t.update(f),s.set(f,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,h))),c.isSkinnedMesh){let d=c.skeleton;s.get(d)!==h&&(d.update(),s.set(d,h))}return f}function a(){s=new WeakMap}function o(c){let h=c.target;h.removeEventListener("dispose",o),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:r,dispose:a}}var yu=new Ye,eu=new Hs(1,1),vu=new Us,Mu=new Kr,Su=new Bs,nu=[],iu=[],su=new Float32Array(16),ru=new Float32Array(9),au=new Float32Array(4);function xs(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=nu[s];if(r===void 0&&(r=new Float32Array(s),nu[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function we(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ee(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function co(i,t){let e=iu[t];e===void 0&&(e=new Int32Array(t),iu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function yg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function vg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;i.uniform2fv(this.addr,t),Ee(e,t)}}function Mg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(we(e,t))return;i.uniform3fv(this.addr,t),Ee(e,t)}}function Sg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;i.uniform4fv(this.addr,t),Ee(e,t)}}function bg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(we(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,n))return;au.set(n),i.uniformMatrix2fv(this.addr,!1,au),Ee(e,n)}}function wg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(we(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,n))return;ru.set(n),i.uniformMatrix3fv(this.addr,!1,ru),Ee(e,n)}}function Eg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(we(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,n))return;su.set(n),i.uniformMatrix4fv(this.addr,!1,su),Ee(e,n)}}function Tg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Ag(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;i.uniform2iv(this.addr,t),Ee(e,t)}}function Cg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(we(e,t))return;i.uniform3iv(this.addr,t),Ee(e,t)}}function Rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;i.uniform4iv(this.addr,t),Ee(e,t)}}function Ig(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Pg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;i.uniform2uiv(this.addr,t),Ee(e,t)}}function Lg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(we(e,t))return;i.uniform3uiv(this.addr,t),Ee(e,t)}}function Dg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;i.uniform4uiv(this.addr,t),Ee(e,t)}}function Ug(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(eu.compareFunction=bl,r=eu):r=yu,e.setTexture2D(t||r,s)}function Ng(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Mu,s)}function Fg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Su,s)}function Og(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||vu,s)}function Bg(i){switch(i){case 5126:return yg;case 35664:return vg;case 35665:return Mg;case 35666:return Sg;case 35674:return bg;case 35675:return wg;case 35676:return Eg;case 5124:case 35670:return Tg;case 35667:case 35671:return Ag;case 35668:case 35672:return Cg;case 35669:case 35673:return Rg;case 5125:return Ig;case 36294:return Pg;case 36295:return Lg;case 36296:return Dg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ug;case 35679:case 36299:case 36307:return Ng;case 35680:case 36300:case 36308:case 36293:return Fg;case 36289:case 36303:case 36311:case 36292:return Og}}function zg(i,t){i.uniform1fv(this.addr,t)}function kg(i,t){let e=xs(t,this.size,2);i.uniform2fv(this.addr,e)}function Hg(i,t){let e=xs(t,this.size,3);i.uniform3fv(this.addr,e)}function Vg(i,t){let e=xs(t,this.size,4);i.uniform4fv(this.addr,e)}function Gg(i,t){let e=xs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Wg(i,t){let e=xs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Xg(i,t){let e=xs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function qg(i,t){i.uniform1iv(this.addr,t)}function Yg(i,t){i.uniform2iv(this.addr,t)}function $g(i,t){i.uniform3iv(this.addr,t)}function Zg(i,t){i.uniform4iv(this.addr,t)}function Jg(i,t){i.uniform1uiv(this.addr,t)}function Kg(i,t){i.uniform2uiv(this.addr,t)}function jg(i,t){i.uniform3uiv(this.addr,t)}function Qg(i,t){i.uniform4uiv(this.addr,t)}function t0(i,t,e){let n=this.cache,s=t.length,r=co(e,s);we(n,r)||(i.uniform1iv(this.addr,r),Ee(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||yu,r[a])}function e0(i,t,e){let n=this.cache,s=t.length,r=co(e,s);we(n,r)||(i.uniform1iv(this.addr,r),Ee(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Mu,r[a])}function n0(i,t,e){let n=this.cache,s=t.length,r=co(e,s);we(n,r)||(i.uniform1iv(this.addr,r),Ee(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Su,r[a])}function i0(i,t,e){let n=this.cache,s=t.length,r=co(e,s);we(n,r)||(i.uniform1iv(this.addr,r),Ee(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||vu,r[a])}function s0(i){switch(i){case 5126:return zg;case 35664:return kg;case 35665:return Hg;case 35666:return Vg;case 35674:return Gg;case 35675:return Wg;case 35676:return Xg;case 5124:case 35670:return qg;case 35667:case 35671:return Yg;case 35668:case 35672:return $g;case 35669:case 35673:return Zg;case 5125:return Jg;case 36294:return Kg;case 36295:return jg;case 36296:return Qg;case 35678:case 36198:case 36298:case 36306:case 35682:return t0;case 35679:case 36299:case 36307:return e0;case 35680:case 36300:case 36308:case 36293:return n0;case 36289:case 36303:case 36311:case 36292:return i0}}var Ol=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Bg(e.type)}},Bl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=s0(e.type)}},zl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Fl=/(\w+)(\])?(\[|\.)?/g;function ou(i,t){i.seq.push(t),i.map[t.id]=t}function r0(i,t,e){let n=i.name,s=n.length;for(Fl.lastIndex=0;;){let r=Fl.exec(n),a=Fl.lastIndex,o=r[1],c=r[2]==="]",h=r[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===s){ou(e,h===void 0?new Ol(o,i,t):new Bl(o,i,t));break}else{let f=e.map[o];f===void 0&&(f=new zl(o),ou(e,f)),e=f}}}var gs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);r0(r,a,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function lu(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var a0=37297,o0=0;function l0(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var cu=new Ft;function c0(i){Gt._getMatrix(cu,Gt.workingColorSpace,i);let t=`mat3( ${cu.elements.map(e=>e.toFixed(4))} )`;switch(Gt.getTransfer(i)){case Ps:return[t,"LinearTransferOETF"];case Qt:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function hu(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),s=i.getShaderInfoLog(t).trim();if(n&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+l0(i.getShaderSource(t),a)}else return s}function h0(i,t){let e=c0(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function u0(i,t){let e;switch(t){case Eh:e="Linear";break;case Th:e="Reinhard";break;case Ah:e="Cineon";break;case ls:e="ACESFilmic";break;case Rh:e="AgX";break;case Ih:e="Neutral";break;case Ch:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var oo=new C;function d0(){Gt.getLuminanceCoefficients(oo);let i=oo.x.toFixed(4),t=oo.y.toFixed(4),e=oo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function f0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rr).join(`
`)}function p0(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function m0(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function rr(i){return i!==""}function uu(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function du(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var g0=/^[ \t]*#include +<([\w\d./]+)>/gm;function kl(i){return i.replace(g0,x0)}var _0=new Map;function x0(i,t){let e=zt[t];if(e===void 0){let n=_0.get(t);if(n!==void 0)e=zt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return kl(e)}var y0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function fu(i){return i.replace(y0,v0)}function v0(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function pu(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function M0(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ll?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===ga?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Mn&&(t="SHADOWMAP_TYPE_VSM"),t}function S0(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ei:case Ti:t="ENVMAP_TYPE_CUBE";break;case Ks:t="ENVMAP_TYPE_CUBE_UV";break}return t}function b0(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ti:t="ENVMAP_MODE_REFRACTION";break}return t}function w0(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case dl:t="ENVMAP_BLENDING_MULTIPLY";break;case bh:t="ENVMAP_BLENDING_MIX";break;case wh:t="ENVMAP_BLENDING_ADD";break}return t}function E0(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function T0(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=M0(e),h=S0(e),u=b0(e),f=w0(e),d=E0(e),m=f0(e),_=p0(r),x=s.createProgram(),p,l,g=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(rr).join(`
`),p.length>0&&(p+=`
`),l=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(rr).join(`
`),l.length>0&&(l+=`
`)):(p=[pu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rr).join(`
`),l=[pu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",e.envMap?"#define "+f:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==zn?"#define TONE_MAPPING":"",e.toneMapping!==zn?zt.tonemapping_pars_fragment:"",e.toneMapping!==zn?u0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",zt.colorspace_pars_fragment,h0("linearToOutputTexel",e.outputColorSpace),d0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(rr).join(`
`)),a=kl(a),a=uu(a,e),a=du(a,e),o=kl(o),o=uu(o,e),o=du(o,e),a=fu(a),o=fu(o),e.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,p=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,l=["#define varying in",e.glslVersion===wl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===wl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+l);let y=g+p+a,v=g+l+o,T=lu(s,s.VERTEX_SHADER,y),E=lu(s,s.FRAGMENT_SHADER,v);s.attachShader(x,T),s.attachShader(x,E),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function R(P){if(i.debug.checkShaderErrors){let H=s.getProgramInfoLog(x).trim(),z=s.getShaderInfoLog(T).trim(),W=s.getShaderInfoLog(E).trim(),$=!0,U=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if($=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,T,E);else{let G=hu(s,T,"vertex"),O=hu(s,E,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+H+`
`+G+`
`+O)}else H!==""?console.warn("THREE.WebGLProgram: Program Info Log:",H):(z===""||W==="")&&(U=!1);U&&(P.diagnostics={runnable:$,programLog:H,vertexShader:{log:z,prefix:p},fragmentShader:{log:W,prefix:l}})}s.deleteShader(T),s.deleteShader(E),L=new gs(s,x),w=m0(s,x)}let L;this.getUniforms=function(){return L===void 0&&R(this),L};let w;this.getAttributes=function(){return w===void 0&&R(this),w};let S=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(x,a0)),S},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=o0++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=T,this.fragmentShader=E,this}var A0=0,Hl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Vl(t),e.set(t,n)),n}},Vl=class{constructor(t){this.id=A0++,this.code=t,this.usedTimes=0}};function C0(i,t,e,n,s,r,a){let o=new ns,c=new Hl,h=new Set,u=[],f=s.logarithmicDepthBuffer,d=s.vertexTextures,m=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(w){return h.add(w),w===0?"uv":`uv${w}`}function p(w,S,P,H,z){let W=H.fog,$=z.geometry,U=w.isMeshStandardMaterial?H.environment:null,G=(w.isMeshStandardMaterial?e:t).get(w.envMap||U),O=G&&G.mapping===Ks?G.image.height:null,X=_[w.type];w.precision!==null&&(m=s.getMaxPrecision(w.precision),m!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",m,"instead."));let K=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,rt=K!==void 0?K.length:0,yt=0;$.morphAttributes.position!==void 0&&(yt=1),$.morphAttributes.normal!==void 0&&(yt=2),$.morphAttributes.color!==void 0&&(yt=3);let Vt,Y,it,St;if(X){let Kt=bn[X];Vt=Kt.vertexShader,Y=Kt.fragmentShader}else Vt=w.vertexShader,Y=w.fragmentShader,c.update(w),it=c.getVertexShaderID(w),St=c.getFragmentShaderID(w);let ut=i.getRenderTarget(),bt=i.state.buffers.depth.getReversed(),Yt=z.isInstancedMesh===!0,It=z.isBatchedMesh===!0,de=!!w.map,fe=!!w.matcap,$t=!!G,I=!!w.aoMap,De=!!w.lightMap,Zt=!!w.bumpMap,re=!!w.normalMap,xt=!!w.displacementMap,Xt=!!w.emissiveMap,Tt=!!w.metalnessMap,Bt=!!w.roughnessMap,Se=w.anisotropy>0,A=w.clearcoat>0,M=w.dispersion>0,B=w.iridescence>0,Z=w.sheen>0,j=w.transmission>0,q=Se&&!!w.anisotropyMap,vt=A&&!!w.clearcoatMap,lt=A&&!!w.clearcoatNormalMap,_t=A&&!!w.clearcoatRoughnessMap,Mt=B&&!!w.iridescenceMap,Q=B&&!!w.iridescenceThicknessMap,dt=Z&&!!w.sheenColorMap,Rt=Z&&!!w.sheenRoughnessMap,Ct=!!w.specularMap,at=!!w.specularColorMap,Dt=!!w.specularIntensityMap,D=j&&!!w.transmissionMap,ct=j&&!!w.thicknessMap,tt=!!w.gradientMap,pt=!!w.alphaMap,et=w.alphaTest>0,J=!!w.alphaHash,mt=!!w.extensions,Ut=zn;w.toneMapped&&(ut===null||ut.isXRRenderTarget===!0)&&(Ut=i.toneMapping);let oe={shaderID:X,shaderType:w.type,shaderName:w.name,vertexShader:Vt,fragmentShader:Y,defines:w.defines,customVertexShaderID:it,customFragmentShaderID:St,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:m,batching:It,batchingColor:It&&z._colorsTexture!==null,instancing:Yt,instancingColor:Yt&&z.instanceColor!==null,instancingMorph:Yt&&z.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ut===null?i.outputColorSpace:ut.isXRRenderTarget===!0?ut.texture.colorSpace:xi,alphaToCoverage:!!w.alphaToCoverage,map:de,matcap:fe,envMap:$t,envMapMode:$t&&G.mapping,envMapCubeUVHeight:O,aoMap:I,lightMap:De,bumpMap:Zt,normalMap:re,displacementMap:d&&xt,emissiveMap:Xt,normalMapObjectSpace:re&&w.normalMapType===Uh,normalMapTangentSpace:re&&w.normalMapType===Sl,metalnessMap:Tt,roughnessMap:Bt,anisotropy:Se,anisotropyMap:q,clearcoat:A,clearcoatMap:vt,clearcoatNormalMap:lt,clearcoatRoughnessMap:_t,dispersion:M,iridescence:B,iridescenceMap:Mt,iridescenceThicknessMap:Q,sheen:Z,sheenColorMap:dt,sheenRoughnessMap:Rt,specularMap:Ct,specularColorMap:at,specularIntensityMap:Dt,transmission:j,transmissionMap:D,thicknessMap:ct,gradientMap:tt,opaque:w.transparent===!1&&w.blending===gi&&w.alphaToCoverage===!1,alphaMap:pt,alphaTest:et,alphaHash:J,combine:w.combine,mapUv:de&&x(w.map.channel),aoMapUv:I&&x(w.aoMap.channel),lightMapUv:De&&x(w.lightMap.channel),bumpMapUv:Zt&&x(w.bumpMap.channel),normalMapUv:re&&x(w.normalMap.channel),displacementMapUv:xt&&x(w.displacementMap.channel),emissiveMapUv:Xt&&x(w.emissiveMap.channel),metalnessMapUv:Tt&&x(w.metalnessMap.channel),roughnessMapUv:Bt&&x(w.roughnessMap.channel),anisotropyMapUv:q&&x(w.anisotropyMap.channel),clearcoatMapUv:vt&&x(w.clearcoatMap.channel),clearcoatNormalMapUv:lt&&x(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_t&&x(w.clearcoatRoughnessMap.channel),iridescenceMapUv:Mt&&x(w.iridescenceMap.channel),iridescenceThicknessMapUv:Q&&x(w.iridescenceThicknessMap.channel),sheenColorMapUv:dt&&x(w.sheenColorMap.channel),sheenRoughnessMapUv:Rt&&x(w.sheenRoughnessMap.channel),specularMapUv:Ct&&x(w.specularMap.channel),specularColorMapUv:at&&x(w.specularColorMap.channel),specularIntensityMapUv:Dt&&x(w.specularIntensityMap.channel),transmissionMapUv:D&&x(w.transmissionMap.channel),thicknessMapUv:ct&&x(w.thicknessMap.channel),alphaMapUv:pt&&x(w.alphaMap.channel),vertexTangents:!!$.attributes.tangent&&(re||Se),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!$.attributes.uv&&(de||pt),fog:!!W,useFog:w.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:bt,skinning:z.isSkinnedMesh===!0,morphTargets:$.morphAttributes.position!==void 0,morphNormals:$.morphAttributes.normal!==void 0,morphColors:$.morphAttributes.color!==void 0,morphTargetsCount:rt,morphTextureStride:yt,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:w.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ut,decodeVideoTexture:de&&w.map.isVideoTexture===!0&&Gt.getTransfer(w.map.colorSpace)===Qt,decodeVideoTextureEmissive:Xt&&w.emissiveMap.isVideoTexture===!0&&Gt.getTransfer(w.emissiveMap.colorSpace)===Qt,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===ze,flipSided:w.side===Be,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:mt&&w.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(mt&&w.extensions.multiDraw===!0||It)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return oe.vertexUv1s=h.has(1),oe.vertexUv2s=h.has(2),oe.vertexUv3s=h.has(3),h.clear(),oe}function l(w){let S=[];if(w.shaderID?S.push(w.shaderID):(S.push(w.customVertexShaderID),S.push(w.customFragmentShaderID)),w.defines!==void 0)for(let P in w.defines)S.push(P),S.push(w.defines[P]);return w.isRawShaderMaterial===!1&&(g(S,w),y(S,w),S.push(i.outputColorSpace)),S.push(w.customProgramCacheKey),S.join()}function g(w,S){w.push(S.precision),w.push(S.outputColorSpace),w.push(S.envMapMode),w.push(S.envMapCubeUVHeight),w.push(S.mapUv),w.push(S.alphaMapUv),w.push(S.lightMapUv),w.push(S.aoMapUv),w.push(S.bumpMapUv),w.push(S.normalMapUv),w.push(S.displacementMapUv),w.push(S.emissiveMapUv),w.push(S.metalnessMapUv),w.push(S.roughnessMapUv),w.push(S.anisotropyMapUv),w.push(S.clearcoatMapUv),w.push(S.clearcoatNormalMapUv),w.push(S.clearcoatRoughnessMapUv),w.push(S.iridescenceMapUv),w.push(S.iridescenceThicknessMapUv),w.push(S.sheenColorMapUv),w.push(S.sheenRoughnessMapUv),w.push(S.specularMapUv),w.push(S.specularColorMapUv),w.push(S.specularIntensityMapUv),w.push(S.transmissionMapUv),w.push(S.thicknessMapUv),w.push(S.combine),w.push(S.fogExp2),w.push(S.sizeAttenuation),w.push(S.morphTargetsCount),w.push(S.morphAttributeCount),w.push(S.numDirLights),w.push(S.numPointLights),w.push(S.numSpotLights),w.push(S.numSpotLightMaps),w.push(S.numHemiLights),w.push(S.numRectAreaLights),w.push(S.numDirLightShadows),w.push(S.numPointLightShadows),w.push(S.numSpotLightShadows),w.push(S.numSpotLightShadowsWithMaps),w.push(S.numLightProbes),w.push(S.shadowMapType),w.push(S.toneMapping),w.push(S.numClippingPlanes),w.push(S.numClipIntersection),w.push(S.depthPacking)}function y(w,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),S.gradientMap&&o.enable(22),w.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reverseDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),w.push(o.mask)}function v(w){let S=_[w.type],P;if(S){let H=bn[S];P=Yh.clone(H.uniforms)}else P=w.uniforms;return P}function T(w,S){let P;for(let H=0,z=u.length;H<z;H++){let W=u[H];if(W.cacheKey===S){P=W,++P.usedTimes;break}}return P===void 0&&(P=new T0(i,S,w,r),u.push(P)),P}function E(w){if(--w.usedTimes===0){let S=u.indexOf(w);u[S]=u[u.length-1],u.pop(),w.destroy()}}function R(w){c.remove(w)}function L(){c.dispose()}return{getParameters:p,getProgramCacheKey:l,getUniforms:v,acquireProgram:T,releaseProgram:E,releaseShaderCache:R,programs:u,dispose:L}}function R0(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function I0(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function mu(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function gu(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(f,d,m,_,x,p){let l=i[t];return l===void 0?(l={id:f.id,object:f,geometry:d,material:m,groupOrder:_,renderOrder:f.renderOrder,z:x,group:p},i[t]=l):(l.id=f.id,l.object=f,l.geometry=d,l.material=m,l.groupOrder=_,l.renderOrder=f.renderOrder,l.z=x,l.group=p),t++,l}function o(f,d,m,_,x,p){let l=a(f,d,m,_,x,p);m.transmission>0?n.push(l):m.transparent===!0?s.push(l):e.push(l)}function c(f,d,m,_,x,p){let l=a(f,d,m,_,x,p);m.transmission>0?n.unshift(l):m.transparent===!0?s.unshift(l):e.unshift(l)}function h(f,d){e.length>1&&e.sort(f||I0),n.length>1&&n.sort(d||mu),s.length>1&&s.sort(d||mu)}function u(){for(let f=t,d=i.length;f<d;f++){let m=i[f];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:c,finish:u,sort:h}}function P0(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new gu,i.set(n,[a])):s>=r.length?(a=new gu,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function L0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new C,color:new Ot};break;case"SpotLight":e={position:new C,direction:new C,color:new Ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new C,color:new Ot,distance:0,decay:0};break;case"HemisphereLight":e={direction:new C,skyColor:new Ot,groundColor:new Ot};break;case"RectAreaLight":e={color:new Ot,position:new C,halfWidth:new C,halfHeight:new C};break}return i[t.id]=e,e}}}function D0(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Et,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var U0=0;function N0(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function F0(i){let t=new L0,e=D0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new C);let s=new C,r=new ee,a=new ee;function o(h){let u=0,f=0,d=0;for(let w=0;w<9;w++)n.probe[w].set(0,0,0);let m=0,_=0,x=0,p=0,l=0,g=0,y=0,v=0,T=0,E=0,R=0;h.sort(N0);for(let w=0,S=h.length;w<S;w++){let P=h[w],H=P.color,z=P.intensity,W=P.distance,$=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)u+=H.r*z,f+=H.g*z,d+=H.b*z;else if(P.isLightProbe){for(let U=0;U<9;U++)n.probe[U].addScaledVector(P.sh.coefficients[U],z);R++}else if(P.isDirectionalLight){let U=t.get(P);if(U.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let G=P.shadow,O=e.get(P);O.shadowIntensity=G.intensity,O.shadowBias=G.bias,O.shadowNormalBias=G.normalBias,O.shadowRadius=G.radius,O.shadowMapSize=G.mapSize,n.directionalShadow[m]=O,n.directionalShadowMap[m]=$,n.directionalShadowMatrix[m]=P.shadow.matrix,g++}n.directional[m]=U,m++}else if(P.isSpotLight){let U=t.get(P);U.position.setFromMatrixPosition(P.matrixWorld),U.color.copy(H).multiplyScalar(z),U.distance=W,U.coneCos=Math.cos(P.angle),U.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),U.decay=P.decay,n.spot[x]=U;let G=P.shadow;if(P.map&&(n.spotLightMap[T]=P.map,T++,G.updateMatrices(P),P.castShadow&&E++),n.spotLightMatrix[x]=G.matrix,P.castShadow){let O=e.get(P);O.shadowIntensity=G.intensity,O.shadowBias=G.bias,O.shadowNormalBias=G.normalBias,O.shadowRadius=G.radius,O.shadowMapSize=G.mapSize,n.spotShadow[x]=O,n.spotShadowMap[x]=$,v++}x++}else if(P.isRectAreaLight){let U=t.get(P);U.color.copy(H).multiplyScalar(z),U.halfWidth.set(P.width*.5,0,0),U.halfHeight.set(0,P.height*.5,0),n.rectArea[p]=U,p++}else if(P.isPointLight){let U=t.get(P);if(U.color.copy(P.color).multiplyScalar(P.intensity),U.distance=P.distance,U.decay=P.decay,P.castShadow){let G=P.shadow,O=e.get(P);O.shadowIntensity=G.intensity,O.shadowBias=G.bias,O.shadowNormalBias=G.normalBias,O.shadowRadius=G.radius,O.shadowMapSize=G.mapSize,O.shadowCameraNear=G.camera.near,O.shadowCameraFar=G.camera.far,n.pointShadow[_]=O,n.pointShadowMap[_]=$,n.pointShadowMatrix[_]=P.shadow.matrix,y++}n.point[_]=U,_++}else if(P.isHemisphereLight){let U=t.get(P);U.skyColor.copy(P.color).multiplyScalar(z),U.groundColor.copy(P.groundColor).multiplyScalar(z),n.hemi[l]=U,l++}}p>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ot.LTC_FLOAT_1,n.rectAreaLTC2=ot.LTC_FLOAT_2):(n.rectAreaLTC1=ot.LTC_HALF_1,n.rectAreaLTC2=ot.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=d;let L=n.hash;(L.directionalLength!==m||L.pointLength!==_||L.spotLength!==x||L.rectAreaLength!==p||L.hemiLength!==l||L.numDirectionalShadows!==g||L.numPointShadows!==y||L.numSpotShadows!==v||L.numSpotMaps!==T||L.numLightProbes!==R)&&(n.directional.length=m,n.spot.length=x,n.rectArea.length=p,n.point.length=_,n.hemi.length=l,n.directionalShadow.length=g,n.directionalShadowMap.length=g,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=g,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=v+T-E,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=R,L.directionalLength=m,L.pointLength=_,L.spotLength=x,L.rectAreaLength=p,L.hemiLength=l,L.numDirectionalShadows=g,L.numPointShadows=y,L.numSpotShadows=v,L.numSpotMaps=T,L.numLightProbes=R,n.version=U0++)}function c(h,u){let f=0,d=0,m=0,_=0,x=0,p=u.matrixWorldInverse;for(let l=0,g=h.length;l<g;l++){let y=h[l];if(y.isDirectionalLight){let v=n.directional[f];v.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(p),f++}else if(y.isSpotLight){let v=n.spot[m];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(p),v.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(s),v.direction.transformDirection(p),m++}else if(y.isRectAreaLight){let v=n.rectArea[_];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(p),a.identity(),r.copy(y.matrixWorld),r.premultiply(p),a.extractRotation(r),v.halfWidth.set(y.width*.5,0,0),v.halfHeight.set(0,y.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),_++}else if(y.isPointLight){let v=n.point[d];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(p),d++}else if(y.isHemisphereLight){let v=n.hemi[x];v.direction.setFromMatrixPosition(y.matrixWorld),v.direction.transformDirection(p),x++}}}return{setup:o,setupView:c,state:n}}function _u(i){let t=new F0(i),e=[],n=[];function s(u){h.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function a(u){n.push(u)}function o(){t.setup(e)}function c(u){t.setupView(e,u)}let h={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:h,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function O0(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new _u(i),t.set(s,[o])):r>=a.length?(o=new _u(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var B0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,z0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function k0(i,t,e){let n=new ss,s=new Et,r=new Et,a=new jt,o=new ia({depthPacking:Dh}),c=new sa,h={},u=e.maxTextureSize,f={[Dn]:Be,[Be]:Dn,[ze]:ze},d=new fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Et},radius:{value:4}},vertexShader:B0,fragmentShader:z0}),m=d.clone();m.defines.HORIZONTAL_PASS=1;let _=new xe;_.setAttribute("position",new Fe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new st(_,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ll;let l=this.type;this.render=function(E,R,L){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||E.length===0)return;let w=i.getRenderTarget(),S=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),H=i.state;H.setBlending(Bn),H.buffers.color.setClear(1,1,1,1),H.buffers.depth.setTest(!0),H.setScissorTest(!1);let z=l!==Mn&&this.type===Mn,W=l===Mn&&this.type!==Mn;for(let $=0,U=E.length;$<U;$++){let G=E[$],O=G.shadow;if(O===void 0){console.warn("THREE.WebGLShadowMap:",G,"has no shadow.");continue}if(O.autoUpdate===!1&&O.needsUpdate===!1)continue;s.copy(O.mapSize);let X=O.getFrameExtents();if(s.multiply(X),r.copy(O.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/X.x),s.x=r.x*X.x,O.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/X.y),s.y=r.y*X.y,O.mapSize.y=r.y)),O.map===null||z===!0||W===!0){let rt=this.type!==Mn?{minFilter:nn,magFilter:nn}:{};O.map!==null&&O.map.dispose(),O.map=new vn(s.x,s.y,rt),O.map.texture.name=G.name+".shadowMap",O.camera.updateProjectionMatrix()}i.setRenderTarget(O.map),i.clear();let K=O.getViewportCount();for(let rt=0;rt<K;rt++){let yt=O.getViewport(rt);a.set(r.x*yt.x,r.y*yt.y,r.x*yt.z,r.y*yt.w),H.viewport(a),O.updateMatrices(G,rt),n=O.getFrustum(),v(R,L,O.camera,G,this.type)}O.isPointLightShadow!==!0&&this.type===Mn&&g(O,L),O.needsUpdate=!1}l=this.type,p.needsUpdate=!1,i.setRenderTarget(w,S,P)};function g(E,R){let L=t.update(x);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,m.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,m.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new vn(s.x,s.y)),d.uniforms.shadow_pass.value=E.map.texture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(R,null,L,d,x,null),m.uniforms.shadow_pass.value=E.mapPass.texture,m.uniforms.resolution.value=E.mapSize,m.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(R,null,L,m,x,null)}function y(E,R,L,w){let S=null,P=L.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(P!==void 0)S=P;else if(S=L.isPointLight===!0?c:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let H=S.uuid,z=R.uuid,W=h[H];W===void 0&&(W={},h[H]=W);let $=W[z];$===void 0&&($=S.clone(),W[z]=$,R.addEventListener("dispose",T)),S=$}if(S.visible=R.visible,S.wireframe=R.wireframe,w===Mn?S.side=R.shadowSide!==null?R.shadowSide:R.side:S.side=R.shadowSide!==null?R.shadowSide:f[R.side],S.alphaMap=R.alphaMap,S.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,S.map=R.map,S.clipShadows=R.clipShadows,S.clippingPlanes=R.clippingPlanes,S.clipIntersection=R.clipIntersection,S.displacementMap=R.displacementMap,S.displacementScale=R.displacementScale,S.displacementBias=R.displacementBias,S.wireframeLinewidth=R.wireframeLinewidth,S.linewidth=R.linewidth,L.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let H=i.properties.get(S);H.light=L}return S}function v(E,R,L,w,S){if(E.visible===!1)return;if(E.layers.test(R.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&S===Mn)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,E.matrixWorld);let z=t.update(E),W=E.material;if(Array.isArray(W)){let $=z.groups;for(let U=0,G=$.length;U<G;U++){let O=$[U],X=W[O.materialIndex];if(X&&X.visible){let K=y(E,X,w,S);E.onBeforeShadow(i,E,R,L,z,K,O),i.renderBufferDirect(L,null,z,K,E,O),E.onAfterShadow(i,E,R,L,z,K,O)}}}else if(W.visible){let $=y(E,W,w,S);E.onBeforeShadow(i,E,R,L,z,$,null),i.renderBufferDirect(L,null,z,$,E,null),E.onAfterShadow(i,E,R,L,z,$,null)}}let H=E.children;for(let z=0,W=H.length;z<W;z++)v(H[z],R,L,w,S)}function T(E){E.target.removeEventListener("dispose",T);for(let L in h){let w=h[L],S=E.target.uuid;S in w&&(w[S].dispose(),delete w[S])}}}var H0={[_a]:xa,[ya]:Sa,[va]:ba,[_i]:Ma,[xa]:_a,[Sa]:ya,[ba]:va,[Ma]:_i};function V0(i,t){function e(){let D=!1,ct=new jt,tt=null,pt=new jt(0,0,0,0);return{setMask:function(et){tt!==et&&!D&&(i.colorMask(et,et,et,et),tt=et)},setLocked:function(et){D=et},setClear:function(et,J,mt,Ut,oe){oe===!0&&(et*=Ut,J*=Ut,mt*=Ut),ct.set(et,J,mt,Ut),pt.equals(ct)===!1&&(i.clearColor(et,J,mt,Ut),pt.copy(ct))},reset:function(){D=!1,tt=null,pt.set(-1,0,0,0)}}}function n(){let D=!1,ct=!1,tt=null,pt=null,et=null;return{setReversed:function(J){if(ct!==J){let mt=t.get("EXT_clip_control");J?mt.clipControlEXT(mt.LOWER_LEFT_EXT,mt.ZERO_TO_ONE_EXT):mt.clipControlEXT(mt.LOWER_LEFT_EXT,mt.NEGATIVE_ONE_TO_ONE_EXT),ct=J;let Ut=et;et=null,this.setClear(Ut)}},getReversed:function(){return ct},setTest:function(J){J?ut(i.DEPTH_TEST):bt(i.DEPTH_TEST)},setMask:function(J){tt!==J&&!D&&(i.depthMask(J),tt=J)},setFunc:function(J){if(ct&&(J=H0[J]),pt!==J){switch(J){case _a:i.depthFunc(i.NEVER);break;case xa:i.depthFunc(i.ALWAYS);break;case ya:i.depthFunc(i.LESS);break;case _i:i.depthFunc(i.LEQUAL);break;case va:i.depthFunc(i.EQUAL);break;case Ma:i.depthFunc(i.GEQUAL);break;case Sa:i.depthFunc(i.GREATER);break;case ba:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pt=J}},setLocked:function(J){D=J},setClear:function(J){et!==J&&(ct&&(J=1-J),i.clearDepth(J),et=J)},reset:function(){D=!1,tt=null,pt=null,et=null,ct=!1}}}function s(){let D=!1,ct=null,tt=null,pt=null,et=null,J=null,mt=null,Ut=null,oe=null;return{setTest:function(Kt){D||(Kt?ut(i.STENCIL_TEST):bt(i.STENCIL_TEST))},setMask:function(Kt){ct!==Kt&&!D&&(i.stencilMask(Kt),ct=Kt)},setFunc:function(Kt,an,En){(tt!==Kt||pt!==an||et!==En)&&(i.stencilFunc(Kt,an,En),tt=Kt,pt=an,et=En)},setOp:function(Kt,an,En){(J!==Kt||mt!==an||Ut!==En)&&(i.stencilOp(Kt,an,En),J=Kt,mt=an,Ut=En)},setLocked:function(Kt){D=Kt},setClear:function(Kt){oe!==Kt&&(i.clearStencil(Kt),oe=Kt)},reset:function(){D=!1,ct=null,tt=null,pt=null,et=null,J=null,mt=null,Ut=null,oe=null}}}let r=new e,a=new n,o=new s,c=new WeakMap,h=new WeakMap,u={},f={},d=new WeakMap,m=[],_=null,x=!1,p=null,l=null,g=null,y=null,v=null,T=null,E=null,R=new Ot(0,0,0),L=0,w=!1,S=null,P=null,H=null,z=null,W=null,$=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),U=!1,G=0,O=i.getParameter(i.VERSION);O.indexOf("WebGL")!==-1?(G=parseFloat(/^WebGL (\d)/.exec(O)[1]),U=G>=1):O.indexOf("OpenGL ES")!==-1&&(G=parseFloat(/^OpenGL ES (\d)/.exec(O)[1]),U=G>=2);let X=null,K={},rt=i.getParameter(i.SCISSOR_BOX),yt=i.getParameter(i.VIEWPORT),Vt=new jt().fromArray(rt),Y=new jt().fromArray(yt);function it(D,ct,tt,pt){let et=new Uint8Array(4),J=i.createTexture();i.bindTexture(D,J),i.texParameteri(D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(D,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let mt=0;mt<tt;mt++)D===i.TEXTURE_3D||D===i.TEXTURE_2D_ARRAY?i.texImage3D(ct,0,i.RGBA,1,1,pt,0,i.RGBA,i.UNSIGNED_BYTE,et):i.texImage2D(ct+mt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,et);return J}let St={};St[i.TEXTURE_2D]=it(i.TEXTURE_2D,i.TEXTURE_2D,1),St[i.TEXTURE_CUBE_MAP]=it(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),St[i.TEXTURE_2D_ARRAY]=it(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),St[i.TEXTURE_3D]=it(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ut(i.DEPTH_TEST),a.setFunc(_i),Zt(!1),re(ol),ut(i.CULL_FACE),I(Bn);function ut(D){u[D]!==!0&&(i.enable(D),u[D]=!0)}function bt(D){u[D]!==!1&&(i.disable(D),u[D]=!1)}function Yt(D,ct){return f[D]!==ct?(i.bindFramebuffer(D,ct),f[D]=ct,D===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=ct),D===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=ct),!0):!1}function It(D,ct){let tt=m,pt=!1;if(D){tt=d.get(ct),tt===void 0&&(tt=[],d.set(ct,tt));let et=D.textures;if(tt.length!==et.length||tt[0]!==i.COLOR_ATTACHMENT0){for(let J=0,mt=et.length;J<mt;J++)tt[J]=i.COLOR_ATTACHMENT0+J;tt.length=et.length,pt=!0}}else tt[0]!==i.BACK&&(tt[0]=i.BACK,pt=!0);pt&&i.drawBuffers(tt)}function de(D){return _!==D?(i.useProgram(D),_=D,!0):!1}let fe={[Zn]:i.FUNC_ADD,[ah]:i.FUNC_SUBTRACT,[oh]:i.FUNC_REVERSE_SUBTRACT};fe[lh]=i.MIN,fe[ch]=i.MAX;let $t={[hh]:i.ZERO,[uh]:i.ONE,[dh]:i.SRC_COLOR,[Wr]:i.SRC_ALPHA,[xh]:i.SRC_ALPHA_SATURATE,[gh]:i.DST_COLOR,[ph]:i.DST_ALPHA,[fh]:i.ONE_MINUS_SRC_COLOR,[Xr]:i.ONE_MINUS_SRC_ALPHA,[_h]:i.ONE_MINUS_DST_COLOR,[mh]:i.ONE_MINUS_DST_ALPHA,[yh]:i.CONSTANT_COLOR,[vh]:i.ONE_MINUS_CONSTANT_COLOR,[Mh]:i.CONSTANT_ALPHA,[Sh]:i.ONE_MINUS_CONSTANT_ALPHA};function I(D,ct,tt,pt,et,J,mt,Ut,oe,Kt){if(D===Bn){x===!0&&(bt(i.BLEND),x=!1);return}if(x===!1&&(ut(i.BLEND),x=!0),D!==rh){if(D!==p||Kt!==w){if((l!==Zn||v!==Zn)&&(i.blendEquation(i.FUNC_ADD),l=Zn,v=Zn),Kt)switch(D){case gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case cl:i.blendFunc(i.ONE,i.ONE);break;case hl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case ul:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case cl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case hl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ul:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}g=null,y=null,T=null,E=null,R.set(0,0,0),L=0,p=D,w=Kt}return}et=et||ct,J=J||tt,mt=mt||pt,(ct!==l||et!==v)&&(i.blendEquationSeparate(fe[ct],fe[et]),l=ct,v=et),(tt!==g||pt!==y||J!==T||mt!==E)&&(i.blendFuncSeparate($t[tt],$t[pt],$t[J],$t[mt]),g=tt,y=pt,T=J,E=mt),(Ut.equals(R)===!1||oe!==L)&&(i.blendColor(Ut.r,Ut.g,Ut.b,oe),R.copy(Ut),L=oe),p=D,w=!1}function De(D,ct){D.side===ze?bt(i.CULL_FACE):ut(i.CULL_FACE);let tt=D.side===Be;ct&&(tt=!tt),Zt(tt),D.blending===gi&&D.transparent===!1?I(Bn):I(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);let pt=D.stencilWrite;o.setTest(pt),pt&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Xt(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?ut(i.SAMPLE_ALPHA_TO_COVERAGE):bt(i.SAMPLE_ALPHA_TO_COVERAGE)}function Zt(D){S!==D&&(D?i.frontFace(i.CW):i.frontFace(i.CCW),S=D)}function re(D){D!==ih?(ut(i.CULL_FACE),D!==P&&(D===ol?i.cullFace(i.BACK):D===sh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):bt(i.CULL_FACE),P=D}function xt(D){D!==H&&(U&&i.lineWidth(D),H=D)}function Xt(D,ct,tt){D?(ut(i.POLYGON_OFFSET_FILL),(z!==ct||W!==tt)&&(i.polygonOffset(ct,tt),z=ct,W=tt)):bt(i.POLYGON_OFFSET_FILL)}function Tt(D){D?ut(i.SCISSOR_TEST):bt(i.SCISSOR_TEST)}function Bt(D){D===void 0&&(D=i.TEXTURE0+$-1),X!==D&&(i.activeTexture(D),X=D)}function Se(D,ct,tt){tt===void 0&&(X===null?tt=i.TEXTURE0+$-1:tt=X);let pt=K[tt];pt===void 0&&(pt={type:void 0,texture:void 0},K[tt]=pt),(pt.type!==D||pt.texture!==ct)&&(X!==tt&&(i.activeTexture(tt),X=tt),i.bindTexture(D,ct||St[D]),pt.type=D,pt.texture=ct)}function A(){let D=K[X];D!==void 0&&D.type!==void 0&&(i.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function M(){try{i.compressedTexImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function B(){try{i.compressedTexImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Z(){try{i.texSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function j(){try{i.texSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function q(){try{i.compressedTexSubImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function vt(){try{i.compressedTexSubImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function lt(){try{i.texStorage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function _t(){try{i.texStorage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Mt(){try{i.texImage2D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Q(){try{i.texImage3D(...arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function dt(D){Vt.equals(D)===!1&&(i.scissor(D.x,D.y,D.z,D.w),Vt.copy(D))}function Rt(D){Y.equals(D)===!1&&(i.viewport(D.x,D.y,D.z,D.w),Y.copy(D))}function Ct(D,ct){let tt=h.get(ct);tt===void 0&&(tt=new WeakMap,h.set(ct,tt));let pt=tt.get(D);pt===void 0&&(pt=i.getUniformBlockIndex(ct,D.name),tt.set(D,pt))}function at(D,ct){let pt=h.get(ct).get(D);c.get(ct)!==pt&&(i.uniformBlockBinding(ct,pt,D.__bindingPointIndex),c.set(ct,pt))}function Dt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},X=null,K={},f={},d=new WeakMap,m=[],_=null,x=!1,p=null,l=null,g=null,y=null,v=null,T=null,E=null,R=new Ot(0,0,0),L=0,w=!1,S=null,P=null,H=null,z=null,W=null,Vt.set(0,0,i.canvas.width,i.canvas.height),Y.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ut,disable:bt,bindFramebuffer:Yt,drawBuffers:It,useProgram:de,setBlending:I,setMaterial:De,setFlipSided:Zt,setCullFace:re,setLineWidth:xt,setPolygonOffset:Xt,setScissorTest:Tt,activeTexture:Bt,bindTexture:Se,unbindTexture:A,compressedTexImage2D:M,compressedTexImage3D:B,texImage2D:Mt,texImage3D:Q,updateUBOMapping:Ct,uniformBlockBinding:at,texStorage2D:lt,texStorage3D:_t,texSubImage2D:Z,texSubImage3D:j,compressedTexSubImage2D:q,compressedTexSubImage3D:vt,scissor:dt,viewport:Rt,reset:Dt}}function G0(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new Et,u=new WeakMap,f,d=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(A,M){return m?new OffscreenCanvas(A,M):Ds("canvas")}function x(A,M,B){let Z=1,j=Se(A);if((j.width>B||j.height>B)&&(Z=B/Math.max(j.width,j.height)),Z<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let q=Math.floor(Z*j.width),vt=Math.floor(Z*j.height);f===void 0&&(f=_(q,vt));let lt=M?_(q,vt):f;return lt.width=q,lt.height=vt,lt.getContext("2d").drawImage(A,0,0,q,vt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+q+"x"+vt+")."),lt}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),A;return A}function p(A){return A.generateMipmaps}function l(A){i.generateMipmap(A)}function g(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(A,M,B,Z,j=!1){if(A!==null){if(i[A]!==void 0)return i[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let q=M;if(M===i.RED&&(B===i.FLOAT&&(q=i.R32F),B===i.HALF_FLOAT&&(q=i.R16F),B===i.UNSIGNED_BYTE&&(q=i.R8)),M===i.RED_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.R8UI),B===i.UNSIGNED_SHORT&&(q=i.R16UI),B===i.UNSIGNED_INT&&(q=i.R32UI),B===i.BYTE&&(q=i.R8I),B===i.SHORT&&(q=i.R16I),B===i.INT&&(q=i.R32I)),M===i.RG&&(B===i.FLOAT&&(q=i.RG32F),B===i.HALF_FLOAT&&(q=i.RG16F),B===i.UNSIGNED_BYTE&&(q=i.RG8)),M===i.RG_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RG8UI),B===i.UNSIGNED_SHORT&&(q=i.RG16UI),B===i.UNSIGNED_INT&&(q=i.RG32UI),B===i.BYTE&&(q=i.RG8I),B===i.SHORT&&(q=i.RG16I),B===i.INT&&(q=i.RG32I)),M===i.RGB_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RGB8UI),B===i.UNSIGNED_SHORT&&(q=i.RGB16UI),B===i.UNSIGNED_INT&&(q=i.RGB32UI),B===i.BYTE&&(q=i.RGB8I),B===i.SHORT&&(q=i.RGB16I),B===i.INT&&(q=i.RGB32I)),M===i.RGBA_INTEGER&&(B===i.UNSIGNED_BYTE&&(q=i.RGBA8UI),B===i.UNSIGNED_SHORT&&(q=i.RGBA16UI),B===i.UNSIGNED_INT&&(q=i.RGBA32UI),B===i.BYTE&&(q=i.RGBA8I),B===i.SHORT&&(q=i.RGBA16I),B===i.INT&&(q=i.RGBA32I)),M===i.RGB&&B===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),M===i.RGBA){let vt=j?Ps:Gt.getTransfer(Z);B===i.FLOAT&&(q=i.RGBA32F),B===i.HALF_FLOAT&&(q=i.RGBA16F),B===i.UNSIGNED_BYTE&&(q=vt===Qt?i.SRGB8_ALPHA8:i.RGBA8),B===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),B===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),q}function v(A,M){let B;return A?M===null||M===si||M===us?B=i.DEPTH24_STENCIL8:M===Sn?B=i.DEPTH32F_STENCIL8:M===cs&&(B=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===si||M===us?B=i.DEPTH_COMPONENT24:M===Sn?B=i.DEPTH_COMPONENT32F:M===cs&&(B=i.DEPTH_COMPONENT16),B}function T(A,M){return p(A)===!0||A.isFramebufferTexture&&A.minFilter!==nn&&A.minFilter!==dn?Math.log2(Math.max(M.width,M.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?M.mipmaps.length:1}function E(A){let M=A.target;M.removeEventListener("dispose",E),L(M),M.isVideoTexture&&u.delete(M)}function R(A){let M=A.target;M.removeEventListener("dispose",R),S(M)}function L(A){let M=n.get(A);if(M.__webglInit===void 0)return;let B=A.source,Z=d.get(B);if(Z){let j=Z[M.__cacheKey];j.usedTimes--,j.usedTimes===0&&w(A),Object.keys(Z).length===0&&d.delete(B)}n.remove(A)}function w(A){let M=n.get(A);i.deleteTexture(M.__webglTexture);let B=A.source,Z=d.get(B);delete Z[M.__cacheKey],a.memory.textures--}function S(A){let M=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(M.__webglFramebuffer[Z]))for(let j=0;j<M.__webglFramebuffer[Z].length;j++)i.deleteFramebuffer(M.__webglFramebuffer[Z][j]);else i.deleteFramebuffer(M.__webglFramebuffer[Z]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[Z])}else{if(Array.isArray(M.__webglFramebuffer))for(let Z=0;Z<M.__webglFramebuffer.length;Z++)i.deleteFramebuffer(M.__webglFramebuffer[Z]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Z=0;Z<M.__webglColorRenderbuffer.length;Z++)M.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[Z]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let B=A.textures;for(let Z=0,j=B.length;Z<j;Z++){let q=n.get(B[Z]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),a.memory.textures--),n.remove(B[Z])}n.remove(A)}let P=0;function H(){P=0}function z(){let A=P;return A>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+s.maxTextures),P+=1,A}function W(A){let M=[];return M.push(A.wrapS),M.push(A.wrapT),M.push(A.wrapR||0),M.push(A.magFilter),M.push(A.minFilter),M.push(A.anisotropy),M.push(A.internalFormat),M.push(A.format),M.push(A.type),M.push(A.generateMipmaps),M.push(A.premultiplyAlpha),M.push(A.flipY),M.push(A.unpackAlignment),M.push(A.colorSpace),M.join()}function $(A,M){let B=n.get(A);if(A.isVideoTexture&&Tt(A),A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){let Z=A.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{St(B,A,M);return}}e.bindTexture(i.TEXTURE_2D,B.__webglTexture,i.TEXTURE0+M)}function U(A,M){let B=n.get(A);if(A.version>0&&B.__version!==A.version){St(B,A,M);return}e.bindTexture(i.TEXTURE_2D_ARRAY,B.__webglTexture,i.TEXTURE0+M)}function G(A,M){let B=n.get(A);if(A.version>0&&B.__version!==A.version){St(B,A,M);return}e.bindTexture(i.TEXTURE_3D,B.__webglTexture,i.TEXTURE0+M)}function O(A,M){let B=n.get(A);if(A.version>0&&B.__version!==A.version){ut(B,A,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture,i.TEXTURE0+M)}let X={[qr]:i.REPEAT,[$n]:i.CLAMP_TO_EDGE,[Yr]:i.MIRRORED_REPEAT},K={[nn]:i.NEAREST,[Ph]:i.NEAREST_MIPMAP_NEAREST,[js]:i.NEAREST_MIPMAP_LINEAR,[dn]:i.LINEAR,[Ta]:i.LINEAR_MIPMAP_NEAREST,[ii]:i.LINEAR_MIPMAP_LINEAR},rt={[Nh]:i.NEVER,[Hh]:i.ALWAYS,[Fh]:i.LESS,[bl]:i.LEQUAL,[Oh]:i.EQUAL,[kh]:i.GEQUAL,[Bh]:i.GREATER,[zh]:i.NOTEQUAL};function yt(A,M){if(M.type===Sn&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===dn||M.magFilter===Ta||M.magFilter===js||M.magFilter===ii||M.minFilter===dn||M.minFilter===Ta||M.minFilter===js||M.minFilter===ii)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,X[M.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,X[M.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,X[M.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,K[M.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,K[M.minFilter]),M.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,rt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===nn||M.minFilter!==js&&M.minFilter!==ii||M.type===Sn&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");i.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Vt(A,M){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,M.addEventListener("dispose",E));let Z=M.source,j=d.get(Z);j===void 0&&(j={},d.set(Z,j));let q=W(M);if(q!==A.__cacheKey){j[q]===void 0&&(j[q]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,B=!0),j[q].usedTimes++;let vt=j[A.__cacheKey];vt!==void 0&&(j[A.__cacheKey].usedTimes--,vt.usedTimes===0&&w(M)),A.__cacheKey=q,A.__webglTexture=j[q].texture}return B}function Y(A,M,B){return Math.floor(Math.floor(A/B)/M)}function it(A,M,B,Z){let q=A.updateRanges;if(q.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,B,Z,M.data);else{q.sort((Q,dt)=>Q.start-dt.start);let vt=0;for(let Q=1;Q<q.length;Q++){let dt=q[vt],Rt=q[Q],Ct=dt.start+dt.count,at=Y(Rt.start,M.width,4),Dt=Y(dt.start,M.width,4);Rt.start<=Ct+1&&at===Dt&&Y(Rt.start+Rt.count-1,M.width,4)===at?dt.count=Math.max(dt.count,Rt.start+Rt.count-dt.start):(++vt,q[vt]=Rt)}q.length=vt+1;let lt=i.getParameter(i.UNPACK_ROW_LENGTH),_t=i.getParameter(i.UNPACK_SKIP_PIXELS),Mt=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let Q=0,dt=q.length;Q<dt;Q++){let Rt=q[Q],Ct=Math.floor(Rt.start/4),at=Math.ceil(Rt.count/4),Dt=Ct%M.width,D=Math.floor(Ct/M.width),ct=at,tt=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Dt),i.pixelStorei(i.UNPACK_SKIP_ROWS,D),e.texSubImage2D(i.TEXTURE_2D,0,Dt,D,ct,tt,B,Z,M.data)}A.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,lt),i.pixelStorei(i.UNPACK_SKIP_PIXELS,_t),i.pixelStorei(i.UNPACK_SKIP_ROWS,Mt)}}function St(A,M,B){let Z=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(Z=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(Z=i.TEXTURE_3D);let j=Vt(A,M),q=M.source;e.bindTexture(Z,A.__webglTexture,i.TEXTURE0+B);let vt=n.get(q);if(q.version!==vt.__version||j===!0){e.activeTexture(i.TEXTURE0+B);let lt=Gt.getPrimaries(Gt.workingColorSpace),_t=M.colorSpace===kn?null:Gt.getPrimaries(M.colorSpace),Mt=M.colorSpace===kn||lt===_t?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);let Q=x(M.image,!1,s.maxTextureSize);Q=Bt(M,Q);let dt=r.convert(M.format,M.colorSpace),Rt=r.convert(M.type),Ct=y(M.internalFormat,dt,Rt,M.colorSpace,M.isVideoTexture);yt(Z,M);let at,Dt=M.mipmaps,D=M.isVideoTexture!==!0,ct=vt.__version===void 0||j===!0,tt=q.dataReady,pt=T(M,Q);if(M.isDepthTexture)Ct=v(M.format===ds,M.type),ct&&(D?e.texStorage2D(i.TEXTURE_2D,1,Ct,Q.width,Q.height):e.texImage2D(i.TEXTURE_2D,0,Ct,Q.width,Q.height,0,dt,Rt,null));else if(M.isDataTexture)if(Dt.length>0){D&&ct&&e.texStorage2D(i.TEXTURE_2D,pt,Ct,Dt[0].width,Dt[0].height);for(let et=0,J=Dt.length;et<J;et++)at=Dt[et],D?tt&&e.texSubImage2D(i.TEXTURE_2D,et,0,0,at.width,at.height,dt,Rt,at.data):e.texImage2D(i.TEXTURE_2D,et,Ct,at.width,at.height,0,dt,Rt,at.data);M.generateMipmaps=!1}else D?(ct&&e.texStorage2D(i.TEXTURE_2D,pt,Ct,Q.width,Q.height),tt&&it(M,Q,dt,Rt)):e.texImage2D(i.TEXTURE_2D,0,Ct,Q.width,Q.height,0,dt,Rt,Q.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){D&&ct&&e.texStorage3D(i.TEXTURE_2D_ARRAY,pt,Ct,Dt[0].width,Dt[0].height,Q.depth);for(let et=0,J=Dt.length;et<J;et++)if(at=Dt[et],M.format!==sn)if(dt!==null)if(D){if(tt)if(M.layerUpdates.size>0){let mt=Il(at.width,at.height,M.format,M.type);for(let Ut of M.layerUpdates){let oe=at.data.subarray(Ut*mt/at.data.BYTES_PER_ELEMENT,(Ut+1)*mt/at.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,et,0,0,Ut,at.width,at.height,1,dt,oe)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,et,0,0,0,at.width,at.height,Q.depth,dt,at.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,et,Ct,at.width,at.height,Q.depth,0,at.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else D?tt&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,et,0,0,0,at.width,at.height,Q.depth,dt,Rt,at.data):e.texImage3D(i.TEXTURE_2D_ARRAY,et,Ct,at.width,at.height,Q.depth,0,dt,Rt,at.data)}else{D&&ct&&e.texStorage2D(i.TEXTURE_2D,pt,Ct,Dt[0].width,Dt[0].height);for(let et=0,J=Dt.length;et<J;et++)at=Dt[et],M.format!==sn?dt!==null?D?tt&&e.compressedTexSubImage2D(i.TEXTURE_2D,et,0,0,at.width,at.height,dt,at.data):e.compressedTexImage2D(i.TEXTURE_2D,et,Ct,at.width,at.height,0,at.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):D?tt&&e.texSubImage2D(i.TEXTURE_2D,et,0,0,at.width,at.height,dt,Rt,at.data):e.texImage2D(i.TEXTURE_2D,et,Ct,at.width,at.height,0,dt,Rt,at.data)}else if(M.isDataArrayTexture)if(D){if(ct&&e.texStorage3D(i.TEXTURE_2D_ARRAY,pt,Ct,Q.width,Q.height,Q.depth),tt)if(M.layerUpdates.size>0){let et=Il(Q.width,Q.height,M.format,M.type);for(let J of M.layerUpdates){let mt=Q.data.subarray(J*et/Q.data.BYTES_PER_ELEMENT,(J+1)*et/Q.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,J,Q.width,Q.height,1,dt,Rt,mt)}M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,Q.width,Q.height,Q.depth,dt,Rt,Q.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ct,Q.width,Q.height,Q.depth,0,dt,Rt,Q.data);else if(M.isData3DTexture)D?(ct&&e.texStorage3D(i.TEXTURE_3D,pt,Ct,Q.width,Q.height,Q.depth),tt&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,Q.width,Q.height,Q.depth,dt,Rt,Q.data)):e.texImage3D(i.TEXTURE_3D,0,Ct,Q.width,Q.height,Q.depth,0,dt,Rt,Q.data);else if(M.isFramebufferTexture){if(ct)if(D)e.texStorage2D(i.TEXTURE_2D,pt,Ct,Q.width,Q.height);else{let et=Q.width,J=Q.height;for(let mt=0;mt<pt;mt++)e.texImage2D(i.TEXTURE_2D,mt,Ct,et,J,0,dt,Rt,null),et>>=1,J>>=1}}else if(Dt.length>0){if(D&&ct){let et=Se(Dt[0]);e.texStorage2D(i.TEXTURE_2D,pt,Ct,et.width,et.height)}for(let et=0,J=Dt.length;et<J;et++)at=Dt[et],D?tt&&e.texSubImage2D(i.TEXTURE_2D,et,0,0,dt,Rt,at):e.texImage2D(i.TEXTURE_2D,et,Ct,dt,Rt,at);M.generateMipmaps=!1}else if(D){if(ct){let et=Se(Q);e.texStorage2D(i.TEXTURE_2D,pt,Ct,et.width,et.height)}tt&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,dt,Rt,Q)}else e.texImage2D(i.TEXTURE_2D,0,Ct,dt,Rt,Q);p(M)&&l(Z),vt.__version=q.version,M.onUpdate&&M.onUpdate(M)}A.__version=M.version}function ut(A,M,B){if(M.image.length!==6)return;let Z=Vt(A,M),j=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+B);let q=n.get(j);if(j.version!==q.__version||Z===!0){e.activeTexture(i.TEXTURE0+B);let vt=Gt.getPrimaries(Gt.workingColorSpace),lt=M.colorSpace===kn?null:Gt.getPrimaries(M.colorSpace),_t=M.colorSpace===kn||vt===lt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);let Mt=M.isCompressedTexture||M.image[0].isCompressedTexture,Q=M.image[0]&&M.image[0].isDataTexture,dt=[];for(let J=0;J<6;J++)!Mt&&!Q?dt[J]=x(M.image[J],!0,s.maxCubemapSize):dt[J]=Q?M.image[J].image:M.image[J],dt[J]=Bt(M,dt[J]);let Rt=dt[0],Ct=r.convert(M.format,M.colorSpace),at=r.convert(M.type),Dt=y(M.internalFormat,Ct,at,M.colorSpace),D=M.isVideoTexture!==!0,ct=q.__version===void 0||Z===!0,tt=j.dataReady,pt=T(M,Rt);yt(i.TEXTURE_CUBE_MAP,M);let et;if(Mt){D&&ct&&e.texStorage2D(i.TEXTURE_CUBE_MAP,pt,Dt,Rt.width,Rt.height);for(let J=0;J<6;J++){et=dt[J].mipmaps;for(let mt=0;mt<et.length;mt++){let Ut=et[mt];M.format!==sn?Ct!==null?D?tt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,0,0,Ut.width,Ut.height,Ct,Ut.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,Dt,Ut.width,Ut.height,0,Ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,0,0,Ut.width,Ut.height,Ct,at,Ut.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt,Dt,Ut.width,Ut.height,0,Ct,at,Ut.data)}}}else{if(et=M.mipmaps,D&&ct){et.length>0&&pt++;let J=Se(dt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,pt,Dt,J.width,J.height)}for(let J=0;J<6;J++)if(Q){D?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,dt[J].width,dt[J].height,Ct,at,dt[J].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Dt,dt[J].width,dt[J].height,0,Ct,at,dt[J].data);for(let mt=0;mt<et.length;mt++){let oe=et[mt].image[J].image;D?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,0,0,oe.width,oe.height,Ct,at,oe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,Dt,oe.width,oe.height,0,Ct,at,oe.data)}}else{D?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Ct,at,dt[J]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Dt,Ct,at,dt[J]);for(let mt=0;mt<et.length;mt++){let Ut=et[mt];D?tt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,0,0,Ct,at,Ut.image[J]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+J,mt+1,Dt,Ct,at,Ut.image[J])}}}p(M)&&l(i.TEXTURE_CUBE_MAP),q.__version=j.version,M.onUpdate&&M.onUpdate(M)}A.__version=M.version}function bt(A,M,B,Z,j,q){let vt=r.convert(B.format,B.colorSpace),lt=r.convert(B.type),_t=y(B.internalFormat,vt,lt,B.colorSpace),Mt=n.get(M),Q=n.get(B);if(Q.__renderTarget=M,!Mt.__hasExternalTextures){let dt=Math.max(1,M.width>>q),Rt=Math.max(1,M.height>>q);j===i.TEXTURE_3D||j===i.TEXTURE_2D_ARRAY?e.texImage3D(j,q,_t,dt,Rt,M.depth,0,vt,lt,null):e.texImage2D(j,q,_t,dt,Rt,0,vt,lt,null)}e.bindFramebuffer(i.FRAMEBUFFER,A),Xt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,j,Q.__webglTexture,0,xt(M)):(j===i.TEXTURE_2D||j>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Z,j,Q.__webglTexture,q),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Yt(A,M,B){if(i.bindRenderbuffer(i.RENDERBUFFER,A),M.depthBuffer){let Z=M.depthTexture,j=Z&&Z.isDepthTexture?Z.type:null,q=v(M.stencilBuffer,j),vt=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,lt=xt(M);Xt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,lt,q,M.width,M.height):B?i.renderbufferStorageMultisample(i.RENDERBUFFER,lt,q,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,q,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,vt,i.RENDERBUFFER,A)}else{let Z=M.textures;for(let j=0;j<Z.length;j++){let q=Z[j],vt=r.convert(q.format,q.colorSpace),lt=r.convert(q.type),_t=y(q.internalFormat,vt,lt,q.colorSpace),Mt=xt(M);B&&Xt(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Mt,_t,M.width,M.height):Xt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Mt,_t,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,_t,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(A,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,A),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let Z=n.get(M.depthTexture);Z.__renderTarget=M,(!Z.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),$(M.depthTexture,0);let j=Z.__webglTexture,q=xt(M);if(M.depthTexture.format===Qi)Xt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(M.depthTexture.format===ds)Xt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,q):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function de(A){let M=n.get(A),B=A.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==A.depthTexture){let Z=A.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),Z){let j=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,Z.removeEventListener("dispose",j)};Z.addEventListener("dispose",j),M.__depthDisposeCallback=j}M.__boundDepthTexture=Z}if(A.depthTexture&&!M.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");let Z=A.texture.mipmaps;Z&&Z.length>0?It(M.__webglFramebuffer[0],A):It(M.__webglFramebuffer,A)}else if(B){M.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[Z]),M.__webglDepthbuffer[Z]===void 0)M.__webglDepthbuffer[Z]=i.createRenderbuffer(),Yt(M.__webglDepthbuffer[Z],A,!1);else{let j=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=M.__webglDepthbuffer[Z];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,q)}}else{let Z=A.texture.mipmaps;if(Z&&Z.length>0?e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),Yt(M.__webglDepthbuffer,A,!1);else{let j=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,q)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function fe(A,M,B){let Z=n.get(A);M!==void 0&&bt(Z.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),B!==void 0&&de(A)}function $t(A){let M=A.texture,B=n.get(A),Z=n.get(M);A.addEventListener("dispose",R);let j=A.textures,q=A.isWebGLCubeRenderTarget===!0,vt=j.length>1;if(vt||(Z.__webglTexture===void 0&&(Z.__webglTexture=i.createTexture()),Z.__version=M.version,a.memory.textures++),q){B.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer[lt]=[];for(let _t=0;_t<M.mipmaps.length;_t++)B.__webglFramebuffer[lt][_t]=i.createFramebuffer()}else B.__webglFramebuffer[lt]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){B.__webglFramebuffer=[];for(let lt=0;lt<M.mipmaps.length;lt++)B.__webglFramebuffer[lt]=i.createFramebuffer()}else B.__webglFramebuffer=i.createFramebuffer();if(vt)for(let lt=0,_t=j.length;lt<_t;lt++){let Mt=n.get(j[lt]);Mt.__webglTexture===void 0&&(Mt.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&Xt(A)===!1){B.__webglMultisampledFramebuffer=i.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let lt=0;lt<j.length;lt++){let _t=j[lt];B.__webglColorRenderbuffer[lt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,B.__webglColorRenderbuffer[lt]);let Mt=r.convert(_t.format,_t.colorSpace),Q=r.convert(_t.type),dt=y(_t.internalFormat,Mt,Q,_t.colorSpace,A.isXRRenderTarget===!0),Rt=xt(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,Rt,dt,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+lt,i.RENDERBUFFER,B.__webglColorRenderbuffer[lt])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=i.createRenderbuffer(),Yt(B.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){e.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),yt(i.TEXTURE_CUBE_MAP,M);for(let lt=0;lt<6;lt++)if(M.mipmaps&&M.mipmaps.length>0)for(let _t=0;_t<M.mipmaps.length;_t++)bt(B.__webglFramebuffer[lt][_t],A,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+lt,_t);else bt(B.__webglFramebuffer[lt],A,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);p(M)&&l(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(vt){for(let lt=0,_t=j.length;lt<_t;lt++){let Mt=j[lt],Q=n.get(Mt);e.bindTexture(i.TEXTURE_2D,Q.__webglTexture),yt(i.TEXTURE_2D,Mt),bt(B.__webglFramebuffer,A,Mt,i.COLOR_ATTACHMENT0+lt,i.TEXTURE_2D,0),p(Mt)&&l(i.TEXTURE_2D)}e.unbindTexture()}else{let lt=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(lt=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(lt,Z.__webglTexture),yt(lt,M),M.mipmaps&&M.mipmaps.length>0)for(let _t=0;_t<M.mipmaps.length;_t++)bt(B.__webglFramebuffer[_t],A,M,i.COLOR_ATTACHMENT0,lt,_t);else bt(B.__webglFramebuffer,A,M,i.COLOR_ATTACHMENT0,lt,0);p(M)&&l(lt),e.unbindTexture()}A.depthBuffer&&de(A)}function I(A){let M=A.textures;for(let B=0,Z=M.length;B<Z;B++){let j=M[B];if(p(j)){let q=g(A),vt=n.get(j).__webglTexture;e.bindTexture(q,vt),l(q),e.unbindTexture()}}}let De=[],Zt=[];function re(A){if(A.samples>0){if(Xt(A)===!1){let M=A.textures,B=A.width,Z=A.height,j=i.COLOR_BUFFER_BIT,q=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,vt=n.get(A),lt=M.length>1;if(lt)for(let Mt=0;Mt<M.length;Mt++)e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer);let _t=A.texture.mipmaps;_t&&_t.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let Mt=0;Mt<M.length;Mt++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(j|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(j|=i.STENCIL_BUFFER_BIT)),lt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,vt.__webglColorRenderbuffer[Mt]);let Q=n.get(M[Mt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Q,0)}i.blitFramebuffer(0,0,B,Z,0,0,B,Z,j,i.NEAREST),c===!0&&(De.length=0,Zt.length=0,De.push(i.COLOR_ATTACHMENT0+Mt),A.depthBuffer&&A.resolveDepthBuffer===!1&&(De.push(q),Zt.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Zt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,De))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),lt)for(let Mt=0;Mt<M.length;Mt++){e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,vt.__webglColorRenderbuffer[Mt]);let Q=n.get(M[Mt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,Q,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&c){let M=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function xt(A){return Math.min(s.maxSamples,A.samples)}function Xt(A){let M=n.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Tt(A){let M=a.render.frame;u.get(A)!==M&&(u.set(A,M),A.update())}function Bt(A,M){let B=A.colorSpace,Z=A.format,j=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==xi&&B!==kn&&(Gt.getTransfer(B)===Qt?(Z!==sn||j!==mn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),M}function Se(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(h.width=A.naturalWidth||A.width,h.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(h.width=A.displayWidth,h.height=A.displayHeight):(h.width=A.width,h.height=A.height),h}this.allocateTextureUnit=z,this.resetTextureUnits=H,this.setTexture2D=$,this.setTexture2DArray=U,this.setTexture3D=G,this.setTextureCube=O,this.rebindTextures=fe,this.setupRenderTarget=$t,this.updateRenderTargetMipmap=I,this.updateMultisampleRenderTarget=re,this.setupDepthRenderbuffer=de,this.setupFrameBufferTexture=bt,this.useMultisampledRTT=Xt}function W0(i,t){function e(n,s=kn){let r,a=Gt.getTransfer(s);if(n===mn)return i.UNSIGNED_BYTE;if(n===Ca)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ra)return i.UNSIGNED_SHORT_5_5_5_1;if(n===gl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===pl)return i.BYTE;if(n===ml)return i.SHORT;if(n===cs)return i.UNSIGNED_SHORT;if(n===Aa)return i.INT;if(n===si)return i.UNSIGNED_INT;if(n===Sn)return i.FLOAT;if(n===hs)return i.HALF_FLOAT;if(n===_l)return i.ALPHA;if(n===xl)return i.RGB;if(n===sn)return i.RGBA;if(n===Qi)return i.DEPTH_COMPONENT;if(n===ds)return i.DEPTH_STENCIL;if(n===yl)return i.RED;if(n===Ia)return i.RED_INTEGER;if(n===vl)return i.RG;if(n===Pa)return i.RG_INTEGER;if(n===La)return i.RGBA_INTEGER;if(n===Qs||n===tr||n===er||n===nr)if(a===Qt)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Qs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===tr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Qs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===tr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===er)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===nr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Da||n===Ua||n===Na||n===Fa)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Da)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ua)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Na)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Fa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Oa||n===Ba||n===za)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Oa||n===Ba)return a===Qt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===za)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ka||n===Ha||n===Va||n===Ga||n===Wa||n===Xa||n===qa||n===Ya||n===$a||n===Za||n===Ja||n===Ka||n===ja||n===Qa)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ka)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ha)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Va)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ga)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Wa)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Xa)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===qa)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ya)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===$a)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Za)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ja)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ka)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ja)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Qa)return a===Qt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ir||n===to||n===eo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ir)return a===Qt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===to)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===eo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ml||n===no||n===io||n===so)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ir)return r.COMPRESSED_RED_RGTC1_EXT;if(n===no)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===io)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===so)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===us?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var X0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,q0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Gl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){let s=new Ye,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!==n.depthNear||e.depthFar!==n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new fn({vertexShader:X0,fragmentShader:q0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new st(new Fn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Wl=class extends yn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,h=null,u=null,f=null,d=null,m=null,_=null,x=new Gl,p=e.getContextAttributes(),l=null,g=null,y=[],v=[],T=new Et,E=null,R=new be;R.viewport=new jt;let L=new be;L.viewport=new jt;let w=[R,L],S=new ma,P=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let it=y[Y];return it===void 0&&(it=new is,y[Y]=it),it.getTargetRaySpace()},this.getControllerGrip=function(Y){let it=y[Y];return it===void 0&&(it=new is,y[Y]=it),it.getGripSpace()},this.getHand=function(Y){let it=y[Y];return it===void 0&&(it=new is,y[Y]=it),it.getHandSpace()};function z(Y){let it=v.indexOf(Y.inputSource);if(it===-1)return;let St=y[it];St!==void 0&&(St.update(Y.inputSource,Y.frame,h||a),St.dispatchEvent({type:Y.type,data:Y.inputSource}))}function W(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",W),s.removeEventListener("inputsourceschange",$);for(let Y=0;Y<y.length;Y++){let it=v[Y];it!==null&&(v[Y]=null,y[Y].disconnect(it))}P=null,H=null,x.reset(),t.setRenderTarget(l),m=null,d=null,f=null,s=null,g=null,Vt.stop(),n.isPresenting=!1,t.setPixelRatio(E),t.setSize(T.width,T.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(Y){h=Y},this.getBaseLayer=function(){return d!==null?d:m},this.getBinding=function(){return f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(l=t.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",W),s.addEventListener("inputsourceschange",$),p.xrCompatible!==!0&&await e.makeXRCompatible(),E=t.getPixelRatio(),t.getSize(T),typeof XRWebGLBinding<"u"&&"createProjectionLayer"in XRWebGLBinding.prototype){let St=null,ut=null,bt=null;p.depth&&(bt=p.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,St=p.stencil?ds:Qi,ut=p.stencil?us:si);let Yt={colorFormat:e.RGBA8,depthFormat:bt,scaleFactor:r};f=new XRWebGLBinding(s,e),d=f.createProjectionLayer(Yt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),g=new vn(d.textureWidth,d.textureHeight,{format:sn,type:mn,depthTexture:new Hs(d.textureWidth,d.textureHeight,ut,void 0,void 0,void 0,void 0,void 0,void 0,St),stencilBuffer:p.stencil,colorSpace:t.outputColorSpace,samples:p.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let St={antialias:p.antialias,alpha:!0,depth:p.depth,stencil:p.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,e,St),s.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),g=new vn(m.framebufferWidth,m.framebufferHeight,{format:sn,type:mn,colorSpace:t.outputColorSpace,stencilBuffer:p.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(c),h=null,a=await s.requestReferenceSpace(o),Vt.setContext(s),Vt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function $(Y){for(let it=0;it<Y.removed.length;it++){let St=Y.removed[it],ut=v.indexOf(St);ut>=0&&(v[ut]=null,y[ut].disconnect(St))}for(let it=0;it<Y.added.length;it++){let St=Y.added[it],ut=v.indexOf(St);if(ut===-1){for(let Yt=0;Yt<y.length;Yt++)if(Yt>=v.length){v.push(St),ut=Yt;break}else if(v[Yt]===null){v[Yt]=St,ut=Yt;break}if(ut===-1)break}let bt=y[ut];bt&&bt.connect(St)}}let U=new C,G=new C;function O(Y,it,St){U.setFromMatrixPosition(it.matrixWorld),G.setFromMatrixPosition(St.matrixWorld);let ut=U.distanceTo(G),bt=it.projectionMatrix.elements,Yt=St.projectionMatrix.elements,It=bt[14]/(bt[10]-1),de=bt[14]/(bt[10]+1),fe=(bt[9]+1)/bt[5],$t=(bt[9]-1)/bt[5],I=(bt[8]-1)/bt[0],De=(Yt[8]+1)/Yt[0],Zt=It*I,re=It*De,xt=ut/(-I+De),Xt=xt*-I;if(it.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Xt),Y.translateZ(xt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),bt[10]===-1)Y.projectionMatrix.copy(it.projectionMatrix),Y.projectionMatrixInverse.copy(it.projectionMatrixInverse);else{let Tt=It+xt,Bt=de+xt,Se=Zt-Xt,A=re+(ut-Xt),M=fe*de/Bt*Tt,B=$t*de/Bt*Tt;Y.projectionMatrix.makePerspective(Se,A,M,B,Tt,Bt),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function X(Y,it){it===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(it.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let it=Y.near,St=Y.far;x.texture!==null&&(x.depthNear>0&&(it=x.depthNear),x.depthFar>0&&(St=x.depthFar)),S.near=L.near=R.near=it,S.far=L.far=R.far=St,(P!==S.near||H!==S.far)&&(s.updateRenderState({depthNear:S.near,depthFar:S.far}),P=S.near,H=S.far),R.layers.mask=Y.layers.mask|2,L.layers.mask=Y.layers.mask|4,S.layers.mask=R.layers.mask|L.layers.mask;let ut=Y.parent,bt=S.cameras;X(S,ut);for(let Yt=0;Yt<bt.length;Yt++)X(bt[Yt],ut);bt.length===2?O(S,R,L):S.projectionMatrix.copy(R.projectionMatrix),K(Y,S,ut)};function K(Y,it,St){St===null?Y.matrix.copy(it.matrixWorld):(Y.matrix.copy(St.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(it.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(it.projectionMatrix),Y.projectionMatrixInverse.copy(it.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=ts*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(d===null&&m===null))return c},this.setFoveation=function(Y){c=Y,d!==null&&(d.fixedFoveation=Y),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=Y)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(S)};let rt=null;function yt(Y,it){if(u=it.getViewerPose(h||a),_=it,u!==null){let St=u.views;m!==null&&(t.setRenderTargetFramebuffer(g,m.framebuffer),t.setRenderTarget(g));let ut=!1;St.length!==S.cameras.length&&(S.cameras.length=0,ut=!0);for(let It=0;It<St.length;It++){let de=St[It],fe=null;if(m!==null)fe=m.getViewport(de);else{let I=f.getViewSubImage(d,de);fe=I.viewport,It===0&&(t.setRenderTargetTextures(g,I.colorTexture,I.depthStencilTexture),t.setRenderTarget(g))}let $t=w[It];$t===void 0&&($t=new be,$t.layers.enable(It),$t.viewport=new jt,w[It]=$t),$t.matrix.fromArray(de.transform.matrix),$t.matrix.decompose($t.position,$t.quaternion,$t.scale),$t.projectionMatrix.fromArray(de.projectionMatrix),$t.projectionMatrixInverse.copy($t.projectionMatrix).invert(),$t.viewport.set(fe.x,fe.y,fe.width,fe.height),It===0&&(S.matrix.copy($t.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),ut===!0&&S.cameras.push($t)}let bt=s.enabledFeatures;if(bt&&bt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&f){let It=f.getDepthInformation(St[0]);It&&It.isValid&&It.texture&&x.init(t,It,s.renderState)}}for(let St=0;St<y.length;St++){let ut=v[St],bt=y[St];ut!==null&&bt!==void 0&&bt.update(ut,it,h||a)}rt&&rt(Y,it),it.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:it}),_=null}let Vt=new xu;Vt.setAnimationLoop(yt),this.setAnimationLoop=function(Y){rt=Y},this.dispose=function(){}}},Ri=new Ze,Y0=new ee;function $0(i,t){function e(p,l){p.matrixAutoUpdate===!0&&p.updateMatrix(),l.value.copy(p.matrix)}function n(p,l){l.color.getRGB(p.fogColor.value,Al(i)),l.isFog?(p.fogNear.value=l.near,p.fogFar.value=l.far):l.isFogExp2&&(p.fogDensity.value=l.density)}function s(p,l,g,y,v){l.isMeshBasicMaterial||l.isMeshLambertMaterial?r(p,l):l.isMeshToonMaterial?(r(p,l),f(p,l)):l.isMeshPhongMaterial?(r(p,l),u(p,l)):l.isMeshStandardMaterial?(r(p,l),d(p,l),l.isMeshPhysicalMaterial&&m(p,l,v)):l.isMeshMatcapMaterial?(r(p,l),_(p,l)):l.isMeshDepthMaterial?r(p,l):l.isMeshDistanceMaterial?(r(p,l),x(p,l)):l.isMeshNormalMaterial?r(p,l):l.isLineBasicMaterial?(a(p,l),l.isLineDashedMaterial&&o(p,l)):l.isPointsMaterial?c(p,l,g,y):l.isSpriteMaterial?h(p,l):l.isShadowMaterial?(p.color.value.copy(l.color),p.opacity.value=l.opacity):l.isShaderMaterial&&(l.uniformsNeedUpdate=!1)}function r(p,l){p.opacity.value=l.opacity,l.color&&p.diffuse.value.copy(l.color),l.emissive&&p.emissive.value.copy(l.emissive).multiplyScalar(l.emissiveIntensity),l.map&&(p.map.value=l.map,e(l.map,p.mapTransform)),l.alphaMap&&(p.alphaMap.value=l.alphaMap,e(l.alphaMap,p.alphaMapTransform)),l.bumpMap&&(p.bumpMap.value=l.bumpMap,e(l.bumpMap,p.bumpMapTransform),p.bumpScale.value=l.bumpScale,l.side===Be&&(p.bumpScale.value*=-1)),l.normalMap&&(p.normalMap.value=l.normalMap,e(l.normalMap,p.normalMapTransform),p.normalScale.value.copy(l.normalScale),l.side===Be&&p.normalScale.value.negate()),l.displacementMap&&(p.displacementMap.value=l.displacementMap,e(l.displacementMap,p.displacementMapTransform),p.displacementScale.value=l.displacementScale,p.displacementBias.value=l.displacementBias),l.emissiveMap&&(p.emissiveMap.value=l.emissiveMap,e(l.emissiveMap,p.emissiveMapTransform)),l.specularMap&&(p.specularMap.value=l.specularMap,e(l.specularMap,p.specularMapTransform)),l.alphaTest>0&&(p.alphaTest.value=l.alphaTest);let g=t.get(l),y=g.envMap,v=g.envMapRotation;y&&(p.envMap.value=y,Ri.copy(v),Ri.x*=-1,Ri.y*=-1,Ri.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Ri.y*=-1,Ri.z*=-1),p.envMapRotation.value.setFromMatrix4(Y0.makeRotationFromEuler(Ri)),p.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,p.reflectivity.value=l.reflectivity,p.ior.value=l.ior,p.refractionRatio.value=l.refractionRatio),l.lightMap&&(p.lightMap.value=l.lightMap,p.lightMapIntensity.value=l.lightMapIntensity,e(l.lightMap,p.lightMapTransform)),l.aoMap&&(p.aoMap.value=l.aoMap,p.aoMapIntensity.value=l.aoMapIntensity,e(l.aoMap,p.aoMapTransform))}function a(p,l){p.diffuse.value.copy(l.color),p.opacity.value=l.opacity,l.map&&(p.map.value=l.map,e(l.map,p.mapTransform))}function o(p,l){p.dashSize.value=l.dashSize,p.totalSize.value=l.dashSize+l.gapSize,p.scale.value=l.scale}function c(p,l,g,y){p.diffuse.value.copy(l.color),p.opacity.value=l.opacity,p.size.value=l.size*g,p.scale.value=y*.5,l.map&&(p.map.value=l.map,e(l.map,p.uvTransform)),l.alphaMap&&(p.alphaMap.value=l.alphaMap,e(l.alphaMap,p.alphaMapTransform)),l.alphaTest>0&&(p.alphaTest.value=l.alphaTest)}function h(p,l){p.diffuse.value.copy(l.color),p.opacity.value=l.opacity,p.rotation.value=l.rotation,l.map&&(p.map.value=l.map,e(l.map,p.mapTransform)),l.alphaMap&&(p.alphaMap.value=l.alphaMap,e(l.alphaMap,p.alphaMapTransform)),l.alphaTest>0&&(p.alphaTest.value=l.alphaTest)}function u(p,l){p.specular.value.copy(l.specular),p.shininess.value=Math.max(l.shininess,1e-4)}function f(p,l){l.gradientMap&&(p.gradientMap.value=l.gradientMap)}function d(p,l){p.metalness.value=l.metalness,l.metalnessMap&&(p.metalnessMap.value=l.metalnessMap,e(l.metalnessMap,p.metalnessMapTransform)),p.roughness.value=l.roughness,l.roughnessMap&&(p.roughnessMap.value=l.roughnessMap,e(l.roughnessMap,p.roughnessMapTransform)),l.envMap&&(p.envMapIntensity.value=l.envMapIntensity)}function m(p,l,g){p.ior.value=l.ior,l.sheen>0&&(p.sheenColor.value.copy(l.sheenColor).multiplyScalar(l.sheen),p.sheenRoughness.value=l.sheenRoughness,l.sheenColorMap&&(p.sheenColorMap.value=l.sheenColorMap,e(l.sheenColorMap,p.sheenColorMapTransform)),l.sheenRoughnessMap&&(p.sheenRoughnessMap.value=l.sheenRoughnessMap,e(l.sheenRoughnessMap,p.sheenRoughnessMapTransform))),l.clearcoat>0&&(p.clearcoat.value=l.clearcoat,p.clearcoatRoughness.value=l.clearcoatRoughness,l.clearcoatMap&&(p.clearcoatMap.value=l.clearcoatMap,e(l.clearcoatMap,p.clearcoatMapTransform)),l.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=l.clearcoatRoughnessMap,e(l.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),l.clearcoatNormalMap&&(p.clearcoatNormalMap.value=l.clearcoatNormalMap,e(l.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(l.clearcoatNormalScale),l.side===Be&&p.clearcoatNormalScale.value.negate())),l.dispersion>0&&(p.dispersion.value=l.dispersion),l.iridescence>0&&(p.iridescence.value=l.iridescence,p.iridescenceIOR.value=l.iridescenceIOR,p.iridescenceThicknessMinimum.value=l.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=l.iridescenceThicknessRange[1],l.iridescenceMap&&(p.iridescenceMap.value=l.iridescenceMap,e(l.iridescenceMap,p.iridescenceMapTransform)),l.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=l.iridescenceThicknessMap,e(l.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),l.transmission>0&&(p.transmission.value=l.transmission,p.transmissionSamplerMap.value=g.texture,p.transmissionSamplerSize.value.set(g.width,g.height),l.transmissionMap&&(p.transmissionMap.value=l.transmissionMap,e(l.transmissionMap,p.transmissionMapTransform)),p.thickness.value=l.thickness,l.thicknessMap&&(p.thicknessMap.value=l.thicknessMap,e(l.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=l.attenuationDistance,p.attenuationColor.value.copy(l.attenuationColor)),l.anisotropy>0&&(p.anisotropyVector.value.set(l.anisotropy*Math.cos(l.anisotropyRotation),l.anisotropy*Math.sin(l.anisotropyRotation)),l.anisotropyMap&&(p.anisotropyMap.value=l.anisotropyMap,e(l.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=l.specularIntensity,p.specularColor.value.copy(l.specularColor),l.specularColorMap&&(p.specularColorMap.value=l.specularColorMap,e(l.specularColorMap,p.specularColorMapTransform)),l.specularIntensityMap&&(p.specularIntensityMap.value=l.specularIntensityMap,e(l.specularIntensityMap,p.specularIntensityMapTransform))}function _(p,l){l.matcap&&(p.matcap.value=l.matcap)}function x(p,l){let g=t.get(l).light;p.referencePosition.value.setFromMatrixPosition(g.matrixWorld),p.nearDistance.value=g.shadow.camera.near,p.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Z0(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(g,y){let v=y.program;n.uniformBlockBinding(g,v)}function h(g,y){let v=s[g.id];v===void 0&&(_(g),v=u(g),s[g.id]=v,g.addEventListener("dispose",p));let T=y.program;n.updateUBOMapping(g,T);let E=t.render.frame;r[g.id]!==E&&(d(g),r[g.id]=E)}function u(g){let y=f();g.__bindingPointIndex=y;let v=i.createBuffer(),T=g.__size,E=g.usage;return i.bindBuffer(i.UNIFORM_BUFFER,v),i.bufferData(i.UNIFORM_BUFFER,T,E),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,y,v),v}function f(){for(let g=0;g<o;g++)if(a.indexOf(g)===-1)return a.push(g),g;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(g){let y=s[g.id],v=g.uniforms,T=g.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let E=0,R=v.length;E<R;E++){let L=Array.isArray(v[E])?v[E]:[v[E]];for(let w=0,S=L.length;w<S;w++){let P=L[w];if(m(P,E,w,T)===!0){let H=P.__offset,z=Array.isArray(P.value)?P.value:[P.value],W=0;for(let $=0;$<z.length;$++){let U=z[$],G=x(U);typeof U=="number"||typeof U=="boolean"?(P.__data[0]=U,i.bufferSubData(i.UNIFORM_BUFFER,H+W,P.__data)):U.isMatrix3?(P.__data[0]=U.elements[0],P.__data[1]=U.elements[1],P.__data[2]=U.elements[2],P.__data[3]=0,P.__data[4]=U.elements[3],P.__data[5]=U.elements[4],P.__data[6]=U.elements[5],P.__data[7]=0,P.__data[8]=U.elements[6],P.__data[9]=U.elements[7],P.__data[10]=U.elements[8],P.__data[11]=0):(U.toArray(P.__data,W),W+=G.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,H,P.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(g,y,v,T){let E=g.value,R=y+"_"+v;if(T[R]===void 0)return typeof E=="number"||typeof E=="boolean"?T[R]=E:T[R]=E.clone(),!0;{let L=T[R];if(typeof E=="number"||typeof E=="boolean"){if(L!==E)return T[R]=E,!0}else if(L.equals(E)===!1)return L.copy(E),!0}return!1}function _(g){let y=g.uniforms,v=0,T=16;for(let R=0,L=y.length;R<L;R++){let w=Array.isArray(y[R])?y[R]:[y[R]];for(let S=0,P=w.length;S<P;S++){let H=w[S],z=Array.isArray(H.value)?H.value:[H.value];for(let W=0,$=z.length;W<$;W++){let U=z[W],G=x(U),O=v%T,X=O%G.boundary,K=O+X;v+=X,K!==0&&T-K<G.storage&&(v+=T-K),H.__data=new Float32Array(G.storage/Float32Array.BYTES_PER_ELEMENT),H.__offset=v,v+=G.storage}}}let E=v%T;return E>0&&(v+=T-E),g.__size=v,g.__cache={},this}function x(g){let y={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(y.boundary=4,y.storage=4):g.isVector2?(y.boundary=8,y.storage=8):g.isVector3||g.isColor?(y.boundary=16,y.storage=12):g.isVector4?(y.boundary=16,y.storage=16):g.isMatrix3?(y.boundary=48,y.storage=48):g.isMatrix4?(y.boundary=64,y.storage=64):g.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",g),y}function p(g){let y=g.target;y.removeEventListener("dispose",p);let v=a.indexOf(y.__bindingPointIndex);a.splice(v,1),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function l(){for(let g in s)i.deleteBuffer(s[g]);a=[],s={},r={}}return{bind:c,update:h,dispose:l}}var _s=class{constructor(t={}){let{canvas:e=Vh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reverseDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let m;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=n.getContextAttributes().alpha}else m=a;let _=new Uint32Array(4),x=new Int32Array(4),p=null,l=null,g=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=zn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let v=this,T=!1;this._outputColorSpace=Ce;let E=0,R=0,L=null,w=-1,S=null,P=new jt,H=new jt,z=null,W=new Ot(0),$=0,U=e.width,G=e.height,O=1,X=null,K=null,rt=new jt(0,0,U,G),yt=new jt(0,0,U,G),Vt=!1,Y=new ss,it=!1,St=!1,ut=new ee,bt=new ee,Yt=new C,It=new jt,de={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},fe=!1;function $t(){return L===null?O:1}let I=n;function De(b,N){return e.getContext(b,N)}try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"178"}`),e.addEventListener("webglcontextlost",pt,!1),e.addEventListener("webglcontextrestored",et,!1),e.addEventListener("webglcontextcreationerror",J,!1),I===null){let N="webgl2";if(I=De(N,b),I===null)throw De(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let Zt,re,xt,Xt,Tt,Bt,Se,A,M,B,Z,j,q,vt,lt,_t,Mt,Q,dt,Rt,Ct,at,Dt,D;function ct(){Zt=new fg(I),Zt.init(),at=new W0(I,Zt),re=new ag(I,Zt,t,at),xt=new V0(I,Zt),re.reverseDepthBuffer&&d&&xt.buffers.depth.setReversed(!0),Xt=new gg(I),Tt=new R0,Bt=new G0(I,Zt,xt,Tt,re,at,Xt),Se=new lg(v),A=new dg(v),M=new Sf(I),Dt=new sg(I,M),B=new pg(I,M,Xt,Dt),Z=new xg(I,B,M,Xt),dt=new _g(I,re,Bt),_t=new og(Tt),j=new C0(v,Se,A,Zt,re,Dt,_t),q=new $0(v,Tt),vt=new P0,lt=new O0(Zt),Q=new ig(v,Se,A,xt,Z,m,c),Mt=new k0(v,Z,re),D=new Z0(I,Xt,re,xt),Rt=new rg(I,Zt,Xt),Ct=new mg(I,Zt,Xt),Xt.programs=j.programs,v.capabilities=re,v.extensions=Zt,v.properties=Tt,v.renderLists=vt,v.shadowMap=Mt,v.state=xt,v.info=Xt}ct();let tt=new Wl(v,I);this.xr=tt,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){let b=Zt.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=Zt.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return O},this.setPixelRatio=function(b){b!==void 0&&(O=b,this.setSize(U,G,!1))},this.getSize=function(b){return b.set(U,G)},this.setSize=function(b,N,k=!0){if(tt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}U=b,G=N,e.width=Math.floor(b*O),e.height=Math.floor(N*O),k===!0&&(e.style.width=b+"px",e.style.height=N+"px"),this.setViewport(0,0,b,N)},this.getDrawingBufferSize=function(b){return b.set(U*O,G*O).floor()},this.setDrawingBufferSize=function(b,N,k){U=b,G=N,O=k,e.width=Math.floor(b*k),e.height=Math.floor(N*k),this.setViewport(0,0,b,N)},this.getCurrentViewport=function(b){return b.copy(P)},this.getViewport=function(b){return b.copy(rt)},this.setViewport=function(b,N,k,V){b.isVector4?rt.set(b.x,b.y,b.z,b.w):rt.set(b,N,k,V),xt.viewport(P.copy(rt).multiplyScalar(O).round())},this.getScissor=function(b){return b.copy(yt)},this.setScissor=function(b,N,k,V){b.isVector4?yt.set(b.x,b.y,b.z,b.w):yt.set(b,N,k,V),xt.scissor(H.copy(yt).multiplyScalar(O).round())},this.getScissorTest=function(){return Vt},this.setScissorTest=function(b){xt.setScissorTest(Vt=b)},this.setOpaqueSort=function(b){X=b},this.setTransparentSort=function(b){K=b},this.getClearColor=function(b){return b.copy(Q.getClearColor())},this.setClearColor=function(){Q.setClearColor(...arguments)},this.getClearAlpha=function(){return Q.getClearAlpha()},this.setClearAlpha=function(){Q.setClearAlpha(...arguments)},this.clear=function(b=!0,N=!0,k=!0){let V=0;if(b){let F=!1;if(L!==null){let nt=L.texture.format;F=nt===La||nt===Pa||nt===Ia}if(F){let nt=L.texture.type,ht=nt===mn||nt===si||nt===cs||nt===us||nt===Ca||nt===Ra,gt=Q.getClearColor(),ft=Q.getClearAlpha(),Pt=gt.r,Lt=gt.g,wt=gt.b;ht?(_[0]=Pt,_[1]=Lt,_[2]=wt,_[3]=ft,I.clearBufferuiv(I.COLOR,0,_)):(x[0]=Pt,x[1]=Lt,x[2]=wt,x[3]=ft,I.clearBufferiv(I.COLOR,0,x))}else V|=I.COLOR_BUFFER_BIT}N&&(V|=I.DEPTH_BUFFER_BIT),k&&(V|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",pt,!1),e.removeEventListener("webglcontextrestored",et,!1),e.removeEventListener("webglcontextcreationerror",J,!1),Q.dispose(),vt.dispose(),lt.dispose(),Tt.dispose(),Se.dispose(),A.dispose(),Z.dispose(),Dt.dispose(),D.dispose(),j.dispose(),tt.dispose(),tt.removeEventListener("sessionstart",ac),tt.removeEventListener("sessionend",oc),ci.stop()};function pt(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),T=!0}function et(){console.log("THREE.WebGLRenderer: Context Restored."),T=!1;let b=Xt.autoReset,N=Mt.enabled,k=Mt.autoUpdate,V=Mt.needsUpdate,F=Mt.type;ct(),Xt.autoReset=b,Mt.enabled=N,Mt.autoUpdate=k,Mt.needsUpdate=V,Mt.type=F}function J(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function mt(b){let N=b.target;N.removeEventListener("dispose",mt),Ut(N)}function Ut(b){oe(b),Tt.remove(b)}function oe(b){let N=Tt.get(b).programs;N!==void 0&&(N.forEach(function(k){j.releaseProgram(k)}),b.isShaderMaterial&&j.releaseShaderCache(b))}this.renderBufferDirect=function(b,N,k,V,F,nt){N===null&&(N=de);let ht=F.isMesh&&F.matrixWorld.determinant()<0,gt=ed(b,N,k,V,F);xt.setMaterial(V,ht);let ft=k.index,Pt=1;if(V.wireframe===!0){if(ft=B.getWireframeAttribute(k),ft===void 0)return;Pt=2}let Lt=k.drawRange,wt=k.attributes.position,Ht=Lt.start*Pt,te=(Lt.start+Lt.count)*Pt;nt!==null&&(Ht=Math.max(Ht,nt.start*Pt),te=Math.min(te,(nt.start+nt.count)*Pt)),ft!==null?(Ht=Math.max(Ht,0),te=Math.min(te,ft.count)):wt!=null&&(Ht=Math.max(Ht,0),te=Math.min(te,wt.count));let _e=te-Ht;if(_e<0||_e===1/0)return;Dt.setup(F,V,gt,k,ft);let le,ie=Rt;if(ft!==null&&(le=M.get(ft),ie=Ct,ie.setIndex(le)),F.isMesh)V.wireframe===!0?(xt.setLineWidth(V.wireframeLinewidth*$t()),ie.setMode(I.LINES)):ie.setMode(I.TRIANGLES);else if(F.isLine){let At=V.linewidth;At===void 0&&(At=1),xt.setLineWidth(At*$t()),F.isLineSegments?ie.setMode(I.LINES):F.isLineLoop?ie.setMode(I.LINE_LOOP):ie.setMode(I.LINE_STRIP)}else F.isPoints?ie.setMode(I.POINTS):F.isSprite&&ie.setMode(I.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)yi("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ie.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Zt.get("WEBGL_multi_draw"))ie.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let At=F._multiDrawStarts,pe=F._multiDrawCounts,qt=F._multiDrawCount,Ge=ft?M.get(ft).bytesPerElement:1,Fi=Tt.get(V).currentProgram.getUniforms();for(let We=0;We<qt;We++)Fi.setValue(I,"_gl_DrawID",We),ie.render(At[We]/Ge,pe[We])}else if(F.isInstancedMesh)ie.renderInstances(Ht,_e,F.count);else if(k.isInstancedBufferGeometry){let At=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,pe=Math.min(k.instanceCount,At);ie.renderInstances(Ht,_e,pe)}else ie.render(Ht,_e)};function Kt(b,N,k){b.transparent===!0&&b.side===ze&&b.forceSinglePass===!1?(b.side=Be,b.needsUpdate=!0,mr(b,N,k),b.side=Dn,b.needsUpdate=!0,mr(b,N,k),b.side=ze):mr(b,N,k)}this.compile=function(b,N,k=null){k===null&&(k=b),l=lt.get(k),l.init(N),y.push(l),k.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(l.pushLight(F),F.castShadow&&l.pushShadow(F))}),b!==k&&b.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(l.pushLight(F),F.castShadow&&l.pushShadow(F))}),l.setupLights();let V=new Set;return b.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let nt=F.material;if(nt)if(Array.isArray(nt))for(let ht=0;ht<nt.length;ht++){let gt=nt[ht];Kt(gt,k,F),V.add(gt)}else Kt(nt,k,F),V.add(nt)}),l=y.pop(),V},this.compileAsync=function(b,N,k=null){let V=this.compile(b,N,k);return new Promise(F=>{function nt(){if(V.forEach(function(ht){Tt.get(ht).currentProgram.isReady()&&V.delete(ht)}),V.size===0){F(b);return}setTimeout(nt,10)}Zt.get("KHR_parallel_shader_compile")!==null?nt():setTimeout(nt,10)})};let an=null;function En(b){an&&an(b)}function ac(){ci.stop()}function oc(){ci.start()}let ci=new xu;ci.setAnimationLoop(En),typeof self<"u"&&ci.setContext(self),this.setAnimationLoop=function(b){an=b,tt.setAnimationLoop(b),b===null?ci.stop():ci.start()},tt.addEventListener("sessionstart",ac),tt.addEventListener("sessionend",oc),this.render=function(b,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),tt.enabled===!0&&tt.isPresenting===!0&&(tt.cameraAutoUpdate===!0&&tt.updateCamera(N),N=tt.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,N,L),l=lt.get(b,y.length),l.init(N),y.push(l),bt.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),Y.setFromProjectionMatrix(bt),St=this.localClippingEnabled,it=_t.init(this.clippingPlanes,St),p=vt.get(b,g.length),p.init(),g.push(p),tt.enabled===!0&&tt.isPresenting===!0){let nt=v.xr.getDepthSensingMesh();nt!==null&&So(nt,N,-1/0,v.sortObjects)}So(b,N,0,v.sortObjects),p.finish(),v.sortObjects===!0&&p.sort(X,K),fe=tt.enabled===!1||tt.isPresenting===!1||tt.hasDepthSensing()===!1,fe&&Q.addToRenderList(p,b),this.info.render.frame++,it===!0&&_t.beginShadows();let k=l.state.shadowsArray;Mt.render(k,b,N),it===!0&&_t.endShadows(),this.info.autoReset===!0&&this.info.reset();let V=p.opaque,F=p.transmissive;if(l.setupLights(),N.isArrayCamera){let nt=N.cameras;if(F.length>0)for(let ht=0,gt=nt.length;ht<gt;ht++){let ft=nt[ht];cc(V,F,b,ft)}fe&&Q.render(b);for(let ht=0,gt=nt.length;ht<gt;ht++){let ft=nt[ht];lc(p,b,ft,ft.viewport)}}else F.length>0&&cc(V,F,b,N),fe&&Q.render(b),lc(p,b,N);L!==null&&R===0&&(Bt.updateMultisampleRenderTarget(L),Bt.updateRenderTargetMipmap(L)),b.isScene===!0&&b.onAfterRender(v,b,N),Dt.resetDefaultState(),w=-1,S=null,y.pop(),y.length>0?(l=y[y.length-1],it===!0&&_t.setGlobalState(v.clippingPlanes,l.state.camera)):l=null,g.pop(),g.length>0?p=g[g.length-1]:p=null};function So(b,N,k,V){if(b.visible===!1)return;if(b.layers.test(N.layers)){if(b.isGroup)k=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(N);else if(b.isLight)l.pushLight(b),b.castShadow&&l.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||Y.intersectsSprite(b)){V&&It.setFromMatrixPosition(b.matrixWorld).applyMatrix4(bt);let ht=Z.update(b),gt=b.material;gt.visible&&p.push(b,ht,gt,k,It.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||Y.intersectsObject(b))){let ht=Z.update(b),gt=b.material;if(V&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),It.copy(b.boundingSphere.center)):(ht.boundingSphere===null&&ht.computeBoundingSphere(),It.copy(ht.boundingSphere.center)),It.applyMatrix4(b.matrixWorld).applyMatrix4(bt)),Array.isArray(gt)){let ft=ht.groups;for(let Pt=0,Lt=ft.length;Pt<Lt;Pt++){let wt=ft[Pt],Ht=gt[wt.materialIndex];Ht&&Ht.visible&&p.push(b,ht,Ht,k,It.z,wt)}}else gt.visible&&p.push(b,ht,gt,k,It.z,null)}}let nt=b.children;for(let ht=0,gt=nt.length;ht<gt;ht++)So(nt[ht],N,k,V)}function lc(b,N,k,V){let F=b.opaque,nt=b.transmissive,ht=b.transparent;l.setupLightsView(k),it===!0&&_t.setGlobalState(v.clippingPlanes,k),V&&xt.viewport(P.copy(V)),F.length>0&&pr(F,N,k),nt.length>0&&pr(nt,N,k),ht.length>0&&pr(ht,N,k),xt.buffers.depth.setTest(!0),xt.buffers.depth.setMask(!0),xt.buffers.color.setMask(!0),xt.setPolygonOffset(!1)}function cc(b,N,k,V){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;l.state.transmissionRenderTarget[V.id]===void 0&&(l.state.transmissionRenderTarget[V.id]=new vn(1,1,{generateMipmaps:!0,type:Zt.has("EXT_color_buffer_half_float")||Zt.has("EXT_color_buffer_float")?hs:mn,minFilter:ii,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Gt.workingColorSpace}));let nt=l.state.transmissionRenderTarget[V.id],ht=V.viewport||P;nt.setSize(ht.z*v.transmissionResolutionScale,ht.w*v.transmissionResolutionScale);let gt=v.getRenderTarget(),ft=v.getActiveCubeFace(),Pt=v.getActiveMipmapLevel();v.setRenderTarget(nt),v.getClearColor(W),$=v.getClearAlpha(),$<1&&v.setClearColor(16777215,.5),v.clear(),fe&&Q.render(k);let Lt=v.toneMapping;v.toneMapping=zn;let wt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),l.setupLightsView(V),it===!0&&_t.setGlobalState(v.clippingPlanes,V),pr(b,k,V),Bt.updateMultisampleRenderTarget(nt),Bt.updateRenderTargetMipmap(nt),Zt.has("WEBGL_multisampled_render_to_texture")===!1){let Ht=!1;for(let te=0,_e=N.length;te<_e;te++){let le=N[te],ie=le.object,At=le.geometry,pe=le.material,qt=le.group;if(pe.side===ze&&ie.layers.test(V.layers)){let Ge=pe.side;pe.side=Be,pe.needsUpdate=!0,hc(ie,k,V,At,pe,qt),pe.side=Ge,pe.needsUpdate=!0,Ht=!0}}Ht===!0&&(Bt.updateMultisampleRenderTarget(nt),Bt.updateRenderTargetMipmap(nt))}v.setRenderTarget(gt,ft,Pt),v.setClearColor(W,$),wt!==void 0&&(V.viewport=wt),v.toneMapping=Lt}function pr(b,N,k){let V=N.isScene===!0?N.overrideMaterial:null;for(let F=0,nt=b.length;F<nt;F++){let ht=b[F],gt=ht.object,ft=ht.geometry,Pt=ht.group,Lt=ht.material;Lt.allowOverride===!0&&V!==null&&(Lt=V),gt.layers.test(k.layers)&&hc(gt,N,k,ft,Lt,Pt)}}function hc(b,N,k,V,F,nt){b.onBeforeRender(v,N,k,V,F,nt),b.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),F.onBeforeRender(v,N,k,V,b,nt),F.transparent===!0&&F.side===ze&&F.forceSinglePass===!1?(F.side=Be,F.needsUpdate=!0,v.renderBufferDirect(k,N,V,F,b,nt),F.side=Dn,F.needsUpdate=!0,v.renderBufferDirect(k,N,V,F,b,nt),F.side=ze):v.renderBufferDirect(k,N,V,F,b,nt),b.onAfterRender(v,N,k,V,F,nt)}function mr(b,N,k){N.isScene!==!0&&(N=de);let V=Tt.get(b),F=l.state.lights,nt=l.state.shadowsArray,ht=F.state.version,gt=j.getParameters(b,F.state,nt,N,k),ft=j.getProgramCacheKey(gt),Pt=V.programs;V.environment=b.isMeshStandardMaterial?N.environment:null,V.fog=N.fog,V.envMap=(b.isMeshStandardMaterial?A:Se).get(b.envMap||V.environment),V.envMapRotation=V.environment!==null&&b.envMap===null?N.environmentRotation:b.envMapRotation,Pt===void 0&&(b.addEventListener("dispose",mt),Pt=new Map,V.programs=Pt);let Lt=Pt.get(ft);if(Lt!==void 0){if(V.currentProgram===Lt&&V.lightsStateVersion===ht)return dc(b,gt),Lt}else gt.uniforms=j.getUniforms(b),b.onBeforeCompile(gt,v),Lt=j.acquireProgram(gt,ft),Pt.set(ft,Lt),V.uniforms=gt.uniforms;let wt=V.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(wt.clippingPlanes=_t.uniform),dc(b,gt),V.needsLights=id(b),V.lightsStateVersion=ht,V.needsLights&&(wt.ambientLightColor.value=F.state.ambient,wt.lightProbe.value=F.state.probe,wt.directionalLights.value=F.state.directional,wt.directionalLightShadows.value=F.state.directionalShadow,wt.spotLights.value=F.state.spot,wt.spotLightShadows.value=F.state.spotShadow,wt.rectAreaLights.value=F.state.rectArea,wt.ltc_1.value=F.state.rectAreaLTC1,wt.ltc_2.value=F.state.rectAreaLTC2,wt.pointLights.value=F.state.point,wt.pointLightShadows.value=F.state.pointShadow,wt.hemisphereLights.value=F.state.hemi,wt.directionalShadowMap.value=F.state.directionalShadowMap,wt.directionalShadowMatrix.value=F.state.directionalShadowMatrix,wt.spotShadowMap.value=F.state.spotShadowMap,wt.spotLightMatrix.value=F.state.spotLightMatrix,wt.spotLightMap.value=F.state.spotLightMap,wt.pointShadowMap.value=F.state.pointShadowMap,wt.pointShadowMatrix.value=F.state.pointShadowMatrix),V.currentProgram=Lt,V.uniformsList=null,Lt}function uc(b){if(b.uniformsList===null){let N=b.currentProgram.getUniforms();b.uniformsList=gs.seqWithValue(N.seq,b.uniforms)}return b.uniformsList}function dc(b,N){let k=Tt.get(b);k.outputColorSpace=N.outputColorSpace,k.batching=N.batching,k.batchingColor=N.batchingColor,k.instancing=N.instancing,k.instancingColor=N.instancingColor,k.instancingMorph=N.instancingMorph,k.skinning=N.skinning,k.morphTargets=N.morphTargets,k.morphNormals=N.morphNormals,k.morphColors=N.morphColors,k.morphTargetsCount=N.morphTargetsCount,k.numClippingPlanes=N.numClippingPlanes,k.numIntersection=N.numClipIntersection,k.vertexAlphas=N.vertexAlphas,k.vertexTangents=N.vertexTangents,k.toneMapping=N.toneMapping}function ed(b,N,k,V,F){N.isScene!==!0&&(N=de),Bt.resetTextureUnits();let nt=N.fog,ht=V.isMeshStandardMaterial?N.environment:null,gt=L===null?v.outputColorSpace:L.isXRRenderTarget===!0?L.texture.colorSpace:xi,ft=(V.isMeshStandardMaterial?A:Se).get(V.envMap||ht),Pt=V.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Lt=!!k.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),wt=!!k.morphAttributes.position,Ht=!!k.morphAttributes.normal,te=!!k.morphAttributes.color,_e=zn;V.toneMapped&&(L===null||L.isXRRenderTarget===!0)&&(_e=v.toneMapping);let le=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,ie=le!==void 0?le.length:0,At=Tt.get(V),pe=l.state.lights;if(it===!0&&(St===!0||b!==S)){let Ue=b===S&&V.id===w;_t.setState(V,b,Ue)}let qt=!1;V.version===At.__version?(At.needsLights&&At.lightsStateVersion!==pe.state.version||At.outputColorSpace!==gt||F.isBatchedMesh&&At.batching===!1||!F.isBatchedMesh&&At.batching===!0||F.isBatchedMesh&&At.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&At.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&At.instancing===!1||!F.isInstancedMesh&&At.instancing===!0||F.isSkinnedMesh&&At.skinning===!1||!F.isSkinnedMesh&&At.skinning===!0||F.isInstancedMesh&&At.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&At.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&At.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&At.instancingMorph===!1&&F.morphTexture!==null||At.envMap!==ft||V.fog===!0&&At.fog!==nt||At.numClippingPlanes!==void 0&&(At.numClippingPlanes!==_t.numPlanes||At.numIntersection!==_t.numIntersection)||At.vertexAlphas!==Pt||At.vertexTangents!==Lt||At.morphTargets!==wt||At.morphNormals!==Ht||At.morphColors!==te||At.toneMapping!==_e||At.morphTargetsCount!==ie)&&(qt=!0):(qt=!0,At.__version=V.version);let Ge=At.currentProgram;qt===!0&&(Ge=mr(V,N,F));let Fi=!1,We=!1,vs=!1,he=Ge.getUniforms(),je=At.uniforms;if(xt.useProgram(Ge.program)&&(Fi=!0,We=!0,vs=!0),V.id!==w&&(w=V.id,We=!0),Fi||S!==b){xt.buffers.depth.getReversed()?(ut.copy(b.projectionMatrix),Wh(ut),Xh(ut),he.setValue(I,"projectionMatrix",ut)):he.setValue(I,"projectionMatrix",b.projectionMatrix),he.setValue(I,"viewMatrix",b.matrixWorldInverse);let ke=he.map.cameraPosition;ke!==void 0&&ke.setValue(I,Yt.setFromMatrixPosition(b.matrixWorld)),re.logarithmicDepthBuffer&&he.setValue(I,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&he.setValue(I,"isOrthographic",b.isOrthographicCamera===!0),S!==b&&(S=b,We=!0,vs=!0)}if(F.isSkinnedMesh){he.setOptional(I,F,"bindMatrix"),he.setOptional(I,F,"bindMatrixInverse");let Ue=F.skeleton;Ue&&(Ue.boneTexture===null&&Ue.computeBoneTexture(),he.setValue(I,"boneTexture",Ue.boneTexture,Bt))}F.isBatchedMesh&&(he.setOptional(I,F,"batchingTexture"),he.setValue(I,"batchingTexture",F._matricesTexture,Bt),he.setOptional(I,F,"batchingIdTexture"),he.setValue(I,"batchingIdTexture",F._indirectTexture,Bt),he.setOptional(I,F,"batchingColorTexture"),F._colorsTexture!==null&&he.setValue(I,"batchingColorTexture",F._colorsTexture,Bt));let Qe=k.morphAttributes;if((Qe.position!==void 0||Qe.normal!==void 0||Qe.color!==void 0)&&dt.update(F,k,Ge),(We||At.receiveShadow!==F.receiveShadow)&&(At.receiveShadow=F.receiveShadow,he.setValue(I,"receiveShadow",F.receiveShadow)),V.isMeshGouraudMaterial&&V.envMap!==null&&(je.envMap.value=ft,je.flipEnvMap.value=ft.isCubeTexture&&ft.isRenderTargetTexture===!1?-1:1),V.isMeshStandardMaterial&&V.envMap===null&&N.environment!==null&&(je.envMapIntensity.value=N.environmentIntensity),We&&(he.setValue(I,"toneMappingExposure",v.toneMappingExposure),At.needsLights&&nd(je,vs),nt&&V.fog===!0&&q.refreshFogUniforms(je,nt),q.refreshMaterialUniforms(je,V,O,G,l.state.transmissionRenderTarget[b.id]),gs.upload(I,uc(At),je,Bt)),V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(gs.upload(I,uc(At),je,Bt),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&he.setValue(I,"center",F.center),he.setValue(I,"modelViewMatrix",F.modelViewMatrix),he.setValue(I,"normalMatrix",F.normalMatrix),he.setValue(I,"modelMatrix",F.matrixWorld),V.isShaderMaterial||V.isRawShaderMaterial){let Ue=V.uniformsGroups;for(let ke=0,bo=Ue.length;ke<bo;ke++){let hi=Ue[ke];D.update(hi,Ge),D.bind(hi,Ge)}}return Ge}function nd(b,N){b.ambientLightColor.needsUpdate=N,b.lightProbe.needsUpdate=N,b.directionalLights.needsUpdate=N,b.directionalLightShadows.needsUpdate=N,b.pointLights.needsUpdate=N,b.pointLightShadows.needsUpdate=N,b.spotLights.needsUpdate=N,b.spotLightShadows.needsUpdate=N,b.rectAreaLights.needsUpdate=N,b.hemisphereLights.needsUpdate=N}function id(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return E},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return L},this.setRenderTargetTextures=function(b,N,k){let V=Tt.get(b);V.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),Tt.get(b.texture).__webglTexture=N,Tt.get(b.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:k,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,N){let k=Tt.get(b);k.__webglFramebuffer=N,k.__useDefaultFramebuffer=N===void 0};let sd=I.createFramebuffer();this.setRenderTarget=function(b,N=0,k=0){L=b,E=N,R=k;let V=!0,F=null,nt=!1,ht=!1;if(b){let ft=Tt.get(b);if(ft.__useDefaultFramebuffer!==void 0)xt.bindFramebuffer(I.FRAMEBUFFER,null),V=!1;else if(ft.__webglFramebuffer===void 0)Bt.setupRenderTarget(b);else if(ft.__hasExternalTextures)Bt.rebindTextures(b,Tt.get(b.texture).__webglTexture,Tt.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let wt=b.depthTexture;if(ft.__boundDepthTexture!==wt){if(wt!==null&&Tt.has(wt)&&(b.width!==wt.image.width||b.height!==wt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Bt.setupDepthRenderbuffer(b)}}let Pt=b.texture;(Pt.isData3DTexture||Pt.isDataArrayTexture||Pt.isCompressedArrayTexture)&&(ht=!0);let Lt=Tt.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Lt[N])?F=Lt[N][k]:F=Lt[N],nt=!0):b.samples>0&&Bt.useMultisampledRTT(b)===!1?F=Tt.get(b).__webglMultisampledFramebuffer:Array.isArray(Lt)?F=Lt[k]:F=Lt,P.copy(b.viewport),H.copy(b.scissor),z=b.scissorTest}else P.copy(rt).multiplyScalar(O).floor(),H.copy(yt).multiplyScalar(O).floor(),z=Vt;if(k!==0&&(F=sd),xt.bindFramebuffer(I.FRAMEBUFFER,F)&&V&&xt.drawBuffers(b,F),xt.viewport(P),xt.scissor(H),xt.setScissorTest(z),nt){let ft=Tt.get(b.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+N,ft.__webglTexture,k)}else if(ht){let ft=Tt.get(b.texture),Pt=N;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,ft.__webglTexture,k,Pt)}else if(b!==null&&k!==0){let ft=Tt.get(b.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,ft.__webglTexture,k)}w=-1},this.readRenderTargetPixels=function(b,N,k,V,F,nt,ht,gt=0){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ft=Tt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ht!==void 0&&(ft=ft[ht]),ft){xt.bindFramebuffer(I.FRAMEBUFFER,ft);try{let Pt=b.textures[gt],Lt=Pt.format,wt=Pt.type;if(!re.textureFormatReadable(Lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!re.textureTypeReadable(wt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=b.width-V&&k>=0&&k<=b.height-F&&(b.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+gt),I.readPixels(N,k,V,F,at.convert(Lt),at.convert(wt),nt))}finally{let Pt=L!==null?Tt.get(L).__webglFramebuffer:null;xt.bindFramebuffer(I.FRAMEBUFFER,Pt)}}},this.readRenderTargetPixelsAsync=async function(b,N,k,V,F,nt,ht,gt=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ft=Tt.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ht!==void 0&&(ft=ft[ht]),ft)if(N>=0&&N<=b.width-V&&k>=0&&k<=b.height-F){xt.bindFramebuffer(I.FRAMEBUFFER,ft);let Pt=b.textures[gt],Lt=Pt.format,wt=Pt.type;if(!re.textureFormatReadable(Lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!re.textureTypeReadable(wt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ht=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Ht),I.bufferData(I.PIXEL_PACK_BUFFER,nt.byteLength,I.STREAM_READ),b.textures.length>1&&I.readBuffer(I.COLOR_ATTACHMENT0+gt),I.readPixels(N,k,V,F,at.convert(Lt),at.convert(wt),0);let te=L!==null?Tt.get(L).__webglFramebuffer:null;xt.bindFramebuffer(I.FRAMEBUFFER,te);let _e=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Gh(I,_e,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Ht),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,nt),I.deleteBuffer(Ht),I.deleteSync(_e),nt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,N=null,k=0){let V=Math.pow(2,-k),F=Math.floor(b.image.width*V),nt=Math.floor(b.image.height*V),ht=N!==null?N.x:0,gt=N!==null?N.y:0;Bt.setTexture2D(b,0),I.copyTexSubImage2D(I.TEXTURE_2D,k,0,0,ht,gt,F,nt),xt.unbindTexture()};let rd=I.createFramebuffer(),ad=I.createFramebuffer();this.copyTextureToTexture=function(b,N,k=null,V=null,F=0,nt=null){nt===null&&(F!==0?(yi("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),nt=F,F=0):nt=0);let ht,gt,ft,Pt,Lt,wt,Ht,te,_e,le=b.isCompressedTexture?b.mipmaps[nt]:b.image;if(k!==null)ht=k.max.x-k.min.x,gt=k.max.y-k.min.y,ft=k.isBox3?k.max.z-k.min.z:1,Pt=k.min.x,Lt=k.min.y,wt=k.isBox3?k.min.z:0;else{let Qe=Math.pow(2,-F);ht=Math.floor(le.width*Qe),gt=Math.floor(le.height*Qe),b.isDataArrayTexture?ft=le.depth:b.isData3DTexture?ft=Math.floor(le.depth*Qe):ft=1,Pt=0,Lt=0,wt=0}V!==null?(Ht=V.x,te=V.y,_e=V.z):(Ht=0,te=0,_e=0);let ie=at.convert(N.format),At=at.convert(N.type),pe;N.isData3DTexture?(Bt.setTexture3D(N,0),pe=I.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Bt.setTexture2DArray(N,0),pe=I.TEXTURE_2D_ARRAY):(Bt.setTexture2D(N,0),pe=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,N.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,N.unpackAlignment);let qt=I.getParameter(I.UNPACK_ROW_LENGTH),Ge=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Fi=I.getParameter(I.UNPACK_SKIP_PIXELS),We=I.getParameter(I.UNPACK_SKIP_ROWS),vs=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,le.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,le.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Pt),I.pixelStorei(I.UNPACK_SKIP_ROWS,Lt),I.pixelStorei(I.UNPACK_SKIP_IMAGES,wt);let he=b.isDataArrayTexture||b.isData3DTexture,je=N.isDataArrayTexture||N.isData3DTexture;if(b.isDepthTexture){let Qe=Tt.get(b),Ue=Tt.get(N),ke=Tt.get(Qe.__renderTarget),bo=Tt.get(Ue.__renderTarget);xt.bindFramebuffer(I.READ_FRAMEBUFFER,ke.__webglFramebuffer),xt.bindFramebuffer(I.DRAW_FRAMEBUFFER,bo.__webglFramebuffer);for(let hi=0;hi<ft;hi++)he&&(I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Tt.get(b).__webglTexture,F,wt+hi),I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Tt.get(N).__webglTexture,nt,_e+hi)),I.blitFramebuffer(Pt,Lt,ht,gt,Ht,te,ht,gt,I.DEPTH_BUFFER_BIT,I.NEAREST);xt.bindFramebuffer(I.READ_FRAMEBUFFER,null),xt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else if(F!==0||b.isRenderTargetTexture||Tt.has(b)){let Qe=Tt.get(b),Ue=Tt.get(N);xt.bindFramebuffer(I.READ_FRAMEBUFFER,rd),xt.bindFramebuffer(I.DRAW_FRAMEBUFFER,ad);for(let ke=0;ke<ft;ke++)he?I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Qe.__webglTexture,F,wt+ke):I.framebufferTexture2D(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Qe.__webglTexture,F),je?I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ue.__webglTexture,nt,_e+ke):I.framebufferTexture2D(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_2D,Ue.__webglTexture,nt),F!==0?I.blitFramebuffer(Pt,Lt,ht,gt,Ht,te,ht,gt,I.COLOR_BUFFER_BIT,I.NEAREST):je?I.copyTexSubImage3D(pe,nt,Ht,te,_e+ke,Pt,Lt,ht,gt):I.copyTexSubImage2D(pe,nt,Ht,te,Pt,Lt,ht,gt);xt.bindFramebuffer(I.READ_FRAMEBUFFER,null),xt.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else je?b.isDataTexture||b.isData3DTexture?I.texSubImage3D(pe,nt,Ht,te,_e,ht,gt,ft,ie,At,le.data):N.isCompressedArrayTexture?I.compressedTexSubImage3D(pe,nt,Ht,te,_e,ht,gt,ft,ie,le.data):I.texSubImage3D(pe,nt,Ht,te,_e,ht,gt,ft,ie,At,le):b.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,nt,Ht,te,ht,gt,ie,At,le.data):b.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,nt,Ht,te,le.width,le.height,ie,le.data):I.texSubImage2D(I.TEXTURE_2D,nt,Ht,te,ht,gt,ie,At,le);I.pixelStorei(I.UNPACK_ROW_LENGTH,qt),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,Ge),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Fi),I.pixelStorei(I.UNPACK_SKIP_ROWS,We),I.pixelStorei(I.UNPACK_SKIP_IMAGES,vs),nt===0&&N.generateMipmaps&&I.generateMipmap(pe),xt.unbindTexture()},this.copyTextureToTexture3D=function(b,N,k=null,V=null,F=0){return yi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,N,k,V,F)},this.initRenderTarget=function(b){Tt.get(b).__webglFramebuffer===void 0&&Bt.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?Bt.setTextureCube(b,0):b.isData3DTexture?Bt.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?Bt.setTexture2DArray(b,0):Bt.setTexture2D(b,0),xt.unbindTexture()},this.resetState=function(){E=0,R=0,L=null,xt.reset(),Dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Gt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Gt._getUnpackColorSpace()}};var Li=new bi,Le=new C,ri=new C,ue=new ge,wu={X:new C(1,0,0),Y:new C(0,1,0),Z:new C(0,0,1)},ql={type:"change"},Eu={type:"mouseDown",mode:null},Tu={type:"mouseUp",mode:null},Au={type:"objectChange"},mo=class extends wi{constructor(t,e=null){super(void 0,e);let n=new $l(this);this._root=n;let s=new Zl;this._gizmo=s,n.add(s);let r=new Jl;this._plane=r,n.add(r);let a=this;function o(y,v){let T=v;Object.defineProperty(a,y,{get:function(){return T!==void 0?T:v},set:function(E){T!==E&&(T=E,r[y]=E,s[y]=E,a.dispatchEvent({type:y+"-changed",value:E}),a.dispatchEvent(ql))}}),a[y]=v,r[y]=v,s[y]=v}o("camera",t),o("object",void 0),o("enabled",!0),o("axis",null),o("mode","translate"),o("translationSnap",null),o("rotationSnap",null),o("scaleSnap",null),o("space","world"),o("size",1),o("dragging",!1),o("showX",!0),o("showY",!0),o("showZ",!0),o("minX",-1/0),o("maxX",1/0),o("minY",-1/0),o("maxY",1/0),o("minZ",-1/0),o("maxZ",1/0);let c=new C,h=new C,u=new ge,f=new ge,d=new C,m=new ge,_=new C,x=new C,p=new C,l=0,g=new C;o("worldPosition",c),o("worldPositionStart",h),o("worldQuaternion",u),o("worldQuaternionStart",f),o("cameraPosition",d),o("cameraQuaternion",m),o("pointStart",_),o("pointEnd",x),o("rotationAxis",p),o("rotationAngle",l),o("eye",g),this._offset=new C,this._startNorm=new C,this._endNorm=new C,this._cameraScale=new C,this._parentPosition=new C,this._parentQuaternion=new ge,this._parentQuaternionInv=new ge,this._parentScale=new C,this._worldScaleStart=new C,this._worldQuaternionInv=new ge,this._worldScale=new C,this._positionStart=new C,this._quaternionStart=new ge,this._scaleStart=new C,this._getPointer=J0.bind(this),this._onPointerDown=j0.bind(this),this._onPointerHover=K0.bind(this),this._onPointerMove=Q0.bind(this),this._onPointerUp=t_.bind(this),e!==null&&this.connect(e)}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointermove",this._onPointerHover),this.domElement.addEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerHover),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="auto"}getHelper(){return this._root}pointerHover(t){if(this.object===void 0||this.dragging===!0)return;t!==null&&Li.setFromCamera(t,this.camera);let e=Yl(this._gizmo.picker[this.mode],Li);e?this.axis=e.object.name:this.axis=null}pointerDown(t){if(!(this.object===void 0||this.dragging===!0||t!=null&&t.button!==0)&&this.axis!==null){t!==null&&Li.setFromCamera(t,this.camera);let e=Yl(this._plane,Li,!0);e&&(this.object.updateMatrixWorld(),this.object.parent.updateMatrixWorld(),this._positionStart.copy(this.object.position),this._quaternionStart.copy(this.object.quaternion),this._scaleStart.copy(this.object.scale),this.object.matrixWorld.decompose(this.worldPositionStart,this.worldQuaternionStart,this._worldScaleStart),this.pointStart.copy(e.point).sub(this.worldPositionStart)),this.dragging=!0,Eu.mode=this.mode,this.dispatchEvent(Eu)}}pointerMove(t){let e=this.axis,n=this.mode,s=this.object,r=this.space;if(n==="scale"?r="local":(e==="E"||e==="XYZE"||e==="XYZ")&&(r="world"),s===void 0||e===null||this.dragging===!1||t!==null&&t.button!==-1)return;t!==null&&Li.setFromCamera(t,this.camera);let a=Yl(this._plane,Li,!0);if(a){if(this.pointEnd.copy(a.point).sub(this.worldPositionStart),n==="translate")this._offset.copy(this.pointEnd).sub(this.pointStart),r==="local"&&e!=="XYZ"&&this._offset.applyQuaternion(this._worldQuaternionInv),e.indexOf("X")===-1&&(this._offset.x=0),e.indexOf("Y")===-1&&(this._offset.y=0),e.indexOf("Z")===-1&&(this._offset.z=0),r==="local"&&e!=="XYZ"?this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale):this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale),s.position.copy(this._offset).add(this._positionStart),this.translationSnap&&(r==="local"&&(s.position.applyQuaternion(ue.copy(this._quaternionStart).invert()),e.search("X")!==-1&&(s.position.x=Math.round(s.position.x/this.translationSnap)*this.translationSnap),e.search("Y")!==-1&&(s.position.y=Math.round(s.position.y/this.translationSnap)*this.translationSnap),e.search("Z")!==-1&&(s.position.z=Math.round(s.position.z/this.translationSnap)*this.translationSnap),s.position.applyQuaternion(this._quaternionStart)),r==="world"&&(s.parent&&s.position.add(Le.setFromMatrixPosition(s.parent.matrixWorld)),e.search("X")!==-1&&(s.position.x=Math.round(s.position.x/this.translationSnap)*this.translationSnap),e.search("Y")!==-1&&(s.position.y=Math.round(s.position.y/this.translationSnap)*this.translationSnap),e.search("Z")!==-1&&(s.position.z=Math.round(s.position.z/this.translationSnap)*this.translationSnap),s.parent&&s.position.sub(Le.setFromMatrixPosition(s.parent.matrixWorld)))),s.position.x=Math.max(this.minX,Math.min(this.maxX,s.position.x)),s.position.y=Math.max(this.minY,Math.min(this.maxY,s.position.y)),s.position.z=Math.max(this.minZ,Math.min(this.maxZ,s.position.z));else if(n==="scale"){if(e.search("XYZ")!==-1){let o=this.pointEnd.length()/this.pointStart.length();this.pointEnd.dot(this.pointStart)<0&&(o*=-1),ri.set(o,o,o)}else Le.copy(this.pointStart),ri.copy(this.pointEnd),Le.applyQuaternion(this._worldQuaternionInv),ri.applyQuaternion(this._worldQuaternionInv),ri.divide(Le),e.search("X")===-1&&(ri.x=1),e.search("Y")===-1&&(ri.y=1),e.search("Z")===-1&&(ri.z=1);s.scale.copy(this._scaleStart).multiply(ri),this.scaleSnap&&(e.search("X")!==-1&&(s.scale.x=Math.round(s.scale.x/this.scaleSnap)*this.scaleSnap||this.scaleSnap),e.search("Y")!==-1&&(s.scale.y=Math.round(s.scale.y/this.scaleSnap)*this.scaleSnap||this.scaleSnap),e.search("Z")!==-1&&(s.scale.z=Math.round(s.scale.z/this.scaleSnap)*this.scaleSnap||this.scaleSnap))}else if(n==="rotate"){this._offset.copy(this.pointEnd).sub(this.pointStart);let o=20/this.worldPosition.distanceTo(Le.setFromMatrixPosition(this.camera.matrixWorld)),c=!1;e==="XYZE"?(this.rotationAxis.copy(this._offset).cross(this.eye).normalize(),this.rotationAngle=this._offset.dot(Le.copy(this.rotationAxis).cross(this.eye))*o):(e==="X"||e==="Y"||e==="Z")&&(this.rotationAxis.copy(wu[e]),Le.copy(wu[e]),r==="local"&&Le.applyQuaternion(this.worldQuaternion),Le.cross(this.eye),Le.length()===0?c=!0:this.rotationAngle=this._offset.dot(Le.normalize())*o),(e==="E"||c)&&(this.rotationAxis.copy(this.eye),this.rotationAngle=this.pointEnd.angleTo(this.pointStart),this._startNorm.copy(this.pointStart).normalize(),this._endNorm.copy(this.pointEnd).normalize(),this.rotationAngle*=this._endNorm.cross(this._startNorm).dot(this.eye)<0?1:-1),this.rotationSnap&&(this.rotationAngle=Math.round(this.rotationAngle/this.rotationSnap)*this.rotationSnap),r==="local"&&e!=="E"&&e!=="XYZE"?(s.quaternion.copy(this._quaternionStart),s.quaternion.multiply(ue.setFromAxisAngle(this.rotationAxis,this.rotationAngle)).normalize()):(this.rotationAxis.applyQuaternion(this._parentQuaternionInv),s.quaternion.copy(ue.setFromAxisAngle(this.rotationAxis,this.rotationAngle)),s.quaternion.multiply(this._quaternionStart).normalize())}this.dispatchEvent(ql),this.dispatchEvent(Au)}}pointerUp(t){t!==null&&t.button!==0||(this.dragging&&this.axis!==null&&(Tu.mode=this.mode,this.dispatchEvent(Tu)),this.dragging=!1,this.axis=null)}dispose(){this.disconnect(),this._root.dispose()}attach(t){return this.object=t,this._root.visible=!0,this}detach(){return this.object=void 0,this.axis=null,this._root.visible=!1,this}reset(){this.enabled&&this.dragging&&(this.object.position.copy(this._positionStart),this.object.quaternion.copy(this._quaternionStart),this.object.scale.copy(this._scaleStart),this.dispatchEvent(ql),this.dispatchEvent(Au),this.pointStart.copy(this.pointEnd))}getRaycaster(){return Li}getMode(){return this.mode}setMode(t){this.mode=t}setTranslationSnap(t){this.translationSnap=t}setRotationSnap(t){this.rotationSnap=t}setScaleSnap(t){this.scaleSnap=t}setSize(t){this.size=t}setSpace(t){this.space=t}setColors(t,e,n,s){let r=this._gizmo.materialLib;r.xAxis.color.set(t),r.yAxis.color.set(e),r.zAxis.color.set(n),r.active.color.set(s),r.xAxisTransparent.color.set(t),r.yAxisTransparent.color.set(e),r.zAxisTransparent.color.set(n),r.activeTransparent.color.set(s),r.xAxis._color&&r.xAxis._color.set(t),r.yAxis._color&&r.yAxis._color.set(e),r.zAxis._color&&r.zAxis._color.set(n),r.active._color&&r.active._color.set(s),r.xAxisTransparent._color&&r.xAxisTransparent._color.set(t),r.yAxisTransparent._color&&r.yAxisTransparent._color.set(e),r.zAxisTransparent._color&&r.zAxisTransparent._color.set(n),r.activeTransparent._color&&r.activeTransparent._color.set(s)}};function J0(i){if(this.domElement.ownerDocument.pointerLockElement)return{x:0,y:0,button:i.button};{let t=this.domElement.getBoundingClientRect();return{x:(i.clientX-t.left)/t.width*2-1,y:-(i.clientY-t.top)/t.height*2+1,button:i.button}}}function K0(i){if(this.enabled)switch(i.pointerType){case"mouse":case"pen":this.pointerHover(this._getPointer(i));break}}function j0(i){this.enabled&&(document.pointerLockElement||this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.pointerHover(this._getPointer(i)),this.pointerDown(this._getPointer(i)))}function Q0(i){this.enabled&&this.pointerMove(this._getPointer(i))}function t_(i){this.enabled&&(this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.pointerUp(this._getPointer(i)))}function Yl(i,t,e){let n=t.intersectObject(i,!0);for(let s=0;s<n.length;s++)if(n[s].object.visible||e)return n[s];return!1}var ho=new Ze,se=new C(0,1,0),Cu=new C(0,0,0),Ru=new ee,uo=new ge,po=new ge,wn=new C,Iu=new ee,lr=new C(1,0,0),Di=new C(0,1,0),cr=new C(0,0,1),fo=new C,ar=new C,or=new C,$l=class extends ve{constructor(t){super(),this.isTransformControlsRoot=!0,this.controls=t,this.visible=!1}updateMatrixWorld(t){let e=this.controls;e.object!==void 0&&(e.object.updateMatrixWorld(),e.object.parent===null?console.error("TransformControls: The attached 3D object must be a part of the scene graph."):e.object.parent.matrixWorld.decompose(e._parentPosition,e._parentQuaternion,e._parentScale),e.object.matrixWorld.decompose(e.worldPosition,e.worldQuaternion,e._worldScale),e._parentQuaternionInv.copy(e._parentQuaternion).invert(),e._worldQuaternionInv.copy(e.worldQuaternion).invert()),e.camera.updateMatrixWorld(),e.camera.matrixWorld.decompose(e.cameraPosition,e.cameraQuaternion,e._cameraScale),e.camera.isOrthographicCamera?e.camera.getWorldDirection(e.eye).negate():e.eye.copy(e.cameraPosition).sub(e.worldPosition).normalize(),super.updateMatrixWorld(t)}dispose(){this.traverse(function(t){t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()})}},Zl=class extends ve{constructor(){super(),this.isTransformControlsGizmo=!0,this.type="TransformControlsGizmo";let t=new Je({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),e=new pn({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),n=t.clone();n.opacity=.15;let s=e.clone();s.opacity=.5;let r=t.clone();r.color.setHex(16711680);let a=t.clone();a.color.setHex(65280);let o=t.clone();o.color.setHex(255);let c=t.clone();c.color.setHex(16711680),c.opacity=.5;let h=t.clone();h.color.setHex(65280),h.opacity=.5;let u=t.clone();u.color.setHex(255),u.opacity=.5;let f=t.clone();f.opacity=.25;let d=t.clone();d.color.setHex(16776960),d.opacity=.25;let m=t.clone();m.color.setHex(16776960);let _=t.clone();_.color.setHex(7895160),this.materialLib={xAxis:r,yAxis:a,zAxis:o,active:m,xAxisTransparent:c,yAxisTransparent:h,zAxisTransparent:u,activeTransparent:d};let x=new ye(0,.04,.1,12);x.translate(0,.05,0);let p=new ae(.08,.08,.08);p.translate(0,.04,0);let l=new xe;l.setAttribute("position",new Wt([0,0,0,1,0,0],3));let g=new ye(.0075,.0075,.5,3);g.translate(0,.25,0);function y($,U){let G=new On($,.0075,3,64,U*Math.PI*2);return G.rotateY(Math.PI/2),G.rotateX(Math.PI/2),G}function v(){let $=new xe;return $.setAttribute("position",new Wt([0,0,0,1,1,1],3)),$}let T={X:[[new st(x,r),[.5,0,0],[0,0,-Math.PI/2]],[new st(x,r),[-.5,0,0],[0,0,Math.PI/2]],[new st(g,r),[0,0,0],[0,0,-Math.PI/2]]],Y:[[new st(x,a),[0,.5,0]],[new st(x,a),[0,-.5,0],[Math.PI,0,0]],[new st(g,a)]],Z:[[new st(x,o),[0,0,.5],[Math.PI/2,0,0]],[new st(x,o),[0,0,-.5],[-Math.PI/2,0,0]],[new st(g,o),null,[Math.PI/2,0,0]]],XYZ:[[new st(new Kn(.1,0),f),[0,0,0]]],XY:[[new st(new ae(.15,.15,.01),u),[.15,.15,0]]],YZ:[[new st(new ae(.15,.15,.01),c),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new st(new ae(.15,.15,.01),h),[.15,0,.15],[-Math.PI/2,0,0]]]},E={X:[[new st(new ye(.2,0,.6,4),n),[.3,0,0],[0,0,-Math.PI/2]],[new st(new ye(.2,0,.6,4),n),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new st(new ye(.2,0,.6,4),n),[0,.3,0]],[new st(new ye(.2,0,.6,4),n),[0,-.3,0],[0,0,Math.PI]]],Z:[[new st(new ye(.2,0,.6,4),n),[0,0,.3],[Math.PI/2,0,0]],[new st(new ye(.2,0,.6,4),n),[0,0,-.3],[-Math.PI/2,0,0]]],XYZ:[[new st(new Kn(.2,0),n)]],XY:[[new st(new ae(.2,.2,.01),n),[.15,.15,0]]],YZ:[[new st(new ae(.2,.2,.01),n),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new st(new ae(.2,.2,.01),n),[.15,0,.15],[-Math.PI/2,0,0]]]},R={START:[[new st(new Kn(.01,2),s),null,null,null,"helper"]],END:[[new st(new Kn(.01,2),s),null,null,null,"helper"]],DELTA:[[new Oe(v(),s),null,null,null,"helper"]],X:[[new Oe(l,s),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new Oe(l,s),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new Oe(l,s),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]},L={XYZE:[[new st(y(.5,1),_),null,[0,Math.PI/2,0]]],X:[[new st(y(.5,.5),r)]],Y:[[new st(y(.5,.5),a),null,[0,0,-Math.PI/2]]],Z:[[new st(y(.5,.5),o),null,[0,Math.PI/2,0]]],E:[[new st(y(.75,1),d),null,[0,Math.PI/2,0]]]},w={AXIS:[[new Oe(l,s),[-1e3,0,0],null,[1e6,1,1],"helper"]]},S={XYZE:[[new st(new jn(.25,10,8),n)]],X:[[new st(new On(.5,.1,4,24),n),[0,0,0],[0,-Math.PI/2,-Math.PI/2]]],Y:[[new st(new On(.5,.1,4,24),n),[0,0,0],[Math.PI/2,0,0]]],Z:[[new st(new On(.5,.1,4,24),n),[0,0,0],[0,0,-Math.PI/2]]],E:[[new st(new On(.75,.1,2,24),n)]]},P={X:[[new st(p,r),[.5,0,0],[0,0,-Math.PI/2]],[new st(g,r),[0,0,0],[0,0,-Math.PI/2]],[new st(p,r),[-.5,0,0],[0,0,Math.PI/2]]],Y:[[new st(p,a),[0,.5,0]],[new st(g,a)],[new st(p,a),[0,-.5,0],[0,0,Math.PI]]],Z:[[new st(p,o),[0,0,.5],[Math.PI/2,0,0]],[new st(g,o),[0,0,0],[Math.PI/2,0,0]],[new st(p,o),[0,0,-.5],[-Math.PI/2,0,0]]],XY:[[new st(new ae(.15,.15,.01),u),[.15,.15,0]]],YZ:[[new st(new ae(.15,.15,.01),c),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new st(new ae(.15,.15,.01),h),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new st(new ae(.1,.1,.1),f)]]},H={X:[[new st(new ye(.2,0,.6,4),n),[.3,0,0],[0,0,-Math.PI/2]],[new st(new ye(.2,0,.6,4),n),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new st(new ye(.2,0,.6,4),n),[0,.3,0]],[new st(new ye(.2,0,.6,4),n),[0,-.3,0],[0,0,Math.PI]]],Z:[[new st(new ye(.2,0,.6,4),n),[0,0,.3],[Math.PI/2,0,0]],[new st(new ye(.2,0,.6,4),n),[0,0,-.3],[-Math.PI/2,0,0]]],XY:[[new st(new ae(.2,.2,.01),n),[.15,.15,0]]],YZ:[[new st(new ae(.2,.2,.01),n),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new st(new ae(.2,.2,.01),n),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new st(new ae(.2,.2,.2),n),[0,0,0]]]},z={X:[[new Oe(l,s),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new Oe(l,s),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new Oe(l,s),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]};function W($){let U=new ve;for(let G in $)for(let O=$[G].length;O--;){let X=$[G][O][0].clone(),K=$[G][O][1],rt=$[G][O][2],yt=$[G][O][3],Vt=$[G][O][4];X.name=G,X.tag=Vt,K&&X.position.set(K[0],K[1],K[2]),rt&&X.rotation.set(rt[0],rt[1],rt[2]),yt&&X.scale.set(yt[0],yt[1],yt[2]),X.updateMatrix();let Y=X.geometry.clone();Y.applyMatrix4(X.matrix),X.geometry=Y,X.renderOrder=1/0,X.position.set(0,0,0),X.rotation.set(0,0,0),X.scale.set(1,1,1),U.add(X)}return U}this.gizmo={},this.picker={},this.helper={},this.add(this.gizmo.translate=W(T)),this.add(this.gizmo.rotate=W(L)),this.add(this.gizmo.scale=W(P)),this.add(this.picker.translate=W(E)),this.add(this.picker.rotate=W(S)),this.add(this.picker.scale=W(H)),this.add(this.helper.translate=W(R)),this.add(this.helper.rotate=W(w)),this.add(this.helper.scale=W(z)),this.picker.translate.visible=!1,this.picker.rotate.visible=!1,this.picker.scale.visible=!1}updateMatrixWorld(t){let n=(this.mode==="scale"?"local":this.space)==="local"?this.worldQuaternion:po;this.gizmo.translate.visible=this.mode==="translate",this.gizmo.rotate.visible=this.mode==="rotate",this.gizmo.scale.visible=this.mode==="scale",this.helper.translate.visible=this.mode==="translate",this.helper.rotate.visible=this.mode==="rotate",this.helper.scale.visible=this.mode==="scale";let s=[];s=s.concat(this.picker[this.mode].children),s=s.concat(this.gizmo[this.mode].children),s=s.concat(this.helper[this.mode].children);for(let r=0;r<s.length;r++){let a=s[r];a.visible=!0,a.rotation.set(0,0,0),a.position.copy(this.worldPosition);let o;if(this.camera.isOrthographicCamera?o=(this.camera.top-this.camera.bottom)/this.camera.zoom:o=this.worldPosition.distanceTo(this.cameraPosition)*Math.min(1.9*Math.tan(Math.PI*this.camera.fov/360)/this.camera.zoom,7),a.scale.set(1,1,1).multiplyScalar(o*this.size/4),a.tag==="helper"){a.visible=!1,a.name==="AXIS"?(a.visible=!!this.axis,this.axis==="X"&&(ue.setFromEuler(ho.set(0,0,0)),a.quaternion.copy(n).multiply(ue),Math.abs(se.copy(lr).applyQuaternion(n).dot(this.eye))>.9&&(a.visible=!1)),this.axis==="Y"&&(ue.setFromEuler(ho.set(0,0,Math.PI/2)),a.quaternion.copy(n).multiply(ue),Math.abs(se.copy(Di).applyQuaternion(n).dot(this.eye))>.9&&(a.visible=!1)),this.axis==="Z"&&(ue.setFromEuler(ho.set(0,Math.PI/2,0)),a.quaternion.copy(n).multiply(ue),Math.abs(se.copy(cr).applyQuaternion(n).dot(this.eye))>.9&&(a.visible=!1)),this.axis==="XYZE"&&(ue.setFromEuler(ho.set(0,Math.PI/2,0)),se.copy(this.rotationAxis),a.quaternion.setFromRotationMatrix(Ru.lookAt(Cu,se,Di)),a.quaternion.multiply(ue),a.visible=this.dragging),this.axis==="E"&&(a.visible=!1)):a.name==="START"?(a.position.copy(this.worldPositionStart),a.visible=this.dragging):a.name==="END"?(a.position.copy(this.worldPosition),a.visible=this.dragging):a.name==="DELTA"?(a.position.copy(this.worldPositionStart),a.quaternion.copy(this.worldQuaternionStart),Le.set(1e-10,1e-10,1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1),Le.applyQuaternion(this.worldQuaternionStart.clone().invert()),a.scale.copy(Le),a.visible=this.dragging):(a.quaternion.copy(n),this.dragging?a.position.copy(this.worldPositionStart):a.position.copy(this.worldPosition),this.axis&&(a.visible=this.axis.search(a.name)!==-1));continue}a.quaternion.copy(n),this.mode==="translate"||this.mode==="scale"?(a.name==="X"&&Math.abs(se.copy(lr).applyQuaternion(n).dot(this.eye))>.99&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="Y"&&Math.abs(se.copy(Di).applyQuaternion(n).dot(this.eye))>.99&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="Z"&&Math.abs(se.copy(cr).applyQuaternion(n).dot(this.eye))>.99&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="XY"&&Math.abs(se.copy(cr).applyQuaternion(n).dot(this.eye))<.2&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="YZ"&&Math.abs(se.copy(lr).applyQuaternion(n).dot(this.eye))<.2&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1),a.name==="XZ"&&Math.abs(se.copy(Di).applyQuaternion(n).dot(this.eye))<.2&&(a.scale.set(1e-10,1e-10,1e-10),a.visible=!1)):this.mode==="rotate"&&(uo.copy(n),se.copy(this.eye).applyQuaternion(ue.copy(n).invert()),a.name.search("E")!==-1&&a.quaternion.setFromRotationMatrix(Ru.lookAt(this.eye,Cu,Di)),a.name==="X"&&(ue.setFromAxisAngle(lr,Math.atan2(-se.y,se.z)),ue.multiplyQuaternions(uo,ue),a.quaternion.copy(ue)),a.name==="Y"&&(ue.setFromAxisAngle(Di,Math.atan2(se.x,se.z)),ue.multiplyQuaternions(uo,ue),a.quaternion.copy(ue)),a.name==="Z"&&(ue.setFromAxisAngle(cr,Math.atan2(se.y,se.x)),ue.multiplyQuaternions(uo,ue),a.quaternion.copy(ue))),a.visible=a.visible&&(a.name.indexOf("X")===-1||this.showX),a.visible=a.visible&&(a.name.indexOf("Y")===-1||this.showY),a.visible=a.visible&&(a.name.indexOf("Z")===-1||this.showZ),a.visible=a.visible&&(a.name.indexOf("E")===-1||this.showX&&this.showY&&this.showZ),a.material._color=a.material._color||a.material.color.clone(),a.material._opacity=a.material._opacity||a.material.opacity,a.material.color.copy(a.material._color),a.material.opacity=a.material._opacity,this.enabled&&this.axis&&(a.name===this.axis?(a.material.color.copy(this.materialLib.active.color),a.material.opacity=1):this.axis.split("").some(function(c){return a.name===c})&&(a.material.color.copy(this.materialLib.active.color),a.material.opacity=1))}super.updateMatrixWorld(t)}},Jl=class extends st{constructor(){super(new Fn(1e5,1e5,2,2),new Je({visible:!1,wireframe:!0,side:ze,transparent:!0,opacity:.1,toneMapped:!1})),this.isTransformControlsPlane=!0,this.type="TransformControlsPlane"}updateMatrixWorld(t){let e=this.space;switch(this.position.copy(this.worldPosition),this.mode==="scale"&&(e="local"),fo.copy(lr).applyQuaternion(e==="local"?this.worldQuaternion:po),ar.copy(Di).applyQuaternion(e==="local"?this.worldQuaternion:po),or.copy(cr).applyQuaternion(e==="local"?this.worldQuaternion:po),se.copy(ar),this.mode){case"translate":case"scale":switch(this.axis){case"X":se.copy(this.eye).cross(fo),wn.copy(fo).cross(se);break;case"Y":se.copy(this.eye).cross(ar),wn.copy(ar).cross(se);break;case"Z":se.copy(this.eye).cross(or),wn.copy(or).cross(se);break;case"XY":wn.copy(or);break;case"YZ":wn.copy(fo);break;case"XZ":se.copy(or),wn.copy(ar);break;case"XYZ":case"E":wn.set(0,0,0);break}break;case"rotate":default:wn.set(0,0,0)}wn.length()===0?this.quaternion.copy(this.cameraQuaternion):(Iu.lookAt(Le.set(0,0,0),wn,se),this.quaternion.setFromRotationMatrix(Iu)),super.updateMatrixWorld(t)}};var Kl=Math.PI*2;function jl(i,t=.1){if(!Number.isFinite(i)||!Number.isFinite(t)||t<=0)return i;let e=Math.round(i/t)*t;return Number(e.toFixed(6))}function Ql(i){return Number.isFinite(i)?((i+Math.PI)%Kl+Kl)%Kl-Math.PI:0}function go(i,{grid:t=.1,minY:e=-1/0}={}){let n=jl(i.position.y,t);return{position:{x:jl(i.position.x,t),y:Number.isFinite(e)?Math.max(e,n):n,z:jl(i.position.z,t)},rotation:{x:Ql(i.rotation.x),y:Ql(i.rotation.y),z:Ql(i.rotation.z)}}}function Pu(i){return{position:{x:i.position.x,y:i.position.y,z:i.position.z},rotation:{x:i.rotation.x,y:i.rotation.y,z:i.rotation.z}}}function tc(i,t){i.position.set(t.position.x,t.position.y,t.position.z),i.rotation.set(t.rotation.x,t.rotation.y,t.rotation.z)}function e_(i){return i instanceof HTMLElement&&!!i.closest("input, textarea, select, [contenteditable='true']")}function Lu({studio:i,store:t,onSelectionChange:e,onStatus:n,grid:s=.1}={}){if(!i?.scene||!i?.camera||!i?.renderer||!t)throw new TypeError("Transform controller requires a studio scene and project store");let r=new mo(i.camera,i.renderer.domElement),a=r.getHelper();i.scene.add(a),r.setMode("translate"),r.setTranslationSnap(s),r.setRotationSnap(Math.PI/12),r.setSize(1.5);let o=null,c=null,h=!1;function u(){return t.getState().assets.find(p=>p.id===o)||null}function f(p){let l=t.getState().assets.find(y=>y.id===p)||null,g=l?i.getAssetObject(l.id):null;return o=g?l.id:null,r.detach(),i.setSelectedAsset(o),g&&!l.locked&&r.attach(g),e?.(o,l),l?.locked&&n?.(`${l.name} \u5DF2\u9501\u5B9A\uFF1B\u53EF\u67E5\u770B\u4F46\u4E0D\u80FD\u79FB\u52A8`,"neutral"),o}let d=p=>{i.controls.enabled=!p.value},m=()=>{!r.object||!o||(c=Pu(r.object),h=!1)},_=()=>{if(!r.object||!o||!c)return;let p=r.object;if(h){tc(p,c),c=null,h=!1;return}let l=go(Pu(p),{grid:s,minY:u()?.dimensions.height/2});tc(p,l);let g=t.updateAssetTransform(o,l);g.ok?n?.(`\u5DF2\u79FB\u52A8 ${u()?.name||o} \xB7 \u5438\u9644 ${s.toFixed(2)} m`,"success"):(tc(p,c),n?.(`\u79FB\u52A8\u5931\u8D25\uFF1A${g.errors[0]?.message||"\u5DE5\u7A0B\u7EA6\u675F\u4E0D\u5141\u8BB8\u8BE5\u4F4D\u7F6E"}`,"error")),c=null},x=p=>{if(e_(p.target))return;if((p.ctrlKey||p.metaKey)&&p.key.toLowerCase()==="z"){p.preventDefault(),(p.shiftKey?t.redo():t.undo())&&n?.(p.shiftKey?"\u5DF2\u91CD\u505A\u4E0A\u4E00\u6B65":"\u5DF2\u64A4\u9500\u4E0A\u4E00\u6B65","success");return}if(p.key==="Escape"&&r.dragging){h=!0,r.reset(),n?.("\u5DF2\u53D6\u6D88\u672C\u6B21\u79FB\u52A8");return}if(p.key==="Delete"&&o){let g=u();if(!g||g.locked){n?.("\u9501\u5B9A\u5BF9\u8C61\u4E0D\u80FD\u5220\u9664","error");return}let y=o;t.removeAsset(y).ok&&(f(null),n?.(`\u5DF2\u5220\u9664 ${g.name}\uFF1B\u53EF\u4F7F\u7528\u64A4\u9500\u6062\u590D`,"success"));return}p.key.toLowerCase()==="w"&&r.setMode("translate"),p.key.toLowerCase()==="e"&&r.setMode("rotate")};return r.addEventListener("dragging-changed",d),r.addEventListener("mouseDown",m),r.addEventListener("mouseUp",_),window.addEventListener("keydown",x),{control:r,select:f,setMode(p){return["translate","rotate"].includes(p)?(r.setMode(p),!0):!1},refresh(){f(o)},getSelectedId(){return o},dispose(){r.removeEventListener("dragging-changed",d),r.removeEventListener("mouseDown",m),r.removeEventListener("mouseUp",_),window.removeEventListener("keydown",x),r.detach(),i.scene.remove(a),r.dispose(),a.traverse(p=>{p.geometry?.dispose?.(),Array.isArray(p.material)?p.material.forEach(l=>l.dispose?.()):p.material?.dispose?.()})}}}var n_="set-flow",i_=1,_o="projects";function xo(i){return{ok:!1,code:"storage-failed",message:i instanceof Error?i.message:"\u6D4F\u89C8\u5668\u65E0\u6CD5\u8BBF\u95EE\u672C\u5730\u5DE5\u7A0B\u5B58\u50A8"}}function s_(i=globalThis.indexedDB){let t;function e(){return i?t||(t=new Promise((s,r)=>{let a=i.open(n_,i_);a.onupgradeneeded=()=>{let o=a.result;o.objectStoreNames.contains(_o)||o.createObjectStore(_o,{keyPath:"id"})},a.onsuccess=()=>s(a.result),a.onerror=()=>r(a.error||new Error("\u65E0\u6CD5\u6253\u5F00\u672C\u5730\u5DE5\u7A0B\u6570\u636E\u5E93")),a.onblocked=()=>r(new Error("\u672C\u5730\u5DE5\u7A0B\u6570\u636E\u5E93\u88AB\u53E6\u4E00\u4E2A\u9875\u9762\u5360\u7528"))}),t):Promise.reject(new Error("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 IndexedDB"))}async function n(s,r){let a=await e();return new Promise((o,c)=>{let h=a.transaction(_o,s),u=h.objectStore(_o),f=r(u);f.onsuccess=()=>o(f.result??null),f.onerror=()=>c(f.error||new Error("\u672C\u5730\u5DE5\u7A0B\u64CD\u4F5C\u5931\u8D25")),h.onabort=()=>c(h.error||new Error("\u672C\u5730\u5DE5\u7A0B\u64CD\u4F5C\u5DF2\u4E2D\u6B62"))})}return{put(s){return n("readwrite",r=>r.put(s))},get(s){return n("readonly",r=>r.get(s))},getAll(){return n("readonly",s=>s.getAll())},delete(s){return n("readwrite",r=>r.delete(s))}}}function Du(i=s_()){return{async save(t){let e=gn(t);if(!e.valid)return{ok:!1,code:"invalid-project",errors:e.errors};try{return await i.put(Jt(t)),{ok:!0,id:t.id}}catch(n){return xo(n)}},async load(t){try{let e=await i.get(t);if(!e)return{ok:!1,code:"not-found",message:"\u6CA1\u6709\u627E\u5230\u8BE5\u672C\u5730\u5DE5\u7A0B"};let n=gn(e);return n.valid?{ok:!0,project:Jt(e)}:{ok:!1,code:"invalid-record",message:"\u672C\u5730\u5DE5\u7A0B\u6570\u636E\u4E0D\u5B8C\u6574",errors:n.errors}}catch(e){return xo(e)}},async list(){try{return{ok:!0,projects:(await i.getAll()).filter(n=>gn(n).valid).map(Jt).sort((n,s)=>String(s.updatedAt).localeCompare(String(n.updatedAt)))}}catch(t){return xo(t)}},async delete(t){try{return await i.delete(t),{ok:!0,id:t}}catch(e){return xo(e)}}}}function r_(){}function Uu({repository:i,createFallback:t,delay:e=900,onState:n=r_}={}){if(!i||typeof i.save!="function"&&typeof i.list!="function")throw new TypeError("SET//FLOW save coordinator requires a project repository");if(typeof t!="function")throw new TypeError("SET//FLOW save coordinator requires a fallback project factory");if(!Number.isFinite(e)||e<0)throw new RangeError("Autosave delay must be a non-negative number");let s=null,r=null,a=!1,o=!1,c=null;function h(d,m={}){n({status:d,dirty:a,...m})}function u(){r!==null&&clearTimeout(r),r=null}async function f(d){if(o)return{ok:!1,code:"disposed",message:"\u4FDD\u5B58\u534F\u8C03\u5668\u5DF2\u5173\u95ED"};u();let m=Jt(d);s=m,a=!0,h("saving",{projectId:m.id});let _=i.save(m);c=_;let x=await _;return c===_&&(c=null),o||(x.ok?(s=null,a=!1,h("saved",{projectId:m.id})):(a=!0,h("error",{projectId:m.id,message:x.message||"\u672C\u5730\u5DE5\u7A0B\u4FDD\u5B58\u5931\u8D25",code:x.code}))),x}return{async restore(){try{let d=await i.list();return d.ok&&d.projects.length>0?{source:"local",project:Jt(d.projects[0]),message:"\u5DF2\u6062\u590D\u6700\u8FD1\u7684\u672C\u5730\u5DE5\u7A0B"}:d.ok?{source:"example",project:Jt(t()),message:"\u5DF2\u6253\u5F00\u5185\u7F6E\u793A\u4F8B"}:{source:"storage-error",project:Jt(t()),message:`\u672C\u5730\u5DE5\u7A0B\u4E0D\u53EF\u7528\uFF1A${d.message||"\u65E0\u6CD5\u8BFB\u53D6\u6D4F\u89C8\u5668\u5B58\u50A8"}`,code:d.code}}catch(d){return{source:"storage-error",project:Jt(t()),message:`\u672C\u5730\u5DE5\u7A0B\u4E0D\u53EF\u7528\uFF1A${d instanceof Error?d.message:"\u65E0\u6CD5\u8BFB\u53D6\u6D4F\u89C8\u5668\u5B58\u50A8"}`,code:"storage-failed"}}},markChanged(d){return o?!1:(s=Jt(d),a=!0,u(),h("dirty",{projectId:s.id}),r=setTimeout(()=>{f(s)},e),!0)},saveNow(d=s){return d?f(d):Promise.resolve({ok:!1,code:"nothing-to-save",message:"\u5F53\u524D\u6CA1\u6709\u5F85\u4FDD\u5B58\u7684\u5DE5\u7A0B\u4FEE\u6539"})},async flush(){return u(),c||(s?f(s):{ok:!0,code:"already-saved"})},isDirty(){return a},dispose(){o=!0,u(),s=null}}}var a_=24,o_=new Set(["frame","head","product","subtitle","platform"]);function Nu(i,t){return{cameraId:i?String(i):null,safeZone:o_.has(t)?t:null}}function l_(i){let t=Math.max(12,Math.min(200,Number(i)||35));return sr.radToDeg(2*Math.atan(a_/(2*t)))}function c_({canvas:i,scene:t,cameraData:e,policy:n={}}){let s=new _s({canvas:i,antialias:!0,alpha:!1,powerPreference:"low-power"});s.setPixelRatio(Math.min(n.pixelRatio||window.devicePixelRatio||1,1.25)),s.setClearColor(461323,1),s.outputColorSpace=Ce,s.toneMapping=ls,s.toneMappingExposure=.92;let r=new be(42,9/16,.05,40);r.layers.enable(2);let a=e,o=0,c=0;function h(d){if(a=d,!a)return;r.fov=l_(a.focalLength),r.position.set(a.position.x,a.position.y,a.position.z),r.lookAt(a.target.x,a.target.y,a.target.z);let m=i.closest("[data-monitor-program]");m&&(m.dataset.aspect=a.aspect)}function u(){let d=Math.max(1,i.clientWidth),m=Math.max(1,i.clientHeight),_=s.getPixelRatio();(i.width!==Math.round(d*_)||i.height!==Math.round(m*_))&&s.setSize(d,m,!1),r.aspect=d/m,r.updateProjectionMatrix()}function f(d){o=requestAnimationFrame(f),!(document.hidden||d-c<1e3/(n.monitorFps||30))&&(c=d,u(),s.render(t,r))}return h(a),o=requestAnimationFrame(f),{update:h,resize:u,capture(){return u(),s.render(t,r),i.toDataURL("image/png")},dispose(){cancelAnimationFrame(o),s.dispose()}}}function Fu({root:i,scene:t,cameras:e=[],policy:n}={}){if(!i||!t)throw new TypeError("Camera monitors require a DOM root and Three.js scene");let s=new Map;for(let r of i.querySelectorAll("canvas[data-camera-monitor]")){let a=r.dataset.cameraMonitor,o=e.find(c=>c.id===a);o&&s.set(a,c_({canvas:r,scene:t,cameraData:o,policy:n}))}return{update(r){for(let[a,o]of s)o.update(r.find(c=>c.id===a))},capture(){return Object.fromEntries([...s].map(([r,a])=>[r,a.capture()]))},setActive(r){let a=Nu(r,null);for(let o of i.querySelectorAll("[data-monitor-program]")){let c=!!a.cameraId&&o.dataset.monitorProgram===a.cameraId;o.closest(".monitor")?.classList.toggle("is-active",c),o.setAttribute("aria-current",c?"true":"false")}},highlightSafeZone(r){let a=Nu(null,r);for(let o of i.querySelectorAll("[data-safe-zone]"))o.classList.toggle("is-highlighted",!!a.safeZone&&o.dataset.safeZone===a.safeZone)},dispose(){s.forEach(r=>r.dispose()),s.clear()}}}var ec={low:{pixelRatioCap:1,shadows:!1,shadowMapSize:0,monitorFps:20,radialSegments:8,visibleLightCones:"selected"},balanced:{pixelRatioCap:1.5,shadows:!0,shadowMapSize:1024,monitorFps:30,radialSegments:14,visibleLightCones:"selected"},high:{pixelRatioCap:2,shadows:!0,shadowMapSize:2048,monitorFps:30,radialSegments:20,visibleLightCones:"all"}};function Ou({quality:i="balanced",devicePixelRatio:t=1,hardwareConcurrency:e=8,reducedMotion:n=!1,assetCount:s=0}={}){let r=ec[i]||ec.balanced,a=Number(e||4)<4,o=a?1:r.pixelRatioCap;return Object.freeze({quality:ec[i]?i:"balanced",pixelRatio:Math.min(Math.max(1,Number(t)||1),o),shadows:a?!1:r.shadows,shadowMapSize:a?0:r.shadowMapSize,monitorFps:n?15:a?20:r.monitorFps,cameraTransitions:!n,reducedMotion:!!n,geometryDetection:!0,assetCountWarning:s>72,recommendedAssetLimit:72,geometry:Object.freeze({radialSegments:a?8:r.radialSegments,castShadows:a?!1:r.shadows,visibleLightCones:r.visibleLightCones})})}var Bu={type:"change"},ic={type:"start"},ku={type:"end"},yo=new Jn,zu=new He,h_=Math.cos(70*sr.DEG2RAD),Te=new C,Ve=2*Math.PI,ne={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},nc=1e-6,vo=class extends wi{constructor(t,e=null){super(t,e),this.state=ne.NONE,this.target=new C,this.cursor=new C,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:ei.ROTATE,MIDDLE:ei.DOLLY,RIGHT:ei.PAN},this.touches={ONE:ni.ROTATE,TWO:ni.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new C,this._lastQuaternion=new ge,this._lastTargetPosition=new C,this._quat=new ge().setFromUnitVectors(t.up,new C(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new as,this._sphericalDelta=new as,this._scale=1,this._panOffset=new C,this._rotateStart=new Et,this._rotateEnd=new Et,this._rotateDelta=new Et,this._panStart=new Et,this._panEnd=new Et,this._panDelta=new Et,this._dollyStart=new Et,this._dollyEnd=new Et,this._dollyDelta=new Et,this._dollyDirection=new C,this._mouse=new Et,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=d_.bind(this),this._onPointerDown=u_.bind(this),this._onPointerUp=f_.bind(this),this._onContextMenu=v_.bind(this),this._onMouseWheel=g_.bind(this),this._onKeyDown=__.bind(this),this._onTouchStart=x_.bind(this),this._onTouchMove=y_.bind(this),this._onMouseDown=p_.bind(this),this._onMouseMove=m_.bind(this),this._interceptControlDown=M_.bind(this),this._interceptControlUp=S_.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Bu),this.update(),this.state=ne.NONE}update(t=null){let e=this.object.position;Te.copy(e).sub(this.target),Te.applyQuaternion(this._quat),this._spherical.setFromVector3(Te),this.autoRotate&&this.state===ne.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=Ve:n>Math.PI&&(n-=Ve),s<-Math.PI?s+=Ve:s>Math.PI&&(s-=Ve),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Te.setFromSpherical(this._spherical),Te.applyQuaternion(this._quatInverse),e.copy(this.target).add(Te),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Te.length();a=this._clampDistance(o*this._scale);let c=o-a;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let o=new C(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let h=new C(this._mouse.x,this._mouse.y,0);h.unproject(this.object),this.object.position.sub(h).add(o),this.object.updateMatrixWorld(),a=Te.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(yo.origin.copy(this.object.position),yo.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(yo.direction))<h_?this.object.lookAt(this.target):(zu.setFromNormalAndCoplanarPoint(this.object.up,this.target),yo.intersectPlane(zu,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>nc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>nc||this._lastTargetPosition.distanceToSquared(this.target)>nc?(this.dispatchEvent(Bu),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?Ve/60*this.autoRotateSpeed*t:Ve/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Te.setFromMatrixColumn(e,0),Te.multiplyScalar(-t),this._panOffset.add(Te)}_panUp(t,e){this.screenSpacePanning===!0?Te.setFromMatrixColumn(e,1):(Te.setFromMatrixColumn(e,0),Te.crossVectors(this.object.up,Te)),Te.multiplyScalar(t),this._panOffset.add(Te)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Te.copy(s).sub(this.target);let r=Te.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(Ve*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ve*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(Ve*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-Ve*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(Ve*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-Ve*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(Ve*this._rotateDelta.x/e.clientHeight),this._rotateUp(Ve*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Et,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function u_(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function d_(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function f_(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(ku),this.state=ne.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function p_(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case ei.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ne.DOLLY;break;case ei.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ne.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ne.ROTATE}break;case ei.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ne.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ne.PAN}break;default:this.state=ne.NONE}this.state!==ne.NONE&&this.dispatchEvent(ic)}function m_(i){switch(this.state){case ne.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ne.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ne.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function g_(i){this.enabled===!1||this.enableZoom===!1||this.state!==ne.NONE||(i.preventDefault(),this.dispatchEvent(ic),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(ku))}function __(i){this.enabled!==!1&&this._handleKeyDown(i)}function x_(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ni.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ne.TOUCH_ROTATE;break;case ni.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ne.TOUCH_PAN;break;default:this.state=ne.NONE}break;case 2:switch(this.touches.TWO){case ni.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ne.TOUCH_DOLLY_PAN;break;case ni.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ne.TOUCH_DOLLY_ROTATE;break;default:this.state=ne.NONE}break;default:this.state=ne.NONE}this.state!==ne.NONE&&this.dispatchEvent(ic)}function y_(i){switch(this._trackPointer(i),this.state){case ne.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ne.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ne.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ne.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ne.NONE}}function v_(i){this.enabled!==!1&&i.preventDefault()}function M_(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function S_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Hu={isometric:{position:[5.4,5.2,6.8],target:[0,.75,-.35]},top:{position:[.01,8.6,.01],target:[0,0,-.35]},front:{position:[0,2.5,7.4],target:[0,1,-.5]}},ai={floor:1120798,wall:1515813,wallEdge:6207682,grid:3559767,signal:6207682,warning:14268509,neutral:8557204};function ur(i,t={}){return new Xs({color:i,roughness:t.roughness??.72,metalness:t.metalness??.18,transparent:!!t.transparent,opacity:t.opacity??1})}function rn(i,t,e,n,s){let r=new st(new ae(t.x,t.y,t.z),ur(n,s));return r.position.set(e.x,e.y,e.z),r.castShadow=i.userData.renderProfile?.castShadows!==!1,r.receiveShadow=!0,i.add(r),r}function oi(i,t,e,n,s,r,a){let o=a||i.userData.renderProfile?.radialSegments||14,c=new st(new ye(t,e,n,o),ur(r,{metalness:.28}));return c.position.set(s.x,s.y,s.z),c.castShadow=i.userData.renderProfile?.castShadows!==!1,i.add(c),c}function b_(i,t,e){rn(i,{x:t.width,y:.08,z:t.depth},{x:0,y:t.height/2-.04,z:0},e);let n=Math.max(.18,t.height-.08);for(let s of[-1,1])for(let r of[-1,1])rn(i,{x:.055,y:n,z:.055},{x:s*(t.width/2-.09),y:-.04,z:r*(t.depth/2-.09)},5004126,{metalness:.5})}function w_(i,t,e){let n=t.height/2-.09;for(let r of[-1,1])oi(i,.022,.022,t.height-.1,{x:r*(t.width/2-.05),y:0,z:0},e,10);let s=oi(i,.025,.025,t.width-.1,{x:0,y:n,z:0},e,10);s.rotation.z=Math.PI/2,rn(i,{x:t.width,y:.045,z:t.depth},{x:0,y:-t.height/2+.04,z:0},3753802,{metalness:.35});for(let r=-2;r<=2;r+=1){let a=rn(i,{x:.18,y:t.height*.42,z:.028},{x:r*t.width*.12,y:t.height*.08,z:0},r%2?6978172:5138025,{roughness:.88});a.rotation.z=r*.025}}function E_(i,t,e){oi(i,t.width*.22,t.width*.28,t.height*.62,{x:0,y:-t.height*.13,z:0},e,24);let n=new st(new jn(t.width*.25,i.userData.renderProfile?.radialSegments||14,10),ur(14793111,{roughness:.92}));n.position.y=t.height*.33,n.castShadow=!0,i.add(n);let s=new st(new ye(t.width*.64,t.width*.64,.02,32),new Je({color:ai.warning,transparent:!0,opacity:.12,depthWrite:!1}));s.position.y=-t.height/2+.015,i.add(s)}function Vu(i,t){oi(i,.018,.025,t.height*.78,{x:0,y:-t.height*.08,z:0},5398885,10);for(let e=0;e<Math.PI*2;e+=Math.PI*2/3){let n=oi(i,.012,.012,t.width*.85,{x:0,y:-t.height*.43,z:0},4609111,8);n.rotation.z=Math.PI/3,n.rotation.y=e}}function T_(i,t,e){Vu(i,t),rn(i,{x:t.width,y:t.width*.58,z:t.depth},{x:0,y:t.height*.38,z:0},e,{roughness:.35,metalness:.22}),rn(i,{x:t.width*.82,y:t.width*.42,z:.012},{x:0,y:t.height*.38,z:-t.depth/2-.007},16767410,{roughness:.2,metalness:0,transparent:!0,opacity:.82});let n=new st(new Vs(t.width*.95,t.height*1.25,i.userData.renderProfile?.radialSegments||14,1,!0),new Je({color:e,transparent:!0,opacity:i.userData.renderProfile?.visibleLightCones==="all"?.05:.009,side:ze,depthWrite:!1}));n.name="planning-light-cone",n.userData.lightCone=!0,n.rotation.x=Math.PI/2,n.position.set(0,t.height*.38,-t.height*.625),i.add(n)}function A_(i,t,e){rn(i,{x:t.width,y:t.height,z:t.depth},{x:0,y:0,z:0},2371378,{metalness:.42}),rn(i,{x:t.width*.88,y:t.height*.78,z:.014},{x:0,y:.02,z:t.depth/2+.008},e,{transparent:!0,opacity:.62,roughness:.28}),oi(i,.018,.024,t.height*.7,{x:0,y:-t.height*.78,z:0},5464420,10)}function C_(i,t,e){rn(i,{x:t.width,y:t.height*.72,z:t.depth*.68},{x:0,y:t.height*.08,z:0},2502965,{metalness:.58});let n=oi(i,t.height*.18,t.height*.24,t.depth*.4,{x:0,y:t.height*.08,z:-t.depth*.5},e,18);n.rotation.x=Math.PI/2,oi(i,.025,.035,t.height*1.8,{x:0,y:-t.height*1.05,z:0},4938590,10)}function R_(i,t,e){let n=new st(new Ws(t.width*.34,t.width*.5,40),new Je({color:e,transparent:!0,opacity:.55,side:ze,depthWrite:!1}));n.rotation.x=-Math.PI/2,i.add(n)}function I_(i,t={}){let e=new un;e.userData.renderProfile=t;let n=i.dimensions,s;try{s=Oi(i.type)}catch{s=null}let r=s?.visual?.primitive||"box",a=new Ot(s?.visual?.color||"#829294").getHex();if(r==="table")b_(e,n,a);else if(r==="rack")w_(e,n,a);else if(r==="presenter")E_(e,n,a);else if(r==="light")T_(e,n,a);else if(r==="stand")Vu(e,n);else if(r==="monitor")A_(e,n,a);else if(r==="camera")C_(e,n,a);else if(r==="marker")R_(e,n,a);else if(r==="orb"){let c=new st(new jn(n.width/2,18,12),ur(a,{transparent:!0,opacity:.72}));e.add(c)}else rn(e,{x:n.width,y:n.height,z:n.depth},{x:0,y:0,z:0},a,r==="wall"?{transparent:!0,opacity:.78}:{});let o=new st(new ae(n.width,n.height,n.depth),new Je({visible:!1}));return o.visible=!1,o.userData.nonPickable=!0,e.add(o),e.name=i.name,e.userData.assetId=i.id,e.userData.assetType=i.type,e.userData.geometrySignature=JSON.stringify(i.dimensions),e.userData.boundsProxy=o,e.traverse(c=>{c.userData.nonPickable||(c.userData.assetId=i.id)}),e}function hr(i){return i?.userData?.boundsProxy||i}function Ui(i){i.traverse(t=>{t.geometry?.dispose?.(),Array.isArray(t.material)?t.material.forEach(e=>e.dispose?.()):t.material?.dispose?.()})}function P_(i){let t=new un;t.name="room-envelope";let e=new st(new Fn(i.width,i.depth),ur(ai.floor,{roughness:.94}));e.rotation.x=-Math.PI/2,e.receiveShadow=!0,t.add(e);let n=new Js(Math.max(i.width,i.depth),Math.round(Math.max(i.width,i.depth)*10),ai.grid,ai.grid);n.position.y=.006,n.material.transparent=!0,n.material.opacity=.32,t.add(n);let s=rn(t,{x:i.width,y:i.height,z:.045},{x:0,y:i.height/2,z:-i.depth/2},ai.wall,{transparent:!0,opacity:.78}),r=rn(t,{x:.045,y:i.height,z:i.depth},{x:-i.width/2,y:i.height/2,z:0},ai.wall,{transparent:!0,opacity:.6});s.receiveShadow=!0,r.receiveShadow=!0;let a=new vi(new Gs(new ae(i.width,i.height,i.depth)),new pn({color:ai.wallEdge,transparent:!0,opacity:.32}));return a.position.y=i.height/2,t.add(a),t.userData.roomSignature=JSON.stringify(i),t}function Gu({canvas:i,policy:t={}}){if(!(i instanceof HTMLCanvasElement))throw new TypeError("A canvas element is required");let e=new _s({canvas:i,antialias:!0,alpha:!1,powerPreference:"high-performance"});e.setPixelRatio(t.pixelRatio||Math.min(window.devicePixelRatio||1,1.5)),e.setClearColor(922904,1),e.outputColorSpace=Ce,e.toneMapping=ls,e.toneMappingExposure=.92,e.shadowMap.enabled=t.shadows!==!1,e.shadowMap.type=ga;let n=new ks;n.background=new Ot(922904),n.fog=new zs(922904,.045);let s=new be(38,1,.05,50);s.layers.enable(31);let r=new vo(s,i);r.enableDamping=!0,r.dampingFactor=.08,r.minDistance=2.4,r.maxDistance=15,r.maxPolarAngle=Math.PI*.49,r.screenSpacePanning=!1,n.add(new Ys(12179933,1118997,1.5));let a=new Zs(13359837,2.1);a.position.set(3.8,6.5,4.5),a.castShadow=t.shadows!==!1;let o=t.shadowMapSize||1024;a.shadow.mapSize.set(o,o),a.shadow.camera.left=-5,a.shadow.camera.right=5,a.shadow.camera.top=5,a.shadow.camera.bottom=-5,n.add(a);let c=new Si(6207682,9,8,2);c.position.set(-2.2,2.4,-2.2),n.add(c);let h=new Si(16761743,15,9,1.7);h.position.set(-2.4,3.1,2.2),h.layers.set(2),n.add(h);let u=new Si(7719122,10,8,1.9);u.position.set(2.3,2.5,-2.1),u.layers.set(2),n.add(u);let f=new bi,d=new Et,m=new Map,_=new un;_.name="issue-evidence",_.layers.set(31),n.add(_);let x=null,p=null,l=null,g=null,y=null;r.addEventListener("start",()=>{y=null});function v(U="isometric"){let G=Hu[U]||Hu.isometric;s.position.fromArray(G.position),r.target.fromArray(G.target),r.update()}function T(){let U=Math.max(1,i.clientWidth),G=Math.max(1,i.clientHeight),O=e.getPixelRatio();(i.width!==Math.round(U*O)||i.height!==Math.round(G*O))&&e.setSize(U,G,!1),s.aspect=U/G,s.updateProjectionMatrix()}function E(U){l=m.has(U)?U:null,p&&(n.remove(p),p.geometry?.dispose?.(),p.material?.dispose?.(),p=null);for(let[G,O]of m)O.traverse(X=>{X.userData.lightCone&&(X.material.opacity=G===l?.14:t.geometry?.visibleLightCones==="all"?.045:.008)});l&&(p=new os(hr(m.get(l)),ai.warning),p.material.transparent=!0,p.material.opacity=.92,p.layers.set(31),n.add(p))}function R(U){g=U;let G=JSON.stringify(U.room);(!x||x.userData.roomSignature!==G)&&(x&&(n.remove(x),Ui(x)),x=P_(U.room),n.add(x));let O=new Set(U.assets.map(X=>X.id));for(let[X,K]of m)O.has(X)||(n.remove(K),Ui(K),m.delete(X));for(let X of U.assets){let K=JSON.stringify(X.dimensions),rt=m.get(X.id);(!rt||rt.userData.assetType!==X.type||rt.userData.geometrySignature!==K)&&(rt&&(n.remove(rt),Ui(rt)),rt=I_(X,t.geometry||{}),m.set(X.id,rt),n.add(rt)),rt.position.set(X.transform.position.x,X.transform.position.y,X.transform.position.z),rt.rotation.set(X.transform.rotation.x,X.transform.rotation.y,X.transform.rotation.z),rt.visible=X.visible!==!1}E(l)}function L(U){let G=i.getBoundingClientRect(),O=U.clientX??U.x??G.left+G.width/2,X=U.clientY??U.y??G.top+G.height/2;return d.set((O-G.left)/G.width*2-1,-((X-G.top)/G.height)*2+1),f.setFromCamera(d,s),f.intersectObjects([...m.values()],!0)[0]?.object?.userData?.assetId||null}function w(U){let G=m.get(U);if(!G)return null;let O=s.getWorldDirection(new C).negate();return new He().setFromNormalAndCoplanarPoint(O,G.position)}function S(U,G){let O=m.get(U),X=w(U);if(!O||!X)return null;let K=i.getBoundingClientRect(),rt=G.clientX??G.x??K.left+K.width/2,yt=G.clientY??G.y??K.top+K.height/2;d.set((rt-K.left)/K.width*2-1,-((yt-K.top)/K.height)*2+1),f.setFromCamera(d,s);let Vt=new C;return f.ray.intersectPlane(X,Vt)?{dx:O.position.x-Vt.x,dz:O.position.z-Vt.z}:null}function P(U,G,O=0,X=0){let K=m.get(U),rt=w(U);if(!K||!rt)return!1;let yt=i.getBoundingClientRect(),Vt=G.clientX??G.x??yt.left+yt.width/2,Y=G.clientY??G.y??yt.top+yt.height/2;d.set((Vt-yt.left)/yt.width*2-1,-((Y-yt.top)/yt.height)*2+1),f.setFromCamera(d,s);let it=new C;return f.ray.intersectPlane(rt,it)?(K.position.x=it.x+O,K.position.z=it.z+X,!0):!1}function H(U,{animate:G=!1}={}){let O=m.get(U);if(!O)return!1;let K=new $e().setFromObject(hr(O)).getBoundingSphere(new Un),rt=s.position.clone().sub(r.target).normalize(),yt=K.center.clone().add(rt.multiplyScalar(Math.max(2.2,K.radius*5.2)));return G?y={startedAt:performance.now(),duration:420,fromPosition:s.position.clone(),fromTarget:r.target.clone(),toPosition:yt,toTarget:K.center.clone()}:(r.target.copy(K.center),s.position.copy(yt),r.update()),!0}function z(){for(let U of[..._.children])_.remove(U),Ui(U)}function W(U,G=14843238){let O=new xe().setFromPoints(U),X=new Oe(O,new pn({color:G,transparent:!0,opacity:.94}));X.layers.set(31),_.add(X)}function $(U,{animate:G=!1}={}){if(z(),!U)return!1;let O=U.assetIds.map(X=>m.get(X)).filter(Boolean);if(U.visual.showCollisionBoxes||U.visual.showBoundaryMeasure||U.kind==="neutral")for(let X of O){let K=new os(hr(X),U.kind==="boundary"?14268509:14843238);K.material.transparent=!0,K.material.opacity=.96,K.layers.set(31),_.add(K)}if(U.kind==="collision"&&O.length>1&&W(O.slice(0,2).map(X=>new $e().setFromObject(hr(X)).getCenter(new C))),U.kind==="boundary"&&O[0]){let X=new $e().setFromObject(hr(O[0])).getCenter(new C),K=U.evidence.axes?.[0],rt=new C(K==="left"?1:K==="right"?-1:0,K==="floor"?1:K==="ceiling"?-1:0,K==="back"?1:K==="front"?-1:0);W([X,X.clone().add(rt.multiplyScalar(Math.max(.25,U.measurement?.value||.25)))],14268509)}if(U.visual.showLineOfSight){let X=g?.cameras.find(K=>K.id===U.cameraId)||g?.cameras[0];X&&W([new C(X.position.x,X.position.y,X.position.z),new C(X.target.x,X.target.y,X.target.z)],6207682)}return O[0]&&H(U.assetIds[0],{animate:G}),O.length>0||!!U.cameraId}return v("isometric"),e.setAnimationLoop(()=>{if(y){let U=Math.min(1,(performance.now()-y.startedAt)/y.duration),G=1-(1-U)**3;s.position.lerpVectors(y.fromPosition,y.toPosition,G),r.target.lerpVectors(y.fromTarget,y.toTarget,G),U>=1&&(y=null)}r.update(),p?.update(),T(),e.render(n,s)}),{canvas:i,renderer:e,scene:n,camera:s,controls:r,sync:R,resize:T,pick:L,measureGrabOffset:S,dragAssetToPointer:P,focusAsset:H,focusEvidence:$,clearEvidence:z,setSelectedAsset:E,setView:v,capture(){T(),s.layers.disable(31),e.render(n,s);let U=i.toDataURL("image/png");return s.layers.enable(31),U},getAssetObject(U){return m.get(U)||null},dispose(){e.setAnimationLoop(null),r.dispose(),p&&(n.remove(p),Ui(p)),z(),n.remove(_),x&&Ui(x),m.forEach(Ui),m.clear(),e.dispose()}}}var Wu=6;function Xu({canvas:i,onSelect:t,onDragStart:e,onDragEnd:n,onContextLost:s,onContextRestored:r,policy:a}={}){let o=Gu({canvas:i,policy:a}),c=null,h=null,u=l=>{if(l.button!==0)return;c={x:l.clientX,y:l.clientY};let g=o.pick(l);h=g?{assetId:g,started:!1,offsetX:0,offsetZ:0}:null},f=l=>{if(!(!h||!c)){if(!h.started){if(Math.hypot(l.clientX-c.x,l.clientY-c.y)<Wu)return;if(!e?.(h.assetId)){h=null;return}let g=o.measureGrabOffset(h.assetId,l);h.offsetX=g?.dx??0,h.offsetZ=g?.dz??0,h.started=!0}o.dragAssetToPointer(h.assetId,l,h.offsetX,h.offsetZ)}},d=l=>{if(l.button!==0)return;let g=h?.started===!0,y=h?.assetId??null,v=c;if(c=null,h=null,!v)return;let T=Math.hypot(l.clientX-v.x,l.clientY-v.y);if(g){n?.(y,l);return}if(T>Wu)return;let E=o.pick(l);o.setSelectedAsset(E),t?.(E)},m=l=>{let g=o.pick(l);g&&o.focusAsset(g)},_=l=>{l.preventDefault(),s?.()},x=()=>r?.();i.addEventListener("pointerdown",u),i.addEventListener("pointermove",f),i.addEventListener("pointerup",d),i.addEventListener("dblclick",m),i.addEventListener("webglcontextlost",_),i.addEventListener("webglcontextrestored",x);let p="ResizeObserver"in window?new ResizeObserver(()=>o.resize()):null;return p?.observe(i),window.addEventListener("resize",o.resize),{...o,dispose(){p?.disconnect(),window.removeEventListener("resize",o.resize),i.removeEventListener("pointerdown",u),i.removeEventListener("pointermove",f),i.removeEventListener("pointerup",d),i.removeEventListener("dblclick",m),i.removeEventListener("webglcontextlost",_),i.removeEventListener("webglcontextrestored",x),o.dispose()}}}function L_(i){if(!i||typeof i.do!="function"||typeof i.undo!="function")throw new TypeError("A command must provide do() and undo() functions")}function qu({limit:i=100}={}){if(!Number.isInteger(i)||i<1)throw new RangeError("History limit must be a positive integer");let t=[],e=[];return{execute(n){return L_(n),n.do(),t.push(n),t.length>i&&t.shift(),e.length=0,!0},undo(){let n=t.pop();if(!n)return!1;try{n.undo(),e.push(n)}catch(s){throw t.push(n),s}return!0},redo(){let n=e.pop();if(!n)return!1;try{n.do(),t.push(n)}catch(s){throw e.push(n),s}return!0},canUndo(){return t.length>0},canRedo(){return e.length>0},clear(){t.length=0,e.length=0},snapshot(){return{undoDepth:t.length,redoDepth:e.length,undoLabel:t.at(-1)?.label||null,redoLabel:e.at(-1)?.label||null}}}}function li(i,t,e){return{path:i,code:t,message:e}}function D_(i){let t=Jt(i);return t.versions=[],t}function Yu(i){return i.assets.reduce((t,e)=>t+Number(e.cost||0),0)}function $u(i,t){if(!i?.snapshot||!t?.snapshot)throw new TypeError("\u5BF9\u6BD4\u7248\u672C\u7F3A\u5C11\u5DE5\u7A0B\u5FEB\u7167");let e=new Map(i.snapshot.assets.map(d=>[d.id,d])),n=new Map(t.snapshot.assets.map(d=>[d.id,d])),r=[...new Set([...e.keys(),...n.keys()])].filter(d=>JSON.stringify(e.get(d)||null)!==JSON.stringify(n.get(d)||null)).sort(),a=new Set(i.issueIds||[]),o=new Set(t.issueIds||[]),c=new Map((i.issues||[]).map(d=>[d.id,d])),h=new Map((t.issues||[]).map(d=>[d.id,d])),u=[...a].filter(d=>!o.has(d)).sort(),f=[...o].filter(d=>!a.has(d)).sort();return{leftId:i.id,rightId:t.id,changedAssetCount:r.length,changedAssetIds:r,changedAssets:r.map(d=>({id:d,before:e.get(d)?.name||null,after:n.get(d)?.name||null})),budgetDelta:Yu(t.snapshot)-Yu(i.snapshot),resolvedIssueIds:u,newIssueIds:f,resolvedIssues:u.map(d=>c.get(d)||{id:d,message:d,severity:"info"}),newIssues:f.map(d=>h.get(d)||{id:d,message:d,severity:"info"}),roomChanged:JSON.stringify(i.snapshot.room)!==JSON.stringify(t.snapshot.room),cameraChanged:JSON.stringify(i.snapshot.cameras)!==JSON.stringify(t.snapshot.cameras)}}function Zu(i,{historyLimit:t=100}={}){let e=gn(i);if(!e.valid)throw new TypeError(`Invalid initial SET//FLOW project: ${e.errors[0].message}`);let n=Jt(i),s=new Set,r=qu({limit:t});function a(){let u=Jt(n),f=r.snapshot();for(let d of s)d(u,f)}function o(u,f){let d=Jt(n),m=Jt(n);try{f(m)}catch(x){return{ok:!1,errors:[li("project","edit-failed",x instanceof Error?x.message:"\u5DE5\u7A0B\u4FEE\u6539\u5931\u8D25")]}}m.updatedAt=new Date().toISOString();let _=gn(m);return _.valid?(r.execute({label:u,do(){n=Jt(m)},undo(){n=Jt(d)}}),a(),{ok:!0,errors:[]}):{ok:!1,errors:_.errors}}function c(u){return n.assets.find(f=>f.id===u)||null}function h(u){return{ok:!1,errors:[li("assets","asset-locked",`${u.name} \u5DF2\u9501\u5B9A\uFF0C\u8BF7\u5148\u89E3\u9501\u518D\u4FEE\u6539`)]}}return{getState(){return Jt(n)},subscribe(u){if(typeof u!="function")throw new TypeError("Project subscriber must be a function");return s.add(u),()=>s.delete(u)},dispatch:o,replaceProject(u){let f=gn(u);return f.valid?(n=Jt(u),r.clear(),a(),{ok:!0,errors:[]}):{ok:!1,errors:f.errors}},resizeRoom(u){return o("\u8C03\u6574\u623F\u95F4\u5C3A\u5BF8",f=>{f.room={...f.room,...Jt(u)}})},updateProjectSettings({room:u,budget:f,aspect:d}={}){return o("\u8C03\u6574\u5DE5\u7A0B\u8BBE\u7F6E",m=>{u&&(m.room={...m.room,...Jt(u)}),f&&(m.budget={...m.budget,...Jt(f)}),d!==void 0&&(m.brief.aspect=d)})},addAsset(u){return o(`\u6DFB\u52A0 ${u?.name||"\u8D44\u4EA7"}`,f=>{f.assets.push(Jt(u))})},removeAsset(u){let f=c(u);return f?f.locked?h(f):o("\u5220\u9664\u8D44\u4EA7",d=>{d.assets=d.assets.filter(m=>m.id!==u)}):{ok:!1,errors:[li("assets","asset-not-found","\u6CA1\u6709\u627E\u5230\u9700\u8981\u5220\u9664\u7684\u8D44\u4EA7")]}},duplicateAsset(u){let f=c(u);if(!f)return{ok:!1,errors:[li("assets","asset-not-found","\u6CA1\u6709\u627E\u5230\u9700\u8981\u590D\u5236\u7684\u8D44\u4EA7")]};let d=1,m=`${f.id}-copy-${d}`;for(;n.assets.some(l=>l.id===m);)d+=1,m=`${f.id}-copy-${d}`;let _=Number(n.settings.gridStep)||.1,x=Jt(f);x.id=m,x.name=`${f.name} \u526F\u672C`,x.locked=!1,x.transform.position.x+=_,x.transform.position.z+=_;let p=o(`\u590D\u5236 ${f.name}`,l=>{l.assets.push(x)});return p.ok?{...p,assetId:m}:p},setAssetLocked(u,f){let d=c(u);return d?o(f?`\u9501\u5B9A ${d.name}`:`\u89E3\u9501 ${d.name}`,m=>{m.assets.find(_=>_.id===u).locked=!!f}):{ok:!1,errors:[li("assets","asset-not-found","\u6CA1\u6709\u627E\u5230\u9700\u8981\u9501\u5B9A\u7684\u8D44\u4EA7")]}},updateAssetTransform(u,f){let d=c(u);return d?d.locked?h(d):o("\u8C03\u6574\u8D44\u4EA7\u4F4D\u7F6E",m=>{let _=m.assets.find(x=>x.id===u);_.transform=Jt(f)}):{ok:!1,errors:[li("assets","asset-not-found","\u6CA1\u6709\u627E\u5230\u9700\u8981\u79FB\u52A8\u7684\u8D44\u4EA7")]}},updateCamera(u,f){let d=n.cameras.find(m=>m.id===u);return d?o(`\u8C03\u6574 ${d.name}`,m=>{let _=m.cameras.find(x=>x.id===u);f.position&&(_.position={..._.position,...Jt(f.position)}),f.target&&(_.target={..._.target,...Jt(f.target)});for(let x of["focalLength","aspect","safeZonePreset"])f[x]!==void 0&&(_[x]=Jt(f[x]))}):{ok:!1,errors:[li("cameras","camera-not-found","\u6CA1\u6709\u627E\u5230\u9700\u8981\u4FEE\u6539\u7684\u673A\u4F4D")]}},saveVersion(u,{issueIds:f=[],issues:d=[],previews:m={}}={}){let _=String(u||"").trim();if(!_)return{ok:!1,errors:[li("versions.name","name-required","\u8BF7\u8F93\u5165\u7248\u672C\u540D\u79F0")]};let x=`version-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,p=new Date().toISOString(),l=D_(n),g=d.map(E=>({id:E.id,message:String(E.message||E.id),severity:E.severity||"info"})),y=g.length?g.map(E=>E.id):f,v=Object.fromEntries(Object.entries(m).filter(([E,R])=>["top","primary","detail"].includes(E)&&typeof R=="string"&&R.startsWith("data:image/"))),T=o(`\u4FDD\u5B58\u7248\u672C ${_}`,E=>{E.versions.push({id:x,name:_,createdAt:p,issueIds:[...new Set(y)].sort(),issues:g,previews:v,snapshot:l})});return T.ok?{...T,versionId:x}:T},undo(){let u=r.undo();return u&&a(),u},redo(){let u=r.redo();return u&&a(),u},canUndo(){return r.canUndo()},canRedo(){return r.canRedo()},historySnapshot(){return r.snapshot()}}}function Nt(i){return String(i??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}var U_=["presenter","garment-rack","live-table","backdrop","key-light","rim-light","light-stand","monitor","changing-zone-marker"];function N_(i){return i.assets.map((t,e)=>`
    <li>
      <button class="asset-row${e===0?" is-selected":""}" type="button" data-selection-kind="asset" data-asset-id="${Nt(t.id)}" aria-pressed="${e===0}">
        <span class="asset-row__index">${String(e+1).padStart(2,"0")}</span>
        <span><strong>${Nt(t.name)}</strong><small>${Nt(t.type)}</small></span>
        <span class="scene-row__meta"><i aria-hidden="true">${t.locked?"LOCK":"EDIT"}</i><b data-issue-badge data-issue-asset="${Nt(t.id)}"></b></span>
      </button>
    </li>`).join("")}function F_(i){return i.cameras.map((t,e)=>`
    <li>
      <button class="asset-row asset-row--camera" type="button" data-selection-kind="camera" data-camera-id="${Nt(t.id)}" aria-pressed="false">
        <span class="asset-row__index">C${e+1}</span>
        <span><strong>${Nt(t.name)}</strong><small>${Nt(t.role)} \xB7 ${Nt(t.aspect)}</small></span>
        <span class="scene-row__meta"><i aria-hidden="true">${Number(t.focalLength).toFixed(0)} MM</i><b data-issue-badge data-issue-camera="${Nt(t.id)}"></b></span>
      </button>
    </li>`).join("")}function Ju(i){return`<div class="scene-tree__group"><span>OBJECTS / ${String(i.assets.length).padStart(2,"0")}</span><ol class="asset-list">${N_(i)}</ol></div>
    <div class="scene-tree__group"><span>CAMERAS / ${String(i.cameras.length).padStart(2,"0")}</span><ol class="asset-list">${F_(i)}</ol></div>`}function O_(){let i=new Map(mc().map(t=>[t.type,t]));return U_.map(t=>{let e=i.get(t);return`<button type="button" data-add-asset="${Nt(t)}"><span>${Nt(e.displayName)}</span><small>${Nt(t)}</small><b>\uFF0B</b></button>`}).join("")}function dr(i,t,e){let n=i?.previews?.[t],[s,r]=t==="top"?[640,420]:[360,640];return n?`<figure><img src="${Nt(n)}" alt="${Nt(`${i.name} / ${e}`)}" width="${s}" height="${r}" loading="lazy" decoding="async"><figcaption>${Nt(e)}</figcaption></figure>`:`<figure class="is-missing"><div>\u753B\u9762\u672A\u83B7\u53D6</div><figcaption>${Nt(e)}</figcaption></figure>`}function sc(i,t,e){return`<section><span>${Nt(i)}</span>${t.length?`<ul>${t.map(n=>`<li>${Nt(n.message||n.after||n.before||n.id)}</li>`).join("")}</ul>`:`<p>${Nt(e)}</p>`}</section>`}function B_(i){let t=i.assets.reduce((e,n)=>e+Number(n.cost||0),0);return`
    <div class="editor-shell">
      <nav class="command-bar" aria-label="\u5DE5\u7A0B\u64CD\u4F5C">
        <div class="project-identity">
          <span>PROJECT / 01</span>
          <strong data-project-name>${Nt(i.name)}</strong>
        </div>
        <div class="command-bar__group">
          <button type="button" data-action="save" data-tooltip="\u4FDD\u5B58\u5230\u672C\u673A" aria-label="\u4FDD\u5B58\u5DE5\u7A0B"><span aria-hidden="true">SAVE</span><b>\u4FDD\u5B58</b></button>
          <button type="button" data-action="undo" data-tooltip="\u64A4\u9500\u4E0A\u4E00\u6B65" aria-label="\u64A4\u9500"><span aria-hidden="true">\u21B6</span><b>\u64A4\u9500</b></button>
          <button type="button" data-action="redo" data-tooltip="\u91CD\u505A\u4E0A\u4E00\u6B65" aria-label="\u91CD\u505A"><span aria-hidden="true">\u21B7</span><b>\u91CD\u505A</b></button>
          <button type="button" data-action="versions" data-tooltip="\u4FDD\u5B58\u5E76\u6BD4\u8F83\u65B9\u6848" aria-label="\u7248\u672C\u4E0E\u5BF9\u6BD4"><span aria-hidden="true">A/B</span><b>\u7248\u672C</b></button>
          <button type="button" data-action="export" data-tooltip="\u5BFC\u51FA\u5DE5\u7A0B\u3001\u6E05\u5355\u3001\u753B\u9762\u548C\u6253\u5370\u62A5\u544A" aria-label="\u5BFC\u51FA\u6267\u884C\u5305"><span aria-hidden="true">EXPORT</span><b>\u5BFC\u51FA</b></button>
          <button type="button" data-action="guide" data-tooltip="\u67E5\u770B\u57FA\u672C\u64CD\u4F5C\u4E0E\u5FEB\u6377\u952E" aria-label="\u6253\u5F00\u4F7F\u7528\u8BF4\u660E"><span aria-hidden="true">?</span><b>\u8BF4\u660E</b></button>
        </div>
        <p class="save-state" data-save-state role="status" aria-live="polite">\u672C\u5730\u5DE5\u7A0B\u5DF2\u5C31\u7EEA</p>
      </nav>

      <aside class="version-panel" data-version-panel aria-label="\u7248\u672C\u4E0E\u65B9\u6848\u5BF9\u6BD4" hidden>
        <header><div><span>VERSION LEDGER</span><strong>\u7248\u672C\u4E0E\u65B9\u6848\u5BF9\u6BD4</strong></div><button type="button" data-close-versions aria-label="\u5173\u95ED\u7248\u672C\u9762\u677F">\xD7</button></header>
        <form class="version-create" data-version-form>
          <label for="set-flow-version-name">\u4FDD\u5B58\u5F53\u524D\u65B9\u6848</label>
          <div><input id="set-flow-version-name" data-version-name name="version-name" type="text" maxlength="42" autocomplete="off" placeholder="\u4F8B\u5982\uFF1A\u65B9\u6848 A / \u4E3B\u64AD\u52A8\u7EBF\u4F18\u5148\u2026"><button type="submit">\u4FDD\u5B58\u7248\u672C</button></div>
        </form>
        <section class="version-ledger" aria-label="\u5DF2\u4FDD\u5B58\u7248\u672C">
          <span>SAVED SNAPSHOTS</span>
          <div data-version-list data-version-contact-sheet><p>\u5C1A\u672A\u4FDD\u5B58\u7248\u672C\u3002</p></div>
        </section>
        <section class="version-compare" aria-label="\u65B9\u6848\u5BF9\u6BD4">
          <span>SIDE-BY-SIDE EVIDENCE</span>
          <div class="version-selects">
            <label>\u57FA\u51C6\u65B9\u6848<select data-compare-left aria-label="\u57FA\u51C6\u65B9\u6848"></select></label>
            <label>\u5BF9\u6BD4\u65B9\u6848<select data-compare-right aria-label="\u5BF9\u6BD4\u65B9\u6848"></select></label>
          </div>
          <button type="button" data-compare-action>\u6BD4\u8F83\u4E24\u4E2A\u7248\u672C</button>
          <div class="comparison-result" data-comparison-result data-comparison-media><p>\u4FDD\u5B58\u81F3\u5C11\u4E24\u4E2A\u547D\u540D\u7248\u672C\u540E\uFF0C\u53EF\u4EE5\u6BD4\u8F83\u5BF9\u8C61\u53D8\u5316\u548C\u95EE\u9898\u589E\u51CF\u3002</p></div>
        </section>
      </aside>

      <aside class="asset-rail" aria-label="\u573A\u666F\u548C\u8D44\u4EA7">
        <header class="panel-heading">
          <div><span>SCENE</span><strong>\u573A\u666F\u4E0E\u8D44\u4EA7</strong></div>
          <b data-asset-count>${String(i.assets.length).padStart(2,"0")}</b>
        </header>
        <div class="room-summary">
          <span>ROOM ENVELOPE</span>
          <strong data-room-size>${i.room.width.toFixed(2)} \xD7 ${i.room.depth.toFixed(2)} \xD7 ${i.room.height.toFixed(2)} m</strong>
        </div>
        <details class="project-settings" open>
          <summary><span>PROJECT SETTINGS</span><strong>\u5DE5\u7A0B\u89C4\u683C</strong></summary>
          <form data-project-settings autocomplete="off">
            <fieldset><legend>\u7A7A\u95F4\u5C3A\u5BF8 / M</legend>
              <label>\u5BBD<input name="room-width" type="number" min="1" max="30" step="0.1" value="${i.room.width.toFixed(1)}"></label>
              <label>\u6DF1<input name="room-depth" type="number" min="1" max="30" step="0.1" value="${i.room.depth.toFixed(1)}"></label>
              <label>\u9AD8<input name="room-height" type="number" min="1" max="12" step="0.1" value="${i.room.height.toFixed(1)}"></label>
            </fieldset>
            <label class="project-settings__wide">\u8BBE\u5907\u9884\u7B97<input name="budget-limit" type="number" min="0" step="100" value="${Number(i.budget.limit)}"><small>CNY</small></label>
            <label class="project-settings__wide">\u9ED8\u8BA4\u753B\u5E45<select name="default-aspect"><option value="9:16"${i.brief.aspect==="9:16"?" selected":""}>9:16 \u7AD6\u5C4F</option><option value="16:9"${i.brief.aspect==="16:9"?" selected":""}>16:9 \u6A2A\u5C4F</option><option value="1:1"${i.brief.aspect==="1:1"?" selected":""}>1:1 \u65B9\u5F62</option></select></label>
          </form>
        </details>
        <section class="scene-tree" data-scene-tree data-asset-list aria-label="\u573A\u666F\u6811">${Ju(i)}</section>
        <div class="selection-actions" role="group" aria-label="\u6240\u9009\u5BF9\u8C61\u64CD\u4F5C">
          <button type="button" data-selection-action="locate" title="\u5728\u4E09\u7EF4\u89C6\u53E3\u4E2D\u5B9A\u4F4D">\u5B9A\u4F4D</button>
          <button type="button" data-selection-action="duplicate" title="\u590D\u5236\u6240\u9009\u8D44\u4EA7">\u590D\u5236</button>
          <button type="button" data-selection-action="lock" title="\u9501\u5B9A\u6216\u89E3\u9501\u6240\u9009\u8D44\u4EA7">\u9501\u5B9A</button>
          <button type="button" data-selection-action="delete" title="\u5220\u9664\u6240\u9009\u8D44\u4EA7">\u5220\u9664</button>
        </div>
        <details class="asset-library" data-asset-library>
          <summary><span>ASSET LIBRARY</span><strong>\u6DFB\u52A0\u8BBE\u5907\u4E0E\u5E03\u666F</strong></summary>
          <div>${O_()}</div>
        </details>
      </aside>

      <section class="drafting-stage" aria-label="\u4E09\u7EF4\u7A7A\u95F4\u89C6\u53E3">
        <div class="viewport-toolbar">
          <div><span class="signal-dot" aria-hidden="true"></span><strong>LIVE / 3D SPACE</strong></div>
          <span>GRID 0.10 M</span>
          <div class="view-switch" role="group" aria-label="\u89C6\u56FE\u5207\u6362">
            <button type="button" data-view="top" aria-pressed="false">\u4FEF\u89C6</button>
            <button class="is-active" type="button" data-view="isometric" aria-pressed="true">\u900F\u89C6</button>
            <button type="button" data-view="front" aria-pressed="false">\u6B63\u9762</button>
          </div>
        </div>
        <div class="axis axis--x" aria-hidden="true"><span>0</span><span>1</span><span>2</span><span>3.8 M</span></div>
        <div class="axis axis--y" aria-hidden="true"><span>0</span><span>2</span><span>4</span><span>5.6 M</span></div>
        <canvas class="studio-canvas" data-studio-canvas tabindex="0" aria-label="\u76F4\u64AD\u95F4\u4E09\u7EF4\u89C6\u56FE"></canvas>
        <div class="viewport-fallback" data-viewport-fallback role="status"><span data-viewport-fallback-message>\u6B63\u5728\u5EFA\u7ACB\u4E09\u7EF4\u573A\u666F\u2026</span><button type="button" data-retry-viewport hidden>\u91CD\u65B0\u52A0\u8F7D\u89C6\u53E3</button></div>
        <div class="viewport-stage-note">
          <span>GEOMETRY / ACTIVE</span>
          <strong>\u5355\u51FB\u9009\u62E9 \xB7 \u62D6\u62FD\u65CB\u8F6C \xB7 \u6EDA\u8F6E\u7F29\u653E \xB7 \u53CC\u51FB\u805A\u7126</strong>
        </div>
      </section>

      <aside class="right-desk">
        <section class="monitor-rail" aria-label="\u673A\u4F4D\u76D1\u770B">
          <figure class="monitor monitor--primary">
            <figcaption><span>CAM A / \u4E3B\u673A\u4F4D</span><b>PRIMARY / 9:16</b></figcaption>
            <div class="monitor__frame">
              <div class="monitor__program" data-monitor-program="${Nt(i.cameras[0]?.id||"camera-primary")}" data-aspect="${Nt(i.cameras[0]?.aspect||"9:16")}">
                <canvas data-camera-monitor="${Nt(i.cameras[0]?.id||"camera-primary")}" aria-label="\u4E3B\u673A\u4F4D\u5B9E\u65F6\u753B\u9762"></canvas>
                <span class="safe-zone safe-zone--frame" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--head" data-safe-zone="head" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--subtitle" data-safe-zone="subtitle" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--platform" data-safe-zone="platform" aria-hidden="true"></span>
                <span class="monitor__crosshair" aria-hidden="true"></span>
              </div>
            </div>
          </figure>
          <figure class="monitor monitor--detail">
            <figcaption><span>CAM B / \u7279\u5199\u673A\u4F4D</span><b>DETAIL / 9:16</b></figcaption>
            <div class="monitor__frame">
              <div class="monitor__program" data-monitor-program="${Nt(i.cameras[1]?.id||"camera-detail")}" data-aspect="${Nt(i.cameras[1]?.aspect||"9:16")}">
                <canvas data-camera-monitor="${Nt(i.cameras[1]?.id||"camera-detail")}" aria-label="\u7279\u5199\u673A\u4F4D\u5B9E\u65F6\u753B\u9762"></canvas>
                <span class="safe-zone safe-zone--frame" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--product" data-safe-zone="product" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--subtitle" data-safe-zone="subtitle" aria-hidden="true"></span>
                <span class="safe-zone safe-zone--platform" data-safe-zone="platform" aria-hidden="true"></span>
                <span class="monitor__crosshair" aria-hidden="true"></span>
              </div>
            </div>
          </figure>
        </section>

        <section class="inspection-desk" aria-label="\u68C0\u67E5\u53F0">
          <header class="panel-heading"><div><span>INSPECT</span><strong>\u5BF9\u8C61\u68C0\u67E5\u53F0</strong></div><b>LIVE</b></header>
          <div class="selected-asset" data-selected-asset>
            <span>SELECTED</span>
            <strong>${Nt(i.assets[0]?.name||"\u672A\u9009\u62E9\u5BF9\u8C61")}</strong>
            <p>${Nt(i.assets[0]?.type||"\u2014")}</p>
          </div>
          <div class="transform-mode" role="group" aria-label="\u53D8\u6362\u6A21\u5F0F">
            <button class="is-active" type="button" data-transform-mode="translate" aria-pressed="true">\u79FB\u52A8 <kbd>W</kbd></button>
            <button type="button" data-transform-mode="rotate" aria-pressed="false">\u65CB\u8F6C <kbd>E</kbd></button>
          </div>
          <form class="transform-form" data-transform-form aria-label="\u5BF9\u8C61\u6570\u503C\u53D8\u6362" autocomplete="off">
            <fieldset><legend>POSITION / M</legend>
              <label>X<input name="position-x" type="number" step="0.1" data-transform-kind="position" data-axis="x" aria-label="\u4F4D\u7F6E X\uFF0C\u5355\u4F4D\u7C73"></label>
              <label>Y<input name="position-y" type="number" step="0.1" data-transform-kind="position" data-axis="y" aria-label="\u4F4D\u7F6E Y\uFF0C\u5355\u4F4D\u7C73"></label>
              <label>Z<input name="position-z" type="number" step="0.1" data-transform-kind="position" data-axis="z" aria-label="\u4F4D\u7F6E Z\uFF0C\u5355\u4F4D\u7C73"></label>
            </fieldset>
            <fieldset><legend>ROTATION / DEG</legend>
              <label>X<input name="rotation-x" type="number" step="1" data-transform-kind="rotation" data-axis="x" aria-label="\u65CB\u8F6C X\uFF0C\u5355\u4F4D\u5EA6"></label>
              <label>Y<input name="rotation-y" type="number" step="1" data-transform-kind="rotation" data-axis="y" aria-label="\u65CB\u8F6C Y\uFF0C\u5355\u4F4D\u5EA6"></label>
              <label>Z<input name="rotation-z" type="number" step="1" data-transform-kind="rotation" data-axis="z" aria-label="\u65CB\u8F6C Z\uFF0C\u5355\u4F4D\u5EA6"></label>
            </fieldset>
            <p class="lock-note" data-lock-note></p>
          </form>
          <form class="camera-form" data-camera-form aria-label="\u673A\u4F4D\u6570\u503C\u8BBE\u7F6E" autocomplete="off" hidden>
            <fieldset><legend>CAMERA POSITION / M</legend>
              <label>X<input name="camera-position-x" type="number" step="0.1" data-camera-kind="position" data-axis="x"></label>
              <label>Y<input name="camera-position-y" type="number" step="0.1" data-camera-kind="position" data-axis="y"></label>
              <label>Z<input name="camera-position-z" type="number" step="0.1" data-camera-kind="position" data-axis="z"></label>
            </fieldset>
            <fieldset><legend>LOOK AT / M</legend>
              <label>X<input name="camera-target-x" type="number" step="0.1" data-camera-kind="target" data-axis="x"></label>
              <label>Y<input name="camera-target-y" type="number" step="0.1" data-camera-kind="target" data-axis="y"></label>
              <label>Z<input name="camera-target-z" type="number" step="0.1" data-camera-kind="target" data-axis="z"></label>
            </fieldset>
            <div class="camera-form__optics">
              <label>\u7126\u8DDD<input name="camera-focal-length" type="number" min="12" max="200" step="1"><small>MM</small></label>
              <label>\u753B\u5E45<select name="camera-aspect"><option value="9:16">9:16</option><option value="16:9">16:9</option><option value="1:1">1:1</option></select></label>
            </div>
          </form>
          <div class="rule-state" data-rule-state>
            <span>RULE ENGINE / ACTIVE</span>
            <strong data-issue-summary>\u6B63\u5728\u68C0\u67E5\u5DE5\u7A0B\u89C4\u5219\u2026</strong>
            <div class="issue-list" data-issue-list aria-live="polite"></div>
          </div>
        </section>
      </aside>

      <footer class="workspace-status">
        <div><span>SCHEMA</span><strong>V${i.schemaVersion}</strong></div>
        <div><span>ASSETS</span><strong data-status-assets>${i.assets.length}</strong></div>
        <div><span>EQUIPMENT</span><strong data-total-cost>\xA5${t.toLocaleString("zh-CN")}</strong></div>
        <div><span>ISSUES</span><strong data-issue-count>\u2014</strong></div>
        <p data-runtime-message>\u5DE5\u7A0B\u6A21\u578B\u3001\u5386\u53F2\u8BB0\u5F55\u3001\u672C\u5730\u5B58\u50A8\u4E0E\u5BFC\u51FA\u5DF2\u63A5\u5165\u3002</p>
      </footer>
    </div>
    <dialog class="usage-guide" data-guide-dialog aria-labelledby="guide-dialog-title">
      <section class="usage-guide__panel">
        <header class="usage-guide__header">
          <div><span>QUICK START / 04 STEPS</span><strong id="guide-dialog-title">\u5FEB\u901F\u4E0A\u624B</strong></div>
          <button type="button" data-close-guide aria-label="\u5173\u95ED\u4F7F\u7528\u8BF4\u660E">\xD7</button>
        </header>
        <ol class="usage-guide__steps">
          <li><span>01 / BUILD</span><strong>\u6DFB\u52A0\u8BBE\u5907</strong><p>\u5C55\u5F00\u5DE6\u4FA7\u8D44\u4EA7\u5E93\uFF0C\u52A0\u5165\u4E3B\u64AD\u533A\u3001\u684C\u53F0\u3001\u706F\u5149\u548C\u80CC\u666F\u7B49\u5BF9\u8C61\u3002</p></li>
          <li><span>02 / ARRANGE</span><strong>\u8C03\u6574\u573A\u666F</strong><p>\u9009\u4E2D\u5BF9\u8C61\u540E\u62D6\u52A8\u4E09\u7EF4\u64CD\u7EB5\u8F74\uFF1B\u4E5F\u53EF\u5207\u6362\u4FEF\u89C6\u3001\u900F\u89C6\u6216\u6B63\u9762\u89C6\u56FE\u3002</p></li>
          <li><span>03 / CHECK</span><strong>\u68C0\u67E5\u95EE\u9898</strong><p>\u70B9\u51FB\u53F3\u4FA7\u95EE\u9898\u5217\u8868\uFF0C\u5B9A\u4F4D\u78B0\u649E\u3001\u8D8A\u754C\u3001\u673A\u4F4D\u5B89\u5168\u533A\u548C\u9884\u7B97\u95EE\u9898\u3002</p></li>
          <li><span>04 / DELIVER</span><strong>\u4FDD\u5B58\u4EA4\u4ED8</strong><p>\u5DE5\u7A0B\u4F1A\u81EA\u52A8\u4FDD\u5B58\uFF1B\u547D\u540D\u7248\u672C\u7528\u4E8E\u6BD4\u8F83\uFF0C\u5BFC\u51FA\u53EF\u751F\u6210\u5B8C\u6574\u6267\u884C\u5305\u3002</p></li>
        </ol>
        <div class="usage-guide__shortcuts" role="group" aria-label="\u952E\u76D8\u5FEB\u6377\u952E">
          <span>KEYBOARD</span>
          <ul>
            <li><kbd>W</kbd><span>\u79FB\u52A8</span></li>
            <li><kbd>E</kbd><span>\u65CB\u8F6C</span></li>
            <li><kbd>Delete</kbd><span>\u5220\u9664</span></li>
            <li><kbd>Ctrl + Z</kbd><span>\u64A4\u9500</span></li>
          </ul>
        </div>
      </section>
    </dialog>
    <dialog class="delete-dialog" data-delete-dialog aria-labelledby="delete-dialog-title">
      <form method="dialog">
        <span>REMOVE FROM SCENE</span>
        <strong id="delete-dialog-title">\u5220\u9664\u6240\u9009\u8D44\u4EA7\uFF1F</strong>
        <p data-delete-message>\u8FD9\u4F1A\u4ECE\u5F53\u524D\u5DE5\u7A0B\u79FB\u9664\u5BF9\u8C61\uFF0C\u4ECD\u53EF\u4F7F\u7528\u64A4\u9500\u6062\u590D\u3002</p>
        <div><button type="submit" value="cancel" data-delete-cancel>\u4FDD\u7559\u5BF9\u8C61</button><button type="button" data-delete-confirm>\u786E\u8BA4\u5220\u9664</button></div>
      </form>
    </dialog>`}function Ku(i,t={},e){if(!i||typeof i.querySelector!="function")throw new TypeError("SET//FLOW shell requires a DOM root");i.innerHTML=B_(e);let n={assetList:i.querySelector("[data-asset-list]"),projectSettings:i.querySelector("[data-project-settings]"),assetLibrary:i.querySelector("[data-asset-library]"),assetCount:i.querySelector("[data-asset-count]"),roomSize:i.querySelector("[data-room-size]"),projectName:i.querySelector("[data-project-name]"),selectedAsset:i.querySelector("[data-selected-asset]"),transformForm:i.querySelector("[data-transform-form]"),cameraForm:i.querySelector("[data-camera-form]"),transformMode:i.querySelector(".transform-mode"),lockNote:i.querySelector("[data-lock-note]"),guideDialog:i.querySelector("[data-guide-dialog]"),guideTrigger:i.querySelector('[data-action="guide"]'),guideClose:i.querySelector("[data-close-guide]"),deleteDialog:i.querySelector("[data-delete-dialog]"),deleteMessage:i.querySelector("[data-delete-message]"),deleteConfirm:i.querySelector("[data-delete-confirm]"),totalCost:i.querySelector("[data-total-cost]"),statusAssets:i.querySelector("[data-status-assets]"),saveState:i.querySelector("[data-save-state]"),issueSummary:i.querySelector("[data-issue-summary]"),issueList:i.querySelector("[data-issue-list]"),issueCount:i.querySelector("[data-issue-count]"),versionPanel:i.querySelector("[data-version-panel]"),versionForm:i.querySelector("[data-version-form]"),versionName:i.querySelector("[data-version-name]"),versionSubmit:i.querySelector('[data-version-form] button[type="submit"]'),versionList:i.querySelector("[data-version-list]"),compareLeft:i.querySelector("[data-compare-left]"),compareRight:i.querySelector("[data-compare-right]"),comparisonResult:i.querySelector("[data-comparison-result]"),viewportFallbackMessage:i.querySelector("[data-viewport-fallback-message]"),retryViewport:i.querySelector("[data-retry-viewport]"),undo:i.querySelector('[data-action="undo"]'),redo:i.querySelector('[data-action="redo"]')},s=e,r=[],a=e.versions||[],o=null,c={kind:"asset",id:e.assets[0]?.id||null},h=null,u=null,f=[];function d(l,g,y){!l||typeof y!="function"||(l.addEventListener(g,y),f.push(()=>l.removeEventListener(g,y)))}for(let[l,g]of[["save","onSave"],["undo","onUndo"],["redo","onRedo"],["export","onExport"]])d(i.querySelector(`[data-action="${l}"]`),"click",t[g]);d(n.guideTrigger,"click",()=>{n.guideDialog.showModal(),n.guideClose.focus()}),d(n.guideClose,"click",()=>n.guideDialog.close()),d(n.guideDialog,"click",l=>{l.target===n.guideDialog&&n.guideDialog.close()}),d(n.guideDialog,"close",()=>n.guideTrigger.focus()),d(i.querySelector('[data-action="versions"]'),"click",()=>{n.versionPanel.hidden=!n.versionPanel.hidden,n.versionPanel.hidden||n.versionName.focus()}),d(i.querySelector("[data-close-versions]"),"click",()=>{n.versionPanel.hidden=!0}),d(n.versionForm,"submit",async l=>{l.preventDefault();let g=n.versionName.value.trim()||`\u65B9\u6848 ${String(a.length+1).padStart(2,"0")}`;n.versionSubmit.disabled=!0,n.versionSubmit.textContent="\u6B63\u5728\u4FDD\u5B58\u2026";try{await t.onSaveVersion?.(g),n.versionName.value=""}finally{n.versionSubmit.disabled=!1,n.versionSubmit.textContent="\u4FDD\u5B58\u7248\u672C"}}),d(i.querySelector("[data-compare-action]"),"click",()=>{t.onCompareVersions?.(n.compareLeft.value,n.compareRight.value)}),d(n.retryViewport,"click",()=>o?.());for(let l of i.querySelectorAll("[data-view]"))d(l,"click",()=>{for(let g of i.querySelectorAll("[data-view]")){let y=g===l;g.classList.toggle("is-active",y),g.setAttribute("aria-pressed",String(y))}t.onSetView?.(l.dataset.view)});for(let l of i.querySelectorAll("[data-transform-mode]"))d(l,"click",()=>{for(let g of i.querySelectorAll("[data-transform-mode]")){let y=g===l;g.classList.toggle("is-active",y),g.setAttribute("aria-pressed",String(y))}t.onSetTransformMode?.(l.dataset.transformMode)});function m(l,g=!1){for(let y of i.querySelectorAll("[data-selection-action]")){let v=y.dataset.selectionAction,T=v!=="locate";y.disabled=T&&l!=="asset",v==="lock"&&(y.textContent=g?"\u89E3\u9501":"\u9501\u5B9A")}}function _(){let l=c.kind==="asset"?s.assets.find(T=>T.id===c.id):null,g=c.kind==="camera"?s.cameras.find(T=>T.id===c.id):null;if(!l&&!g){let T=s.assets[0]||s.cameras[0];return T?(c={kind:s.assets[0]?"asset":"camera",id:T.id},_()):void 0}for(let T of n.assetList.querySelectorAll("[data-selection-kind]")){let E=T.dataset.assetId||T.dataset.cameraId,R=T.dataset.selectionKind===c.kind&&E===c.id;T.classList.toggle("is-selected",R),T.setAttribute("aria-pressed",String(R))}if(g){n.selectedAsset.innerHTML=`<span>SELECTED CAMERA</span><strong>${Nt(g.name)}</strong><p>${Nt(g.role)} / ${Nt(g.aspect)} / ${Number(g.focalLength).toFixed(0)} MM</p>`,n.transformForm.hidden=!0,n.cameraForm.hidden=!1,n.transformMode.hidden=!0;for(let T of n.cameraForm.querySelectorAll("input[data-camera-kind]"))T.value=Number(g[T.dataset.cameraKind][T.dataset.axis]).toFixed(2);n.cameraForm.elements.namedItem("camera-focal-length").value=Number(g.focalLength).toFixed(0),n.cameraForm.elements.namedItem("camera-aspect").value=g.aspect,m("camera");return}n.selectedAsset.innerHTML=`<span>SELECTED ASSET</span><strong>${Nt(l.name)}</strong><p>${Nt(l.type)}${l.locked?" / \u5DF2\u9501\u5B9A":" / \u53EF\u7F16\u8F91"}</p>`,n.transformForm.hidden=!1,n.cameraForm.hidden=!0,n.transformMode.hidden=!1;let{position:y,rotation:v}=l.transform;for(let T of n.transformForm.querySelectorAll("input[data-transform-kind]")){let E=T.dataset.transformKind,R=T.dataset.axis,L=E==="rotation"?v[R]*180/Math.PI:y[R];T.value=L.toFixed(E==="rotation"?1:2),T.disabled=!!l.locked}n.lockNote.textContent=l.locked?"\u8BE5\u5BF9\u8C61\u5C5E\u4E8E\u623F\u95F4\u57FA\u51C6\uFF0C\u5DF2\u9501\u5B9A\u3002\u4ECD\u53EF\u67E5\u770B\u5C3A\u5BF8\u4E0E\u4F4D\u7F6E\u3002":`\u5C3A\u5BF8 ${l.dimensions.width.toFixed(2)} \xD7 ${l.dimensions.depth.toFixed(2)} \xD7 ${l.dimensions.height.toFixed(2)} m`,n.lockNote.dataset.locked=String(!!l.locked),m("asset",l.locked)}d(n.assetList,"click",l=>{let g=l.target.closest("[data-selection-kind]");g&&(c={kind:g.dataset.selectionKind,id:g.dataset.assetId||g.dataset.cameraId},_(),t.onSelect?.({...c}),c.kind==="asset"&&t.onSelectAsset?.(c.id))}),d(n.transformForm,"change",()=>{if(c.kind!=="asset"||!c.id)return;let l={position:{},rotation:{}};for(let g of n.transformForm.querySelectorAll("input[data-transform-kind]")){let y=Number.parseFloat(g.value),v=g.dataset.transformKind,T=g.dataset.axis;l[v][T]=v==="rotation"?y*Math.PI/180:y}t.onUpdateTransform?.(c.id,l)}),d(n.cameraForm,"change",()=>{if(c.kind!=="camera"||!c.id)return;let l={position:{},target:{}};for(let g of n.cameraForm.querySelectorAll("input[data-camera-kind]"))l[g.dataset.cameraKind][g.dataset.axis]=Number.parseFloat(g.value);l.focalLength=Number.parseFloat(n.cameraForm.elements.namedItem("camera-focal-length").value),l.aspect=n.cameraForm.elements.namedItem("camera-aspect").value,t.onUpdateCamera?.(c.id,l)}),d(n.projectSettings,"change",()=>{let l=g=>Number.parseFloat(n.projectSettings.elements.namedItem(g).value);t.onUpdateProjectSettings?.({room:{width:l("room-width"),depth:l("room-depth"),height:l("room-height"),unit:s.room.unit},budget:{limit:l("budget-limit"),currency:s.budget.currency},aspect:n.projectSettings.elements.namedItem("default-aspect").value})}),d(n.assetLibrary,"click",l=>{let g=l.target.closest("[data-add-asset]");g&&t.onAddAsset?.(g.dataset.addAsset)}),d(i.querySelector(".selection-actions"),"click",l=>{let g=l.target.closest("[data-selection-action]");if(!g||g.disabled||!c.id)return;let y=g.dataset.selectionAction;if(y==="delete"){let v=s.assets.find(T=>T.id===c.id);n.deleteMessage.textContent=`\u201C${v?.name||c.id}\u201D\u4F1A\u4ECE\u5F53\u524D\u5DE5\u7A0B\u79FB\u9664\uFF0C\u4ECD\u53EF\u4F7F\u7528\u64A4\u9500\u6062\u590D\u3002`,u=g,n.deleteDialog.showModal();return}if(y==="locate"&&t.onLocateSelection?.({...c}),y==="duplicate"&&t.onDuplicateSelection?.({...c}),y==="lock"){let v=s.assets.find(T=>T.id===c.id);t.onSetLocked?.({...c},!v?.locked)}}),d(n.deleteConfirm,"click",()=>{n.deleteDialog.close("confirm"),t.onDeleteSelection?.({...c})}),d(n.deleteDialog,"close",()=>{u?.focus(),u=null}),d(n.issueList,"click",l=>{let g=l.target.closest("[data-issue-id]");if(!g)return;let y=r.find(v=>v.id===g.dataset.issueId);y&&t.onFocusIssue?.(y)});function x(){for(let l of n.assetList.querySelectorAll("[data-issue-badge]")){let g=l.dataset.issueAsset||l.dataset.issueCamera,y=r.filter(v=>v.assetIds?.includes(g)||v.cameraId===g).length;l.textContent=y?String(y):"",l.hidden=y===0}}function p(l,g={undoDepth:0,redoDepth:0}){s=l,n.projectName.textContent=l.name,n.assetList.innerHTML=Ju(l),n.assetCount.textContent=String(l.assets.length).padStart(2,"0"),n.statusAssets.textContent=String(l.assets.length),n.roomSize.textContent=`${l.room.width.toFixed(2)} \xD7 ${l.room.depth.toFixed(2)} \xD7 ${l.room.height.toFixed(2)} m`,n.totalCost.textContent=`\xA5${l.assets.reduce((y,v)=>y+Number(v.cost||0),0).toLocaleString("zh-CN")}`,n.projectSettings.elements.namedItem("room-width").value=l.room.width.toFixed(1),n.projectSettings.elements.namedItem("room-depth").value=l.room.depth.toFixed(1),n.projectSettings.elements.namedItem("room-height").value=l.room.height.toFixed(1),n.projectSettings.elements.namedItem("budget-limit").value=Number(l.budget.limit),n.projectSettings.elements.namedItem("default-aspect").value=l.brief.aspect,n.undo.disabled=g.undoDepth===0,n.redo.disabled=g.redoDepth===0,_(),x()}return _(),{refs:n,sync:p,syncIssues(l){r=[...l],n.issueCount.textContent=String(l.length),n.issueSummary.textContent=l.length===0?"\u5F53\u524D\u89C4\u5219\u672A\u53D1\u73B0\u95EE\u9898":`\u53D1\u73B0 ${l.length} \u9879\u9700\u8981\u68C0\u67E5`,n.issueSummary.dataset.state=l.some(g=>g.severity==="critical")?"critical":l.length?"warning":"clear",n.issueList.innerHTML=l.length===0?'<p class="issue-empty">\u8FB9\u754C\u3001\u78B0\u649E\u3001\u673A\u4F4D\u5B89\u5168\u533A\u548C\u9884\u7B97\u5747\u901A\u8FC7\u5F53\u524D\u89C4\u5219\u3002</p>':l.map(g=>`<button class="${g.id===h?"is-active":""}" type="button" data-issue-id="${Nt(g.id)}" data-severity="${Nt(g.severity)}"${g.id===h?' aria-current="true"':""}>
            <span>${g.severity==="critical"?"\u5FC5\u987B\u5904\u7406":g.severity==="warning"?"\u5EFA\u8BAE\u68C0\u67E5":"\u4FE1\u606F"}</span>
            <strong>${Nt(g.message)}</strong>
            <small>${Nt(g.suggestion)}</small>
          </button>`).join(""),x()},syncVersions(l){a=[...l],n.versionList.innerHTML=l.length?l.map((y,v)=>`<article><span>${String(v+1).padStart(2,"0")}</span>${dr(y,"top","\u4E09\u7EF4\u603B\u89C8")}<div><strong>${Nt(y.name)}</strong><small>${Nt(new Date(y.createdAt).toLocaleString("zh-CN",{hour12:!1}))} \xB7 ${y.issueIds?.length||0} \u9879\u95EE\u9898</small></div></article>`).join(""):"<p>\u5C1A\u672A\u4FDD\u5B58\u7248\u672C\u3002</p>";let g=l.map(y=>`<option value="${Nt(y.id)}">${Nt(y.name)}</option>`).join("");n.compareLeft.innerHTML=g,n.compareRight.innerHTML=g,l.length>1&&(n.compareRight.value=l.at(-1).id)},showComparison(l,g,y){n.comparisonResult.innerHTML=`<div class="comparison-head"><span>${Nt(g.name)}</span><i aria-hidden="true">\u2192</i><span>${Nt(y.name)}</span></div>
        <div class="comparison-contact-sheet">
          <div>${dr(g,"top","\u4E09\u7EF4\u603B\u89C8")}${dr(g,"primary","\u4E3B\u673A\u4F4D")}</div>
          <div>${dr(y,"top","\u4E09\u7EF4\u603B\u89C8")}${dr(y,"primary","\u4E3B\u673A\u4F4D")}</div>
        </div>
        <dl>
          <div><dt>\u5BF9\u8C61\u53D8\u5316</dt><dd>${l.changedAssetCount}</dd></div>
          <div><dt>\u9884\u7B97\u5DEE\u989D</dt><dd>${l.budgetDelta>=0?"+":"\u2212"}\xA5${Math.abs(l.budgetDelta).toLocaleString("zh-CN")}</dd></div>
          <div><dt>\u5DF2\u89E3\u51B3</dt><dd>${l.resolvedIssueIds.length}</dd></div>
          <div><dt>\u65B0\u589E\u95EE\u9898</dt><dd>${l.newIssueIds.length}</dd></div>
        </dl>
        <div class="comparison-evidence">
          ${sc("CHANGED OBJECTS / \u53D8\u5316\u5BF9\u8C61",l.changedAssets,"\u5BF9\u8C61\u6CA1\u6709\u53D8\u5316")}
          ${sc("RESOLVED / \u5DF2\u89E3\u51B3",l.resolvedIssues,"\u6CA1\u6709\u5DF2\u89E3\u51B3\u95EE\u9898")}
          ${sc("NEW ISSUES / \u65B0\u589E\u95EE\u9898",l.newIssues,"\u6CA1\u6709\u65B0\u589E\u95EE\u9898")}
        </div>
        <p>${l.roomChanged?"\u623F\u95F4\u5C3A\u5BF8\u6709\u53D8\u5316\u3002":"\u623F\u95F4\u5C3A\u5BF8\u672A\u53D8\u5316\u3002"}${l.cameraChanged?" \u673A\u4F4D\u53C2\u6570\u6709\u53D8\u5316\u3002":" \u673A\u4F4D\u53C2\u6570\u672A\u53D8\u5316\u3002"} \u8FD9\u91CC\u53EA\u5C55\u793A\u5DEE\u5F02\uFF0C\u4E0D\u81EA\u52A8\u5224\u65AD\u54EA\u4E2A\u65B9\u6848\u66F4\u4F18\u3002</p>`},showViewportFailure(l,g){n.viewportFallbackMessage.textContent=l,o=typeof g=="function"?g:null,n.retryViewport.hidden=!o},selectAsset(l){c={kind:"asset",id:l},_()},select(l){c={...l},_()},setActiveIssue(l){h=l||null;for(let g of n.issueList.querySelectorAll("[data-issue-id]")){let y=g.dataset.issueId===h;g.classList.toggle("is-active",y),y?g.setAttribute("aria-current","true"):g.removeAttribute("aria-current")}},setStatus(l,g="neutral"){n.saveState.textContent=l,n.saveState.dataset.tone=g},destroy(){f.splice(0).forEach(l=>l())}}}function fr(i,t,e){return Number.isFinite(t)?Object.freeze({label:i,value:t,unit:e}):null}function Ni(i,t,e,n){if(!i?.id)throw new TypeError("\u95EE\u9898\u8BC1\u636E\u7F3A\u5C11\u552F\u4E00\u6807\u8BC6");return Object.freeze({id:i.id,type:i.type,kind:t,assetIds:Object.freeze([...i.assetIds||[]]),cameraId:i.cameraId||null,message:String(i.message||"\u9700\u8981\u68C0\u67E5\u5DE5\u7A0B\u95EE\u9898"),suggestion:String(i.suggestion||"\u68C0\u67E5\u5173\u8054\u5BF9\u8C61\u4E0E\u5DE5\u7A0B\u53C2\u6570"),evidence:Object.freeze({...i.evidence||{}}),measurement:e,visual:Object.freeze({showInScene:!0,showCollisionBoxes:!1,showBoundaryMeasure:!1,showLineOfSight:!1,safeZone:null,...n})})}function rc(i){let t=i?.evidence||{};switch(i?.type){case"collision":return Ni(i,"collision",fr("\u91CD\u53E0",t.overlapDepth,"m"),{showCollisionBoxes:!0});case"boundary":return Ni(i,"boundary",fr("\u8D8A\u754C",t.outsideDistance,"m"),{showBoundaryMeasure:!0});case"camera-obstruction":return Ni(i,"line-of-sight",fr("\u8DDD\u89C6\u7EBF\u4E2D\u5FC3",t.lineDistance,"m"),{showLineOfSight:!0});case"platform-overlay":return Ni(i,"safe-zone",fr("\u753B\u9762\u6A2A\u5411\u4F4D\u7F6E",t.normalizedX,"normalized"),{showInScene:!1,safeZone:"platform"});case"camera-coverage":return Ni(i,"camera-coverage",null,{showLineOfSight:!0});case"budget":return Ni(i,"budget",fr("\u8D85\u51FA\u9884\u7B97",t.overBy,"CNY"),{showInScene:!1});default:return Ni(i,"neutral",null,{})}}function ju(i=[],t=[]){let e=new Set(i.map(s=>s?.id).filter(Boolean)),n=new Set(t.map(s=>s?.id).filter(Boolean));return Object.freeze({resolvedIds:Object.freeze([...e].filter(s=>!n.has(s)).sort()),persistentIds:Object.freeze([...n].filter(s=>e.has(s)).sort()),newIds:Object.freeze([...n].filter(s=>!e.has(s)).sort())})}function Qu(i=[]){let t=[...i],e=null;return{focus(n){return e=t.some(s=>s.id===n)?n:null,t.find(s=>s.id===e)||null},update(n=[]){let s=[...n],r=ju(t,s),a=e&&r.resolvedIds.includes(e)?t.find(o=>o.id===e):null;return a&&(e=null),t=s,Object.freeze({diff:r,activeIssue:s.find(o=>o.id===e)||null,resolvedMessage:a?`\u5DF2\u89E3\u51B3\uFF1A${a.message}`:null})},getActiveIssue(){return t.find(n=>n.id===e)||null},clear(){e=null}}}var ys=document.querySelector("[data-set-flow-app]"),td=document.querySelector("[data-build-state]"),Mo=document.querySelector("[data-build-state-label]");function z_(i,t,e="application/json"){let n=URL.createObjectURL(new Blob([t],{type:e})),s=document.createElement("a");s.href=n,s.download=i,s.click(),setTimeout(()=>URL.revokeObjectURL(n),0)}function k_(i,t){let e=document.createElement("a");e.href=t,e.download=i,e.click()}function H_(i,{maxWidth:t=720,maxHeight:e=520,quality:n=.72}={}){return i?new Promise(s=>{let r=new Image;r.onload=()=>{let a=Math.min(1,t/r.naturalWidth,e/r.naturalHeight),o=document.createElement("canvas");o.width=Math.max(1,Math.round(r.naturalWidth*a)),o.height=Math.max(1,Math.round(r.naturalHeight*a)),o.getContext("2d")?.drawImage(r,0,0,o.width,o.height),s(o.toDataURL("image/jpeg",n))},r.onerror=()=>s(i),r.src=i}):Promise.resolve(null)}async function V_(){let i=Du(),t,e=Uu({repository:i,createFallback:vc,onState(p){if(!t)return;let l={dirty:"\u6709\u672A\u4FDD\u5B58\u4FEE\u6539 \xB7 \u6B63\u5728\u7B49\u5F85\u81EA\u52A8\u4FDD\u5B58",saving:"\u6B63\u5728\u4FDD\u5B58\u5230\u672C\u673A\u2026",saved:"\u5DF2\u4FDD\u5B58\u5230\u672C\u673A"};t.setStatus(p.status==="error"?`\u4FDD\u5B58\u5931\u8D25\uFF1A${p.message}`:l[p.status]||"\u672C\u5730\u5DE5\u7A0B\u5DF2\u5C31\u7EEA",p.status==="error"?"error":p.status==="saved"?"success":"neutral")}}),n=await e.restore(),s=Zu(n.project),r=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||!1,a=xr(s.getState()),o=Qu(a),c=Ou({quality:s.getState().settings.quality,devicePixelRatio:window.devicePixelRatio,hardwareConcurrency:navigator.hardwareConcurrency,reducedMotion:r,assetCount:s.getState().assets.length});document.documentElement.dataset.setFlowQuality=c.quality;let h,u,f,d=s.getState().assets.length;t=Ku(ys,{async onSave(){await e.saveNow(s.getState())},onUndo(){s.undo()?t.setStatus("\u5DF2\u64A4\u9500\u4E0A\u4E00\u6B65","success"):t.setStatus("\u5F53\u524D\u6CA1\u6709\u53EF\u64A4\u9500\u7684\u4FEE\u6539")},onRedo(){s.redo()?t.setStatus("\u5DF2\u91CD\u505A\u4E0A\u4E00\u6B65","success"):t.setStatus("\u5F53\u524D\u6CA1\u6709\u53EF\u91CD\u505A\u7684\u4FEE\u6539")},onExport(){try{let p=f?.capture()||{},l=Rc(s.getState(),{issues:xr(s.getState()),captures:{top:h?.capture(),...p}});if(!l.ok){t.setStatus("\u5BFC\u51FA\u5931\u8D25\uFF1A\u5DE5\u7A0B\u6570\u636E\u4E0D\u5B8C\u6574","error");return}l.files.forEach((g,y)=>{window.setTimeout(()=>{g.dataUrl?k_(g.filename,g.dataUrl):z_(g.filename,g.text,g.mime)},y*90)}),t.setStatus(`\u5DF2\u751F\u6210\u6267\u884C\u5305 \xB7 ${l.files.length} \u4E2A\u6587\u4EF6`,"success")}catch(p){t.setStatus(`\u5BFC\u51FA\u5931\u8D25\uFF1A${p instanceof Error?p.message:"\u6D4F\u89C8\u5668\u65E0\u6CD5\u751F\u6210\u6587\u4EF6"}`,"error")}},onSelect(p){p.kind==="asset"?(h?.setSelectedAsset(p.id),u?.select(p.id),t.setStatus(`\u5DF2\u9009\u62E9 ${p.id}`)):(h?.setSelectedAsset(null),u?.select(null),t.setStatus(`\u6B63\u5728\u8BBE\u7F6E\u673A\u4F4D ${p.id}`))},onUpdateProjectSettings(p){let l=s.updateProjectSettings(p);t.setStatus(l.ok?"\u5DE5\u7A0B\u89C4\u683C\u5DF2\u66F4\u65B0":l.errors[0]?.message||"\u5DE5\u7A0B\u89C4\u683C\u65E0\u6548",l.ok?"success":"error")},onAddAsset(p){d+=1;let l=s.getState(),g=d%5,y=pc(p,{id:`${p}-${Date.now()}-${d}`,position:{x:-1+g*.45,z:.35+Math.floor(g/3)*.45}}),v=s.addAsset(y);v.ok&&(t.selectAsset(y.id),h?.setSelectedAsset(y.id),u?.select(y.id)),t.setStatus(v.ok?`\u5DF2\u6DFB\u52A0 ${y.name}`:v.errors[0]?.message||"\u6DFB\u52A0\u8D44\u4EA7\u5931\u8D25",v.ok?"success":"error")},onDuplicateSelection(p){if(p.kind!=="asset")return;let l=s.duplicateAsset(p.id);l.ok&&(t.selectAsset(l.assetId),h?.setSelectedAsset(l.assetId),u?.select(l.assetId)),t.setStatus(l.ok?"\u8D44\u4EA7\u526F\u672C\u5DF2\u52A0\u5165\u573A\u666F":l.errors[0]?.message||"\u590D\u5236\u5931\u8D25",l.ok?"success":"error")},onDeleteSelection(p){if(p.kind!=="asset")return;let l=s.removeAsset(p.id);t.setStatus(l.ok?"\u8D44\u4EA7\u5DF2\u79FB\u9664\uFF0C\u53EF\u4F7F\u7528\u64A4\u9500\u6062\u590D":l.errors[0]?.message||"\u5220\u9664\u5931\u8D25",l.ok?"success":"error")},onSetLocked(p,l){if(p.kind!=="asset")return;let g=s.setAssetLocked(p.id,l);t.setStatus(g.ok?l?"\u8D44\u4EA7\u5DF2\u9501\u5B9A":"\u8D44\u4EA7\u5DF2\u89E3\u9501":g.errors[0]?.message||"\u9501\u5B9A\u72B6\u6001\u4FEE\u6539\u5931\u8D25",g.ok?"success":"error")},onLocateSelection(p){p.kind==="asset"?(h?.focusAsset(p.id),t.setStatus("\u89C6\u53E3\u5DF2\u805A\u7126\u6240\u9009\u8D44\u4EA7","success")):t.setStatus("\u5DF2\u5728\u53F3\u4FA7\u76D1\u770B\u533A\u6807\u51FA\u6240\u9009\u673A\u4F4D")},onUpdateCamera(p,l){let g=s.updateCamera(p,l);t.setStatus(g.ok?"\u673A\u4F4D\u53C2\u6570\u5DF2\u66F4\u65B0":g.errors[0]?.message||"\u673A\u4F4D\u53C2\u6570\u65E0\u6548",g.ok?"success":"error")},onSetView(p){h?.setView(p),t.setStatus(`\u89C6\u56FE\u5DF2\u5207\u6362\uFF1A${p}`)},onSetTransformMode(p){u?.setMode(p)&&t.setStatus(p==="rotate"?"\u53D8\u6362\u6A21\u5F0F\uFF1A\u65CB\u8F6C":"\u53D8\u6362\u6A21\u5F0F\uFF1A\u79FB\u52A8")},onUpdateTransform(p,l){let g=s.getState().assets.find(v=>v.id===p);if(!g||g.locked){t.setStatus("\u9501\u5B9A\u5BF9\u8C61\u4E0D\u80FD\u4FEE\u6539","error"),t.sync(s.getState(),s.historySnapshot());return}let y=s.updateAssetTransform(p,go(l,{grid:.1,minY:g.dimensions.height/2}));t.setStatus(y.ok?`\u5DF2\u66F4\u65B0 ${g.name} \xB7 \u5438\u9644 0.10 m`:`\u4FEE\u6539\u5931\u8D25\uFF1A${y.errors[0]?.message||"\u6570\u503C\u65E0\u6548"}`,y.ok?"success":"error")},onFocusIssue(p){o.focus(p.id);let l=rc(p),g=p.assetIds[0]||null;g&&(t.selectAsset(g),u?.select(g),h?.setSelectedAsset(g)),h?.focusEvidence(l,{animate:!r}),f?.setActive(l.cameraId),f?.highlightSafeZone(l.visual.safeZone),t.setActiveIssue(p.id),t.setStatus(p.message,p.severity==="critical"?"error":"neutral")},async onSaveVersion(p){t.setStatus("\u6B63\u5728\u91C7\u96C6\u4E09\u7EF4\u603B\u89C8\u4E0E\u8282\u76EE\u673A\u4F4D\u2026");let l=f?.capture()||{},g={top:h?.capture()||null,primary:l["camera-primary"]||null,detail:l["camera-detail"]||null},y=Object.fromEntries((await Promise.all(Object.entries(g).map(async([T,E])=>[T,await H_(E)]))).filter(([,T])=>T)),v=s.saveVersion(p,{issues:a,previews:y});t.setStatus(v.ok?`\u5DF2\u4FDD\u5B58\u7248\u672C\uFF1A${p}`:v.errors[0]?.message||"\u4FDD\u5B58\u7248\u672C\u5931\u8D25",v.ok?"success":"error")},onCompareVersions(p,l){let g=s.getState().versions,y=g.find(T=>T.id===p),v=g.find(T=>T.id===l);if(!y||!v||y.id===v.id){t.setStatus("\u8BF7\u9009\u62E9\u4E24\u4E2A\u4E0D\u540C\u7684\u7248\u672C\u8FDB\u884C\u6BD4\u8F83","error");return}t.showComparison($u(y,v),y,v),t.setStatus(`\u6B63\u5728\u6BD4\u8F83 ${y.name} \u4E0E ${v.name}`,"success")}},s.getState()),t.sync(s.getState(),s.historySnapshot()),t.syncIssues(a),t.syncVersions(s.getState().versions),t.setStatus(n.message,n.source==="storage-error"?"error":"success");let m=ys.querySelector("[data-studio-canvas]");if(m)try{h=Xu({canvas:m,policy:c,onDragStart(l){let g=s.getState().assets.find(y=>y.id===l);return!g||g.locked?(t.setStatus("\u9501\u5B9A\u5BF9\u8C61\u4E0D\u80FD\u76F4\u63A5\u62D6\u52A8\uFF0C\u8BF7\u5148\u89E3\u9501","error"),!1):(u?.select(l),h&&(h.controls.enabled=!1),t.setStatus(`\u6B63\u5728\u62D6\u52A8 ${g.name} \xB7 \u677E\u5F00\u5B8C\u6210\u79FB\u52A8`),!0)},onDragEnd(l){h&&(h.controls.enabled=!0);let g=s.getState().assets.find(E=>E.id===l),y=h?.getAssetObject(l);if(!g||!y)return;let v=go({position:{x:y.position.x,y:y.position.y,z:y.position.z},rotation:{x:g.transform.rotation.x,y:g.transform.rotation.y,z:g.transform.rotation.z}},{grid:.1,minY:g.dimensions.height/2}),T=s.updateAssetTransform(l,v);T.ok?t.setStatus(`\u5DF2\u79FB\u52A8 ${g.name} \xB7 \u5438\u9644 0.10 m`,"success"):(h?.sync(s.getState()),t.setStatus(`\u79FB\u52A8\u5931\u8D25\uFF1A${T.errors[0]?.message||"\u5DE5\u7A0B\u7EA6\u675F\u4E0D\u5141\u8BB8\u8BE5\u4F4D\u7F6E"}`,"error"))},onContextLost(){m.closest(".drafting-stage")?.removeAttribute("data-viewport"),t.showViewportFailure("\u4E09\u7EF4\u4E0A\u4E0B\u6587\u5DF2\u4E2D\u65AD\u3002\u5DE5\u7A0B\u6570\u636E\u4ECD\u7136\u5B89\u5168\uFF0C\u53EF\u4EE5\u91CD\u65B0\u52A0\u8F7D\u89C6\u53E3\u3002",()=>window.location.reload()),t.setStatus("\u4E09\u7EF4\u89C6\u53E3\u5DF2\u4E2D\u65AD","error")},onContextRestored(){m.closest(".drafting-stage")?.setAttribute("data-viewport","ready"),t.setStatus("\u4E09\u7EF4\u89C6\u53E3\u5DF2\u6062\u590D","success")},onSelect(l){if(!l){t.setStatus("\u672A\u9009\u62E9\u5BF9\u8C61");return}t.selectAsset(l),u?.select(l),t.setStatus(`\u5DF2\u9009\u62E9 ${l}`)}}),h.sync(s.getState());let p=s.getState().assets.find(l=>!l.locked)?.id||s.getState().assets[0]?.id||null;h.setSelectedAsset(p),u=Lu({studio:h,store:s,onSelectionChange(l){l&&t.selectAsset(l)},onStatus(l,g){t.setStatus(l,g)}}),u.select(p),p&&t.selectAsset(p),f=Fu({root:ys,scene:h.scene,cameras:s.getState().cameras,policy:c}),m.closest(".drafting-stage")?.setAttribute("data-viewport","ready")}catch(p){t.showViewportFailure(`\u4E09\u7EF4\u89C6\u53E3\u542F\u52A8\u5931\u8D25\uFF1A${p instanceof Error?p.message:"\u672A\u77E5\u9519\u8BEF"}`,()=>window.location.reload()),t.setStatus("\u4E09\u7EF4\u89C6\u53E3\u672A\u80FD\u542F\u52A8","error")}let _=!1;s.subscribe((p,l)=>{let g=xr(p),y=o.update(g);if(a=g,t.sync(p,l),t.syncIssues(g),t.syncVersions(p.versions),h?.sync(p),f?.update(p.cameras),y.resolvedMessage)h?.clearEvidence(),f?.setActive(null),f?.highlightSafeZone(null),t.setActiveIssue(null),queueMicrotask(()=>t.setStatus(y.resolvedMessage,"success"));else if(y.activeIssue){let v=rc(y.activeIssue);h?.focusEvidence(v,{animate:!1}),f?.setActive(v.cameraId),f?.highlightSafeZone(v.visual.safeZone),t.setActiveIssue(y.activeIssue.id)}_&&e.markChanged(p)}),_=!0;let x=p=>{e.isDirty()&&(p.preventDefault(),p.returnValue="")};window.addEventListener("beforeunload",x),window.addEventListener("pagehide",()=>{f?.dispose(),u?.dispose(),h?.dispose(),e.dispose()},{once:!0}),ys.dataset.runtime="ready",td&&td.classList.add("is-ready"),Mo&&(Mo.textContent=n.source==="local"?"Local project restored":"Workspace ready")}ys&&V_().catch(i=>{Mo&&(Mo.textContent="Workspace failed"),ys.innerHTML=`<p role="alert">SET//FLOW \u542F\u52A8\u5931\u8D25\uFF1A${i instanceof Error?i.message:"\u672A\u77E5\u9519\u8BEF"}</p>`});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
