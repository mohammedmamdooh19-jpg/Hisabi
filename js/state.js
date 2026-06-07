// ── Storage helpers ────────────────────────────────────────────────────────
const LS={
  get:k=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  getStr:k=>localStorage.getItem(k)||"",
  setStr:(k,v)=>localStorage.setItem(k,v),
};

function getApiKey(){return LS.getStr("hisabi_api_key");}
function saveApiKey(k){LS.setStr("hisabi_api_key",k);}
function isSetup(){return!!LS.getStr("hisabi_setup_done");}
function markSetup(){LS.setStr("hisabi_setup_done","1");}
function isGuestSession(){return LS.getStr("hisabi_guest")==="1";}
function setGuestSession(){LS.setStr("hisabi_guest","1");}
function clearGuestSession(){localStorage.removeItem("hisabi_guest");}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt=n=>"BD "+Number(n).toLocaleString("en-BH",{minimumFractionDigits:3,maximumFractionDigits:3});
const tod=()=>new Date().toISOString().split("T")[0];
const daysLeft=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth()+1,0).getDate()-n.getDate();};
const daysTotal=()=>{const n=new Date();return new Date(n.getFullYear(),n.getMonth()+1,0).getDate();};
const moUntil=s=>{if(!s)return null;const[y,m]=s.split("-").map(Number),n=new Date();return Math.max(0,(y-n.getFullYear())*12+(m-1-n.getMonth()));};

function h(tag,attrs,children){
  const el=document.createElement(tag);
  if(attrs)Object.entries(attrs).forEach(([k,v])=>{
    if(k==="style"&&typeof v==="object")Object.assign(el.style,v);
    else if(k.startsWith("on"))el.addEventListener(k.slice(2).toLowerCase(),v);
    else if(k==="className")el.className=v;
    else el.setAttribute(k,v);
  });
  if(children)(Array.isArray(children)?children:[children]).forEach(c=>{
    if(c==null||c===false)return;
    el.appendChild(typeof c==="string"?document.createTextNode(c):c);
  });
  return el;
}

// ── State ──────────────────────────────────────────────────────────────────
const defaultState={
  tab:"dashboard", moneyTab:"transactions", planTab:"budget", dashView:"weekly", catView:"list",
  loans:[],
  showLoanForm:false, newLoan:{name:"",purpose:"Other",total:"",paid:"",monthly:"",payDay:"",endDate:"",color:""},
  editingLoanId:null, editLoan:null, loanPayInputs:{},
  salary:0, carry:0, sides:[], txs:[], msgs:[{role:"assistant",text:"Hi! I'm your Hisabi assistant\n\nAsk me anything — 'Am I on track?', 'When can I afford my goal?', 'Analyse my spending habits'"}],
  limits:{Housing:500,Food:150,Transport:80,Utilities:60,Entertainment:50,Health:60,Shopping:100,Savings:150,Other:60},
  goals:[], shortcuts:[{id:1,label:"Karak",icon:"karak",amount:0.1,category:"Food",color:C.amber},{id:2,label:"Parking",icon:"parking",amount:0.2,category:"Transport",color:C.teal}],
  debts:[], history:[],
  profile:{name:"",email:"",mobile:"",newsletter:true},
  chatLoading:false, importLoading:false, importResult:null, showImportInfo:false,
  showScForm:false, showDebtForm:false, showGoalForm:false, showAddCat:false,
  editingShortcuts:false, editingScId:null, editSc:{label:"",icon:"karak",amount:"",category:"Food",color:C.amber},
  editingCat:null, editCatName:"", editCatIcon:null, editCatLimit:"",
  editingGoalId:null, editGoal:{},
  newSc:{label:"",icon:"karak",amount:"",category:"Food",color:C.amber},
  newTx:{date:tod(),desc:"",amount:"",category:"Food"},
  newSide:{date:tod(),desc:"",amount:""},
  newGoal:{name:"",icon:"○",color:C.grove,target:"",saved:"",freq:"monthly",freqAmount:"",deadline:"",type:"save"},
  newDebt:{person:"",amount:"",direction:"i-owe",note:"",date:tod()},
  newCatName:"",newCatLimit:"",newCatIcon:"",
  gInputs:{},
  feedbackType:"Feature idea", feedbackDraft:"", feedbackSent:false,
};

let state=Object.assign({},defaultState,LS.get("hisabi_state")||{});
// Ensure all arrays are actually arrays after merge
["sides","txs","goals","shortcuts","debts","history","loans","msgs"].forEach(k=>{if(!Array.isArray(state[k]))state[k]=defaultState[k]||[];});
// Ensure limits is an object
if(typeof state.limits!=="object"||Array.isArray(state.limits))state.limits=defaultState.limits;
// Ensure profile is an object
if(typeof state.profile!=="object"||!state.profile)state.profile=defaultState.profile;

function saveState(){
  const toSave={...state};
  delete toSave.chatLoading;delete toSave.importLoading;delete toSave.importResult;
  LS.set("hisabi_state",toSave);
}

function derived(){
  const sides=Array.isArray(state.sides)?state.sides:[];
  const txs=Array.isArray(state.txs)?state.txs:[];
  const debts=Array.isArray(state.debts)?state.debts:[];
  const limits=state.limits||{};
  const totalSide=sides.reduce((s,i)=>s+Number(i.amount||0),0);
  const totalIncome=Number(state.salary||0)+totalSide+Number(state.carry||0);
  const byCat=CATS.reduce((a,c)=>{a[c]=txs.filter(t=>t.category===c).reduce((s,t)=>s+Number(t.amount||0),0);return a;},{});
  const totalSpent=Object.values(byCat).reduce((a,b)=>a+b,0);
  const balance=totalIncome-totalSpent;
  const dp=new Date().getDate();
  const rate=dp>0?totalSpent/dp:0;
  const projSpend=rate*daysTotal();
  const owedToMe=debts.filter(d=>!d.settled&&d.direction==="they-owe").reduce((s,d)=>s+Number(d.amount||0),0);
  const iOwe=debts.filter(d=>!d.settled&&d.direction==="i-owe").reduce((s,d)=>s+Number(d.amount||0),0);
  const overBudget=CATS.filter(c=>byCat[c]>(limits[c]||0));
  return{totalSide,totalIncome,byCat,totalSpent,balance,rate,projSpend,owedToMe,iOwe,overBudget};
}
function histRows(){let c=0;return(state.history||[]).map(h=>{const net=c+h.income-h.spent;const r={...h,carry:c,net};c=net;return r;});}

function render(){
  renderRoot();
}
