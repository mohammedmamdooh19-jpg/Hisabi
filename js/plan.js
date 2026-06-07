// ══════════════════════════════════════════════════════════════════════════
// PLAN TAB (Budget + Goals + Loans + Pay Back)
// ══════════════════════════════════════════════════════════════════════════
function renderPlan(el,d){
  const tabs=h("div",{className:"sub-tabs"});
  ["budget","goals","loans","payback"].forEach(t=>{
    tabs.appendChild(h("button",{className:"sub-tab"+(state.planTab===t?" active":""),onClick:()=>{state.planTab=t;render();}},{budget:"Budget",goals:"Goals",loans:"Loans",payback:"Pay Back"}[t]));
  });
  el.appendChild(tabs);
  if(state.planTab==="budget") renderBudget(el,d);
  else if(state.planTab==="goals") renderGoals(el,d);
  else if(state.planTab==="loans") renderLoans(el,d);
  else renderDebts(el,d);
}

// ── Budget ────────────────────────────────────────────────────────────────
function renderBudget(el,d){
  const lCard=h("div",{className:"card"});
  const lHdr=h("div",{className:"sec-hdr"});
  lHdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"Category Limits"));
  lHdr.appendChild(h("button",{className:"btn-ghost",style:{fontSize:11,padding:"5px 12px",color:C.grove,borderColor:C.grove+"66"},onClick:()=>{state.showAddCat=!state.showAddCat;render();}},"+ Add"));
  lCard.appendChild(lHdr);
  if(state.showAddCat){
    const fb=h("div",{className:"form-box",style:{marginBottom:14}});
    fb.appendChild(h("div",{style:{fontSize:12,color:C.grove,fontWeight:600,marginBottom:10}},"New Category"));
    const row=h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}});
    const ni=h("input",{className:"inp",placeholder:"Category name",value:state.newCatName||""});ni.addEventListener("input",e=>state.newCatName=e.target.value);
    const li=h("input",{className:"inp",type:"number",step:"0.001",placeholder:"Limit (BD)",value:state.newCatLimit||""});li.addEventListener("input",e=>state.newCatLimit=e.target.value);
    row.appendChild(ni);row.appendChild(li);fb.appendChild(row);
    const btns=h("div",{style:{display:"flex",gap:8}});
    btns.appendChild(h("button",{className:"btn-primary",style:{marginTop:0,flex:1},onClick:()=>{const name=(state.newCatName||"").trim();if(!name)return;if(!CATS.includes(name)){CATS.push(name);CAT_COLORS[name]=C.grove;CAT_ICONS[name]=name.slice(0,2).toUpperCase();state.limits[name]=Number(state.newCatLimit||0);}state.newCatName="";state.newCatLimit="";state.showAddCat=false;render();}},"+ Create"));
    btns.appendChild(h("button",{className:"btn-ghost",onClick:()=>{state.showAddCat=false;render();}},"Cancel"));fb.appendChild(btns);lCard.appendChild(fb);
  }
  CATS.forEach(cat=>{
    const isEditing=state.editingCat===cat;
    const wrapper=h("div",{style:{marginBottom:8,borderRadius:12,border:"1px solid "+(isEditing?C.grove+"55":C.border),overflow:"hidden"}});
    const mainRow=h("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:isEditing?C.mint:"#fff"}});
    const catDot=h("div",{style:{width:34,height:34,borderRadius:"50%",background:(CAT_COLORS[cat]||C.grove)+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}});
    const innerDot=h("div",{style:{width:12,height:12,borderRadius:"50%",background:CAT_COLORS[cat]||C.grove}});
    catDot.appendChild(innerDot);
    mainRow.appendChild(catDot);
    const nameStack=h("div",{style:{flex:1,minWidth:0}});
    nameStack.appendChild(h("div",{style:{fontSize:13,color:C.gray1,fontWeight:500}},cat));
    nameStack.appendChild(h("div",{style:{fontSize:11,color:C.grove,fontFamily:"'Lora',serif",fontWeight:600,marginTop:1}},fmt(state.limits[cat]||0)));
    mainRow.appendChild(nameStack);
    mainRow.appendChild(h("button",{style:{background:isEditing?C.grove:C.gray4,color:isEditing?"#fff":C.gray2,border:"1px solid "+(isEditing?C.grove:C.gray3),borderRadius:8,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:500,flexShrink:0},onClick:()=>{if(isEditing){state.editingCat=null;state.editCatName="";state.editCatIcon=null;state.editCatLimit="";}else{state.editingCat=cat;state.editCatName=cat;state.editCatIcon=CAT_ICONS[cat]||cat.slice(0,2).toUpperCase();state.editCatLimit=String(state.limits[cat]||0);}render();}},isEditing?"Done":"Edit"));
    wrapper.appendChild(mainRow);
    if(isEditing){
      const panel=h("div",{style:{padding:"14px",background:"#fff",borderTop:"1px solid "+C.grove+"22"}});
      const topRow=h("div",{style:{display:"grid",gridTemplateColumns:"1fr auto",gap:8,marginBottom:12}});
      const nameInp=h("input",{className:"inp",placeholder:"Category name",value:state.editCatName||cat});nameInp.addEventListener("input",e=>state.editCatName=e.target.value);
      const amtInp=h("input",{className:"inp",type:"number",step:"0.001",placeholder:"Limit (BD)",value:state.editCatLimit||state.limits[cat]||0,style:{width:110,textAlign:"right"}});amtInp.addEventListener("focus",e=>e.target.select());amtInp.addEventListener("input",e=>state.editCatLimit=e.target.value);
      topRow.appendChild(nameInp);topRow.appendChild(amtInp);panel.appendChild(topRow);
      const btns=h("div",{style:{display:"flex",gap:8}});
      btns.appendChild(h("button",{className:"btn-primary",style:{marginTop:0,flex:1},onClick:()=>{const newName=(state.editCatName||cat).trim();const newLimit=Number(state.editCatLimit||0);const newIcon=state.editCatIcon||CAT_ICONS[cat]||cat.slice(0,2).toUpperCase();if(newName&&newName!==cat){const idx=CATS.indexOf(cat);if(idx>-1)CATS[idx]=newName;state.limits[newName]=newLimit;CAT_COLORS[newName]=CAT_COLORS[cat]||C.grove;CAT_ICONS[newName]=newIcon;delete state.limits[cat];delete CAT_COLORS[cat];delete CAT_ICONS[cat];}else{state.limits[cat]=newLimit;CAT_ICONS[cat]=newIcon;}state.editingCat=null;state.editCatName="";state.editCatIcon=null;state.editCatLimit="";render();}},"✓ Save Changes"));
      btns.appendChild(h("button",{className:"btn-coral",onClick:()=>{if(confirm("Delete "+cat+"?")){const idx=CATS.indexOf(cat);if(idx>-1){CATS.splice(idx,1);delete state.limits[cat];delete CAT_COLORS[cat];delete CAT_ICONS[cat];}state.editingCat=null;render();}}},"Delete"));
      panel.appendChild(btns);wrapper.appendChild(panel);
    }
    lCard.appendChild(wrapper);
  });
  const total=h("div",{style:{borderTop:"1px solid "+C.border,paddingTop:12,marginTop:4,display:"flex",justifyContent:"space-between",alignItems:"center"}});
  total.appendChild(h("span",{style:{fontWeight:600,color:C.gray1,fontSize:14}},"Total Budget"));
  total.appendChild(h("span",{style:{fontWeight:700,color:C.grove,fontFamily:"'Lora',serif",fontSize:16}},fmt(Object.values(state.limits).reduce((a,b)=>a+b,0))));
  lCard.appendChild(total);el.appendChild(lCard);
}

// ── Goals ─────────────────────────────────────────────────────────────────
function renderGoals(el,d){
  const hCard=h("div",{className:"card"});
  const hHdr=h("div",{className:"sec-hdr"});
  hHdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"Savings Goals"));
  hHdr.appendChild(h("button",{className:"btn-ghost",onClick:()=>{state.showGoalForm=!state.showGoalForm;state.editingGoalId=null;render();}},state.showGoalForm?"✕ Cancel":"+ New Goal"));
  hCard.appendChild(hHdr);
  if(state.showGoalForm){
    const fb=h("div",{className:"form-box"});
    fb.appendChild(h("div",{style:{fontSize:12,color:C.grove,fontWeight:600,marginBottom:12}},"New Goal"));
    const fr=h("div",{className:"form-row"});
    const ni=h("input",{className:"inp form-full",placeholder:"Goal name",value:state.newGoal.name});ni.addEventListener("input",e=>state.newGoal.name=e.target.value);
    const ti=h("input",{className:"inp",placeholder:"Target (BD)",type:"number",step:"0.001",value:state.newGoal.target});ti.addEventListener("input",e=>state.newGoal.target=e.target.value);
    const si2=h("input",{className:"inp",placeholder:"Already saved (BD)",type:"number",step:"0.001",value:state.newGoal.saved});si2.addEventListener("input",e=>state.newGoal.saved=e.target.value);
    const fs=h("select",{className:"inp"});fs.addEventListener("change",e=>state.newGoal.freq=e.target.value);["daily","weekly","monthly"].forEach(f=>{const o=h("option",null,f);if(f===state.newGoal.freq)o.selected=true;fs.appendChild(o);});
    const fa=h("input",{className:"inp",placeholder:"Save per period (BD)",type:"number",step:"0.001",value:state.newGoal.freqAmount});fa.addEventListener("input",e=>state.newGoal.freqAmount=e.target.value);
    const dl=h("div",{className:"form-full"});dl.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:4}},"Target Date (optional)"));const di=h("input",{className:"inp",type:"date",value:state.newGoal.deadline});di.addEventListener("change",e=>state.newGoal.deadline=e.target.value);dl.appendChild(di);
    const tp=h("div",{className:"form-full"});tp.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:6}},"Goal Type"));const pills=h("div",{className:"type-pills"});["save","purchase","experience","personal"].forEach(type=>{pills.appendChild(h("button",{className:"type-pill"+(state.newGoal.type===type?" sel":""),onClick:()=>{state.newGoal.type=type;render();}},type));});tp.appendChild(pills);
    fr.appendChild(ni);fr.appendChild(ti);fr.appendChild(si2);fr.appendChild(fs);fr.appendChild(fa);fr.appendChild(dl);fr.appendChild(tp);fb.appendChild(fr);
    fb.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:5}},"Icon"));const ip=h("div",{className:"icon-picker"});GOAL_ICONS.forEach(ic=>ip.appendChild(h("button",{className:"icon-btn"+(state.newGoal.icon===ic?" sel":""),onClick:()=>{state.newGoal.icon=ic;render();}},ic)));fb.appendChild(ip);
    fb.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:5}},"Color"));const cp=h("div",{className:"color-picker"});GOAL_COLORS.forEach(col=>cp.appendChild(h("div",{className:"color-dot"+(state.newGoal.color===col?" sel":""),style:{background:col},onClick:()=>{state.newGoal.color=col;render();}})));fb.appendChild(cp);
    fb.appendChild(h("button",{className:"btn-primary",onClick:()=>{if(!state.newGoal.name||!state.newGoal.target)return;state.goals.push({...state.newGoal,id:Date.now(),target:Number(state.newGoal.target),saved:Number(state.newGoal.saved||0),freqAmount:Number(state.newGoal.freqAmount||0)});state.newGoal={name:"",icon:"○",color:C.grove,target:"",saved:"",freq:"monthly",freqAmount:"",deadline:"",type:"save"};state.showGoalForm=false;render();}},"+ Create Goal"));
    hCard.appendChild(fb);
  }
  el.appendChild(hCard);
  state.goals.forEach(g=>{
    const pct=Math.min((g.saved/g.target)*100,100);const rem=g.target-g.saved;const ml=g.freqAmount>0?Math.ceil(rem/g.freqAmount):null;const dl2=moUntil(g.deadline);const done=g.saved>=g.target;const isEditing=state.editingGoalId===g.id;
    const card=h("div",{className:"card",style:{borderColor:isEditing?C.grove+"55":done?g.color+"66":C.border}});
    const top=h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}});
    const tl=h("div",{style:{display:"flex",alignItems:"center",gap:10}});
    tl.appendChild(h("div",{style:{width:42,height:42,borderRadius:"50%",background:g.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},g.icon));
    const info=h("div");info.appendChild(h("div",{style:{fontWeight:600,fontSize:14,color:C.gray1,fontFamily:"'Lora',serif"}},g.name));if(g.type)info.appendChild(h("span",{className:"badge badge-green",style:{marginTop:3,display:"inline-block"}},g.type));if(ml&&!done)info.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginTop:2}},ml+" months to complete"));if(done)info.appendChild(h("div",{style:{fontSize:11,color:g.color,marginTop:2}},"Goal reached"));
    tl.appendChild(info);top.appendChild(tl);
    const tr=h("div",{style:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}});
    tr.appendChild(h("div",{style:{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:g.color}},Math.round(pct)+"%"));
    tr.appendChild(h("button",{style:{background:isEditing?C.grove:C.gray4,color:isEditing?"#fff":C.gray2,border:"1px solid "+(isEditing?C.grove:C.gray3),borderRadius:8,padding:"4px 12px",fontSize:11,cursor:"pointer",fontWeight:500},onClick:()=>{if(isEditing){state.editingGoalId=null;}else{state.editingGoalId=g.id;state.editGoal={name:g.name,icon:g.icon,color:g.color,target:g.target>0?String(g.target):"",saved:g.saved>0?String(g.saved):"",freq:g.freq||"monthly",freqAmount:g.freqAmount>0?String(g.freqAmount):"",deadline:g.deadline||"",type:g.type||"save"};}render();}},isEditing?"Done":"Edit"));
    top.appendChild(tr);card.appendChild(top);
    if(isEditing){
      const panel=h("div",{style:{background:C.gray4,borderRadius:12,padding:14,marginBottom:14,border:"1px solid "+C.grove+"22"}});
      panel.appendChild(h("div",{style:{fontSize:11,color:C.grove,fontWeight:600,marginBottom:10}},"Edit Goal"));
      const fr=h("div",{className:"form-row"});
      const ni=h("input",{className:"inp form-full",placeholder:"Goal name",value:state.editGoal.name});ni.addEventListener("input",e=>state.editGoal.name=e.target.value);
      const ti=h("input",{className:"inp",placeholder:"Target (BD)",type:"number",step:"0.001",value:state.editGoal.target});ti.addEventListener("input",e=>state.editGoal.target=e.target.value);
      const si2=h("input",{className:"inp",placeholder:"Saved so far (BD)",type:"number",step:"0.001",value:state.editGoal.saved});si2.addEventListener("input",e=>state.editGoal.saved=e.target.value);
      const fs=h("select",{className:"inp"});fs.addEventListener("change",e=>state.editGoal.freq=e.target.value);["daily","weekly","monthly"].forEach(f=>{const o=h("option",null,f);if(f===state.editGoal.freq)o.selected=true;fs.appendChild(o);});
      const fa=h("input",{className:"inp",placeholder:"Save per period (BD)",type:"number",step:"0.001",value:state.editGoal.freqAmount});fa.addEventListener("input",e=>state.editGoal.freqAmount=e.target.value);
      const dl=h("div",{className:"form-full"});dl.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:4}},"Target Date"));const di=h("input",{className:"inp",type:"date",value:state.editGoal.deadline});di.addEventListener("change",e=>state.editGoal.deadline=e.target.value);dl.appendChild(di);
      const tp=h("div",{className:"form-full"});tp.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:6}},"Goal Type"));const pills=h("div",{className:"type-pills"});["save","purchase","experience","personal"].forEach(type=>{pills.appendChild(h("button",{className:"type-pill"+(state.editGoal.type===type?" sel":""),onClick:()=>{state.editGoal.type=type;render();}},type));});tp.appendChild(pills);
      fr.appendChild(ni);fr.appendChild(ti);fr.appendChild(si2);fr.appendChild(fs);fr.appendChild(fa);fr.appendChild(dl);fr.appendChild(tp);panel.appendChild(fr);
      panel.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:5}},"Icon"));const ip=h("div",{className:"icon-picker"});GOAL_ICONS.forEach(ic=>ip.appendChild(h("button",{className:"icon-btn"+(state.editGoal.icon===ic?" sel":""),onClick:()=>{state.editGoal.icon=ic;render();}},ic)));panel.appendChild(ip);
      panel.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:5}},"Color"));const cp=h("div",{className:"color-picker",style:{marginBottom:12}});GOAL_COLORS.forEach(col=>cp.appendChild(h("div",{className:"color-dot"+(state.editGoal.color===col?" sel":""),style:{background:col},onClick:()=>{state.editGoal.color=col;render();}})));panel.appendChild(cp);
      const btns=h("div",{style:{display:"flex",gap:8}});
      btns.appendChild(h("button",{className:"btn-primary",style:{marginTop:0,flex:1},onClick:()=>{state.goals=state.goals.map(x=>x.id===g.id?{...x,...state.editGoal,target:Number(state.editGoal.target),saved:Number(state.editGoal.saved||0),freqAmount:Number(state.editGoal.freqAmount||0)}:x);state.editingGoalId=null;render();}},"✓ Save Changes"));
      btns.appendChild(h("button",{className:"btn-coral",onClick:()=>{if(confirm("Delete "+g.name+"?")){state.goals=state.goals.filter(x=>x.id!==g.id);state.editingGoalId=null;render();}}},"Delete"));
      panel.appendChild(btns);card.appendChild(panel);
    }
    const track=h("div",{className:"goal-bar",style:{background:C.bg}});track.appendChild(h("div",{style:{width:pct+"%",height:"100%",background:g.color,borderRadius:99}}));card.appendChild(track);
    const stats=h("div",{style:{display:"flex",justifyContent:"space-between",fontSize:11,color:C.gray2,margin:"8px 0 12px"}});
    const sp=h("span");sp.appendChild(document.createTextNode("Saved "));sp.appendChild(h("span",{style:{color:g.color,fontWeight:600,fontFamily:"'Lora',serif"}},fmt(g.saved)));stats.appendChild(sp);
    const tp2=h("span");tp2.appendChild(document.createTextNode("Target "));tp2.appendChild(h("span",{style:{fontFamily:"'Lora',serif",color:C.gray1}},fmt(g.target)));stats.appendChild(tp2);
    const lp=h("span");lp.appendChild(document.createTextNode("Left "));lp.appendChild(h("span",{style:{color:C.amber,fontFamily:"'Lora',serif"}},fmt(rem)));stats.appendChild(lp);
    card.appendChild(stats);
    if(g.deadline&&dl2!==null) card.appendChild(h("div",{style:{background:C.tealLight,borderRadius:8,padding:"7px 11px",fontSize:11,color:C.teal,marginBottom:12,fontWeight:500}},dl2+" months to your deadline of "+g.deadline));
    if(!done&&!isEditing){
      const cr=h("div",{style:{display:"flex",gap:8}});
      const gi=h("input",{className:"inp",type:"number",step:"0.001",placeholder:"Add savings (BD)",value:state.gInputs[g.id]||""});gi.addEventListener("input",e=>state.gInputs[g.id]=e.target.value);
      cr.appendChild(gi);cr.appendChild(h("button",{style:{background:g.color,color:"#fff",border:"none",borderRadius:10,padding:"0 16px",fontSize:12,cursor:"pointer",fontWeight:600,flexShrink:0},onClick:()=>{const v=Number(state.gInputs[g.id]||0);if(v<=0)return;state.goals=state.goals.map(gg=>gg.id===g.id?{...gg,saved:Math.min(gg.saved+v,gg.target)}:gg);state.gInputs[g.id]="";render();}},"+ Save"));
      card.appendChild(cr);
    }
    el.appendChild(card);
  });
}

// ── Loans ─────────────────────────────────────────────────────────────────
function renderLoans(el,d){
  if(!state.loans) state.loans=[];

  const totalOwed=state.loans.reduce((s,l)=>s+(l.total-l.paid),0);
  const totalMonthly=state.loans.reduce((s,l)=>s+l.monthly,0);
  if(state.loans.length>0){
    const sumCard=h("div",{className:"card"});
    const sg=h("div",{className:"grid2"});
    sg.appendChild(h("div",{className:"stat-card alert-neg"},[h("div",{className:"lbl",style:{color:C.coralDark}},"Total Remaining"),h("div",{className:"num",style:{fontSize:16,color:C.coralDark}},fmt(totalOwed))]));
    sg.appendChild(h("div",{className:"stat-card alert-warn"},[h("div",{className:"lbl",style:{color:"#8a5a00"}},"Monthly Installments"),h("div",{className:"num",style:{fontSize:16,color:"#8a5a00"}},fmt(totalMonthly))]));
    sumCard.appendChild(sg);
    el.appendChild(sumCard);
  }

  const hCard=h("div",{className:"card"});
  const hHdr=h("div",{className:"sec-hdr"});
  hHdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"My Loans"));
  hHdr.appendChild(h("button",{className:"btn-ghost",onClick:()=>{state.showLoanForm=!state.showLoanForm;render();}},state.showLoanForm?"✕ Cancel":"+ Add Loan"));
  hCard.appendChild(hHdr);

  if(state.showLoanForm){
    const fb=h("div",{className:"form-box"});
    fb.appendChild(h("div",{style:{fontSize:12,color:C.grove,fontWeight:600,marginBottom:12}},"New Loan"));
    if(!state.newLoan) state.newLoan={name:"",purpose:"Other",total:"",paid:"",monthly:"",payDay:"",endDate:"",color:C.coral};
    const fr=h("div",{className:"form-row"});
    [["name","Loan name (e.g. Car Loan - NBB)","text","form-full"],["total","Total loan amount (BD)","number",""],["paid","Already paid (BD)","number",""],["monthly","Monthly installment (BD)","number",""],["payDay","Payment day of month","number",""]].forEach(([key,ph,type,cls])=>{
      const inp=h("input",{className:"inp "+cls,placeholder:ph,type:type,step:"0.001",value:state.newLoan[key]||""});
      inp.addEventListener("input",e=>state.newLoan[key]=e.target.value);
      fr.appendChild(inp);
    });
    const de=h("div",{className:"form-full"});
    de.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:4}},"Loan end date"));
    const dei=h("input",{className:"inp",type:"date",value:state.newLoan.endDate||""});
    dei.addEventListener("change",e=>state.newLoan.endDate=e.target.value);
    de.appendChild(dei);fr.appendChild(de);
    const pu=h("div",{className:"form-full"});
    pu.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:6}},"Purpose"));
    const pills=h("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}});
    ["Car","Home","Personal","Education","Medical","Other"].forEach(p=>{
      const pill=h("button",{style:{padding:"5px 10px",borderRadius:99,fontSize:11,cursor:"pointer",border:"1px solid "+(state.newLoan.purpose===p?C.grove:C.gray3),background:state.newLoan.purpose===p?C.mint:"#fff",color:state.newLoan.purpose===p?C.grove:C.gray2,fontFamily:"'Plus Jakarta Sans',sans-serif"}});
      pill.textContent=p;
      pill.addEventListener("click",()=>{state.newLoan.purpose=p;render();});
      pills.appendChild(pill);
    });
    pu.appendChild(pills);fr.appendChild(pu);
    fb.appendChild(fr);
    fb.appendChild(h("button",{className:"btn-primary",style:{marginTop:0},onClick:()=>{
      if(!state.newLoan.name||!state.newLoan.total)return;
      state.loans.push({...state.newLoan,id:Date.now(),total:Number(state.newLoan.total)||0,paid:Number(state.newLoan.paid)||0,monthly:Number(state.newLoan.monthly)||0,payDay:Number(state.newLoan.payDay)||1});
      state.newLoan={name:"",purpose:"Other",total:"",paid:"",monthly:"",payDay:"",endDate:"",color:C.coral};
      state.showLoanForm=false;render();
    }},"+ Add Loan"));
    hCard.appendChild(fb);
  }
  el.appendChild(hCard);

  if(state.loans.length===0){
    el.appendChild(h("div",{className:"card",style:{textAlign:"center",padding:"32px 20px",background:C.tealLight,border:"1px solid "+C.tealMid+"44"}},[
      h("div",{style:{fontSize:36,marginBottom:12}},"—"),
      h("div",{style:{fontSize:14,fontWeight:600,color:C.teal,marginBottom:6}},"No loans tracked yet"),
      h("div",{style:{fontSize:12,color:C.teal,lineHeight:1.6}},"Add your loans above to track how much you owe and when you'll be free."),
    ]));
    return;
  }

  state.loans.forEach(loan=>{
    const remaining=loan.total-loan.paid;
    const pct=loan.total>0?Math.min((loan.paid/loan.total)*100,100):0;
    const monthsLeft=loan.monthly>0?Math.ceil(remaining/loan.monthly):null;
    const isEditing=state.editingLoanId===loan.id;

    const now=new Date();
    let nextPay=new Date(now.getFullYear(),now.getMonth(),loan.payDay);
    if(nextPay<=now) nextPay=new Date(now.getFullYear(),now.getMonth()+1,loan.payDay);
    const daysToNext=Math.ceil((nextPay-now)/(1000*60*60*24));

    const card=h("div",{className:"card",style:{borderColor:isEditing?C.grove+"55":C.border}});

    const top=h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}});
    const tl=h("div");
    tl.appendChild(h("div",{style:{fontFamily:"'Lora',serif",fontSize:15,fontWeight:700,color:C.gray1,marginBottom:4}},loan.name));
    tl.appendChild(h("div",{style:{fontSize:11,color:C.gray2}},loan.purpose));
    if(daysToNext<=7) tl.appendChild(h("div",{style:{fontSize:11,color:C.coral,fontWeight:600,marginTop:4}},"Payment in "+daysToNext+" days — "+fmt(loan.monthly)));
    else tl.appendChild(h("div",{style:{fontSize:11,color:C.gray2,marginTop:4}},"Next payment in "+daysToNext+" days"));
    top.appendChild(tl);
    const editBtn=h("button",{style:{background:isEditing?C.grove:C.gray4,color:isEditing?"#fff":C.gray2,border:"1px solid "+(isEditing?C.grove:C.gray3),borderRadius:8,padding:"4px 12px",fontSize:11,cursor:"pointer",fontWeight:500}});
    editBtn.textContent=isEditing?"Done":"Edit";
    editBtn.addEventListener("click",()=>{
      if(isEditing){state.editingLoanId=null;}
      else{state.editingLoanId=loan.id;state.editLoan={...loan,total:String(loan.total),paid:String(loan.paid),monthly:String(loan.monthly),payDay:String(loan.payDay)};}
      render();
    });
    top.appendChild(editBtn);
    card.appendChild(top);

    const ringWrap=h("div",{style:{display:"flex",alignItems:"center",gap:20,marginBottom:16}});
    const size=90;const r=36;const circ=2*Math.PI*r;const filled=(pct/100)*circ;
    const svgNS="http://www.w3.org/2000/svg";
    const svg=document.createElementNS(svgNS,"svg");
    svg.setAttribute("width",size);svg.setAttribute("height",size);svg.setAttribute("viewBox","0 0 90 90");
    const bgC=document.createElementNS(svgNS,"circle");
    bgC.setAttribute("cx","45");bgC.setAttribute("cy","45");bgC.setAttribute("r",r);
    bgC.setAttribute("fill","none");bgC.setAttribute("stroke",C.border);bgC.setAttribute("stroke-width","10");
    svg.appendChild(bgC);
    const pgC=document.createElementNS(svgNS,"circle");
    pgC.setAttribute("cx","45");pgC.setAttribute("cy","45");pgC.setAttribute("r",r);
    pgC.setAttribute("fill","none");pgC.setAttribute("stroke",pct>80?C.teal:pct>40?C.amber:C.coral);pgC.setAttribute("stroke-width","10");
    pgC.setAttribute("stroke-dasharray",filled+" "+circ);pgC.setAttribute("stroke-dashoffset","0");
    pgC.setAttribute("transform","rotate(-90 45 45)");
    svg.appendChild(pgC);
    const txt=document.createElementNS(svgNS,"text");
    txt.setAttribute("x","45");txt.setAttribute("y","45");txt.setAttribute("text-anchor","middle");txt.setAttribute("dominant-baseline","central");
    txt.setAttribute("font-size","16");txt.setAttribute("font-weight","700");txt.setAttribute("fill",C.gray1);
    txt.textContent=Math.round(pct)+"%";
    svg.appendChild(txt);
    const sub=document.createElementNS(svgNS,"text");
    sub.setAttribute("x","45");sub.setAttribute("y","60");sub.setAttribute("text-anchor","middle");
    sub.setAttribute("font-size","8");sub.setAttribute("fill",C.gray2);sub.textContent="paid off";
    svg.appendChild(sub);
    ringWrap.appendChild(svg);

    const stats=h("div",{style:{flex:1}});
    [["Total Loan",fmt(loan.total),C.gray1],["Paid",fmt(loan.paid),C.teal],["Remaining",fmt(remaining),C.coral],["Monthly",fmt(loan.monthly),C.amber]].forEach(([l,v,col])=>{
      const row=h("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6}});
      row.appendChild(h("span",{style:{fontSize:11,color:C.gray2}},l));
      row.appendChild(h("span",{style:{fontSize:11,fontWeight:600,color:col,fontFamily:"'Lora',serif"}},v));
      stats.appendChild(row);
    });
    ringWrap.appendChild(stats);
    card.appendChild(ringWrap);

    const track=h("div",{style:{background:C.bg,borderRadius:99,height:8,overflow:"hidden",marginBottom:6}});
    track.appendChild(h("div",{style:{width:pct+"%",height:"100%",background:pct>80?C.teal:pct>40?C.amber:C.coral,borderRadius:99}}));
    card.appendChild(track);
    const meta=h("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray2,marginBottom:12}});
    meta.appendChild(h("span",null,Math.round(pct)+"% paid off"));
    if(monthsLeft) meta.appendChild(h("span",{style:{color:monthsLeft<6?C.coral:C.gray2}},monthsLeft+" months remaining"));
    if(loan.endDate) meta.appendChild(h("span",null,"Ends "+loan.endDate));
    card.appendChild(meta);

    if(!isEditing){
      const payRow=h("div",{style:{display:"flex",gap:8}});
      const payInp=h("input",{className:"inp",type:"number",step:"0.001",placeholder:"Record a payment (BD)",value:state.loanPayInputs&&state.loanPayInputs[loan.id]||""});
      payInp.addEventListener("input",e=>{if(!state.loanPayInputs)state.loanPayInputs={};state.loanPayInputs[loan.id]=e.target.value;});
      payRow.appendChild(payInp);
      const payBtn=h("button",{style:{background:C.grove,color:"#fff",border:"none",borderRadius:10,padding:"0 14px",fontSize:12,cursor:"pointer",fontWeight:600,flexShrink:0}});
      payBtn.textContent="✓ Paid";
      payBtn.addEventListener("click",()=>{
        const v=Number(state.loanPayInputs&&state.loanPayInputs[loan.id]||0);
        if(v<=0)return;
        state.loans=state.loans.map(l=>l.id===loan.id?{...l,paid:Math.min(l.paid+v,l.total)}:l);
        if(!state.loanPayInputs)state.loanPayInputs={};
        state.loanPayInputs[loan.id]="";
        render();
      });
      payRow.appendChild(payBtn);
      card.appendChild(payRow);
    }

    if(isEditing){
      const panel=h("div",{style:{background:C.gray4,borderRadius:12,padding:14,border:"1px solid "+C.grove+"22",marginTop:10}});
      const fr=h("div",{className:"form-row"});
      if(!state.editLoan)state.editLoan={...loan,total:String(loan.total),paid:String(loan.paid),monthly:String(loan.monthly),payDay:String(loan.payDay)};
      [["name","Loan name","text","form-full"],["total","Total amount (BD)","number",""],["paid","Paid so far (BD)","number",""],["monthly","Monthly (BD)","number",""],["payDay","Payment day","number",""]].forEach(([key,ph,type,cls])=>{
        const inp=h("input",{className:"inp "+cls,placeholder:ph,type:type,step:"0.001",value:state.editLoan[key]||""});
        inp.addEventListener("input",e=>state.editLoan[key]=e.target.value);
        fr.appendChild(inp);
      });
      const de2=h("div",{className:"form-full"});
      de2.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:4}},"End date"));
      const dei2=h("input",{className:"inp",type:"date",value:state.editLoan.endDate||""});
      dei2.addEventListener("change",e=>state.editLoan.endDate=e.target.value);
      de2.appendChild(dei2);fr.appendChild(de2);
      panel.appendChild(fr);
      const btns=h("div",{style:{display:"flex",gap:8}});
      btns.appendChild(h("button",{className:"btn-primary",style:{marginTop:0,flex:1},onClick:()=>{
        state.loans=state.loans.map(l=>l.id===loan.id?{...l,...state.editLoan,total:Number(state.editLoan.total)||0,paid:Number(state.editLoan.paid)||0,monthly:Number(state.editLoan.monthly)||0,payDay:Number(state.editLoan.payDay)||1}:l);
        state.editingLoanId=null;render();
      }},"✓ Save"));
      btns.appendChild(h("button",{className:"btn-coral",onClick:()=>{if(confirm("Delete "+loan.name+"?")){state.loans=state.loans.filter(l=>l.id!==loan.id);state.editingLoanId=null;render();}}},"Delete"));
      panel.appendChild(btns);card.appendChild(panel);
    }

    el.appendChild(card);
  });
}

// ── Debts ─────────────────────────────────────────────────────────────────
function renderDebts(el,d){
  const grid=h("div",{className:"grid2"});
  grid.appendChild(h("div",{className:"stat-card alert-pos"},[h("div",{className:"lbl",style:{color:C.teal}},"Owed to You"),h("div",{className:"num",style:{fontSize:20,color:C.teal}},fmt(d.owedToMe)),h("div",{style:{fontSize:10,color:C.teal+"99",marginTop:3}},state.debts.filter(x=>!x.settled&&x.direction==="they-owe").length+" people")]));
  grid.appendChild(h("div",{className:"stat-card alert-neg"},[h("div",{className:"lbl",style:{color:C.coralDark}},"You Owe"),h("div",{className:"num",style:{fontSize:20,color:C.coralDark}},fmt(d.iOwe)),h("div",{style:{fontSize:10,color:C.coral+"99",marginTop:3}},state.debts.filter(x=>!x.settled&&x.direction==="i-owe").length+" people")]));
  el.appendChild(grid);
  const mainCard=h("div",{className:"card"});
  const mHdr=h("div",{className:"sec-hdr"});
  mHdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"Pay Back Tracker"));
  mHdr.appendChild(h("button",{className:"btn-ghost",onClick:()=>{state.showDebtForm=!state.showDebtForm;render();}},state.showDebtForm?"✕ Cancel":"+ Add"));
  mainCard.appendChild(mHdr);
  if(state.showDebtForm){
    const fb=h("div",{className:"form-box"});
    const fr=h("div",{className:"form-row"});
    const pn=h("input",{className:"inp form-full",placeholder:"Person's name",value:state.newDebt.person});pn.addEventListener("input",e=>state.newDebt.person=e.target.value);
    const am=h("input",{className:"inp",placeholder:"Amount (BD)",type:"number",step:"0.001",value:state.newDebt.amount});am.addEventListener("input",e=>state.newDebt.amount=e.target.value);
    const da=h("input",{className:"inp",type:"date",value:state.newDebt.date});da.addEventListener("change",e=>state.newDebt.date=e.target.value);
    const no=h("input",{className:"inp form-full",placeholder:"Note",value:state.newDebt.note});no.addEventListener("input",e=>state.newDebt.note=e.target.value);
    fr.appendChild(pn);fr.appendChild(am);fr.appendChild(da);fr.appendChild(no);fb.appendChild(fr);
    const dirs=h("div",{style:{display:"flex",gap:8,marginBottom:12}});
    [["i-owe","I owe them",C.coralDark,C.coralLight],["they-owe","They owe me",C.teal,C.tealLight]].forEach(([val,label,col,bg])=>{dirs.appendChild(h("button",{style:{flex:1,padding:"10px",borderRadius:10,border:"1px solid "+(state.newDebt.direction===val?col:C.border),background:state.newDebt.direction===val?bg:C.surface,color:state.newDebt.direction===val?col:C.gray2,cursor:"pointer",fontWeight:state.newDebt.direction===val?600:400,fontSize:12},onClick:()=>{state.newDebt.direction=val;render();}},label));});
    fb.appendChild(dirs);
    fb.appendChild(h("button",{className:"btn-primary",style:{marginTop:0},onClick:()=>{if(!state.newDebt.person||!state.newDebt.amount)return;state.debts.push({...state.newDebt,id:Date.now(),amount:Number(state.newDebt.amount),settled:false});state.newDebt={person:"",amount:"",direction:"i-owe",note:"",date:tod()};state.showDebtForm=false;render();}},"+ Add Entry"));
    mainCard.appendChild(fb);
  }
  el.appendChild(mainCard);
  ["they-owe","i-owe"].forEach(dir=>{
    const list=state.debts.filter(d=>!d.settled&&d.direction===dir);if(!list.length)return;
    const isIOwe=dir==="i-owe";
    const card=h("div",{className:"card"});card.appendChild(h("div",{style:{fontWeight:600,marginBottom:12,color:isIOwe?C.coralDark:C.teal,fontFamily:"'Lora',serif",fontSize:14}},isIOwe?"You Owe":"Owed to You"));
    list.forEach(debt=>{
      const row=h("div",{className:"debt-row",style:{border:"1px solid "+(isIOwe?C.coral+"44":C.tealMid+"44"),background:isIOwe?C.coralLight:C.tealLight}});
      const left=h("div");left.appendChild(h("div",{style:{fontSize:13,fontWeight:500,color:C.gray1}},debt.person));left.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginTop:1}},debt.date+(debt.note?" · "+debt.note:"")));row.appendChild(left);
      const right=h("div",{style:{display:"flex",alignItems:"center",gap:10}});right.appendChild(h("span",{style:{fontWeight:700,color:isIOwe?C.coralDark:C.teal,fontFamily:"'Lora',serif",fontSize:14}},fmt(debt.amount)));right.appendChild(h("button",{style:{background:isIOwe?C.coralDark:C.teal,color:"#fff",border:"none",borderRadius:99,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer"},onClick:()=>{state.debts=state.debts.map(x=>x.id===debt.id?{...x,settled:true}:x);render();}},"✓ Settle"));row.appendChild(right);card.appendChild(row);
    });
    el.appendChild(card);
  });
  const settled=state.debts.filter(d=>d.settled);
  if(settled.length){const card=h("div",{className:"card"});card.appendChild(h("div",{style:{fontWeight:600,marginBottom:12,color:C.gray2,fontFamily:"'Lora',serif",fontSize:14}},"✓ Settled"));settled.forEach(debt=>{const row=h("div",{style:{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.gray4,borderRadius:10,marginBottom:6,opacity:.6}});row.appendChild(h("div",{style:{fontSize:12,color:C.gray2}},debt.person+" · "+debt.note));row.appendChild(h("span",{style:{fontSize:12,fontWeight:600,color:C.gray2,fontFamily:"'Lora',serif"}},fmt(debt.amount)));card.appendChild(row);});el.appendChild(card);}
}
