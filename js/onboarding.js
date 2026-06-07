// ══════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ══════════════════════════════════════════════════════════════════════════
function renderLanding(root){
  const el=h("div",{className:"landing"});

  // Logo
  el.appendChild(h("div",{className:"landing-logo"},"Hisabi"));
  el.appendChild(h("div",{className:"landing-arabic"},"حسابي"));

  // Tagline
  el.appendChild(h("div",{className:"landing-tagline"},"Your personal finance tracker, built for Bahrain."));
  el.appendChild(h("div",{className:"landing-sub"},"Track every fils. Save toward your goals. Understand your money."));

  // Features
  const features=h("div",{className:"landing-features"});
  [["Quick-log daily payments in one tap"],["Set savings goals with deadlines"],["AI assistant that knows your finances"],["Import bank statements automatically"]].forEach(([icon,text])=>{
    const f=h("div",{className:"landing-feature"});
    f.appendChild(h("div",{className:"landing-feature-icon"},icon));
    f.appendChild(h("div",{className:"landing-feature-text"},text));
    features.appendChild(f);
  });
  el.appendChild(features);

  // CTA
  el.appendChild(h("button",{className:"landing-btn",onClick:()=>renderOnboarding(root)},"Get Started →"));
  el.appendChild(h("button",{className:"landing-secondary",onClick:()=>{markSetup();render();}},"I already have an account"));

  root.appendChild(el);
}

// ══════════════════════════════════════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════════════════════════════════════
let onboardStep=1;
const TOTAL_STEPS=5;
const onboardData={name:"",salary:"",spendingHabit:"",goals:[],hasLoan:null,loanName:"",loanTotal:"",loanMonthly:"",loanPaid:"",loanDay:"",loanEnd:"",loanPurpose:"",prefs:{weeklyReview:false,spendingAlerts:true,weeklySummary:false}};
const goalOptions=[
  // Ring icon — clearly engagement/marriage
  {icon:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 4V2M12 22v-2M4 12H2M22 12h-2"/></svg>`,name:"Get Engaged / Married",desc:"Save toward a life milestone"},
  // Plane icon — clearly travel
  {icon:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,name:"Travel & Vacation",desc:"Plan your next trip"},
  // House icon — clearly home
  {icon:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,name:"Buy a Home",desc:"Save for a down payment"},
  // Umbrella icon — clearly protection/safety net
  {icon:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7"/></svg>`,name:"Emergency Fund",desc:"Build a financial safety net"},
  // Graduation cap — clearly education
  {icon:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,name:"Education / Course",desc:"Invest in yourself"},
  // Car icon — clearly a car
  {icon:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,name:"Buy a Car",desc:"Save for your next vehicle"},
];
const habitOptions=[
  // Piggy bank — clearly saving money
  {svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5c-1.5 0-2.8.6-3.8 1.5A5 5 0 006 10v1H4l-2 4h2v3a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-3h2l-2-4V10a5 5 0 00-1-3"/><circle cx="15" cy="10" r="1" fill="currentColor"/></svg>`,value:"saver",label:"Natural Saver",desc:"I think before I spend and always try to save"},
  // Shopping bag — clearly spending
  {svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,value:"spender",label:"Free Spender",desc:"I enjoy spending and live in the moment"},
  // Scale/balance — clearly balance
  {svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9 2 9-2"/><path d="M3 15a6 6 0 006 6"/><path d="M21 15a6 6 0 01-6 6"/><path d="M3 9a6 6 0 006-6"/><path d="M21 9a6 6 0 01-6-6"/></svg>`,value:"balanced",label:"Somewhere in between",desc:"I try to balance spending and saving"},
  // Chart trending up — clearly improvement
  {svg:`<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,value:"improving",label:"Trying to improve",desc:"I want to get better at managing my money"},
];

function renderOnboarding(root){
  root.innerHTML="";
  const el=h("div",{className:"onboard"});
  const prog=h("div",{className:"progress-bar"});
  prog.appendChild(h("div",{className:"progress-fill",style:{width:((onboardStep/TOTAL_STEPS)*100)+"%"}}));
  el.appendChild(prog);
  const ohdr=h("div",{className:"onboard-header"});
  if(onboardStep>1){const back=document.createElement("button");back.style.cssText="background:none;border:none;cursor:pointer;font-size:18px;color:"+C.gray2+";margin-right:8px;";back.textContent="←";back.addEventListener("click",()=>{onboardStep--;renderOnboarding(root);});ohdr.appendChild(back);}
  const hdrtxt=h("div");
  hdrtxt.appendChild(h("div",{className:"onboard-step"},"Step "+onboardStep+" of "+TOTAL_STEPS));
  hdrtxt.appendChild(h("div",{className:"onboard-title"},["Welcome to Hisabi","Your monthly salary","Your spending style","What are you saving for?","Do you have a loan?"][onboardStep-1]));
  ohdr.appendChild(hdrtxt);el.appendChild(ohdr);
  const body=h("div",{className:"onboard-body"});

  if(onboardStep===1){
    body.appendChild(h("div",{style:{fontSize:14,color:C.gray2,marginBottom:24,lineHeight:1.6}},"Let's personalise Hisabi for you. What should we call you?"));
    const ni=h("input",{className:"inp",placeholder:"Your first name",value:onboardData.name,style:{fontSize:18,padding:"14px"}});
    ni.addEventListener("input",e=>onboardData.name=e.target.value);
    body.appendChild(ni);
    body.appendChild(h("div",{style:{fontSize:11,color:C.gray2,marginTop:8}},"Used to personalise your experience. You can change this later."));

  } else if(onboardStep===2){
    body.appendChild(h("div",{style:{fontSize:14,color:C.gray2,marginBottom:24,lineHeight:1.6}},"Nice to meet you, "+(onboardData.name||"there")+"! What is your monthly salary in BHD?"));
    const si=h("input",{className:"inp",placeholder:"e.g. 1200.000",type:"number",step:"0.001",value:onboardData.salary,style:{fontSize:20,padding:"16px",fontFamily:"'Lora',serif",textAlign:"center"}});
    si.addEventListener("input",e=>onboardData.salary=e.target.value);
    body.appendChild(si);
    body.appendChild(h("div",{style:{fontSize:11,color:C.gray2,marginTop:8,textAlign:"center"}},"This helps calculate your balance and budget limits."));

  } else if(onboardStep===3){
    body.appendChild(h("div",{style:{fontSize:14,color:C.gray2,marginBottom:20,lineHeight:1.6}},"How would you describe your spending style?"));
    habitOptions.forEach(opt=>{
      const sel=onboardData.spendingHabit===opt.value;
      const card=document.createElement("div");
      card.style.cssText="border:2px solid "+(sel?C.grove:C.border)+";border-radius:12px;padding:14px;margin-bottom:10px;cursor:pointer;background:"+(sel?C.mint:"#fff")+";display:flex;align-items:center;gap:12px;";
      const ico=document.createElement("div");
      ico.style.cssText="width:44px;height:44px;border-radius:12px;background:"+(sel?C.grove+"22":"#F1EFE8")+";display:flex;align-items:center;justify-content:center;flex-shrink:0;color:"+(sel?C.grove:C.gray2)+";";
      ico.innerHTML=opt.svg||"";
      const svg=ico.querySelector("svg");if(svg)svg.style.cssText="width:24px;height:24px;stroke:currentColor;";
      const txt=document.createElement("div");
      const lbl=document.createElement("div");lbl.style.cssText="font-size:13px;font-weight:600;color:"+(sel?C.grove:C.gray1)+";";lbl.textContent=opt.label;
      const dsc=document.createElement("div");dsc.style.cssText="font-size:11px;color:"+C.gray2+";margin-top:2px;";dsc.textContent=opt.desc;
      txt.appendChild(lbl);txt.appendChild(dsc);
      card.appendChild(ico);card.appendChild(txt);
      if(sel){const chk=document.createElement("div");chk.style.cssText="color:"+C.grove+";font-size:20px;margin-left:auto;";chk.textContent="✓";card.appendChild(chk);}
      card.addEventListener("click",()=>{onboardData.spendingHabit=opt.value;renderOnboarding(root);});
      body.appendChild(card);
    });

  } else if(onboardStep===4){
    body.appendChild(h("div",{style:{fontSize:14,color:C.gray2,marginBottom:20,lineHeight:1.6}},"What are you saving toward? Pick all that apply — or skip and add later."));
    goalOptions.forEach(g=>{
      const sel=onboardData.goals.includes(g.name);
      const opt=h("div",{style:{
        border:"2px solid "+(sel?C.grove:C.border),
        borderRadius:12,padding:"14px 16px",marginBottom:10,
        cursor:"pointer",background:sel?C.mint:"#fff",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        transition:"all 0.15s"
      }});
      opt.appendChild(h("div",{style:{fontSize:13,fontWeight:600,color:sel?C.grove:C.gray1}},g.name));
      if(sel) opt.appendChild(h("div",{style:{width:20,height:20,borderRadius:"50%",background:C.grove,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,flexShrink:0}},"✓"));
      opt.addEventListener("click",()=>{
        if(sel) onboardData.goals=onboardData.goals.filter(x=>x!==g.name);
        else onboardData.goals.push(g.name);
        renderOnboarding(root);
      });
      body.appendChild(opt);
    });
    // Add later note
    body.appendChild(h("div",{style:{fontSize:11,color:C.gray2,textAlign:"center",marginTop:8,lineHeight:1.6}},"You can always add and edit goals later from the Plan tab."));

  } else if(onboardStep===5){
    body.appendChild(h("div",{style:{fontSize:14,color:C.gray2,marginBottom:20,lineHeight:1.6}},"Do you have any active loans? This is very common in Bahrain and Hisabi has a dedicated loan tracker."));
    const yesno=h("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}});
    [["Yes, I do",true],["No, I don't",false]].forEach(([label,val])=>{
      const btn=document.createElement("div");
      btn.style.cssText="border:2px solid "+(onboardData.hasLoan===val?C.grove:C.border)+";border-radius:12px;padding:16px;text-align:center;cursor:pointer;background:"+(onboardData.hasLoan===val?C.mint:"#fff")+";";
      const lb=document.createElement("div");lb.style.cssText="font-size:13px;font-weight:600;color:"+(onboardData.hasLoan===val?C.grove:C.gray1)+";";lb.textContent=label;
      btn.appendChild(lb);
      btn.addEventListener("click",()=>{onboardData.hasLoan=val;renderOnboarding(root);});
      yesno.appendChild(btn);
    });
    body.appendChild(yesno);
    if(onboardData.hasLoan){
      body.appendChild(h("div",{style:{fontSize:13,color:C.grove,fontWeight:600,marginBottom:12}},"Add your first loan (optional):"));
      const lc=h("div",{style:{background:C.gray4,borderRadius:12,padding:14,border:"1px solid "+C.border}});
      const lf=h("div",{className:"form-row"});
      const inputs=[
        ["loanName","inp form-full","Loan name (e.g. Car Loan - NBB)","text"],
        ["loanTotal","inp","Total amount (BD)","number"],
        ["loanMonthly","inp","Monthly installment (BD)","number"],
        ["loanPaid","inp","Amount paid so far (BD)","number"],
        ["loanDay","inp","Payment day (e.g. 15)","number"],
      ];
      inputs.forEach(([key,cls,ph,type])=>{
        const inp=h("input",{className:cls,placeholder:ph,type:type,step:"0.001",value:onboardData[key]||""});
        inp.addEventListener("input",e=>onboardData[key]=e.target.value);
        lf.appendChild(inp);
      });
      const lend=h("div",{className:"form-full"});
      lend.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:4}},"Loan end date"));
      const lendI=h("input",{className:"inp",type:"date",value:onboardData.loanEnd||""});
      lendI.addEventListener("change",e=>onboardData.loanEnd=e.target.value);
      lend.appendChild(lendI);lf.appendChild(lend);
      const lpur=h("div",{className:"form-full"});
      lpur.appendChild(h("div",{style:{fontSize:10,color:C.gray2,marginBottom:6}},"Purpose of loan"));
      const purps=h("div",{style:{display:"flex",flexWrap:"wrap",gap:6}});
      ["Car","Home","Personal","Education","Medical","Other"].forEach(p=>{
        const pill=document.createElement("button");
        pill.style.cssText="padding:5px 10px;border-radius:99px;font-size:11px;cursor:pointer;border:1px solid "+(onboardData.loanPurpose===p?C.grove:C.gray3)+";background:"+(onboardData.loanPurpose===p?C.mint:"#fff")+";color:"+(onboardData.loanPurpose===p?C.grove:C.gray2)+";font-family:'Plus Jakarta Sans',sans-serif;";
        pill.textContent=p;
        pill.addEventListener("click",()=>{onboardData.loanPurpose=p;renderOnboarding(root);});
        purps.appendChild(pill);
      });
      lpur.appendChild(purps);lf.appendChild(lpur);
      lc.appendChild(lf);body.appendChild(lc);
    }
    body.appendChild(h("div",{style:{fontSize:13,color:C.gray1,fontWeight:600,marginTop:20,marginBottom:12}},"Your Preferences"));
    [["weeklyReview","Weekly budget review","Remind me to review my budget each week"],["spendingAlerts","Spending alerts","Warn me when I'm close to a category limit"],["weeklySummary","Weekly summary","Show me a weekly summary of my spending"]].forEach(([key,label,desc])=>{
      const row=document.createElement("div");
      row.style.cssText="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding:12px 14px;background:#fff;border-radius:10px;border:1px solid "+C.border+";";
      const left=document.createElement("div");
      const lb=document.createElement("div");lb.style.cssText="font-size:13px;font-weight:500;color:"+C.gray1+";";lb.textContent=label;
      const dc=document.createElement("div");dc.style.cssText="font-size:11px;color:"+C.gray2+";margin-top:2px;";dc.textContent=desc;
      left.appendChild(lb);left.appendChild(dc);row.appendChild(left);
      const tog=document.createElement("button");
      tog.style.cssText="width:44px;height:24px;border-radius:99px;background:"+(onboardData.prefs[key]?C.grove:C.gray3)+";border:none;cursor:pointer;position:relative;flex-shrink:0;";
      const knob=document.createElement("div");
      knob.style.cssText="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:"+(onboardData.prefs[key]?"22px":"2px")+";transition:left 0.2s;box-shadow:0 1px 3px rgba(0,0,0,0.2);";
      tog.appendChild(knob);
      tog.addEventListener("click",()=>{onboardData.prefs[key]=!onboardData.prefs[key];renderOnboarding(root);});
      row.appendChild(tog);body.appendChild(row);
    });
  }

  el.appendChild(body);
  const footer=h("div",{className:"onboard-footer"});
  const isLast=onboardStep===TOTAL_STEPS;
  const nextBtn=h("button",{className:"btn-primary",style:{marginTop:0}});
  nextBtn.textContent=isLast?"Let's go!":"Continue →";
  nextBtn.addEventListener("click",()=>{
    if(onboardStep<TOTAL_STEPS){onboardStep++;renderOnboarding(root);}
    else{
      state.profile.name=onboardData.name||"";
      state.salary=Number(onboardData.salary)||0;
      state.spendingHabit=onboardData.spendingHabit||"balanced";
      state.preferences=onboardData.prefs;
      onboardData.goals.forEach(gname=>{
        const match=goalOptions.find(x=>x.name===gname);
        if(match)state.goals.push({id:Date.now()+Math.random(),name:gname,icon:match.icon,color:C.grove,target:0,saved:0,freq:"monthly",freqAmount:0,deadline:"",type:"save"});
      });
      if(onboardData.hasLoan&&onboardData.loanName&&onboardData.loanTotal){
        if(!state.loans)state.loans=[];
        state.loans.push({id:Date.now(),name:onboardData.loanName,purpose:onboardData.loanPurpose||"Other",total:Number(onboardData.loanTotal)||0,paid:Number(onboardData.loanPaid)||0,monthly:Number(onboardData.loanMonthly)||0,payDay:Number(onboardData.loanDay)||1,endDate:onboardData.loanEnd||"",color:C.grove});
      }
      markSetup();render();
    }
  });
  footer.appendChild(nextBtn);
  // Skip button on step 4 (goals) and last step
  if(onboardStep===4||isLast){
    const skip=document.createElement("button");
    skip.style.cssText="background:none;border:none;cursor:pointer;font-size:12px;color:"+C.gray2+";margin-top:10px;display:block;width:100%;text-align:center;";
    skip.textContent=isLast?"Skip for now":"Skip — I'll add goals later";
    skip.addEventListener("click",()=>{
      if(isLast){markSetup();render();}
      else{onboardStep++;renderOnboarding(root);}
    });
    footer.appendChild(skip);
  }
  // DEV ONLY — remove before going live
  const devSkip=document.createElement("button");
  devSkip.style.cssText="background:none;border:1px dashed #f97316;border-radius:6px;cursor:pointer;font-size:10px;color:#f97316;margin-top:14px;padding:4px 10px;display:block;width:100%;text-align:center;font-family:'Plus Jakarta Sans',sans-serif;";
  devSkip.textContent="⚡ Skip to Dashboard (dev)";
  devSkip.addEventListener("click",()=>{
    localStorage.setItem("hisabi_setup_done","1");
    localStorage.setItem("hisabi_guest","1");
    if(!currentUser){currentUser={uid:"guest_local",displayName:"",email:"",isGuest:true};}
    renderRoot();
  });
  footer.appendChild(devSkip);
  el.appendChild(footer);
  root.appendChild(el);
}
