// ══════════════════════════════════════════════════════════════════════════
// PROFILE
// ══════════════════════════════════════════════════════════════════════════
function renderProfile(el,d){
  if(!state.profile) state.profile={name:"",email:"",mobile:"",newsletter:true};

  // Avatar + name — use Google photo if available
  const topCard=h("div",{className:"card",style:{textAlign:"center",padding:"24px 18px"}});
  if(currentUser&&currentUser.photoURL){
    const img=h("img",{style:{width:80,height:80,borderRadius:"50%",objectFit:"cover",margin:"0 auto 12px",display:"block",border:"3px solid "+C.grove+"33"}});
    img.src=currentUser.photoURL;
    topCard.appendChild(img);
  } else {
    topCard.appendChild(h("div",{className:"profile-avatar"},(state.profile.name||"H").charAt(0).toUpperCase()));
  }
  topCard.appendChild(h("div",{style:{fontFamily:"'Lora',serif",fontSize:20,fontWeight:700,color:C.gray1,marginBottom:4}},state.profile.name||"Your Name"));
  topCard.appendChild(h("div",{style:{fontSize:12,color:C.gray2,marginBottom:currentUser?12:0}},state.profile.email||"Add your email below"));
  if(currentUser){
    topCard.appendChild(h("div",{style:{display:"inline-flex",alignItems:"center",gap:6,background:C.mint,borderRadius:99,padding:"4px 12px",fontSize:11,color:C.grove,fontWeight:600}},"Signed in with Google"));
  }
  el.appendChild(topCard);

  // Personal info
  const infoCard=h("div",{className:"card"});
  infoCard.appendChild(h("div",{className:"card-title"},"Personal Information"));
  [["Full Name","text","name","Your full name"],["Email","email","email","your@email.com"],["Mobile","tel","mobile","+973 XXXX XXXX"]].forEach(([label,type,key,placeholder])=>{
    const wrap=h("div",{style:{marginBottom:14}});
    wrap.appendChild(h("div",{className:"lbl"},label));
    const inp=h("input",{className:"inp",type:type,placeholder:placeholder,value:state.profile[key]||""});
    inp.addEventListener("blur",e=>{state.profile[key]=e.target.value;saveState();});
    wrap.appendChild(inp);
    infoCard.appendChild(wrap);
  });

  // Newsletter toggle
  const nlRow=h("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:14,borderTop:"1px solid "+C.border}});
  const nlLeft=h("div");
  nlLeft.appendChild(h("div",{style:{fontSize:13,fontWeight:500,color:C.gray1}},"Newsletter"));
  nlLeft.appendChild(h("div",{style:{fontSize:11,color:C.gray2,marginTop:2}},"Get updates about new Hisabi features"));
  nlRow.appendChild(nlLeft);
  const toggle=h("button",{style:{width:44,height:24,borderRadius:"99px",background:state.profile.newsletter?C.grove:C.gray3,border:"none",cursor:"pointer",position:"relative",flexShrink:0},onClick:()=>{state.profile.newsletter=!state.profile.newsletter;render();}});
  const knob=h("div",{style:{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:"2px",left:state.profile.newsletter?"22px":"2px",transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)"}});
  toggle.appendChild(knob);
  nlRow.appendChild(toggle);
  infoCard.appendChild(nlRow);
  el.appendChild(infoCard);

  // Financial settings
  const finCard=h("div",{className:"card"});
  finCard.appendChild(h("div",{className:"card-title"},"Financial Settings"));
  const salWrap=h("div",{style:{marginBottom:14}});
  salWrap.appendChild(h("div",{className:"lbl"},"Monthly Salary (BD)"));
  const salInp=h("input",{className:"inp",type:"number",step:"0.001",placeholder:"e.g. 1200.000",value:state.salary});
  salInp.addEventListener("blur",e=>{state.salary=Number(e.target.value)||0;render();});
  salWrap.appendChild(salInp);
  finCard.appendChild(salWrap);
  const carryWrap=h("div");
  carryWrap.appendChild(h("div",{className:"lbl"},"Carry-Forward (BD)"));
  carryWrap.appendChild(h("div",{style:{fontSize:11,color:C.gray2,marginBottom:6}},"Balance carried over from last month"));
  const carryInp=h("input",{className:"inp",type:"number",step:"0.001",placeholder:"0.000",value:state.carry});
  carryInp.addEventListener("blur",e=>{state.carry=Number(e.target.value)||0;render();});
  carryWrap.appendChild(carryInp);
  finCard.appendChild(carryWrap);
  el.appendChild(finCard);

  // Bank statement import
  const importCard=h("div",{className:"card"});
  importCard.appendChild(h("div",{className:"card-title"},"Import Bank Statement"));
  importCard.appendChild(h("div",{style:{fontSize:12,color:C.gray2,marginBottom:14,lineHeight:1.6}},"Upload your PDF bank statement. The AI will read all transactions, categorize them, and suggest budget adjustments based on your spending habits."));
  if(!getApiKey()){
    importCard.appendChild(h("div",{style:{background:C.amberLight,borderRadius:10,padding:"10px 12px",fontSize:12,color:"#8a5a00"}},"Set up your API key below first to use this feature."));
  } else {
    const fileRef=document.createElement("input");
    fileRef.type="file";fileRef.accept="application/pdf,.pdf";fileRef.style.display="none";
    fileRef.addEventListener("change",importBankStatement);
    importCard.appendChild(fileRef);
    const uploadBtn=h("button",{className:"btn-primary",style:{marginTop:0}},state.importLoading?"⏳ Reading statement…":"Upload PDF Statement");
    uploadBtn.addEventListener("click",()=>{if(!state.importLoading)fileRef.click();});
    importCard.appendChild(uploadBtn);
    if(state.importResult){
      const res=h("div",{style:{marginTop:12,padding:"12px",background:C.tealLight,borderRadius:10,border:"1px solid "+C.tealMid+"44"}});
      res.appendChild(h("div",{style:{fontSize:12,color:C.teal,fontWeight:600,marginBottom:4}},"✓ "+state.importResult.count+" transactions imported · "+state.importResult.cats+" budgets updated"));
      res.appendChild(h("div",{style:{fontSize:11,color:C.teal,lineHeight:1.6}},state.importResult.summary));
      const dismissBtn=h("button",{style:{fontSize:11,color:C.gray2,background:"none",border:"none",cursor:"pointer",marginTop:6}},"Dismiss");
      dismissBtn.addEventListener("click",()=>{state.importResult=null;render();});
      res.appendChild(dismissBtn);
      importCard.appendChild(res);
    }
  }
  el.appendChild(importCard);

  // API key
  const apiCard=h("div",{className:"card"});
  apiCard.appendChild(h("div",{className:"card-title"},"AI Assistant"));
  const hasKey=!!getApiKey();
  apiCard.appendChild(h("div",{style:{fontSize:12,color:C.gray2,marginBottom:12,lineHeight:1.6}},hasKey?"✓ API key saved — AI assistant is active.":"No API key yet. Get one free at console.anthropic.com"));
  if(hasKey){
    const removeBtn=h("button",{className:"btn-coral"},"Remove API Key");
    removeBtn.addEventListener("click",()=>{if(confirm("Remove API key?")){localStorage.removeItem("hisabi_api_key");render();}});
    apiCard.appendChild(removeBtn);
  } else {
    const keyRow=h("div",{style:{display:"flex",gap:8}});
    const keyInp=h("input",{className:"inp",placeholder:"sk-ant-...",type:"password"});
    keyRow.appendChild(keyInp);
    const saveBtn=h("button",{className:"btn-primary",style:{marginTop:0,flexShrink:0}},"Save");
    saveBtn.addEventListener("click",()=>{const k=keyInp.value.trim();if(!k.startsWith("sk-")){alert("Invalid key — should start with sk-ant-");return;}saveApiKey(k);render();});
    keyRow.appendChild(saveBtn);
    apiCard.appendChild(keyRow);
    apiCard.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginTop:8}},"Your key is stored only on this device."));
  }
  el.appendChild(apiCard);

  // Feedback
  const fbCard=h("div",{className:"card"});
  fbCard.appendChild(h("div",{className:"card-title"},"Share Your Feedback"));
  fbCard.appendChild(h("div",{style:{fontSize:12,color:C.gray2,marginBottom:12,lineHeight:1.6}},"Help us improve Hisabi! Tell us what you love, what's missing, or any bugs you've found."));

  const feedbackTypes=["Feature idea","Bug report","I love this","Suggestion"];
  const typeRow=h("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}});
  if(!state.feedbackType) state.feedbackType=feedbackTypes[0];
  feedbackTypes.forEach(t=>{
    const pill=h("button",{style:{padding:"5px 10px",borderRadius:99,fontSize:11,cursor:"pointer",border:"1px solid "+(state.feedbackType===t?C.grove:C.gray3),background:state.feedbackType===t?C.mint:"#fff",color:state.feedbackType===t?C.grove:C.gray2,fontWeight:state.feedbackType===t?600:400,fontFamily:"'Plus Jakarta Sans',sans-serif"}});
    pill.textContent=t;
    pill.addEventListener("click",()=>{state.feedbackType=t;render();});
    typeRow.appendChild(pill);
  });
  fbCard.appendChild(typeRow);

  const textarea=document.createElement("textarea");
  textarea.className="inp";
  textarea.placeholder="Write your feedback here…";
  textarea.rows=4;
  textarea.style.resize="none";
  textarea.style.lineHeight="1.6";
  textarea.value=state.feedbackDraft||"";
  textarea.addEventListener("input",e=>state.feedbackDraft=e.target.value);
  fbCard.appendChild(textarea);

  const sendFbBtn=h("button",{className:"btn-primary",style:{marginTop:8}});
  sendFbBtn.textContent=state.feedbackSent?"✓ Feedback sent — thank you!":"Send Feedback";
  sendFbBtn.style.background=state.feedbackSent?C.teal:C.grove;
  sendFbBtn.addEventListener("click",async()=>{
    const text=(state.feedbackDraft||"").trim();
    if(!text)return;
    const db=getDb();
    try{
      if(db){
        await db.collection("feedback").add({
          uid:currentUser?currentUser.uid:"anonymous",
          name:state.profile.name||"",
          email:state.profile.email||"",
          type:state.feedbackType||"",
          message:text,
          timestamp:firebase.firestore.FieldValue.serverTimestamp(),
          appVersion:"1.0.0"
        });
      }
      state.feedbackSent=true;
      state.feedbackDraft="";
      render();
      setTimeout(()=>{state.feedbackSent=false;render();},4000);
    }catch(e){
      alert("Couldn't send feedback. Please try again.");
    }
  });
  fbCard.appendChild(sendFbBtn);
  el.appendChild(fbCard);

  // App settings
  const resetCard=h("div",{className:"card"});
  resetCard.appendChild(h("div",{className:"card-title"},"App Settings"));
  if(currentUser){
    const signOutBtn=h("button",{style:{background:"#fff",color:C.grove,border:"1px solid "+C.grove+"66",borderRadius:10,padding:"10px 16px",fontSize:12,cursor:"pointer",fontWeight:600,width:"100%",marginBottom:10}});
    signOutBtn.textContent="Sign Out";
    signOutBtn.addEventListener("click",()=>{if(confirm("Sign out of Hisabi?")){signOut();}});
    resetCard.appendChild(signOutBtn);
  }
  const resetBtn=h("button",{style:{background:"#fff",color:C.coralDark,border:"1px solid "+C.coral+"66",borderRadius:10,padding:"10px 16px",fontSize:12,cursor:"pointer",fontWeight:500,width:"100%"}},"Reset All Data");
  resetBtn.addEventListener("click",()=>{if(confirm("Reset all data? This cannot be undone.")){localStorage.clear();location.reload();}});
  resetCard.appendChild(resetBtn);
  el.appendChild(resetCard);

  // App info footer
  const footer=h("div",{style:{textAlign:"center",padding:"16px 0 8px"}});
  footer.appendChild(h("div",{style:{fontFamily:"'Lora',serif",fontSize:16,color:C.grove,fontWeight:700}},"Hisabi · حسابي"));
  footer.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginTop:4}},"Track every fils · Built for Bahrain"));
  footer.appendChild(h("div",{style:{fontSize:10,color:C.gray3,marginTop:4}},"v1.0.0"));
  el.appendChild(footer);
}

// ══════════════════════════════════════════════════════════════════════════
// BANK STATEMENT IMPORT
// ══════════════════════════════════════════════════════════════════════════
async function importBankStatement(e){
  const file=e.target.files[0];if(!file)return;
  const apiKey=getApiKey();if(!apiKey)return;
  state.importLoading=true;state.importResult=null;render();
  const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
  const catList=CATS.join(", ");
  const prompt=`You are a bank statement parser for Hisabi, a personal finance app in Bahrain (currency BHD).

Analyze this bank statement PDF and extract ALL transactions. Respond ONLY in this exact JSON format, no markdown, no extra text:
{
  "transactions": [
    {"date":"YYYY-MM-DD","desc":"merchant or description","amount":0.000,"category":"one of: ${catList}","isIncome":false}
  ],
  "budgetSuggestions": {"Housing":500,"Food":150},
  "analysis": "2-3 sentence summary of spending habits and patterns observed"
}

Rules:
- amount is always positive (use isIncome:true for deposits/salary)
- Pick the most relevant category from: ${catList}
- date format must be YYYY-MM-DD
- If date unclear, use today's date`;
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:[{type:"document",source:{type:"base64",media_type:"application/pdf",data:b64}},{type:"text",text:prompt}]}]})});
    const data=await res.json();
    const raw=data.content&&data.content.map(b=>b.text||"").join("")||"";
    const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
    let added=0;
    (parsed.transactions||[]).forEach(t=>{
      if(t.isIncome){state.sides.push({id:Date.now()+added,date:t.date||tod(),desc:t.desc,amount:Math.abs(t.amount)});}
      else{state.txs.push({id:Date.now()+added,date:t.date||tod(),desc:t.desc,amount:Math.abs(t.amount),category:CATS.includes(t.category)?t.category:"Other"});}
      added++;
    });
    let catsUpdated=0;
    if(parsed.budgetSuggestions){Object.entries(parsed.budgetSuggestions).forEach(([cat,val])=>{if(CATS.includes(cat)){state.limits[cat]=Number(val);catsUpdated++;}});}
    if(parsed.analysis){state.msgs.push({role:"assistant",text:"Bank statement imported!\n\n"+parsed.analysis+"\n\nI've added "+added+" transactions and updated "+catsUpdated+" budget limits based on your spending patterns."});}
    state.importResult={count:added,cats:catsUpdated,summary:parsed.analysis||""};
  }catch(err){
    state.msgs.push({role:"assistant",text:"Couldn't read the statement. Make sure it's a text-based PDF (not a scanned image). Try downloading directly from your bank's app."});
    state.importResult={count:0,cats:0,summary:"Import failed. Please try again with a text-based PDF."};
  }
  state.importLoading=false;e.target.value="";render();
}

function quickLog(s){
  state.txs.push({id:Date.now(),date:tod(),ts:new Date().toISOString(),desc:s.label,amount:s.amount,category:s.category});
  render();
}
