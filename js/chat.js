// ══════════════════════════════════════════════════════════════════════════
// ASK AI — COMING SOON
// ══════════════════════════════════════════════════════════════════════════
function renderChat(el){
  // Coming Soon hero
  const hero=h("div",{className:"card",style:{textAlign:"center",padding:"36px 24px",background:"linear-gradient(135deg,#EAF3DE,#E1F5EE)",border:"1px solid "+C.leaf+"44"}});
  hero.appendChild(h("div",{style:{fontSize:48,marginBottom:16}},"✦"));
  hero.appendChild(h("div",{style:{fontFamily:"'Lora',serif",fontSize:22,fontWeight:700,color:C.grove,marginBottom:8}},"AI Assistant"));
  const badge=h("div",{style:{display:"inline-block",background:C.grove,color:"#fff",borderRadius:99,padding:"4px 14px",fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:16}},"COMING SOON");
  hero.appendChild(badge);
  hero.appendChild(h("div",{style:{fontSize:13,color:C.gray2,lineHeight:1.7,maxWidth:280,margin:"0 auto"}},"Your personal AI finance assistant is on its way. It will know your spending, goals, and habits — and give you real advice in plain English."));
  el.appendChild(hero);

  // Feature previews
  const featCard=h("div",{className:"card"});
  featCard.appendChild(h("div",{className:"card-title"},"What to expect"));
  [
    ["Ask anything","'Am I on track this month?' or 'When can I afford my goal?'"],
    ["Smart analysis","Get a full breakdown of your spending habits and patterns"],
    ["Bank statement AI","Upload your PDF and let AI categorize every transaction"],
    ["Goal forecasting","Know exactly how long until you hit each savings goal"],
    ["Budget alerts","Get warned before you overspend in any category"],
  ].forEach(([title,desc])=>{
    const row=h("div",{style:{display:"flex",gap:12,marginBottom:14,alignItems:"flex-start"}});
    const dot=h("div",{style:{width:6,height:6,borderRadius:"50%",background:C.grove,flexShrink:0,marginTop:5}});
    row.appendChild(dot);
    const txt=h("div");
    txt.appendChild(h("div",{style:{fontSize:13,fontWeight:600,color:C.gray1,marginBottom:2}},title));
    txt.appendChild(h("div",{style:{fontSize:11,color:C.gray2,lineHeight:1.5}},desc));
    row.appendChild(txt);
    featCard.appendChild(row);
  });
  el.appendChild(featCard);

  // Notify me card
  const notifyCard=h("div",{className:"card",style:{background:C.amberLight,border:"1px solid "+C.amberMid}});
  notifyCard.appendChild(h("div",{style:{fontWeight:600,color:"#8a5a00",fontSize:14,marginBottom:6}},"Get notified when it launches"));
  notifyCard.appendChild(h("div",{style:{fontSize:12,color:"#8a5a00",marginBottom:12,lineHeight:1.6}},"Make sure your email is saved in your Profile and the newsletter is turned on — we'll let you know the moment AI is available."));
  const goBtn=h("button",{className:"btn-primary",style:{marginTop:0,background:"#8a5a00",border:"none"}});
  goBtn.textContent="Go to Profile →";
  goBtn.addEventListener("click",()=>{state.tab="profile";render();});
  notifyCard.appendChild(goBtn);
  el.appendChild(notifyCard);
}

async function sendChat(){
  const inp=document.getElementById("chat-input");
  if(!inp||!inp.value.trim()||state.chatLoading)return;
  const apiKey=getApiKey();if(!apiKey){state.tab="chat";render();return;}
  const msg=inp.value.trim();inp.value="";
  state.msgs.push({role:"user",text:msg});state.chatLoading=true;render();
  const d=derived();
  const ctx=`HISABI — Bahrain BHD\nUser: ${state.profile&&state.profile.name||"unknown"}\nSalary:${fmt(state.salary)} Carry:${fmt(state.carry)} Total:${fmt(d.totalIncome)}\nSpent:${fmt(d.totalSpent)} Balance:${fmt(d.balance)} Days left:${daysLeft()}\nProjected:${fmt(d.projSpend)}\nSpending:\n${CATS.map(c=>`  ${c}: ${fmt(d.byCat[c]||0)}/${fmt(state.limits[c]||0)} ${(d.byCat[c]||0)>(state.limits[c]||0)?"OVER":"ok"}`).join("\n")}\nGoals:\n${state.goals.map(g=>{const rem=g.target-g.saved;const ml=g.freqAmount>0?Math.ceil(rem/g.freqAmount):null;const dl2=moUntil(g.deadline);return`  ${g.icon} ${g.name}: ${fmt(g.saved)}/${fmt(g.target)}, ~${ml||"?"}mo${dl2!==null?", deadline "+dl2+"mo":""}`;}).join("\n")||"  None"}\nDebts:\n${state.debts.filter(x=>!x.settled).map(x=>`  ${x.direction==="i-owe"?"I owe":"Owed:"} ${x.person} ${fmt(x.amount)}`).join("\n")||"  None"}\nHistory:\n${histRows().map(r=>`  ${r.month}: in ${fmt(r.income)} out ${fmt(r.spent)} bal ${fmt(r.net)}`).join("\n")||"  No history yet"}`;
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are a sharp friendly personal finance assistant for Hisabi (حسابي), a personal finance app in Bahrain. Currency BHD prefix BD. Use history for forecasting. Answer affordability questions with real math. Concise, warm, specific. Plain text only, no markdown.",messages:[{role:"user",content:ctx+"\n\nQuestion: "+msg}]})});
    const data=await res.json();
    const reply=data.content&&data.content.map(b=>b.text||"").join("");
    state.msgs.push({role:"assistant",text:reply||"I couldn't get a response. Please try again."});
  }catch{state.msgs.push({role:"assistant",text:"Connection error. Check your internet and try again."});}
  state.chatLoading=false;render();
}
