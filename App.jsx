import { useState, useRef, useEffect } from "react";

// ── Fonts ──────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;600;700&display=swap";
document.head.appendChild(fontLink);

const styleTag = document.createElement("style");
styleTag.textContent = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #0f1e15; }
  ::-webkit-scrollbar-thumb { background: #2a4a33; border-radius: 99px; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  input::placeholder { color: #5a6145; }
  select option { background: #1B3424; color: #F6EAC8; }
  @media (min-width: 768px) {
    .mobile-only { display: none !important; }
  }
  @media (max-width: 767px) {
    .desktop-only { display: none !important; }
  }
`;
document.head.appendChild(styleTag);

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:"#0f1e15", surface:"#1B3424", surface2:"#162b1c", border:"#2a4a33",
  olive:"#898F65", oliveDim:"#5a6145", sand:"#F6EAC8", sandDim:"#c8ba98",
  sandFaint:"#8a7d61", sky:"#BCD4E6", skyDim:"#8aafc8",
  negative:"#c17a5a", warning:"#d4a853",
};
const FONT = {
  display:"'Lora',Georgia,serif",
  body:"'Plus Jakarta Sans','Segoe UI',sans-serif",
  arabic:"'Scheherazade New',serif",
};

// ── Constants ──────────────────────────────────────────────────────────────
const CATS = ["Housing","Food","Transport","Utilities","Entertainment","Health","Shopping","Savings","Other"];
const CAT_COLORS = { Housing:C.olive,Food:C.warning,Transport:C.sky,Utilities:C.skyDim,Entertainment:"#b8a0c8",Health:"#7ab89a",Shopping:C.negative,Savings:C.sand,Other:C.sandFaint };
const GOAL_ICONS = ["💍","✈️","🏠","🚗","🛡️","📱","🎓","💻","🎸","🌴","💊","🎯","📚","🏋️","👔","🎮","🧳","🐾"];
const GOAL_COLORS = [C.sand,C.olive,C.sky,C.warning,"#b8a0c8","#7ab89a",C.negative,C.skyDim];
const SC_ICONS = ["☕","🧃","🥤","🍔","🍕","🥪","🛺","🚌","⛽","🅿️","💊","🧴","🎮","🎬","🛒","🍞","🥛","🧹","💈","🌯","🍜","🧋","🐟","🥚"];
const SC_COLORS = [C.warning,C.olive,C.sky,C.sand,"#b8a0c8","#7ab89a",C.negative,C.skyDim];
const FREQS = ["daily","weekly","monthly"];
const NAV = [
  {id:"dashboard",icon:"📊",label:"Dashboard"},
  {id:"transactions",icon:"💳",label:"Transactions"},
  {id:"budget",icon:"📋",label:"Budget"},
  {id:"goals",icon:"🎯",label:"Goals"},
  {id:"debts",icon:"🤝",label:"Pay Back"},
  {id:"history",icon:"📅",label:"History"},
  {id:"chat",icon:"💬",label:"Ask AI"},
];

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = n => "BD "+Number(n).toLocaleString("en-BH",{minimumFractionDigits:3,maximumFractionDigits:3});
const tod = () => new Date().toISOString().split("T")[0];
const daysLeft  = () => { const n=new Date(); return new Date(n.getFullYear(),n.getMonth()+1,0).getDate()-n.getDate(); };
const daysTotal = () => { const n=new Date(); return new Date(n.getFullYear(),n.getMonth()+1,0).getDate(); };
const moUntil   = s => { if(!s) return null; const [y,m]=s.split("-").map(Number),n=new Date(); return Math.max(0,(y-n.getFullYear())*12+(m-1-n.getMonth())); };
const useWidth  = () => { const [w,setW]=useState(window.innerWidth); useEffect(()=>{ const h=()=>setW(window.innerWidth); window.addEventListener("resize",h); return ()=>window.removeEventListener("resize",h); },[]); return w; };

// ── Seed data ──────────────────────────────────────────────────────────────
const SEED = {
  limits:{ Housing:500,Food:150,Transport:80,Utilities:60,Entertainment:50,Health:60,Shopping:100,Savings:150,Other:60 },
  goals:[
    {id:1,name:"Emergency Fund",icon:"🛡️",color:C.olive,target:2000,saved:450,freq:"monthly",freqAmount:200,deadline:"",type:"save"},
    {id:2,name:"Vacation",icon:"✈️",color:C.sky,target:800,saved:170,freq:"monthly",freqAmount:80,deadline:"2026-12-01",type:"experience"},
  ],
  shortcuts:[
    {id:1,label:"Karak",icon:"☕",amount:0.1,category:"Food",color:C.warning},
    {id:2,label:"Parking",icon:"🅿️",amount:0.2,category:"Transport",color:C.sky},
    {id:3,label:"Batelco",icon:"📡",amount:33.593,category:"Utilities",color:C.skyDim},
  ],
  debts:[
    {id:1,person:"Ali",amount:20,direction:"they-owe",note:"Lunch split",date:"2026-05-01",settled:false},
    {id:2,person:"Sara",amount:15,direction:"i-owe",note:"Petrol",date:"2026-05-05",settled:false},
  ],
  history:[
    {month:"2026-01",income:2110,spent:391.208},
    {month:"2026-02",income:150,spent:260.093},
    {month:"2026-03",income:40.116,spent:216.384},
    {month:"2026-04",income:0,spent:152.593},
  ],
  transactions:[
    {id:1,date:"2026-05-02",desc:"Rent",amount:480,category:"Housing"},
    {id:2,date:"2026-05-04",desc:"Lulu",amount:32.5,category:"Food"},
    {id:3,date:"2026-05-06",desc:"Uber",amount:4.2,category:"Transport"},
    {id:4,date:"2026-05-08",desc:"Netflix",amount:3.1,category:"Entertainment"},
    {id:5,date:"2026-05-10",desc:"Pharmacy",amount:8.5,category:"Health"},
    {id:6,date:"2026-05-11",desc:"Dinner Bushido",amount:22.0,category:"Food"},
  ],
};

// ── Shared style objects ───────────────────────────────────────────────────
const S = {
  input:{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,color:C.sand,padding:"9px 11px",fontSize:12,width:"100%",outline:"none",fontFamily:FONT.body},
  btn:{background:"#2a4a33",color:C.sand,border:`1px solid ${C.olive}`,borderRadius:8,padding:"9px 16px",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",fontFamily:FONT.body},
  ghost:{background:C.surface,color:C.sandFaint,border:`1px solid ${C.border}`,borderRadius:8,padding:"9px 16px",fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontFamily:FONT.body},
};

// ── Sub-components ─────────────────────────────────────────────────────────
const Card = ({children,style={}}) => <div style={{background:C.surface,borderRadius:14,padding:20,border:`1px solid ${C.border}`,...style}}>{children}</div>;
const Lbl  = ({children,style={}}) => <div style={{fontSize:10,color:C.sandFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5,fontWeight:600,fontFamily:FONT.body,...style}}>{children}</div>;
const Bar  = ({pct,color,h=6}) => <div style={{background:C.bg,borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:color,transition:"width 0.4s"}}/></div>;
const Num  = ({children,color=C.olive,size=18}) => <div style={{fontFamily:FONT.display,fontSize:size,fontWeight:700,color}}>{children}</div>;

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const width = useWidth();
  const isTablet = width >= 768;
  const isDesktop = width >= 1080;

  const [tab,setTab]             = useState("dashboard");
  const [salary,setSalary]       = useState(1200);
  const [carry,setCarry]         = useState(0);
  const [sides,setSides]         = useState([]);
  const [txs,setTxs]             = useState(SEED.transactions);
  const [limits,setLimits]       = useState(SEED.limits);
  const [tempLimits,setTempLimits]= useState(SEED.limits);
  const [editingBudget,setEditingBudget] = useState(false);
  const [goals,setGoals]         = useState(SEED.goals);
  const [shortcuts,setShortcuts] = useState(SEED.shortcuts);
  const [debts,setDebts]         = useState(SEED.debts);
  const [msgs,setMsgs]           = useState([{role:"assistant",text:"مرحبا! I'm your Hisabi assistant 👋\n\nAsk me anything — 'When can I afford my engagement ring?', 'Am I on track this month?', 'Which goal should I focus on?'"}]);
  const [chatIn,setChatIn]       = useState("");
  const [chatLoading,setChatLoading] = useState(false);
  const chatEndRef               = useRef(null);
  const fileRef                  = useRef(null);

  const [txForm,setTxForm]       = useState({date:tod(),desc:"",amount:"",category:"Food"});
  const [sideForm,setSideForm]   = useState({date:tod(),desc:"",amount:""});
  const [goalForm,setGoalForm]   = useState({name:"",icon:"🎯",color:C.olive,target:"",saved:"",freq:"monthly",freqAmount:"",deadline:"",type:"save"});
  const [scForm,setScForm]       = useState({label:"",icon:"☕",amount:"",category:"Food",color:C.warning});
  const [debtForm,setDebtForm]   = useState({person:"",amount:"",direction:"i-owe",note:"",date:tod()});
  const [showScForm,setShowScForm]   = useState(false);
  const [showDebtForm,setShowDebtForm] = useState(false);
  const [showGoalForm,setShowGoalForm] = useState(false);
  const [gInputs,setGInputs]     = useState({});
  const [flashId,setFlashId]     = useState(null);
  const [scanLoading,setScanLoading] = useState(false);
  const [scanResult,setScanResult]   = useState(null);

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalSide   = sides.reduce((s,i)=>s+Number(i.amount),0);
  const totalIncome = Number(salary)+totalSide+carry;
  const byCat = CATS.reduce((a,c)=>{ a[c]=txs.filter(t=>t.category===c).reduce((s,t)=>s+Number(t.amount),0); return a; },{});
  const totalSpent  = Object.values(byCat).reduce((a,b)=>a+b,0);
  const balance     = totalIncome-totalSpent;
  const dl          = daysLeft();
  const dp          = new Date().getDate();
  const rate        = dp>0?totalSpent/dp:0;
  const projSpend   = rate*daysTotal();
  const projBal     = totalIncome-projSpend;
  const overBudget  = CATS.filter(c=>byCat[c]>limits[c]);
  const owedToMe    = debts.filter(d=>!d.settled&&d.direction==="they-owe").reduce((s,d)=>s+Number(d.amount),0);
  const iOwe        = debts.filter(d=>!d.settled&&d.direction==="i-owe").reduce((s,d)=>s+Number(d.amount),0);

  const histRows = () => {
    let c=0;
    return SEED.history.map(h=>{ const net=c+h.income-h.spent; const r={...h,carry:c,net}; c=net; return r; });
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const addTx = tx => {
    const t=tx||txForm; if(!t.desc||!t.amount) return;
    setTxs(p=>[...p,{...t,id:Date.now(),amount:Number(t.amount)}]);
    if(!tx) setTxForm({date:tod(),desc:"",amount:"",category:"Food"});
    setScanResult(null);
  };
  const addSide = () => {
    if(!sideForm.desc||!sideForm.amount) return;
    setSides(p=>[...p,{...sideForm,id:Date.now(),amount:Number(sideForm.amount)}]);
    setSideForm({date:tod(),desc:"",amount:""});
  };
  const addGoal = () => {
    if(!goalForm.name||!goalForm.target) return;
    setGoals(p=>[...p,{...goalForm,id:Date.now(),target:Number(goalForm.target),saved:Number(goalForm.saved||0),freqAmount:Number(goalForm.freqAmount||0)}]);
    setGoalForm({name:"",icon:"🎯",color:C.olive,target:"",saved:"",freq:"monthly",freqAmount:"",deadline:"",type:"save"});
    setShowGoalForm(false);
  };
  const addSc = () => {
    if(!scForm.label||!scForm.amount) return;
    setShortcuts(p=>[...p,{...scForm,id:Date.now(),amount:Number(scForm.amount)}]);
    setScForm({label:"",icon:"☕",amount:"",category:"Food",color:C.warning});
    setShowScForm(false);
  };
  const addDebt = () => {
    if(!debtForm.person||!debtForm.amount) return;
    setDebts(p=>[...p,{...debtForm,id:Date.now(),amount:Number(debtForm.amount),settled:false}]);
    setDebtForm({person:"",amount:"",direction:"i-owe",note:"",date:tod()});
    setShowDebtForm(false);
  };
  const settle    = id => setDebts(p=>p.map(d=>d.id===id?{...d,settled:true}:d));
  const quickLog  = s  => { setTxs(p=>[...p,{id:Date.now(),date:tod(),desc:s.label,amount:s.amount,category:s.category}]); setFlashId(s.id); setTimeout(()=>setFlashId(null),700); };
  const contributeGoal = id => { const v=Number(gInputs[id]||0); if(v<=0) return; setGoals(p=>p.map(g=>g.id===id?{...g,saved:Math.min(g.saved+v,g.target)}:g)); setGInputs(p=>({...p,[id]:""})); };

  // ── Receipt scan ──────────────────────────────────────────────────────────
  const handleScan = async e => {
    const file=e.target.files[0]; if(!file) return;
    setScanLoading(true); setScanResult(null);
    const b64=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); });
    try {
      const resp=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:`Receipt parser. Return ONLY JSON: {"desc":"merchant","amount":number,"category":"${CATS.join("|")}","date":"YYYY-MM-DD"}. Today=${tod()}.`,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:file.type,data:b64}},{type:"text",text:"Parse receipt, JSON only."}]}]})});
      const data=await resp.json();
      const parsed=JSON.parse(data.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim());
      setScanResult({...parsed,amount:String(parsed.amount)});
    } catch { setScanResult({error:true}); }
    setScanLoading(false); e.target.value="";
  };

  // ── AI Chat ───────────────────────────────────────────────────────────────
  const sendChat = async () => {
    if(!chatIn.trim()||chatLoading) return;
    const msg=chatIn.trim(); setChatIn("");
    setMsgs(p=>[...p,{role:"user",text:msg}]); setChatLoading(true);
    const ctx=`HISABI USER SNAPSHOT — Bahrain, BHD
Salary:${fmt(salary)} | Carry:${fmt(carry)} | Side:${fmt(totalSide)} | Total:${fmt(totalIncome)}
Spent:${fmt(totalSpent)} | Balance:${fmt(balance)} | Days left:${dl} | Daily rate:${fmt(rate)}
Projected spend:${fmt(projSpend)} | Projected balance:${fmt(projBal)}

Spending:\n${CATS.map(c=>`  ${c}: ${fmt(byCat[c])}/${fmt(limits[c])} ${byCat[c]>limits[c]?"OVER":"ok"}`).join("\n")}

Recent transactions:\n${txs.slice(-8).map(t=>`  ${t.date} ${t.desc} -${fmt(t.amount)} [${t.category}]`).join("\n")}

Goals:\n${goals.map(g=>{ const rem=g.target-g.saved; const ml=g.freqAmount>0?Math.ceil(rem/g.freqAmount):null; const dl2=moUntil(g.deadline); return `  ${g.icon} ${g.name}: ${fmt(g.saved)}/${fmt(g.target)} (${Math.round((g.saved/g.target)*100)}%), ${fmt(g.freqAmount)}/${g.freq}, ~${ml||"?"}mo to finish${dl2!==null?`, deadline in ${dl2}mo`:""}`; }).join("\n")}

Debts:\n${debts.filter(d=>!d.settled).map(d=>`  ${d.direction==="i-owe"?"I owe":"Owed by me from"} ${d.person}: ${fmt(d.amount)} (${d.note})`).join("\n")||"  None"}
Owed to me: ${fmt(owedToMe)} | I owe: ${fmt(iOwe)}

Monthly history:\n${histRows().map(r=>`  ${r.month}: income ${fmt(r.income)}, spent ${fmt(r.spent)}, balance ${fmt(r.net)}`).join("\n")}`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are a sharp friendly personal finance assistant for Hisabi (حسابي), a personal finance tracker in Bahrain. Currency BHD, prefix BD. Use monthly history for multi-month forecasting. Answer 'when can I afford X' with real math using current saving rate. Be concise, warm, specific. Plain text only.",messages:[{role:"user",content:`${ctx}\n\nQuestion: ${msg}`}]})});
      const data=await res.json();
      setMsgs(p=>[...p,{role:"assistant",text:data.content?.map(b=>b.text||"").join("")||"Sorry, try again."}]);
    } catch { setMsgs(p=>[...p,{role:"assistant",text:"Something went wrong. Please try again."}]); }
    setChatLoading(false);
  };

  // ── Page content renderer ─────────────────────────────────────────────────
  const renderPage = () => {
    switch(tab) {

      // ── DASHBOARD ────────────────────────────────────────────────────────
      case "dashboard": return (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {/* Stat cards */}
          <div style={{display:"grid",gridTemplateColumns:isDesktop?"repeat(4,1fr)":isTablet?"repeat(4,1fr)":"repeat(2,1fr)",gap:12}}>
            {[["Total Income",fmt(totalIncome),C.olive],["Total Spent",fmt(totalSpent),C.warning],["Projected",fmt(projSpend),projSpend>totalIncome?C.negative:C.sky],["Days Left",`${dl} days`,C.skyDim]].map(([l,v,col])=>(
              <Card key={l} style={{padding:16}}>
                <Lbl>{l}</Lbl>
                <Num color={col} size={isDesktop?17:15}>{v}</Num>
              </Card>
            ))}
          </div>

          {/* Debt banners */}
          {(iOwe>0||owedToMe>0)&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {iOwe>0&&<Card style={{padding:14,background:"#2a1810",border:`1px solid ${C.negative}44`}}><Lbl>You Owe</Lbl><Num color={C.negative} size={16}>{fmt(iOwe)}</Num></Card>}
              {owedToMe>0&&<Card style={{padding:14,background:"#1a2a1a",border:`1px solid ${C.olive}44`}}><Lbl>Owed to You</Lbl><Num color={C.olive} size={16}>{fmt(owedToMe)}</Num></Card>}
            </div>
          )}

          {overBudget.length>0&&(
            <div style={{background:"#2a1810",border:`1px solid ${C.negative}55`,borderRadius:12,padding:14}}>
              <div style={{color:C.negative,fontWeight:600,marginBottom:4,fontFamily:FONT.body,fontSize:13}}>⚠ Over Budget</div>
              <div style={{fontSize:12,color:C.sandDim,fontFamily:FONT.body}}>{overBudget.map(c=>`${c} (${fmt(byCat[c])}/${fmt(limits[c])})`).join(" · ")}</div>
            </div>
          )}

          {/* Main grid — two columns on desktop */}
          <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:16}}>
            <Card>
              <div style={{fontWeight:600,marginBottom:14,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Spending by Category</div>
              {CATS.filter(c=>byCat[c]>0||limits[c]>0).map(cat=>{
                const pct=Math.min((byCat[cat]/limits[cat])*100,100);
                const over=byCat[cat]>limits[cat];
                return (
                  <div key={cat} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3,fontFamily:FONT.body}}>
                      <span style={{color:C.sandDim}}>{cat}</span>
                      <span style={{color:over?C.negative:C.sandFaint}}>{fmt(byCat[cat])} / {fmt(limits[cat])}</span>
                    </div>
                    <Bar pct={pct} color={over?C.negative:CAT_COLORS[cat]}/>
                  </div>
                );
              })}
            </Card>

            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <Card>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontWeight:600,fontFamily:FONT.display,fontSize:15,color:C.sand}}>🎯 Goals</div>
                  <button onClick={()=>setTab("goals")} style={{fontSize:11,color:C.olive,background:"none",border:"none",cursor:"pointer",fontFamily:FONT.body}}>View all →</button>
                </div>
                {goals.map(g=>{
                  const pct=Math.min((g.saved/g.target)*100,100);
                  const ml=g.freqAmount>0?Math.ceil((g.target-g.saved)/g.freqAmount):null;
                  const dl2=moUntil(g.deadline);
                  return (
                    <div key={g.id} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4,fontFamily:FONT.body}}>
                        <span style={{color:C.sandDim}}>{g.icon} {g.name}</span>
                        <span style={{color:g.color}}>{Math.round(pct)}%{ml?` · ~${ml}mo`:""}{ dl2!==null?` · 📅${dl2}mo`:""}</span>
                      </div>
                      <Bar pct={pct} color={g.color} h={7}/>
                    </div>
                  );
                })}
              </Card>

              <Card style={{padding:16}}>
                <div style={{fontWeight:600,fontFamily:FONT.display,fontSize:15,color:C.sand,marginBottom:12}}>⚡ Quick Log</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {shortcuts.slice(0,4).map(s=>(
                    <button key={s.id} onClick={()=>quickLog(s)} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:72,height:72,borderRadius:12,border:`2px solid ${flashId===s.id?s.color:s.color+"44"}`,background:flashId===s.id?s.color+"22":C.bg,cursor:"pointer",transition:"all 0.15s",transform:flashId===s.id?"scale(0.92)":"scale(1)"}}>
                      {flashId===s.id?<span style={{fontSize:22,color:C.sand}}>✓</span>:<><span style={{fontSize:20}}>{s.icon}</span><span style={{fontSize:9,color:C.sandDim,marginTop:2,maxWidth:65,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontFamily:FONT.body}}>{s.label}</span><span style={{fontSize:9,color:s.color,fontWeight:700,fontFamily:FONT.body}}>BD {Number(s.amount).toFixed(3)}</span></>}
                    </button>
                  ))}
                  <button onClick={()=>setTab("transactions")} style={{width:72,height:72,borderRadius:12,border:`2px dashed ${C.border}`,background:"transparent",cursor:"pointer",color:C.sandFaint,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      );

      // ── TRANSACTIONS ─────────────────────────────────────────────────────
      case "transactions": return (
        <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {/* Quick Log */}
            <Card>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                <div>
                  <div style={{fontWeight:600,fontFamily:FONT.display,fontSize:15,color:C.sand}}>⚡ Quick Log</div>
                  <div style={{fontSize:11,color:C.sandFaint,marginTop:2,fontFamily:FONT.body}}>One tap — no receipt needed</div>
                </div>
                <button onClick={()=>setShowScForm(v=>!v)} style={{...S.ghost,padding:"5px 11px",fontSize:11}}>{showScForm?"✕":"+ New"}</button>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:14}}>
                {shortcuts.map(s=>(
                  <button key={s.id} onClick={()=>quickLog(s)} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:78,height:78,borderRadius:13,border:`2px solid ${flashId===s.id?s.color:s.color+"44"}`,background:flashId===s.id?s.color+"22":C.bg,cursor:"pointer",transition:"all 0.15s",transform:flashId===s.id?"scale(0.92)":"scale(1)"}}>
                    {flashId===s.id?<span style={{fontSize:24,color:C.sand}}>✓</span>:<><span style={{fontSize:22,lineHeight:1}}>{s.icon}</span><span style={{fontSize:9,color:C.sandDim,marginTop:3,maxWidth:68,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontFamily:FONT.body}}>{s.label}</span><span style={{fontSize:9,color:s.color,fontWeight:700,fontFamily:FONT.body}}>BD {Number(s.amount).toFixed(3)}</span></>}
                  </button>
                ))}
                <button onClick={()=>setShowScForm(true)} style={{width:78,height:78,borderRadius:13,border:`2px dashed ${C.border}`,background:"transparent",cursor:"pointer",color:C.sandFaint,fontSize:24,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              {showScForm&&(
                <div style={{marginTop:14,background:C.bg,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:12,color:C.olive,fontWeight:600,marginBottom:10,fontFamily:FONT.body}}>New Quick Log Shortcut</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                    <input placeholder="Label" value={scForm.label} onChange={e=>setScForm(f=>({...f,label:e.target.value}))} style={{...S.input,gridColumn:"span 2"}}/>
                    <input placeholder="Amount (BD)" type="number" step="0.001" value={scForm.amount} onChange={e=>setScForm(f=>({...f,amount:e.target.value}))} style={S.input}/>
                    <select value={scForm.category} onChange={e=>setScForm(f=>({...f,category:e.target.value}))} style={S.input}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                  </div>
                  <div style={{marginBottom:8}}><div style={{fontSize:10,color:C.sandFaint,marginBottom:5,fontFamily:FONT.body}}>Icon</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{SC_ICONS.map(ic=><button key={ic} onClick={()=>setScForm(f=>({...f,icon:ic}))} style={{background:scForm.icon===ic?C.border:"transparent",border:scForm.icon===ic?`1px solid ${C.olive}`:"1px solid transparent",borderRadius:6,padding:"2px 5px",cursor:"pointer",fontSize:16}}>{ic}</button>)}</div></div>
                  <div style={{marginBottom:12}}><div style={{fontSize:10,color:C.sandFaint,marginBottom:5,fontFamily:FONT.body}}>Color</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{SC_COLORS.map(col=><button key={col} onClick={()=>setScForm(f=>({...f,color:col}))} style={{width:20,height:20,borderRadius:"50%",background:col,border:scForm.color===col?`3px solid ${C.sand}`:"3px solid transparent",cursor:"pointer"}}/>)}</div></div>
                  <div style={{display:"flex",gap:8}}><button onClick={addSc} style={{...S.btn,flex:1}}>+ Create</button><button onClick={()=>setShowScForm(false)} style={S.ghost}>Cancel</button></div>
                </div>
              )}
            </Card>

            {/* Receipt Scanner */}
            <Card>
              <div style={{fontWeight:600,marginBottom:4,fontFamily:FONT.display,fontSize:15,color:C.sand}}>📷 Scan Receipt</div>
              <div style={{fontSize:11,color:C.sandFaint,marginBottom:12,fontFamily:FONT.body}}>AI reads the receipt and fills in the details</div>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleScan} style={{display:"none"}}/>
              <button onClick={()=>fileRef.current?.click()} disabled={scanLoading} style={{...S.btn,background:C.border,color:C.sky,border:`1px solid ${C.sky}44`}}>{scanLoading?"⏳ Reading…":"📷 Scan Receipt"}</button>
              {scanResult&&!scanResult.error&&(
                <div style={{marginTop:12,background:C.bg,borderRadius:10,padding:12,border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,color:C.olive,fontWeight:600,marginBottom:8,fontFamily:FONT.body}}>✓ Review and confirm:</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <input type="date" value={scanResult.date} onChange={e=>setScanResult(r=>({...r,date:e.target.value}))} style={S.input}/>
                    <select value={scanResult.category} onChange={e=>setScanResult(r=>({...r,category:e.target.value}))} style={S.input}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                    <input value={scanResult.desc} onChange={e=>setScanResult(r=>({...r,desc:e.target.value}))} style={S.input}/>
                    <input value={scanResult.amount} onChange={e=>setScanResult(r=>({...r,amount:e.target.value}))} type="number" step="0.001" style={S.input}/>
                  </div>
                  <div style={{display:"flex",gap:8}}><button onClick={()=>addTx(scanResult)} style={{...S.btn,flex:1}}>✓ Add</button><button onClick={()=>setScanResult(null)} style={S.ghost}>✕</button></div>
                </div>
              )}
              {scanResult?.error&&<div style={{marginTop:8,fontSize:12,color:C.negative,fontFamily:FONT.body}}>Couldn't read receipt. Try a clearer photo or add manually.</div>}
            </Card>

            {/* Manual + Side Income */}
            <Card>
              <div style={{fontWeight:600,marginBottom:12,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Add Transaction</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <input type="date" value={txForm.date} onChange={e=>setTxForm(f=>({...f,date:e.target.value}))} style={S.input}/>
                <select value={txForm.category} onChange={e=>setTxForm(f=>({...f,category:e.target.value}))} style={S.input}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
                <input placeholder="Description" value={txForm.desc} onChange={e=>setTxForm(f=>({...f,desc:e.target.value}))} style={S.input}/>
                <input placeholder="Amount (BD)" type="number" step="0.001" value={txForm.amount} onChange={e=>setTxForm(f=>({...f,amount:e.target.value}))} style={S.input}/>
              </div>
              <button onClick={()=>addTx()} style={S.btn}>+ Add Transaction</button>
            </Card>

            <Card>
              <div style={{fontWeight:600,marginBottom:12,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Add Side Income</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                <input type="date" value={sideForm.date} onChange={e=>setSideForm(f=>({...f,date:e.target.value}))} style={S.input}/>
                <input placeholder="Amount (BD)" type="number" step="0.001" value={sideForm.amount} onChange={e=>setSideForm(f=>({...f,amount:e.target.value}))} style={S.input}/>
                <input placeholder="Source" value={sideForm.desc} onChange={e=>setSideForm(f=>({...f,desc:e.target.value}))} style={{...S.input,gridColumn:"span 2"}}/>
              </div>
              <button onClick={addSide} style={{...S.btn,background:"#1a2a1a",color:C.olive,border:`1px solid ${C.olive}55`}}>+ Add Income</button>
            </Card>
          </div>

          {/* Transaction list — right column on desktop */}
          <Card>
            <div style={{fontWeight:600,marginBottom:14,fontFamily:FONT.display,fontSize:15,color:C.sand}}>This Month ({txs.length + sides.length} entries)</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,maxHeight:isDesktop?600:9999,overflowY:isDesktop?"auto":"visible"}}>
              {[...sides.map(s=>({...s,isSide:true})),...txs].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(t=>(
                <div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 11px",background:C.bg,borderRadius:8,border:`1px solid ${C.border}66`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:t.isSide?C.olive:CAT_COLORS[t.category],flexShrink:0}}/>
                    <div><div style={{fontSize:13,color:C.sand,fontFamily:FONT.body}}>{t.desc}</div><div style={{fontSize:10,color:C.sandFaint,fontFamily:FONT.body}}>{t.date} · {t.isSide?"Side Income":t.category}</div></div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontWeight:600,fontSize:13,color:t.isSide?C.olive:C.negative,fontFamily:FONT.display}}>{t.isSide?"+":"-"}{fmt(t.amount)}</span>
                    <button onClick={()=>t.isSide?setSides(p=>p.filter(s=>s.id!==t.id)):setTxs(p=>p.filter(x=>x.id!==t.id))} style={{background:"none",border:"none",cursor:"pointer",color:C.sandFaint,fontSize:15,padding:0}}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );

      // ── BUDGET ───────────────────────────────────────────────────────────
      case "budget": return (
        <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:16}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Card><div style={{fontWeight:600,marginBottom:10,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Monthly Salary (BD)</div><input type="number" step="0.001" value={salary} onChange={e=>setSalary(e.target.value)} style={S.input}/></Card>
            <Card>
              <div style={{fontWeight:600,marginBottom:6,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Carry-Forward (BD)</div>
              <div style={{fontSize:11,color:C.sandFaint,marginBottom:8,fontFamily:FONT.body}}>Your "From Last Month" balance</div>
              <input type="number" step="0.001" value={carry} onChange={e=>setCarry(Number(e.target.value))} style={S.input}/>
            </Card>
          </div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontWeight:600,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Category Limits</div>
              <div style={{display:"flex",gap:6}}>
                {editingBudget
                  ?<><button onClick={()=>{setLimits({...tempLimits});setEditingBudget(false);}} style={{...S.btn,padding:"5px 12px",fontSize:11}}>Save</button><button onClick={()=>{setEditingBudget(false);setTempLimits({...limits});}} style={{...S.ghost,padding:"5px 12px",fontSize:11}}>Cancel</button></>
                  :<button onClick={()=>setEditingBudget(true)} style={{...S.ghost,padding:"5px 12px",fontSize:11}}>Edit</button>
                }
              </div>
            </div>
            {CATS.map(cat=>(
              <div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:8,height:8,borderRadius:"50%",background:CAT_COLORS[cat]}}/><span style={{fontSize:13,color:C.sandDim,fontFamily:FONT.body}}>{cat}</span></div>
                {editingBudget?<input type="number" step="0.001" value={tempLimits[cat]} onChange={e=>setTempLimits(l=>({...l,[cat]:Number(e.target.value)}))} style={{...S.input,width:120,textAlign:"right",padding:"4px 8px"}}/>:<span style={{fontSize:13,color:C.sandFaint,fontFamily:FONT.body}}>{fmt(limits[cat])}</span>}
              </div>
            ))}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
              <span style={{fontWeight:600,color:C.sand,fontFamily:FONT.body}}>Total</span>
              <span style={{fontWeight:700,color:C.olive,fontFamily:FONT.display}}>{fmt(Object.values(editingBudget?tempLimits:limits).reduce((a,b)=>a+b,0))}</span>
            </div>
          </Card>
        </div>
      );

      // ── GOALS ────────────────────────────────────────────────────────────
      case "goals": return (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontWeight:600,fontFamily:FONT.display,fontSize:15,color:C.sand}}>Savings Goals</div>
              <button onClick={()=>setShowGoalForm(v=>!v)} style={{...S.ghost,padding:"5px 12px",fontSize:11}}>{showGoalForm?"✕ Cancel":"+ New Goal"}</button>
            </div>
            {showGoalForm&&(
              <div style={{marginTop:14,background:C.bg,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
                <div style={{fontSize:12,color:C.olive,fontWeight:600,marginBottom:12,fontFamily:FONT.body}}>New Goal</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <input placeholder="Goal name" value={goalForm.name} onChange={e=>setGoalForm(f=>({...f,name:e.target.value}))} style={{...S.input,gridColumn:"span 2"}}/>
                  <input placeholder="Target (BD)" type="number" step="0.001" value={goalForm.target} onChange={e=>setGoalForm(f=>({...f,target:e.target.value}))} style={S.input}/>
                  <input placeholder="Already saved (BD)" type="number" step="0.001" value={goalForm.saved} onChange={e=>setGoalForm(f=>({...f,saved:e.target.value}))} style={S.input}/>
                  <select value={goalForm.freq} onChange={e=>setGoalForm(f=>({...f,freq:e.target.value}))} style={S.input}>{FREQS.map(f=><option key={f}>{f}</option>)}</select>
                  <input placeholder={`Save per ${goalForm.freq} (BD)`} type="number" step="0.001" value={goalForm.freqAmount} onChange={e=>setGoalForm(f=>({...f,freqAmount:e.target.value}))} style={S.input}/>
                  <div style={{gridColumn:"span 2"}}><div style={{fontSize:10,color:C.sandFaint,marginBottom:4,fontFamily:FONT.body}}>Target Date (optional)</div><input type="date" value={goalForm.deadline} onChange={e=>setGoalForm(f=>({...f,deadline:e.target.value}))} style={S.input}/></div>
                  <div style={{gridColumn:"span 2"}}><div style={{fontSize:10,color:C.sandFaint,marginBottom:5,fontFamily:FONT.body}}>Goal Type</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["save","purchase","experience","personal"].map(type=><button key={type} onClick={()=>setGoalForm(f=>({...f,type}))} style={{padding:"4px 10px",borderRadius:99,border:`1px solid ${goalForm.type===type?C.olive:C.border}`,background:goalForm.type===type?C.border:"transparent",color:goalForm.type===type?C.olive:C.sandFaint,fontSize:11,cursor:"pointer",textTransform:"capitalize",fontFamily:FONT.body}}>{type}</button>)}</div></div>
                </div>
                <div style={{marginBottom:10}}><div style={{fontSize:10,color:C.sandFaint,marginBottom:5,fontFamily:FONT.body}}>Icon</div><div style={{display:"flex",flexWrap:"wrap",gap:4}}>{GOAL_ICONS.map(ic=><button key={ic} onClick={()=>setGoalForm(f=>({...f,icon:ic}))} style={{background:goalForm.icon===ic?C.border:"transparent",border:goalForm.icon===ic?`1px solid ${C.olive}`:"1px solid transparent",borderRadius:6,padding:"2px 5px",cursor:"pointer",fontSize:18}}>{ic}</button>)}</div></div>
                <div style={{marginBottom:12}}><div style={{fontSize:10,color:C.sandFaint,marginBottom:5,fontFamily:FONT.body}}>Color</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{GOAL_COLORS.map(col=><button key={col} onClick={()=>setGoalForm(f=>({...f,color:col}))} style={{width:20,height:20,borderRadius:"50%",background:col,border:goalForm.color===col?`3px solid ${C.sand}`:"3px solid transparent",cursor:"pointer"}}/>)}</div></div>
                <button onClick={addGoal} style={{...S.btn,width:"100%"}}>+ Create Goal</button>
              </div>
            )}
          </Card>

          <div style={{display:"grid",gridTemplateColumns:isDesktop?"1fr 1fr":"1fr",gap:16}}>
            {goals.map(g=>{
              const pct=Math.min((g.saved/g.target)*100,100);
              const rem=g.target-g.saved;
              const ml=g.freqAmount>0?Math.ceil(rem/g.freqAmount):null;
              const dl2=moUntil(g.deadline);
              const done=g.saved>=g.target;
              const urgency=dl2!==null&&ml!==null&&dl2<ml;
              return (
                <Card key={g.id} style={{border:`1px solid ${done?g.color+"55":urgency?C.negative+"55":C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:26}}>{g.icon}</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:14,color:C.sand,fontFamily:FONT.display}}>{g.name}</div>
                        <div style={{fontSize:10,color:C.sandFaint,marginTop:1,fontFamily:FONT.body}}>
                          {g.type&&<span style={{background:C.border,padding:"1px 6px",borderRadius:99,marginRight:5,textTransform:"capitalize"}}>{g.type}</span>}
                          {g.freqAmount>0&&<span>{fmt(g.freqAmount)}/{g.freq}</span>}
                        </div>
                        {ml&&!done&&<div style={{fontSize:10,color:urgency?C.negative:C.sandFaint,marginTop:2,fontFamily:FONT.body}}>{urgency?"⚠ ":""}~{ml} months{dl2!==null?` · deadline in ${dl2}mo`:""}</div>}
                        {done&&<div style={{fontSize:11,color:g.color,marginTop:2,fontFamily:FONT.body}}>🎉 Goal reached!</div>}
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <Num color={g.color} size={20}>{Math.round(pct)}%</Num>
                      <button onClick={()=>setGoals(p=>p.filter(x=>x.id!==g.id))} style={{background:"none",border:"none",color:C.sandFaint,fontSize:10,cursor:"pointer",fontFamily:FONT.body}}>remove</button>
                    </div>
                  </div>
                  <Bar pct={pct} color={g.color} h={10}/>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.sandFaint,margin:"10px 0",fontFamily:FONT.body}}>
                    <span>Saved <span style={{color:g.color,fontWeight:600,fontFamily:FONT.display}}>{fmt(g.saved)}</span></span>
                    <span>Target <span style={{color:C.sand,fontFamily:FONT.display}}>{fmt(g.target)}</span></span>
                    <span>Left <span style={{color:C.warning,fontFamily:FONT.display}}>{fmt(rem)}</span></span>
                  </div>
                  {g.deadline&&<div style={{background:C.bg,borderRadius:8,padding:"7px 11px",fontSize:11,color:C.sandFaint,marginBottom:10,fontFamily:FONT.body}}>📅 {g.deadline} <span style={{color:urgency?C.negative:C.sandFaint}}>· {dl2} months away</span></div>}
                  {!done&&<div style={{display:"flex",gap:8}}><input type="number" step="0.001" placeholder="Add savings (BD)" value={gInputs[g.id]||""} onChange={e=>setGInputs(p=>({...p,[g.id]:e.target.value}))} style={{...S.input,flex:1,padding:"7px 10px",fontSize:12}}/><button onClick={()=>contributeGoal(g.id)} style={{...S.btn,padding:"7px 14px",fontSize:12,background:g.color+"22",color:g.color,border:`1px solid ${g.color}44`}}>+ Save</button></div>}
                </Card>
              );
            })}
          </div>
        </div>
      );

      // ── PAY BACK ─────────────────────────────────────────────────────────
      case "debts": return (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Card style={{background:"#1a2a1a",border:`1px solid ${C.olive}44`,padding:16}}><Lbl>Owed to You</Lbl><Num color={C.olive} size={20}>{fmt(owedToMe)}</Num><div style={{fontSize:10,color:C.sandFaint,marginTop:3,fontFamily:FONT.body}}>{debts.filter(d=>!d.settled&&d.direction==="they-owe").length} people</div></Card>
            <Card style={{background:"#2a1810",border:`1px solid ${C.negative}44`,padding:16}}><Lbl>You Owe</Lbl><Num color={C.negative} size={20}>{fmt(iOwe)}</Num><div style={{fontSize:10,color:C.sandFaint,marginTop:3,fontFamily:FONT.body}}>{debts.filter(d=>!d.settled&&d.direction==="i-owe").length} people</div></Card>
          </div>
          <Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showDebtForm?14:0}}>
              <div style={{fontWeight:600,fontFamily:FONT.display,fontSize:15,color:C.sand}}>🤝 Pay Back Tracker</div>
              <button onClick={()=>setShowDebtForm(v=>!v)} style={{...S.ghost,padding:"5px 12px",fontSize:11}}>{showDebtForm?"✕ Cancel":"+ Add"}</button>
            </div>
            {showDebtForm&&(
              <div style={{background:C.bg,borderRadius:10,padding:14,border:`1px solid ${C.border}`}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <input placeholder="Person's name" value={debtForm.person} onChange={e=>setDebtForm(f=>({...f,person:e.target.value}))} style={{...S.input,gridColumn:"span 2"}}/>
                  <input placeholder="Amount (BD)" type="number" step="0.001" value={debtForm.amount} onChange={e=>setDebtForm(f=>({...f,amount:e.target.value}))} style={S.input}/>
                  <input type="date" value={debtForm.date} onChange={e=>setDebtForm(f=>({...f,date:e.target.value}))} style={S.input}/>
                  <input placeholder="Note" value={debtForm.note} onChange={e=>setDebtForm(f=>({...f,note:e.target.value}))} style={{...S.input,gridColumn:"span 2"}}/>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:12}}>
                  {[["i-owe","I owe them",C.negative,"#2a1810"],["they-owe","They owe me",C.olive,"#1a2a1a"]].map(([val,label,col,bg])=>(
                    <button key={val} onClick={()=>setDebtForm(f=>({...f,direction:val}))} style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${debtForm.direction===val?col:C.border}`,background:debtForm.direction===val?bg:"transparent",color:debtForm.direction===val?col:C.sandFaint,cursor:"pointer",fontWeight:debtForm.direction===val?600:400,fontSize:12,fontFamily:FONT.body}}>{label}</button>
                  ))}
                </div>
                <button onClick={addDebt} style={{...S.btn,width:"100%"}}>+ Add Entry</button>
              </div>
            )}
          </Card>
          {["they-owe","i-owe"].map(dir=>{
            const list=debts.filter(d=>!d.settled&&d.direction===dir);
            if(!list.length) return null;
            const isIOwe=dir==="i-owe";
            return (
              <Card key={dir}>
                <div style={{fontWeight:600,marginBottom:12,color:isIOwe?C.negative:C.olive,fontFamily:FONT.display,fontSize:14}}>{isIOwe?"You Owe":"Owed to You"}</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {list.map(d=>(
                    <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:C.bg,borderRadius:8,border:`1px solid ${isIOwe?C.negative+"33":C.olive+"33"}`}}>
                      <div><div style={{fontSize:13,fontWeight:500,color:C.sand,fontFamily:FONT.body}}>{d.person}</div><div style={{fontSize:10,color:C.sandFaint,fontFamily:FONT.body}}>{d.date}{d.note&&` · ${d.note}`}</div></div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontWeight:700,color:isIOwe?C.negative:C.olive,fontFamily:FONT.display,fontSize:13}}>{fmt(d.amount)}</span>
                        <button onClick={()=>settle(d.id)} style={{fontSize:10,padding:"4px 10px",borderRadius:99,background:isIOwe?"#2a1810":"#1a2a1a",border:`1px solid ${isIOwe?C.negative:C.olive}55`,color:isIOwe?C.negative:C.olive,cursor:"pointer",fontFamily:FONT.body}}>✓ Settle</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
          {debts.filter(d=>d.settled).length>0&&(
            <Card>
              <div style={{fontWeight:600,marginBottom:12,color:C.sandFaint,fontFamily:FONT.display,fontSize:14}}>✓ Settled</div>
              {debts.filter(d=>d.settled).map(d=>(
                <div key={d.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.bg,borderRadius:8,marginBottom:6,opacity:0.5}}>
                  <div style={{fontSize:12,color:C.sandDim,fontFamily:FONT.body}}>{d.person} · {d.note}</div>
                  <span style={{fontSize:12,fontWeight:600,color:C.sandFaint,fontFamily:FONT.display}}>{fmt(d.amount)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      );

      // ── HISTORY ──────────────────────────────────────────────────────────
      case "history": return (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Card>
            <div style={{fontWeight:600,marginBottom:4,fontFamily:FONT.display,fontSize:16,color:C.sand}}>📅 Monthly History</div>
            <div style={{fontSize:11,color:C.sandFaint,marginBottom:20,fontFamily:FONT.body}}>Carry-forward balance — like your Google Sheet</div>
            {(()=>{
              const rows=histRows();
              const cur={month:"May 2026",carry:rows[rows.length-1]?.net||0,income:totalIncome,spent:totalSpent,net:balance};
              const all=[...rows,cur];
              const maxAbs=Math.max(...all.map(r=>Math.abs(r.net)),1);
              return (
                <>
                  <div style={{display:"flex",alignItems:"flex-end",gap:6,height:90,marginBottom:16}}>
                    {all.map((r,i)=>{
                      const h=Math.max((Math.abs(r.net)/maxAbs)*78,4);
                      const isCur=i===all.length-1;
                      return (
                        <div key={r.month} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                          <div style={{width:"100%",height:h,borderRadius:"4px 4px 0 0",background:r.net>=0?C.olive:C.negative,opacity:isCur?1:0.7,border:isCur?`1px solid ${C.sand}44`:"none"}}/>
                          <div style={{fontSize:8,color:isCur?C.sky:C.sandFaint,fontFamily:FONT.body}}>{r.month.toString().slice(-5).replace("-",".")}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{overflowX:"auto"}}>
                    <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr 1fr 1fr",gap:"7px 12px",fontSize:11,minWidth:380}}>
                      {["Month","Carry-in","Income","Spent","Balance"].map(h=><div key={h} style={{color:C.sandFaint,fontWeight:600,paddingBottom:6,borderBottom:`1px solid ${C.border}`,fontFamily:FONT.body}}>{h}</div>)}
                      {all.map((r,i)=>{
                        const isCur=i===all.length-1;
                        return [
                          <div key={r.month+"m"} style={{color:isCur?C.sky:C.sandDim,fontWeight:isCur?600:400,fontFamily:FONT.body}}>{r.month}</div>,
                          <div key={r.month+"c"} style={{color:C.sandFaint,fontFamily:FONT.display}}>{fmt(r.carry)}</div>,
                          <div key={r.month+"i"} style={{color:C.olive,fontFamily:FONT.display}}>{fmt(r.income)}</div>,
                          <div key={r.month+"s"} style={{color:C.negative,fontFamily:FONT.display}}>{fmt(r.spent)}</div>,
                          <div key={r.month+"n"} style={{color:r.net>=0?C.olive:C.negative,fontWeight:600,fontFamily:FONT.display}}>{fmt(r.net)}</div>,
                        ];
                      })}
                    </div>
                  </div>
                </>
              );
            })()}
          </Card>
          <Card style={{background:C.surface2,border:`1px solid ${C.sky}33`}}>
            <div style={{fontSize:12,color:C.sky,fontWeight:600,marginBottom:6,fontFamily:FONT.body}}>💬 Ask the AI about your history</div>
            <div style={{fontSize:11,color:C.sandFaint,fontFamily:FONT.body}}>Try: "Based on my history, when will I have enough for my engagement?"</div>
          </Card>
        </div>
      );

      // ── CHAT ─────────────────────────────────────────────────────────────
      case "chat": return (
        <div style={{display:"flex",flexDirection:"column",height:isTablet?"calc(100vh - 120px)":"calc(100vh - 185px)"}}>
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,paddingBottom:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:isDesktop?"65%":"83%",padding:"12px 16px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?C.oliveDim:C.surface,border:m.role==="assistant"?`1px solid ${C.border}`:"none",fontSize:13,lineHeight:1.7,color:C.sand,whiteSpace:"pre-wrap",fontFamily:FONT.body}}>{m.text}</div>
              </div>
            ))}
            {chatLoading&&<div style={{display:"flex"}}><div style={{padding:"12px 16px",borderRadius:"18px 18px 18px 4px",background:C.surface,border:`1px solid ${C.border}`,color:C.sandFaint,fontSize:13,fontFamily:FONT.body}}>Thinking…</div></div>}
            <div ref={chatEndRef}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
            {["When can I afford my engagement goal?","Am I on track this month?","Which goal to prioritize?","How long to clear my debts?"].map(p=>(
              <button key={p} onClick={()=>setChatIn(p)} style={{fontSize:10,padding:"5px 10px",borderRadius:99,border:`1px solid ${C.border}`,background:C.surface,color:C.sandFaint,cursor:"pointer",fontFamily:FONT.body}}>{p}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Ask anything about your finances…" style={{...S.input,flex:1,padding:"11px 14px",fontSize:13}}/>
            <button onClick={sendChat} disabled={chatLoading} style={{...S.btn,padding:"11px 20px",fontSize:13}}>Send</button>
          </div>
        </div>
      );

      default: return null;
    }
  };

  // ── Layout ────────────────────────────────────────────────────────────────
  const oliveDim = "#5a6145";

  // Sidebar (tablet + desktop)
  const Sidebar = () => (
    <div style={{width:isDesktop?220:64,background:C.surface2,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0,transition:"width 0.2s"}}>
      {/* Logo */}
      <div style={{padding:isDesktop?"22px 20px 18px":"18px 0",textAlign:isDesktop?"left":"center",borderBottom:`1px solid ${C.border}`}}>
        {isDesktop
          ? <>
              <div style={{fontSize:9,letterSpacing:3,color:C.olive,textTransform:"uppercase",fontWeight:700,fontFamily:FONT.body,marginBottom:3}}>حسابي</div>
              <div style={{fontFamily:FONT.display,fontSize:20,fontWeight:700,color:C.sand,letterSpacing:-0.5}}>Hisabi</div>
              <div style={{fontFamily:FONT.arabic,fontSize:14,color:C.olive,marginTop:1}}>حسابي</div>
            </>
          : <div style={{fontFamily:FONT.display,fontSize:16,fontWeight:700,color:C.sand}}>H</div>
        }
      </div>

      {/* Nav items */}
      <div style={{flex:1,padding:isDesktop?"14px 10px":"12px 8px",display:"flex",flexDirection:"column",gap:3}}>
        {NAV.map(n=>{
          const active=tab===n.id;
          return (
            <button key={n.id} onClick={()=>setTab(n.id)} style={{display:"flex",alignItems:"center",gap:isDesktop?10:0,justifyContent:isDesktop?"flex-start":"center",padding:isDesktop?"9px 12px":"10px 0",borderRadius:9,border:"none",background:active?C.border:"transparent",color:active?C.sand:C.sandFaint,fontWeight:active?600:400,fontSize:isDesktop?13:18,cursor:"pointer",fontFamily:FONT.body,borderLeft:active&&isDesktop?`3px solid ${C.olive}`:"3px solid transparent",transition:"all 0.15s",width:"100%"}}>
              <span style={{fontSize:isDesktop?15:18,flexShrink:0}}>{n.icon}</span>
              {isDesktop&&<span>{n.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Balance pill */}
      <div style={{padding:isDesktop?"14px":"10px 6px",borderTop:`1px solid ${C.border}`}}>
        {isDesktop
          ? <div style={{background:C.bg,borderRadius:10,padding:"12px 14px",border:`1px solid ${C.border}`}}>
              <div style={{fontSize:9,color:C.sandFaint,textTransform:"uppercase",letterSpacing:1.5,marginBottom:3,fontFamily:FONT.body}}>Balance</div>
              <div style={{fontFamily:FONT.display,fontSize:16,fontWeight:700,color:balance>=0?C.olive:C.negative}}>{fmt(balance)}</div>
              <div style={{fontSize:10,color:oliveDim,marginTop:2,fontFamily:FONT.body}}>{dl} days left</div>
            </div>
          : <div style={{textAlign:"center"}}>
              <div style={{fontFamily:FONT.display,fontSize:10,fontWeight:700,color:balance>=0?C.olive:C.negative}}>{balance>=0?"↑":"↓"}</div>
            </div>
        }
      </div>
    </div>
  );

  // Mobile bottom tabs
  const MobileTabs = () => (
    <div className="mobile-only" style={{display:"flex",borderTop:`1px solid ${C.border}`,background:C.surface2,flexShrink:0}}>
      {NAV.map(n=>{
        const active=tab===n.id;
        return (
          <button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"8px 2px",border:"none",background:"transparent",color:active?C.olive:C.sandFaint,cursor:"pointer",borderTop:active?`2px solid ${C.olive}`:"2px solid transparent",transition:"all 0.15s"}}>
            <span style={{fontSize:16}}>{n.icon}</span>
            <span style={{fontSize:8,marginTop:2,fontFamily:FONT.body,fontWeight:active?600:400}}>{n.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.bg,fontFamily:FONT.body,overflow:"hidden"}}>

      {/* Tablet/Desktop: sidebar + content */}
      {isTablet
        ? <div style={{display:"flex",flex:1,overflow:"hidden"}}>
            <Sidebar/>
            <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
              {/* Topbar */}
              <div style={{padding:"14px 24px",borderBottom:`1px solid ${C.border}`,background:C.surface2,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
                <div style={{fontFamily:FONT.display,fontSize:16,fontWeight:700,color:C.sand,letterSpacing:-0.3}}>{NAV.find(n=>n.id===tab)?.icon} {NAV.find(n=>n.id===tab)?.label}</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:99,padding:"5px 12px",fontSize:11,color:C.olive,fontFamily:FONT.body}}>📅 May 2026</div>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,border:`2px solid ${C.olive}55`,fontFamily:FONT.body}}>👤</div>
                </div>
              </div>
              {/* Page */}
              <div style={{flex:1,overflowY:"auto",padding:isDesktop?"24px":"20px"}}>
                {renderPage()}
              </div>
            </div>
          </div>

        /* Mobile: header + content + bottom tabs */
        : <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
            <div style={{padding:"16px 18px 0",borderBottom:`1px solid ${C.border}`,background:C.surface2,flexShrink:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:3,color:C.olive,textTransform:"uppercase",fontWeight:700,fontFamily:FONT.body}}>حسابي · BHD</div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <div style={{fontSize:22,fontWeight:700,color:C.sand,letterSpacing:-0.5,fontFamily:FONT.display}}>Hisabi</div>
                    <div style={{fontSize:17,color:C.olive,fontFamily:FONT.arabic,fontWeight:600}}>حسابي</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:C.sandFaint,fontFamily:FONT.body}}>Balance</div>
                  <div style={{fontSize:20,fontWeight:700,color:balance>=0?C.olive:C.negative,fontFamily:FONT.display}}>{fmt(balance)}</div>
                </div>
              </div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:18}}>
              {renderPage()}
            </div>
            <MobileTabs/>
          </div>
      }
    </div>
  );
}
