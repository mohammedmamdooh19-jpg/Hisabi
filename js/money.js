// ══════════════════════════════════════════════════════════════════════════
// MONEY TAB (Transactions + History)
// ══════════════════════════════════════════════════════════════════════════
function renderMoney(el,d){
  const tabs=h("div",{className:"sub-tabs"});
  ["transactions","history"].forEach(t=>{
    tabs.appendChild(h("button",{className:"sub-tab"+(state.moneyTab===t?" active":""),onClick:()=>{state.moneyTab=t;render();}},t==="transactions"?"Transactions":"History"));
  });
  el.appendChild(tabs);
  if(state.moneyTab==="transactions") renderTransactions(el,d);
  else renderHistory(el,d);
}

// ── Transactions ───────────────────────────────────────────────────────────
function renderTransactions(el,d){
  // Quick Log
  const qlCard=h("div",{className:"card"});
  const qlHdr=h("div",{className:"sec-hdr"});
  qlHdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"Quick Log"));
  const hdrBtns=h("div",{style:{display:"flex",gap:6}});
  hdrBtns.appendChild(h("button",{className:"btn-ghost",style:{fontSize:11,padding:"5px 10px",color:state.editingShortcuts?C.coral:C.gray2,borderColor:state.editingShortcuts?C.coral:C.gray3},onClick:()=>{state.editingShortcuts=!state.editingShortcuts;state.showScForm=false;state.editingScId=null;render();}},state.editingShortcuts?"Done":"Edit"));
  qlHdr.appendChild(hdrBtns);
  qlCard.appendChild(qlHdr);
  const qlGrid=h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}});
  state.shortcuts.forEach(s=>{
    const tile=h("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"12px 6px 10px",borderRadius:14,background:state.editingShortcuts?"#FFF5F3":C.gray4,cursor:"pointer",gap:5,border:"1px solid "+(state.editingShortcuts?C.coral+"44":C.border),overflow:"visible",position:"relative"}});
    if(state.editingShortcuts){const del=document.createElement("div");del.style.cssText="position:absolute;top:-6px;right:-6px;width:18px;height:18px;border-radius:50%;background:"+C.coral+";color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;box-shadow:0 1px 4px rgba(0,0,0,0.25);line-height:1;";del.textContent="×";del.addEventListener("click",(e)=>{e.stopPropagation();state.shortcuts=state.shortcuts.filter(x=>x.id!==s.id);render();});tile.appendChild(del);}
    const circle=h("div",{style:{width:"40px",height:"40px",borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",color:s.color,flexShrink:"0"}});
    if(SC_ICONS[s.icon]){circle.innerHTML=SC_ICONS[s.icon];const svg2=circle.querySelector("svg");if(svg2){svg2.style.width="20px";svg2.style.height="20px";svg2.style.stroke=s.color;svg2.style.fill="none";}}
    else{circle.style.fontSize="18px";circle.style.fontWeight="700";circle.style.fontFamily="'Plus Jakarta Sans',sans-serif";circle.textContent=(s.label||"?")[0].toUpperCase();}
    tile.appendChild(circle);
    tile.appendChild(h("div",{style:{fontSize:10,color:C.gray1,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontWeight:500,maxWidth:"100%"}},s.label));
    tile.appendChild(h("div",{style:{fontSize:9,color:s.color,fontWeight:700,textAlign:"center"}},"BD "+Number(s.amount).toFixed(3)));
    if(state.editingShortcuts) tile.appendChild(h("div",{style:{fontSize:9,color:C.grove,fontWeight:600,marginTop:2,cursor:"pointer"},onClick:(e)=>{e.stopPropagation();state.editingScId=s.id;state.editSc={label:s.label,icon:s.icon,amount:String(s.amount),category:s.category,color:s.color};state.showScForm=false;render();}},"Edit"));
    else tile.addEventListener("click",()=>quickLog(s));
    qlGrid.appendChild(tile);
  });
  if(!state.editingShortcuts){const addTile=h("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",padding:"14px 6px",borderRadius:14,background:state.showScForm?C.mint:C.gray4,cursor:"pointer",border:"2px dashed "+(state.showScForm?C.grove:C.gray3),color:state.showScForm?C.grove:C.gray2,fontSize:22,fontWeight:700},onClick:()=>{state.showScForm=!state.showScForm;state.editingScId=null;render();}},state.showScForm?"✕":"+");qlGrid.appendChild(addTile);}
  qlCard.appendChild(qlGrid);

  // Edit existing shortcut
  if(state.editingScId!==null){
    const s=state.shortcuts.find(x=>x.id===state.editingScId);
    if(s){
      const fb=h("div",{className:"form-box",style:{borderColor:C.grove+"44",background:C.mint}});
      fb.appendChild(h("div",{style:{fontSize:12,color:C.grove,fontWeight:600,marginBottom:10}},"Edit: "+s.label));
      const fr=h("div",{className:"form-row"});
      const li=h("input",{className:"inp form-full",placeholder:"Label",value:state.editSc.label});li.addEventListener("input",e=>state.editSc.label=e.target.value);
      const ai=h("input",{className:"inp",placeholder:"Amount (BD)",type:"number",step:"0.001",value:state.editSc.amount});ai.addEventListener("input",e=>state.editSc.amount=e.target.value);
      const cs=h("select",{className:"inp"});cs.addEventListener("change",e=>state.editSc.category=e.target.value);CATS.forEach(c=>{const o=h("option",null,c);if(c===state.editSc.category)o.selected=true;cs.appendChild(o);});
      fr.appendChild(li);fr.appendChild(ai);fr.appendChild(cs);fb.appendChild(fr);
      fb.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:6}},"Icon"));
      const ip=h("div",{className:"icon-picker"});Object.entries(SC_ICONS).forEach(([key,svg])=>{const btn=document.createElement("button");btn.className="icon-btn"+(state.editSc.icon===key?" sel":"");btn.type="button";btn.innerHTML=svg;btn.addEventListener("click",()=>{state.editSc.icon=key;render();});ip.appendChild(btn);});fb.appendChild(ip);
      fb.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:5}},"Color"));
      const cp=h("div",{className:"color-picker"});SC_COLORS.forEach(col=>cp.appendChild(h("div",{className:"color-dot"+(state.editSc.color===col?" sel":""),style:{background:col},onClick:()=>{state.editSc.color=col;render();}})));fb.appendChild(cp);
      const btns=h("div",{style:{display:"flex",gap:8}});
      btns.appendChild(h("button",{className:"btn-primary",style:{marginTop:0,flex:1},onClick:()=>{if(!state.editSc.label||!state.editSc.amount)return;state.shortcuts=state.shortcuts.map(x=>x.id===state.editingScId?{...x,...state.editSc,amount:Number(state.editSc.amount)}:x);state.editingScId=null;state.editingShortcuts=false;render();}},"✓ Save"));
      btns.appendChild(h("button",{className:"btn-ghost",onClick:()=>{state.editingScId=null;render();}},"Cancel"));
      fb.appendChild(btns);qlCard.appendChild(fb);
    }
  }
  // New shortcut form
  if(state.showScForm){
    const fb=h("div",{className:"form-box"});
    fb.appendChild(h("div",{style:{fontSize:12,color:C.grove,fontWeight:600,marginBottom:10}},"New Quick Log Shortcut"));
    const fr=h("div",{className:"form-row"});
    const li=h("input",{className:"inp form-full",placeholder:"Label (e.g. Karak)",value:state.newSc.label});li.addEventListener("input",e=>state.newSc.label=e.target.value);
    const ai=h("input",{className:"inp",placeholder:"Amount (BD)",type:"number",step:"0.001",value:state.newSc.amount});ai.addEventListener("input",e=>state.newSc.amount=e.target.value);
    const cs=h("select",{className:"inp"});cs.addEventListener("change",e=>state.newSc.category=e.target.value);CATS.forEach(c=>{const o=h("option",null,c);if(c===state.newSc.category)o.selected=true;cs.appendChild(o);});
    fr.appendChild(li);fr.appendChild(ai);fr.appendChild(cs);fb.appendChild(fr);
    fb.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:6}},"Icon"));
    const ip=h("div",{className:"icon-picker"});Object.entries(SC_ICONS).forEach(([key,svg])=>{const btn=document.createElement("button");btn.className="icon-btn"+(state.newSc.icon===key?" sel":"");btn.type="button";btn.innerHTML=svg;btn.addEventListener("click",()=>{state.newSc.icon=key;render();});ip.appendChild(btn);});fb.appendChild(ip);
    fb.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:5}},"Color"));
    const cp=h("div",{className:"color-picker"});SC_COLORS.forEach(col=>cp.appendChild(h("div",{className:"color-dot"+(state.newSc.color===col?" sel":""),style:{background:col},onClick:()=>{state.newSc.color=col;render();}})));fb.appendChild(cp);
    const btns=h("div",{style:{display:"flex",gap:8}});
    btns.appendChild(h("button",{className:"btn-primary",style:{marginTop:0,flex:1},onClick:()=>{if(!state.newSc.label||!state.newSc.amount)return;state.shortcuts.push({...state.newSc,id:Date.now(),amount:Number(state.newSc.amount)});state.newSc={label:"",icon:"karak",amount:"",category:"Food",color:C.amber};state.showScForm=false;render();}},"+ Create"));
    btns.appendChild(h("button",{className:"btn-ghost",onClick:()=>{state.showScForm=false;render();}},"Cancel"));
    fb.appendChild(btns);qlCard.appendChild(fb);
  }
  el.appendChild(qlCard);

  // Add transaction
  const txCard=h("div",{className:"card"});
  txCard.appendChild(h("div",{className:"card-title"},"Add Transaction"));
  const txFr=h("div",{className:"form-row"});
  const tDate=h("input",{className:"inp",type:"date",value:state.newTx.date});tDate.addEventListener("change",e=>state.newTx.date=e.target.value);
  const tCat=h("select",{className:"inp"});tCat.addEventListener("change",e=>state.newTx.category=e.target.value);CATS.forEach(c=>{const o=h("option",null,c);if(c===state.newTx.category)o.selected=true;tCat.appendChild(o);});
  const tDesc=h("input",{className:"inp",placeholder:"Description",value:state.newTx.desc});tDesc.addEventListener("input",e=>state.newTx.desc=e.target.value);
  const tAmt=h("input",{className:"inp",placeholder:"Amount (BD)",type:"number",step:"0.001",value:state.newTx.amount});tAmt.addEventListener("input",e=>state.newTx.amount=e.target.value);
  txFr.appendChild(tDate);txFr.appendChild(tCat);txFr.appendChild(tDesc);txFr.appendChild(tAmt);txCard.appendChild(txFr);
  txCard.appendChild(h("button",{className:"btn-primary",onClick:()=>{if(!state.newTx.desc||!state.newTx.amount)return;state.txs.push({...state.newTx,id:Date.now(),ts:new Date().toISOString(),amount:Number(state.newTx.amount)});state.newTx={date:tod(),desc:"",amount:"",category:"Food"};render();}},"+ Add Transaction"));
  el.appendChild(txCard);

  // Side income
  const sCard=h("div",{className:"card"});
  sCard.appendChild(h("div",{className:"card-title"},"Add Side Income"));
  const sFr=h("div",{className:"form-row"});
  const sDate=h("input",{className:"inp",type:"date",value:state.newSide.date});sDate.addEventListener("change",e=>state.newSide.date=e.target.value);
  const sAmt=h("input",{className:"inp",placeholder:"Amount (BD)",type:"number",step:"0.001",value:state.newSide.amount});sAmt.addEventListener("input",e=>state.newSide.amount=e.target.value);
  const sDesc=h("input",{className:"inp form-full",placeholder:"Source",value:state.newSide.desc});sDesc.addEventListener("input",e=>state.newSide.desc=e.target.value);
  sFr.appendChild(sDate);sFr.appendChild(sAmt);sFr.appendChild(sDesc);sCard.appendChild(sFr);
  sCard.appendChild(h("button",{className:"btn-income",onClick:()=>{if(!state.newSide.desc||!state.newSide.amount)return;state.sides.push({...state.newSide,id:Date.now(),ts:new Date().toISOString(),amount:Number(state.newSide.amount)});state.newSide={date:tod(),desc:"",amount:""};render();}},"+ Add Income"));
  el.appendChild(sCard);

  // Transaction list
  const lCard=h("div",{className:"card"});
  lCard.appendChild(h("div",{className:"card-title"},"This Month ("+(state.txs.length+state.sides.length)+" entries)"));
  [...state.sides.map(s=>({...s,isSide:true})),...state.txs].sort((a,b)=>(b.ts||b.date||"").localeCompare(a.ts||a.date||"")).forEach(t=>{
    const row=h("div",{className:"tx-row"});
    const left=h("div",{style:{display:"flex",alignItems:"center",flex:1,minWidth:0}});
    left.appendChild(h("div",{className:"tx-dot",style:{background:t.isSide?C.teal:CAT_COLORS[t.category]||C.gray2}}));
    const info=h("div",{style:{minWidth:0}});
    info.appendChild(h("div",{className:"tx-desc"},t.desc));
    const timeStr=t.ts?new Date(t.ts).toLocaleTimeString("en-BH",{hour:"2-digit",minute:"2-digit"}):"";
    info.appendChild(h("div",{className:"tx-meta"},t.date+(timeStr?" · "+timeStr:"")+" · "+(t.isSide?"Side Income":t.category)));
    left.appendChild(info);row.appendChild(left);
    const right=h("div",{style:{display:"flex",alignItems:"center",gap:6,flexShrink:0}});
    right.appendChild(h("span",{style:{fontWeight:600,fontSize:13,color:t.isSide?C.teal:C.coral,fontFamily:"'Lora',serif"}},(t.isSide?"+":"-")+fmt(t.amount)));
    right.appendChild(h("button",{className:"tx-del",onClick:()=>{if(t.isSide)state.sides=state.sides.filter(s=>s.id!==t.id);else state.txs=state.txs.filter(x=>x.id!==t.id);render();}},"×"));
    row.appendChild(right);lCard.appendChild(row);
  });
  el.appendChild(lCard);
}

// ── History ───────────────────────────────────────────────────────────────
function renderHistory(el,d){
  const card=h("div",{className:"card"});
  card.appendChild(h("div",{className:"card-title"},"Monthly History"));
  card.appendChild(h("div",{style:{fontSize:11,color:C.gray2,marginBottom:16}},"Your month-by-month balance history"));

  const rows=histRows();
  const curMonth=new Date().toLocaleString("en",{month:"short",year:"numeric"});
  const cur={month:curMonth,carry:rows.length>0?rows[rows.length-1].net:0,income:d.totalIncome,spent:d.totalSpent,net:d.balance};
  const all=[...rows,cur];
  const maxAbs=Math.max(...all.map(r=>Math.abs(r.net)),1);

  if(all.length>0){
    card.appendChild(h("div",{style:{fontSize:10,color:C.gray2,textTransform:"uppercase",letterSpacing:1,fontWeight:600,marginBottom:8}},"Balance by Month"));

    const chartWrap=h("div",{style:{background:C.gray4,borderRadius:12,padding:"16px 12px 8px",marginBottom:16}});
    const bars=h("div",{style:{display:"flex",alignItems:"flex-end",gap:6,height:90}});

    all.forEach((r,i)=>{
      const isCur=i===all.length-1;
      const ht=Math.max((Math.abs(r.net)/maxAbs)*72,6);
      const col=h("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}});
      col.appendChild(h("div",{style:{fontSize:7,color:isCur?C.grove:C.gray2,textAlign:"center",fontWeight:isCur?700:400,whiteSpace:"nowrap",overflow:"hidden",maxWidth:"100%"}},"BD "+(Math.abs(r.net)<1000?r.net.toFixed(0):Math.round(r.net/100)/10+"k")));
      const bar=h("div",{style:{width:"100%",height:ht+"px",borderRadius:"6px 6px 0 0",background:r.net>=0?C.grove:C.coral,opacity:isCur?1:0.55,border:isCur?"2px solid "+C.grove+"99":"none",transition:"height 0.3s"}});
      col.appendChild(bar);
      col.appendChild(h("div",{style:{fontSize:8,color:isCur?C.grove:C.gray2,textAlign:"center",fontWeight:isCur?700:400}},r.month.toString().slice(0,3)));
      bars.appendChild(col);
    });
    chartWrap.appendChild(bars);

    const legend=h("div",{style:{display:"flex",gap:14,marginTop:8,justifyContent:"center"}});
    [[C.grove,"Positive"],[C.coral,"Negative"]].forEach(([col,label])=>{
      const item=h("div",{style:{display:"flex",alignItems:"center",gap:4}});
      item.appendChild(h("div",{style:{width:8,height:8,borderRadius:2,background:col}}));
      item.appendChild(h("div",{style:{fontSize:9,color:C.gray2}},label));
      legend.appendChild(item);
    });
    chartWrap.appendChild(legend);
    card.appendChild(chartWrap);
  }

  card.appendChild(h("div",{style:{fontSize:10,color:C.gray2,textTransform:"uppercase",letterSpacing:1,fontWeight:600,marginBottom:8}},"Detailed Breakdown"));
  const wrap=h("div",{className:"scroll-x"});
  const table=h("div",{className:"hist-table"});
  ["Month","Carry","Income","Spent","Balance"].forEach(hd=>table.appendChild(h("div",{className:"hist-head"},hd)));
  all.forEach((r,i)=>{
    const isCur=i===all.length-1;
    [
      h("div",{style:{color:isCur?C.grove:C.gray1,fontWeight:isCur?600:400}},r.month),
      h("div",{style:{color:C.gray2,fontFamily:"'Lora',serif"}},fmt(r.carry)),
      h("div",{style:{color:C.teal,fontFamily:"'Lora',serif"}},fmt(r.income)),
      h("div",{style:{color:C.coral,fontFamily:"'Lora',serif"}},fmt(r.spent)),
      h("div",{style:{color:r.net>=0?C.grove:C.coral,fontWeight:600,fontFamily:"'Lora',serif"}},fmt(r.net))
    ].forEach(cell=>table.appendChild(cell));
  });
  wrap.appendChild(table);
  card.appendChild(wrap);
  el.appendChild(card);

  if(rows.length===0){
    el.appendChild(h("div",{className:"card",style:{background:C.tealLight,border:"1px solid "+C.tealMid+"44",textAlign:"center",padding:"20px"}},[
      h("div",{style:{fontSize:24,marginBottom:8}},"—"),
      h("div",{style:{fontSize:13,color:C.teal,fontWeight:600,marginBottom:4}},"History builds over time"),
      h("div",{style:{fontSize:11,color:C.teal,lineHeight:1.6}},"As you track each month, your balance history will appear here as a chart. Keep logging!"),
    ]));
  }
}
