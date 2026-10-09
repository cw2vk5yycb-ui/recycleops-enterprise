'use strict';
const LS='recycleops.enterprise.v1';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NOW=new Date();
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const T=iso(NOW);
const dAgo=n=>{const d=new Date(NOW);d.setDate(d.getDate()-n);return iso(d)};
const DAYS=Array.from({length:14},(_,i)=>dAgo(13-i));
const fD=s=>s?new Date(s+'T12:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short'}):'–';
const fN=(n,d=0)=>Number(n||0).toLocaleString('en-GB',{minimumFractionDigits:d,maximumFractionDigits:d});
const gbp=n=>'£'+fN(n,0);
const sum=(a,f)=>a.reduce((s,x)=>s+(f?f(x):x),0);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hhmm=(t)=>new Date(t||Date.now()).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
const ic=(n,c='')=>`<i data-lucide="${n}" class="${c}"></i>`;
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
let uidN=0;const uid=()=>'r'+Date.now().toString(36)+(uidN++).toString(36);

const MATS=['Ferrous','Non-Ferrous','Plastics','E-Waste','Paper'];
const ZONES={A:'Zone A · Tipping bay',B:'Zone B · Ferrous stockpile',C:'Zone C · Shear & baler hall',D:'Zone D · Picking line',E:'Zone E · Loading & weighbridge',W:'Workshop'};
const ROLES=['Operator','Supervisor','Plant Manager','Owner'];
const PERM={
 costs:{l:'See fuel prices and running costs',r:[2,3]},
 deliveries:{l:'Record diesel deliveries',r:[1,2,3]},
 schedule:{l:'Schedule and close maintenance work',r:[1,2,3]},
 predictive:{l:'Predictive maintenance alerts',r:[1,2,3]},
 weighbridge:{l:'Operate the weighbridge',r:[1,2,3]},
 staff:{l:'Attendance, shifts, tasks and voice log',r:[1,2,3]},
 approve:{l:'Approve or reject permits to work',r:[2,3]},
 del:{l:'Delete logged records',r:[2,3]},
 reports:{l:'Executive reports',r:[2,3]},
 multisite:{l:'Cross-site comparison',r:[3]}};
const BASE={log:'Log production, fuel use, breakdowns and incidents',checks:'Complete forklift checks and request permits',fleet:'View fleet status and scan machine QR codes'};
const FORK_ITEMS=['Brakes: service and parking','Horn','Hydraulics: mast, tilt, no leaks','Steering','Tyres and wheel nuts','Forks, chains and backrest','Lights and beacon','Seat belt','Reversing alarm','Fluid levels: fuel, oil, coolant'];

let S;
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}};
function load(){try{const r=localStorage.getItem(LS);if(r){const o=JSON.parse(r);if(o&&o.v===1)return o}}catch(e){}return seed()}
const can=p=>PERM[p].r.includes(ROLES.indexOf(S.ui.role));
const here=a=>a.filter(x=>x.site===S.ui.site);
const mach=id=>S.machines.find(m=>m.id===id);
const siteName=id=>(S.sites.find(s=>s.id===id)||{}).name||id;

function seed(){
 const r=rng(11),pick=a=>a[Math.floor(r()*a.length)],r1=n=>Math.round(n*10)/10;
 const s={v:1,ui:{role:'Plant Manager',site:'CDF',tab:'overview',sub:{},online:true},queue:0,lastSync:Date.now(),
  sites:[{id:'CDF',name:'Cardiff Yard',tank:25000,opening:6500,f:1},{id:'NPT',name:'Newport Yard',tank:20000,opening:5200,f:.7},{id:'SWA',name:'Swansea Yard',tank:20000,opening:4800,f:.5}],
  machines:[],deliveries:[],usage:[],maint:[],production:[],tickets:[],staff:[],attendance:{},tasks:[],chat:[],checks:[],permits:[],envlogs:[],incidents:[],reports:[],targets:{}};
 const MD=[['EX-01','Material handler 35t','Excavator','B',1,19,6420],['EX-02','Excavator 22t with grab','Excavator','A',1,15,8105],['SH-01','Hydraulic scrap shear 1000t','Shear','C',0,0,11230],['CV-01','Infeed conveyor','Conveyor Belt','D',0,0,14980],['CV-02','Picking line conveyor','Conveyor Belt','D',0,0,13310],['BL-01','Two-ram baler','Baler','C',0,0,9240],['WL-01','Wheel loader 18t','Wheel Loader','A',1,14,5230],['FL-01','Forklift 3.5t diesel','Forklift','E',1,3.2,3980],['FL-02','Forklift 5t diesel','Forklift','E',1,4.1,2710],['GN-01','Generator 250 kVA','Generator','C',1,22,7655]];
 const pickM={CDF:[0,1,2,3,4,5,6,7,8,9],NPT:[0,2,3,5,6,7,9],SWA:[1,2,4,5,6,7,9]};
 const base={Ferrous:120,'Non-Ferrous':28,Plastics:16,'E-Waste':9,Paper:22};
 const sup=['Harbour Fuel Supplies','Valley Bulk Fuels'];
 const people={CDF:[['Gareth Pryce','Supervisor','A','Morning'],['Anwen Bowen','Weighbridge clerk','A','Morning'],['Tomasz Kowal','Shear operator','A','Morning'],['Dylan Rees','Excavator operator','A','Morning'],['Priya Nair','Picker','A','Morning'],['Marcus Okafor','Forklift driver','A','Morning'],['Sian Llewellyn','Fitter','B','Afternoon'],['Ieuan Hopkins','Baler operator','B','Afternoon'],['Kofi Mensah','Picker','B','Afternoon'],['Rhodri Vaughan','Excavator operator','B','Afternoon'],['Elena Popa','Forklift driver','C','Night'],['Huw Griffiths','Fitter','C','Night']],
  NPT:[['Carys Morgan','Supervisor','A','Morning'],['Owen Jenkins','Excavator operator','A','Morning'],['Aisha Rahman','Picker','A','Morning'],['Lukas Novak','Forklift driver','B','Afternoon'],['Bethan Price','Baler operator','B','Afternoon'],['Nia Roberts','Fitter','C','Night']],
  SWA:[['Emyr Thomas','Supervisor','A','Morning'],['Jakub Zielinski','Shear operator','A','Morning'],['Megan Howells','Picker','B','Afternoon'],['Samuel Adeyemi','Forklift driver','B','Afternoon'],['Rhian Parry','Fitter','C','Night']]};
 s.sites.forEach((st,si)=>{
  const id=st.id;
  s.targets[id]={};MATS.forEach(m=>s.targets[id][m]=Math.round(base[m]*st.f));
  pickM[id].forEach(i=>{const[code,name,type,zone,diesel,lph,hrs]=MD[i],every=diesel?250:500,hours=hrs-si*640;
   s.machines.push({id:id+'-'+code,site:id,code,name,type,zone,diesel:!!diesel,lph,hours,serviceEvery:every,lastServiceAt:Math.round(hours-(.15+r()*.5)*every),greaseEvery:40,lastGreaseAt:Math.round(hours-4-r()*28),live:r()<.75?'Running':'Idle',wear:Math.round(r()*8)})});
  // fuel use, 14 days
  DAYS.forEach((d,di)=>s.machines.filter(m=>m.site===id&&m.diesel).forEach(m=>{
   let h=m.type==='Generator'?8+r()*2:m.type==='Forklift'?3+r()*3:5+r()*4;if(d===T)h*=.6;
   const anomaly=id==='CDF'&&m.code==='EX-02'&&di>=11?1.38:1;
   s.usage.push({id:uid(),site:id,date:d,machineId:m.id,hours:r1(h),litres:Math.round(h*m.lph*(.93+r()*.14)*anomaly)})}));
  [[12,9000],[5,8000]].forEach(([ago,l],k)=>{const litres=Math.round(l*st.f/100)*100;s.deliveries.push({id:uid(),site:id,date:dAgo(ago),supplier:sup[k],litres,cost:Math.round(litres*(.94+r()*.05)),receivedBy:people[id][0][0]})});
  DAYS.forEach(d=>MATS.forEach(m=>{const perf=id==='SWA'?.74+r()*.24:.84+r()*.3;s.production.push({id:uid(),site:id,date:d,shift:pick(['Morning','Morning','Afternoon']),team:pick(['A','A','B','B','C']),material:m,tonnes:r1(s.targets[id][m]*perf*(d===T?.62:1))})}));
  people[id].forEach(([name,role,team,shift],k)=>s.staff.push({id:id+'-P'+k,site:id,name,role,team,shift}));
  const P=people[id].map(p=>p[0]);
  s.incidents.push({id:uid(),site:id,date:dAgo(9+si*4),type:'Near miss',severity:'Low',location:ZONES.E,desc:'Pedestrian stepped into the forklift route at the loading bay.',action:'Barrier repositioned and route repainted.',status:'Closed',by:P[0]});
  s.envlogs.push({id:uid(),site:id,date:dAgo(2),category:'Dust monitoring (PM10)',reading:(28+si*6)+' µg/m³ at boundary',status:'Compliant',notes:'Below the 50 µg/m³ daily limit.',by:P[0]});
  for(let k=0;k<(id==='CDF'?4:2);k++){const inb=k%3!==2,tare=13200+Math.round(r()*30)*100,net=(inb?9+r()*14:18+r()*8)*1000;
   s.tickets.push({id:uid(),site:id,date:T,time:String(7+k*1)+':'+String(10+Math.floor(r()*45)),ticket:'WB-'+(4100+si*300+k),reg:pick(['CU','CV','CP','WN'])+(60+Math.floor(r()*14))+' '+pick(['HRT','BXL','DKO','FJN','TYE']),haulier:pick(['Taff Skip Hire','Severn Metals Haulage','Glamorgan Demolition','Gwent Waste Carriers']),dir:inb?'Inbound':'Outbound',material:inb?pick(['Mixed scrap','Mixed scrap','Light iron','WEEE']):pick(['Ferrous','Non-Ferrous','Paper']),gross:Math.round((tare+net)/20)*20,tare,net:Math.round(net/20)*20})}
 });
 const M=c=>'CDF-'+c,set=(id,o)=>Object.assign(s.machines.find(m=>m.id===id),o);
 let m=s.machines.find(x=>x.id===M('SH-01'));set(m.id,{lastServiceAt:m.hours-565});
 m=s.machines.find(x=>x.id===M('WL-01'));set(m.id,{lastGreaseAt:m.hours-58});
 m=s.machines.find(x=>x.id==='NPT-BL-01');set(m.id,{lastGreaseAt:m.hours-51});
 m=s.machines.find(x=>x.id==='SWA-GN-01');set(m.id,{lastServiceAt:m.hours-290});
 const mt=(site,code,type,due,status,notes,by,doneOn)=>s.maint.push({id:uid(),site,machineId:site+'-'+code,type,due,status,notes,by,doneOn:doneOn||''});
 mt('CDF','CV-02','Breakdown',T,'In progress','Belt tear at the tail drum. Splice kit ordered, fitter on site.','Sian Llewellyn');
 mt('CDF','SH-01','Service',dAgo(3),'Scheduled','500-hour service: hydraulic oil sample, blade pins, filters.','Huw Griffiths');
 mt('CDF','WL-01','Greasing',T,'Scheduled','Centre pivot, bucket pins and prop shaft.','Dylan Rees');
 mt('CDF','EX-01','Inspection',dAgo(-2),'Scheduled','Weekly inspection: slew ring, grab hoses, cab guards.','Sian Llewellyn');
 mt('CDF','BL-01','Inspection',dAgo(-5),'Scheduled','Ram seals and wire-tie unit.','Huw Griffiths');
 mt('CDF','EX-01','Service',dAgo(9),'Done','250-hour service completed.','Sian Llewellyn',dAgo(9));
 mt('CDF','EX-02','Breakdown',dAgo(18),'Done','Burst hydraulic hose on the grab. Hose replaced.','Huw Griffiths',dAgo(17));
 mt('CDF','GN-01','Service',dAgo(22),'Done','Oil, fuel and air filters changed.','Sian Llewellyn',dAgo(22));
 mt('NPT','BL-01','Greasing',T,'Scheduled','Main ram guides and door hinges.','Nia Roberts');
 mt('NPT','EX-01','Inspection',dAgo(-1),'Scheduled','Weekly inspection.','Nia Roberts');
 mt('SWA','GN-01','Service',dAgo(1),'Scheduled','250-hour service.','Rhian Parry');
 mt('SWA','CV-02','Inspection',dAgo(-3),'Scheduled','Belt tracking and idlers.','Rhian Parry');
 // attendance, last 7 days
 for(let i=0;i<7;i++){const d=dAgo(i);s.attendance[d]={};s.staff.forEach(p=>{const x=r();s.attendance[d][p.id]=x<.86?'P':x<.94?'L':'A'})}
 [['CDF-P2','Shear the heavy melt stockpile in Zone B',1],['CDF-P3','Load two outbound ferrous wagons before 14:00',0],['CDF-P4','Clear contamination from the paper picking line',1],['CDF-P6','Fit the splice kit on CV-02',0],['CDF-P5','Pre-shift checks on both forklifts',1],['NPT-P1','Feed the baler with the aluminium cans bay',0],['SWA-P1','Cut down the cable drums',0]].forEach(([staffId,text,done])=>s.tasks.push({id:uid(),site:staffId.slice(0,3),date:T,staffId,text,done:!!done}));
 s.checks.push({id:uid(),site:'CDF',date:T,machineId:M('FL-01'),when:'Pre-shift',operator:'Marcus Okafor',fails:[],result:'Pass'});
 s.checks.push({id:uid(),site:'CDF',date:dAgo(1),machineId:M('FL-02'),when:'Post-shift',operator:'Elena Popa',fails:['Reversing alarm'],result:'Fail'});
 const pm=(type,location,requester,status,work,approver)=>s.permits.push({id:uid(),site:'CDF',date:T,type,location,requester,status,work,approver:approver||''});
 pm('Hot Work',ZONES.C,'Sian Llewellyn','Pending','Weld a new wear plate on the shear hopper. Fire watch for 60 minutes after.');
 pm('Working at Heights',ZONES.D,'Huw Griffiths','Approved','Replace idlers on CV-01 from the MEWP. Harness and exclusion zone.','Gareth Pryce');
 pm('Confined Space',ZONES.A,'Sian Llewellyn','Closed','Clean the interceptor chamber. Gas monitor and rescue tripod.','Gareth Pryce');
 s.envlogs.push({id:uid(),site:'CDF',date:dAgo(1),category:'Noise at site boundary',reading:'63 dB LAeq',status:'Compliant',notes:'Shear running, wind from the south-west.',by:'Gareth Pryce'});
 s.envlogs.push({id:uid(),site:'CDF',date:dAgo(4),category:'Surface water interceptor',reading:'Oil layer 12 mm',status:'Action needed',notes:'Book a tanker to empty before the next audit.',by:'Gareth Pryce'});
 s.envlogs.push({id:uid(),site:'CDF',date:dAgo(6),category:'Stockpile height and fire breaks',reading:'Tallest pile 3.6 m, 6 m breaks',status:'Compliant',notes:'Within the fire prevention plan limits.',by:'Gareth Pryce'});
 s.incidents.push({id:uid(),site:'CDF',date:dAgo(2),type:'Near miss',severity:'Medium',location:ZONES.B,desc:'Gas cylinder found in a mixed scrap load before it reached the shear.',action:'Load quarantined. Supplier notified. Toolbox talk on cylinder spotting.',status:'Open',by:'Tomasz Kowal'});
 s.incidents.push({id:uid(),site:'CDF',date:dAgo(6),type:'First aid',severity:'Low',location:ZONES.D,desc:'Cut to forearm from a sharp edge on the picking line.',action:'Dressed on site. Cut-resistant sleeves issued.',status:'Closed',by:'Priya Nair'});
 s.chat.push({who:'bot',t:Date.now(),text:'Send a quick update and I will file it. Try: "Log 14 tonnes processed by Team A" or "Breakdown on EX-01 hydraulic leak".'});
 return s;
}

/* ---------- calculations ---------- */
function mStatus(m){
 if(S.maint.some(x=>x.machineId===m.id&&x.type==='Breakdown'&&x.status!=='Done'))return'In Repair';
 if(m.hours-m.lastServiceAt>m.serviceEvery||S.maint.some(x=>x.machineId===m.id&&x.status!=='Done'&&x.due<T))return'Overdue';
 if(m.hours-m.lastGreaseAt>m.greaseEvery)return'Needs Greasing';
 return'Operational'}
const liveOf=m=>mStatus(m)==='In Repair'?'Down':m.live;
const COMP={fuel:{Excavator:'fuel injectors or hydraulic pump',"Wheel Loader":'injectors or torque converter',Generator:'injectors or air filter',Forklift:'fuel system'},
 svc:{Shear:'hydraulic seals and blade pins','Conveyor Belt':'drive bearing and belt tracking',Baler:'main ram seals',Excavator:'slew ring and hydraulic filters','Wheel Loader':'axle oil and transmission filters',Generator:'engine oil and coolant system',Forklift:'mast chains and brakes'}};
function analysis(m){
 const svc=(m.hours-m.lastServiceAt)/m.serviceEvery,gr=(m.hours-m.lastGreaseAt)/m.greaseEvery;
 let fuel=0;
 if(m.diesel){const u=S.usage.filter(x=>x.machineId===m.id).sort((a,b)=>a.date<b.date?-1:1),ds=[...new Set(u.map(x=>x.date))],cut=ds[ds.length-3];
  if(ds.length>=6){const rec=u.filter(x=>x.date>=cut),old=u.filter(x=>x.date<cut),a=sum(rec,x=>x.litres)/Math.max(.1,sum(rec,x=>x.hours)),b=sum(old,x=>x.litres)/Math.max(.1,sum(old,x=>x.hours));fuel=(a/b-1)*100}}
 const bd=S.maint.filter(x=>x.machineId===m.id&&x.type==='Breakdown'&&x.due>=dAgo(30)).length;
 const p={fuel:Math.max(0,fuel-6)*1.5,svc:Math.max(0,svc-.7)*65,gr:Math.min(18,Math.max(0,gr-1)*30),bd:bd*11};
 const risk=Math.round(clamp(6+m.wear+p.fuel+p.svc+p.gr+p.bd,2,98));
 const top=Object.keys(p).sort((a,b)=>p[b]-p[a])[0];
 const sig=[];
 if(fuel>6)sig.push(`Fuel burn up ${fN(fuel)}% per hour against its own 11-day baseline`);
 if(svc>.7)sig.push(svc>1?`${fN(m.hours-m.lastServiceAt-m.serviceEvery)} h past the ${m.serviceEvery} h service interval`:`${fN(svc*100)}% of the service interval used`);
 if(gr>1)sig.push(`${fN(m.hours-m.lastGreaseAt)} h since last greasing (interval ${m.greaseEvery} h)`);
 if(bd)sig.push(`${bd} breakdown${bd>1?'s':''} in the last 30 days`);
 const comp=top==='fuel'?(COMP.fuel[m.type]||'fuel system'):top==='svc'?(COMP.svc[m.type]||'service items'):top==='gr'?'pins, bushes and bearings':'repeat failure, root cause not closed';
 return{risk,health:100-risk,fuel,svc,gr,bd,sig,comp,eta:Math.max(8,Math.round((100-risk)*1.7)),level:risk>=65?'bad':risk>=40?'warn':'ok'}}
function dieselStats(site){
 const st=S.sites.find(s=>s.id===site),del=S.deliveries.filter(x=>x.site===site),use=S.usage.filter(x=>x.site===site);
 const stock=st.opening+sum(del,x=>x.litres)-sum(use,x=>x.litres),ppl=sum(del,x=>x.cost)/Math.max(1,sum(del,x=>x.litres));
 const daily=DAYS.map(d=>({label:fD(d),short:fD(d).slice(0,2),v:sum(use.filter(x=>x.date===d),x=>x.litres)}));
 const avg7=sum(daily.slice(6,13),x=>x.v)/7;
 const ma=daily.map((_,i)=>{const w=daily.slice(Math.max(0,i-6),i+1);return sum(w,x=>x.v)/w.length});
 const l14=sum(daily,x=>x.v),h14=sum(use.filter(x=>x.date>=DAYS[0]),x=>x.hours);
 return{stock,tank:st.tank,ppl,daily,ma,avg7,cover:stock/Math.max(1,avg7),today:daily[13].v,l14,h14}}
function siteStats(site){
 const ms=S.machines.filter(m=>m.site===site),pr=S.production.filter(p=>p.site===site),tg=S.targets[site],targetDay=sum(Object.values(tg));
 const byMat={};MATS.forEach(m=>byMat[m]=sum(pr.filter(p=>p.date===T&&p.material===m),p=>p.tonnes));
 const w=dAgo(7),t7=sum(pr.filter(p=>p.date>=w&&p.date<T),p=>p.tonnes);
 const ds=dieselStats(site),l7=sum(ds.daily.slice(6,13),x=>x.v);
 const st=ms.map(m=>({m,s:mStatus(m),a:analysis(m)}));
 const staff=S.staff.filter(p=>p.site===site),att=S.attendance[T]||{},cnt=v=>staff.filter(p=>att[p.id]===v).length;
 const inc=S.incidents.filter(i=>i.site===site),lastInc=inc.filter(i=>i.type!=='Near miss').map(i=>i.date).sort().pop();
 return{site,name:siteName(site),byMat,tg,targetDay,tToday:sum(Object.values(byMat)),t7,target7:targetDay*7,attain:t7/(targetDay*7)*100,
  ds,l7,lPerT:l7/Math.max(1,t7),costPerT:l7*ds.ppl/Math.max(1,t7),
  inRepair:st.filter(x=>x.s==='In Repair'),overdue:st.filter(x=>x.s==='Overdue'),grease:st.filter(x=>x.s==='Needs Greasing'),alerts:st.filter(x=>x.a.risk>=40).sort((a,b)=>b.a.risk-a.a.risk),
  avail:(1-st.filter(x=>x.s==='In Repair').length/Math.max(1,ms.length))*100,nMach:ms.length,
  pending:S.permits.filter(p=>p.site===site&&p.status==='Pending').length,openInc:inc.filter(i=>i.status==='Open').length,nearMiss7:inc.filter(i=>i.type==='Near miss'&&i.date>=w).length,
  failed:S.checks.filter(c=>c.site===site&&c.result==='Fail'&&c.date>=dAgo(1)),present:cnt('P'),late:cnt('L'),absent:cnt('A'),staffN:staff.length,
  attPct:staff.length?(cnt('P')+cnt('L'))/staff.length*100:0,sinceInc:lastInc?Math.round((new Date(T)-new Date(lastInc))/864e5):null}}
function attention(st){
 const a=[];
 st.inRepair.forEach(x=>a.push({c:'bad',i:'wrench',t:`${x.m.code} is in repair`,s:(S.maint.find(k=>k.machineId===x.m.id&&k.type==='Breakdown'&&k.status!=='Done')||{}).notes||'',tab:'maint',sub:'schedule'}));
 st.alerts.filter(x=>x.s!=='In Repair').forEach(x=>a.push({c:x.a.level,i:'brain-circuit',t:`${x.m.code} failure risk ${x.a.risk}%`,s:`Watch the ${x.a.comp}. About ${x.a.eta} operating hours of margin.`,tab:'maint',sub:'ai'}));
 st.overdue.forEach(x=>a.push({c:'bad',i:'calendar-clock',t:`${x.m.code} has overdue maintenance`,s:x.m.name,tab:'maint',sub:'status'}));
 st.grease.forEach(x=>a.push({c:'warn',i:'droplet',t:`${x.m.code} needs greasing`,s:`${fN(x.m.hours-x.m.lastGreaseAt)} h since last greased`,tab:'maint',sub:'status'}));
 if(st.pending)a.push({c:'warn',i:'file-check',t:`${st.pending} permit${st.pending>1?'s':''} to work waiting for approval`,s:'Work cannot start until approved.',tab:'ehs',sub:'permits'});
 if(st.openInc)a.push({c:'warn',i:'triangle-alert',t:`${st.openInc} open incident or near miss`,s:'Actions not yet closed out.',tab:'ehs',sub:'inc'});
 st.failed.forEach(c=>a.push({c:'bad',i:'forklift',t:`${mach(c.machineId).code} failed its ${c.when.toLowerCase()} check`,s:'Failed: '+c.fails.join(', '),tab:'ehs',sub:'fork'}));
 if(st.ds.cover<5)a.push({c:'bad',i:'fuel',t:`Diesel cover down to ${fN(st.ds.cover,1)} days`,s:'Order a delivery.',tab:'diesel',sub:'deliveries'});
 return a}
