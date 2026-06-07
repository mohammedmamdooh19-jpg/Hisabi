// ══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
function renderDashboard(el,d){
  const dl=daysLeft();
  const isWeekly=state.dashView==="weekly";
  const WEEKS=4.333; // avg weeks per month

  // ── Week helpers ──
  const now=new Date();
  const dayOfWeek=now.getDay(); // 0=Sun
  const startOfWeek=new Date(now);
  startOfWeek.setDate(now.getDate()-dayOfWeek);
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek=new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate()+6);
  endOfWeek.setHours(23,59,59,999);
  const daysLeftWeek=6-dayOfWeek;

  const weekTxs=state.txs.filter(t=>{const d2=new Date(t.date);return d2>=startOfWeek&&d2<=endOfWeek;});
  const byCatWeek=CATS.reduce((a,c)=>{a[c]=weekTxs.filter(t=>t.category===c).reduce((s,t)=>s+Number(t.amount),0);return a;},{});
  const weekSpent=Object.values(byCatWeek).reduce((a,b)=>a+b,0);
  const weekIncome=Number(state.salary)/WEEKS;
  const weekBalance=weekIncome-weekSpent;

  // Display values based on view
  const dispSpent=isWeekly?weekSpent:d.totalSpent;
  const dispIncome=isWeekly?weekIncome:d.totalIncome;
  const dispBalance=isWeekly?weekBalance:d.balance;
  const dispDaysLeft=isWeekly?daysLeftWeek:dl;
  const dispByCat=isWeekly?byCatWeek:d.byCat;
  const dispLimits=CATS.reduce((a,c)=>{a[c]=isWeekly?(state.limits[c]||0)/WEEKS:state.limits[c]||0;return a;},{});

  // ── View toggle ──
  const toggleRow=h("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}});
  const togglePill=h("div",{style:{display:"flex",background:C.gray4,borderRadius:99,padding:3,border:"1px solid "+C.border}});
  ["weekly","monthly"].forEach(v=>{
    const btn=h("button",{style:{padding:"5px 16px",borderRadius:99,border:"none",fontSize:11,fontWeight:600,cursor:"pointer",background:state.dashView===v?C.grove:"transparent",color:state.dashView===v?"#fff":C.gray2,transition:"all 0.15s"},onClick:()=>{state.dashView=v;render();}},v.charAt(0).toUpperCase()+v.slice(1));
    togglePill.appendChild(btn);
  });
  toggleRow.appendChild(h("div",{style:{fontSize:12,color:C.gray2,fontWeight:500}},isWeekly?"This week · "+startOfWeek.toLocaleDateString("en-BH",{day:"numeric",month:"short"})+" – "+endOfWeek.toLocaleDateString("en-BH",{day:"numeric",month:"short"}):"This month · "+now.toLocaleString("en",{month:"long",year:"numeric"})));
  toggleRow.appendChild(togglePill);
  el.appendChild(toggleRow);

  // ── Stat cards ──
  const grid=h("div",{className:"grid2"});
  [
    [isWeekly?"Weekly Income":"Total Income", fmt(dispIncome), isWeekly?"Salary ÷ 4.3 weeks":"Salary + carry-forward", C.grove, C.mint],
    [isWeekly?"Week Spent":"Total Spent", fmt(dispSpent), isWeekly?"This week so far":"This month so far", C.coral, C.coralLight],
    [isWeekly?"Week Balance":"End-of-Month Est.", isWeekly?fmt(dispBalance):fmt(d.projSpend), isWeekly?"Income minus spending":"At current daily pace", dispBalance<0||d.projSpend>d.totalIncome?C.coral:C.teal, dispBalance<0||d.projSpend>d.totalIncome?C.coralLight:C.tealLight],
    [isWeekly?"Days Left":"Days Left", dispDaysLeft+(isWeekly?" days":" days"), isWeekly?"Left this week":"Left this month", C.amber, C.amberLight]
  ].forEach(([l,v,sub,col,bg])=>{
    const c=h("div",{className:"stat-card",style:{background:bg,borderColor:col+"33"}});
    c.appendChild(h("div",{className:"lbl",style:{color:col}},l));
    c.appendChild(h("div",{className:"num",style:{fontSize:15,color:col}},v));
    c.appendChild(h("div",{style:{fontSize:9,color:col+"99",marginTop:3}},sub));
    grid.appendChild(c);
  });
  el.appendChild(grid);

  // ── Debt banners (monthly only) ──
  if(!isWeekly&&(d.iOwe>0||d.owedToMe>0)){
    const dg=h("div",{className:"grid2"});
    if(d.iOwe>0) dg.appendChild(h("div",{className:"stat-card alert-neg"},[h("div",{className:"lbl",style:{color:C.coralDark}},"You Owe"),h("div",{className:"num",style:{fontSize:16,color:C.coralDark}},fmt(d.iOwe))]));
    if(d.owedToMe>0) dg.appendChild(h("div",{className:"stat-card alert-pos"},[h("div",{className:"lbl",style:{color:C.teal}},"Owed to You"),h("div",{className:"num",style:{fontSize:16,color:C.teal}},fmt(d.owedToMe))]));
    el.appendChild(dg);
  }

  // ── Over budget alert ──
  const overBudgetView=CATS.filter(c=>(dispByCat[c]||0)>dispLimits[c]);
  if(overBudgetView.length>0) el.appendChild(h("div",{className:"alert alert-warn"},[h("div",{style:{color:"#8a5a00",fontWeight:600,marginBottom:4,fontSize:13}},"Over "+(isWeekly?"Weekly":"Monthly")+" Budget"),h("div",{style:{fontSize:12,color:"#8a5a00"}},overBudgetView.join(", "))]));

  // ── Spending by Category — Chart / List toggle ──
  const spCard=h("div",{className:"card"});
  const spHdr=h("div",{className:"sec-hdr",style:{marginBottom:10}});
  spHdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"Spending by Category"));

  // Toggle pill: List | Chart
  const viewPill=h("div",{style:{display:"flex",background:C.gray4,borderRadius:99,padding:3,border:"1px solid "+C.border}});
  ["list","chart"].forEach(v=>{
    const btn=document.createElement("button");
    btn.style.cssText="padding:4px 12px;border-radius:99px;border:none;font-size:11px;font-weight:600;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;background:"+(state.catView===v?C.grove:"transparent")+";color:"+(state.catView===v?"#fff":C.gray2)+";transition:all 0.15s;";
    btn.textContent=v==="list"?"≡ List":"◕ Chart";
    btn.addEventListener("click",()=>{state.catView=v;render();});
    viewPill.appendChild(btn);
  });
  spHdr.appendChild(viewPill);
  spCard.appendChild(spHdr);

  if(isWeekly) spCard.appendChild(h("div",{style:{fontSize:10,color:C.teal,background:C.tealLight,padding:"4px 10px",borderRadius:99,fontWeight:600,display:"inline-block",marginBottom:10}},"Weekly view"));

  const activeCats=CATS.filter(c=>(dispByCat[c]||0)>0);
  const totalDisp=activeCats.reduce((s,c)=>s+(dispByCat[c]||0),0);

  if(activeCats.length===0){
    const empty=h("div",{style:{textAlign:"center",padding:"28px 0",color:C.gray2}});
    empty.appendChild(h("div",{style:{fontSize:36,marginBottom:8}},"—"));
    empty.appendChild(h("div",{style:{fontSize:13,fontWeight:500,color:C.gray2,marginBottom:4}},"No spending yet"));
    empty.appendChild(h("div",{style:{fontSize:11,color:C.gray3}},"Add transactions to see your breakdown"));
    spCard.appendChild(empty);

  } else if(state.catView==="chart"){
    // ── CHART VIEW ──
    const chartWrap=h("div",{style:{display:"flex",alignItems:"center",gap:16,marginBottom:14}});

    // SVG Donut
    const cx=75,cy=75,R=58,r=34;
    const svgNS="http://www.w3.org/2000/svg";
    const svg=document.createElementNS(svgNS,"svg");
    svg.setAttribute("width","150");svg.setAttribute("height","150");
    svg.setAttribute("viewBox","0 0 150 150");svg.style.flexShrink="0";

    let startAngle=-90;
    activeCats.forEach(cat=>{
      const val=dispByCat[cat]||0;
      const over=(val>(dispLimits[cat]||0))&&(dispLimits[cat]||0)>0;
      const col=over?C.coral:CAT_COLORS[cat]||C.gray3;
      const pct=totalDisp>0?val/totalDisp:0;
      const angle=pct*360;
      const endAngle=startAngle+angle;
      if(pct>=0.999){
        const circ=document.createElementNS(svgNS,"circle");
        circ.setAttribute("cx",cx);circ.setAttribute("cy",cy);circ.setAttribute("r",(R+r)/2);
        circ.setAttribute("fill","none");circ.setAttribute("stroke",col);circ.setAttribute("stroke-width",R-r);
        svg.appendChild(circ);
      } else {
        const s=startAngle*Math.PI/180,e=endAngle*Math.PI/180;
        const large=angle>180?1:0;
        const path=document.createElementNS(svgNS,"path");
        path.setAttribute("d",`M${cx+R*Math.cos(s)},${cy+R*Math.sin(s)} A${R},${R} 0 ${large},1 ${cx+R*Math.cos(e)},${cy+R*Math.sin(e)} L${cx+r*Math.cos(e)},${cy+r*Math.sin(e)} A${r},${r} 0 ${large},0 ${cx+r*Math.cos(s)},${cy+r*Math.sin(s)} Z`);
        path.setAttribute("fill",col);path.setAttribute("stroke","#fff");path.setAttribute("stroke-width","2");
        svg.appendChild(path);
      }
      startAngle=endAngle;
    });

    // Center label
    const ct=document.createElementNS(svgNS,"text");
    ct.setAttribute("x",cx);ct.setAttribute("y",cy-5);ct.setAttribute("text-anchor","middle");
    ct.setAttribute("font-size","9");ct.setAttribute("fill",C.gray2);ct.setAttribute("font-family","'Plus Jakarta Sans',sans-serif");
    ct.textContent=isWeekly?"This week":"This month";svg.appendChild(ct);
    const ca=document.createElementNS(svgNS,"text");
    ca.setAttribute("x",cx);ca.setAttribute("y",cy+11);ca.setAttribute("text-anchor","middle");
    ca.setAttribute("font-size","12");ca.setAttribute("font-weight","700");ca.setAttribute("fill",C.gray1);
    ca.setAttribute("font-family","'Lora',Georgia,serif");
    ca.textContent="BD "+Number(totalDisp).toFixed(3);svg.appendChild(ca);
    chartWrap.appendChild(svg);

    // Legend
    const legend=h("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:8,minWidth:0}});
    activeCats.forEach(cat=>{
      const val=dispByCat[cat]||0;
      const pct=totalDisp>0?Math.round((val/totalDisp)*100):0;
      const over=(val>(dispLimits[cat]||0))&&(dispLimits[cat]||0)>0;
      const col=over?C.coral:CAT_COLORS[cat]||C.gray3;
      const row=h("div",{style:{display:"flex",alignItems:"center",gap:7,minWidth:0}});
      row.appendChild(h("div",{style:{width:10,height:10,borderRadius:3,background:col,flexShrink:0}}));
      row.appendChild(h("div",{style:{fontSize:11,fontWeight:700,color:(CAT_COLORS[cat]||C.gray2),flexShrink:0}},(CAT_ICONS[cat]||cat.slice(0,2).toUpperCase())));
      row.appendChild(h("div",{style:{fontSize:11,color:C.gray1,flex:1,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}},cat));
      row.appendChild(h("div",{style:{fontSize:11,color:col,fontWeight:600,flexShrink:0}},pct+"%"));
      legend.appendChild(row);
    });
    chartWrap.appendChild(legend);
    spCard.appendChild(chartWrap);

    // Breakdown bar below
    const breakdown=h("div",{style:{borderTop:"1px solid "+C.border,paddingTop:12}});
    activeCats.forEach(cat=>{
      const val=dispByCat[cat]||0;
      const limit=dispLimits[cat]||0;
      const over=val>limit&&limit>0;
      const col=over?C.coral:CAT_COLORS[cat]||C.gray3;
      const pctBar=limit>0?Math.min((val/limit)*100,100):100;
      const row=h("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:10}});
      row.appendChild(h("div",{style:{fontSize:11,fontWeight:700,color:(CAT_COLORS[cat]||C.gray2),flexShrink:0}},(CAT_ICONS[cat]||cat.slice(0,2).toUpperCase())));
      const mid=h("div",{style:{flex:1,minWidth:0}});
      mid.appendChild(h("div",{style:{fontSize:11,color:C.gray1,marginBottom:3}},cat));
      const track=h("div",{style:{background:C.bg,borderRadius:99,height:4,overflow:"hidden"}});
      track.appendChild(h("div",{style:{width:pctBar+"%",height:"100%",background:col,borderRadius:99}}));
      mid.appendChild(track);
      row.appendChild(mid);
      const right=h("div",{style:{textAlign:"right",flexShrink:0}});
      right.appendChild(h("div",{style:{fontSize:11,fontFamily:"'Lora',serif",fontWeight:700,color:col}},"BD "+Number(val).toFixed(3)));
      if(limit>0) right.appendChild(h("div",{style:{fontSize:9,color:C.gray3}},"/ "+Number(limit).toFixed(3)));
      row.appendChild(right);
      breakdown.appendChild(row);
    });
    spCard.appendChild(breakdown);

  } else {
    // ── LIST VIEW (original icon cards) ──
    const catGrid=h("div",{className:"cat-grid"});
    CATS.filter(c=>(dispByCat[c]||0)>0||(dispLimits[c]||0)>0).forEach(cat=>{
      const spent=dispByCat[cat]||0;
      const limit=dispLimits[cat]||0;
      const pct=limit>0?Math.min((spent/limit)*100,100):0;
      const over=spent>limit&&limit>0;
      const col=over?C.coral:CAT_COLORS[cat];
      const card=h("div",{className:"cat-card"});
      const catCircle=h("div",{className:"cat-icon-circle",style:{background:col+"18"}});
      catCircle.appendChild(h("div",{style:{width:14,height:14,borderRadius:"50%",background:col}}));
      card.appendChild(catCircle);
      card.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:3,fontWeight:500}},cat));
      card.appendChild(h("div",{style:{fontFamily:"'Lora',serif",fontSize:12,fontWeight:700,color:over?C.coral:C.gray1,marginBottom:2}},"BD "+Number(spent).toFixed(3)));
      card.appendChild(h("div",{style:{fontSize:9,color:C.gray2,marginBottom:8}},"of BD "+Number(limit).toFixed(3)));
      const track=h("div",{style:{width:"100%",background:C.bg,borderRadius:99,height:4,overflow:"hidden"}});
      track.appendChild(h("div",{style:{width:pct+"%",height:"100%",background:col,borderRadius:99}}));
      card.appendChild(track);
      catGrid.appendChild(card);
    });
    spCard.appendChild(catGrid);
  }
  el.appendChild(spCard);

  // ── Goals (monthly only) ──
  if(!isWeekly&&state.goals.length>0){
    const gCard=h("div",{className:"card"});
    const ghdr=h("div",{className:"sec-hdr"});
    ghdr.appendChild(h("div",{className:"card-title",style:{margin:0}},"Goals"));
    ghdr.appendChild(h("button",{style:{fontSize:11,color:C.grove,background:"none",border:"none",cursor:"pointer",fontWeight:600},onClick:()=>{state.tab="plan";state.planTab="goals";render();}},"View all →"));
    gCard.appendChild(ghdr);
    state.goals.forEach(g=>{
      const pct=Math.min((g.saved/g.target)*100,100);
      const ml=g.freqAmount>0?Math.ceil((g.target-g.saved)/g.freqAmount):null;
      const row=h("div",{style:{marginBottom:14}});
      const top=h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}});
      const left=h("div",{style:{display:"flex",alignItems:"center",gap:6}});
      left.appendChild(h("div",{style:{width:26,height:26,borderRadius:"50%",background:g.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}},g.icon));
      left.appendChild(h("span",{style:{fontSize:12,color:C.gray1,fontWeight:500}},g.name));
      top.appendChild(left);
      const ri=h("div",{style:{textAlign:"right"}});
      ri.appendChild(h("div",{style:{fontSize:12,color:g.color,fontFamily:"'Lora',serif",fontWeight:700}},fmt(g.saved)));
      ri.appendChild(h("div",{style:{fontSize:9,color:C.gray2}},"of "+fmt(g.target)));
      top.appendChild(ri);
      row.appendChild(top);
      const track=h("div",{className:"goal-bar"});
      track.appendChild(h("div",{style:{width:pct+"%",height:"100%",background:g.color,borderRadius:99}}));
      row.appendChild(track);
      const bot=h("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray2}});
      bot.appendChild(h("span",null,Math.round(pct)+"% saved"+(ml?" · ~"+ml+"mo to go":"")));
      row.appendChild(bot);
      gCard.appendChild(row);
    });
    el.appendChild(gCard);
  }

  // ── Quick log ──
  const qlCard=h("div",{className:"card"});
  qlCard.appendChild(h("div",{className:"card-title"},"Quick Log"));
  const qlGrid=h("div",{style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}});
  state.shortcuts.slice(0,4).forEach(s=>{
    const tile=h("div",{className:"ql-tile",onClick:()=>quickLog(s)});
    const circle=h("div",{style:{width:"44px",height:"44px",borderRadius:"50%",background:s.color+"22",display:"flex",alignItems:"center",justifyContent:"center",color:s.color,flexShrink:"0"}});
    if(SC_ICONS[s.icon]){circle.innerHTML=SC_ICONS[s.icon];const svg=circle.querySelector("svg");if(svg){svg.style.width="22px";svg.style.height="22px";svg.style.stroke=s.color;svg.style.fill="none";}}
    else{circle.style.fontSize="20px";circle.style.fontWeight="700";circle.style.fontFamily="'Plus Jakarta Sans',sans-serif";circle.textContent=(s.label||"?")[0].toUpperCase();}
    tile.appendChild(circle);
    tile.appendChild(h("div",{style:{fontSize:10,color:C.gray1,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontWeight:500,maxWidth:"100%"}},s.label));
    tile.appendChild(h("div",{style:{fontSize:9,color:s.color,fontWeight:700,textAlign:"center"}},"BD "+Number(s.amount).toFixed(3)));
    qlGrid.appendChild(tile);
  });
  qlCard.appendChild(qlGrid);
  el.appendChild(qlCard);
}
