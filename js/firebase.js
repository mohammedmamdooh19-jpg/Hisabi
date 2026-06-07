// ══════════════════════════════════════════════════════════════════════════
// FIREBASE INIT & GOOGLE AUTH
// ══════════════════════════════════════════════════════════════════════════
const firebaseConfig={
  apiKey:"AIzaSyAUBh4tFM2mL-lg--31qY5wMjnzbVn0wzA",
  authDomain:"hisabi-28018.firebaseapp.com",
  projectId:"hisabi-28018",
  storageBucket:"hisabi-28018.firebasestorage.app",
  messagingSenderId:"365148761689",
  appId:"1:365148761689:web:2db6ad71279ae2cec98b48"
};

let currentUser=null;
let _firebaseAuth=null;
let _firebaseDb=null;

function getAuth(){return _firebaseAuth;}
function getDb(){return _firebaseDb;}

// Load user data from Firestore
async function loadUserData(uid){
  const db=getDb();if(!db)return;
  try{
    const doc=await db.collection("users").doc(uid).get();
    if(doc.exists){
      const saved=doc.data();
      Object.assign(state,saved);
      if(!state.profile) state.profile={name:"",email:"",mobile:"",newsletter:true};
      if(!state.profile.name&&currentUser.displayName) state.profile.name=currentUser.displayName;
      if(!state.profile.email&&currentUser.email) state.profile.email=currentUser.email;
    } else {
      if(!state.profile) state.profile={name:"",email:"",mobile:"",newsletter:true};
      state.profile.name=currentUser.displayName||"";
      state.profile.email=currentUser.email||"";
    }
  }catch(e){console.log("Load error",e);}
}

// Save to Firestore
async function saveToCloud(){
  const db=getDb();
  if(!currentUser||!db)return;
  try{
    const toSave={...state};
    ["chatLoading","importLoading","importResult","showScForm","showDebtForm","showGoalForm","showAddCat","editingShortcuts","editingScId","editingCat","editingGoalId","showImportInfo"].forEach(k=>delete toSave[k]);
    await db.collection("users").doc(currentUser.uid).set(toSave,{merge:true});
  }catch(e){console.log("Save error",e);}
}

// Google Sign-In — always use redirect (works on Safari/iPhone)
function signInWithGoogle(){
  const auth=getAuth();if(!auth)return;
  const provider=new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

function signOut(){
  currentUser=null;
  clearGuestSession();
  localStorage.removeItem("hisabi_setup_done");
  const auth=getAuth();
  if(auth) auth.signOut().catch(()=>{});
  renderRoot();
}

// Main render router
function renderRoot(){
  try{saveState();}catch(e){}
  try{saveToCloud();}catch(e){}
  const root=document.getElementById("root");
  if(!root)return;
  root.innerHTML="";
  try{
    if(!currentUser){renderSignIn(root);return;}
    if(!isSetup()){renderOnboarding(root);return;}
    renderApp(root);
  }catch(e){
    console.error("Render error:",e);
    root.innerHTML=`<div style="padding:40px;text-align:center;font-family:sans-serif;">
      <div style="font-size:32px;margin-bottom:16px;color:#F0997B;">!</div>
      <div style="font-size:16px;color:#2C2C2A;margin-bottom:8px;">Something went wrong</div>
      <div style="font-size:12px;color:#888;margin-bottom:24px;">${e.message}</div>
      <button onclick="localStorage.clear();location.reload()" style="background:#3B6D11;color:#fff;border:none;border-radius:10px;padding:12px 24px;font-size:14px;cursor:pointer;">Reset & Restart</button>
    </div>`;
  }
}

// Sign-in screen
function renderSignIn(root){
  const el=h("div",{className:"landing"});

  // ── Logo wordmark ──
  const logoWrap=h("div",{style:{marginBottom:"48px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center"}});

  // Badge
  const badge=h("div",{style:{
    width:76,height:76,borderRadius:22,
    background:"linear-gradient(135deg,rgba(255,255,255,0.2),rgba(255,255,255,0.07))",
    border:"1px solid rgba(255,255,255,0.28)",
    display:"flex",alignItems:"center",justifyContent:"center",
    marginBottom:20,
    boxShadow:"0 8px 32px rgba(0,0,0,0.25),inset 0 1px 0 rgba(255,255,255,0.15)"
  }});
  badge.innerHTML=`<svg width="38" height="38" viewBox="0 0 40 40" fill="none">
    <path d="M8 8 L8 32 M8 20 L32 20 M32 8 L32 32" stroke="#F6EAC8" stroke-width="4.5" stroke-linecap="round"/>
    <circle cx="20" cy="20" r="3" fill="#97C459"/>
  </svg>`;
  logoWrap.appendChild(badge);

  // Wordmark
  logoWrap.appendChild(h("div",{style:{
    fontFamily:"'Lora',Georgia,serif",
    fontSize:46,fontWeight:700,
    color:"#F6EAC8",
    letterSpacing:-2,
    lineHeight:1,
    marginBottom:8
  }},"Hisabi"));

  // Arabic
  logoWrap.appendChild(h("div",{style:{
    fontFamily:"'Scheherazade New',serif",
    fontSize:18,color:"#97C459",
    marginBottom:12,
    letterSpacing:1
  }},"حسابي"));

  // Divider line
  const divLine=h("div",{style:{width:32,height:1,background:"rgba(255,255,255,0.15)",marginBottom:12}});
  logoWrap.appendChild(divLine);

  // Tagline
  logoWrap.appendChild(h("div",{style:{
    fontSize:13,color:"#C0DD97",
    letterSpacing:0.5,
    marginBottom:3,
    fontWeight:500
  }},"Your personal finance tracker"));
  logoWrap.appendChild(h("div",{style:{fontSize:11,color:"#5a6b45",letterSpacing:0.3}},"Built for Bahrain, built for you."));

  el.appendChild(logoWrap);

  // ── Feature rows — liquid glass style ──
  const features=h("div",{style:{display:"flex",flexDirection:"column",gap:"12px",marginTop:"8px",marginBottom:"40px",width:"100%",maxWidth:320}});
  [
    ["Quick Log","Log daily payments like Karak in one tap"],
    ["Goals","Save toward what matters with deadlines"],
    ["Loans","Track your installments and stay on top"],
    ["AI Insights","Understand your money like never before"],
  ].forEach(([title,desc])=>{
    const row=h("div",{style:{
      background:"rgba(255,255,255,0.08)",
      backdropFilter:"blur(16px)",
      WebkitBackdropFilter:"blur(16px)",
      border:"1px solid rgba(255,255,255,0.13)",
      borderRadius:"14px",
      padding:"16px 20px",
      boxShadow:"0 2px 12px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,0.1)",
      textAlign:"center",
    }});
    row.appendChild(h("div",{style:{fontSize:12,fontWeight:600,color:"#F6EAC8",marginBottom:3,letterSpacing:0.1}},title));
    row.appendChild(h("div",{style:{fontSize:11,color:"#7a8a60",lineHeight:1.5}},desc));
    features.appendChild(row);
  });
  el.appendChild(features);

  // ── Sign-in options ──
  const btnWrap=h("div",{style:{width:"100%",maxWidth:320,display:"flex",flexDirection:"column",gap:12}});

  // Google Sign-In button
  const googleBtn=document.createElement("button");
  googleBtn.style.cssText="display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#2C2C2A;border:none;border-radius:14px;padding:15px 24px;font-size:15px;font-weight:600;cursor:pointer;width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.2);font-family:'Plus Jakarta Sans',sans-serif;";
  const svgNS="http://www.w3.org/2000/svg";
  const gSvg=document.createElementNS(svgNS,"svg");
  gSvg.setAttribute("width","20");gSvg.setAttribute("height","20");gSvg.setAttribute("viewBox","0 0 48 48");
  gSvg.innerHTML='<path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4.5 24 4.5 13.3 4.5 4.5 13.3 4.5 24S13.3 43.5 24 43.5c10.5 0 19.5-7.5 19.5-19.5 0-1.3-.1-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4.5 24 4.5c-7.6 0-14.1 4.4-17.7 10.2z"/><path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-1.9 13.4-5.1l-6.2-5.2C29.3 34.9 26.8 36 24 36c-5.2 0-9.7-2.7-11.3-7H6.3C9.8 39 16.3 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>';
  googleBtn.appendChild(gSvg);
  googleBtn.appendChild(document.createTextNode("Continue with Google"));
  googleBtn.addEventListener("click",signInWithGoogle);
  btnWrap.appendChild(googleBtn);

  // Divider
  const div=h("div",{style:{display:"flex",alignItems:"center",gap:10}});
  div.appendChild(h("div",{style:{flex:1,height:1,background:"rgba(255,255,255,0.15)"}}));
  div.appendChild(h("div",{style:{fontSize:11,color:"#6b7a55"}},"or"));
  div.appendChild(h("div",{style:{flex:1,height:1,background:"rgba(255,255,255,0.15)"}}));
  btnWrap.appendChild(div);

  // Guest button
  const guestBtn=document.createElement("button");
  guestBtn.style.cssText="display:flex;align-items:center;justify-content:center;gap:10px;background:rgba(255,255,255,0.08);color:#C0DD97;border:1px solid rgba(255,255,255,0.2);border-radius:14px;padding:15px 24px;font-size:14px;font-weight:500;cursor:pointer;width:100%;font-family:'Plus Jakarta Sans',sans-serif;";
  guestBtn.textContent="Continue without account";
  guestBtn.addEventListener("click",()=>{
    currentUser={uid:"guest_local",displayName:"",email:"",isGuest:true};
    setGuestSession();
    localStorage.removeItem("hisabi_setup_done");
    renderRoot();
  });
  btnWrap.appendChild(guestBtn);

  // Security note
  btnWrap.appendChild(h("div",{style:{
    fontSize:11,color:"#8a9a65",textAlign:"center",
    lineHeight:1.6,marginTop:4
  }},"Google: data syncs across devices\nGuest: data stored on this device only"));

  el.appendChild(btnWrap);
  root.appendChild(el);
}

// ── Boot ──────────────────────────────────────────────────────────────────
// Restore guest session across page refreshes before first render
if(isGuestSession()){
  currentUser={uid:"guest_local",displayName:"",email:"",isGuest:true};
}
renderRoot();

// Load Firebase async after app is visible
function loadFirebase(){
  return new Promise((resolve)=>{
    const scripts=[
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js",
      "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"
    ];
    let loaded=0;
    scripts.forEach(src=>{
      const s=document.createElement("script");
      s.src=src;
      s.onload=()=>{loaded++;if(loaded===scripts.length)resolve(true);};
      s.onerror=()=>{loaded++;if(loaded===scripts.length)resolve(false);};
      document.head.appendChild(s);
    });
  });
}

loadFirebase().then(ok=>{
  if(!ok||typeof firebase==="undefined"){
    console.log("Firebase failed — running offline");
    return;
  }
  try{
    firebase.initializeApp(firebaseConfig);
    _firebaseAuth=firebase.auth();
    _firebaseDb=firebase.firestore();
    _firebaseAuth.getRedirectResult().catch(()=>{});
    _firebaseAuth.onAuthStateChanged(async user=>{
      if(user){
        currentUser=user;
        try{await loadUserData(user.uid);}catch(e){}
        renderRoot();
      } else {
        if(currentUser&&currentUser.isGuest) return;
        currentUser=null;
        renderRoot();
      }
    });
  }catch(e){console.log("Firebase init error:",e);}
});
