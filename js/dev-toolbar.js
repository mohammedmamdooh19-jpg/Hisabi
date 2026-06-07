// DEV TOOLBAR — localhost only, never on production
if(location.hostname==="localhost"||location.hostname==="127.0.0.1"){
  const bar=document.createElement("div");
  bar.style.cssText="position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;display:flex;gap:6px;background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:6px 8px;box-shadow:0 4px 20px rgba(0,0,0,0.5);font-family:'Plus Jakarta Sans',sans-serif;";
  [
    ["Sign In",()=>{localStorage.clear();location.reload();},"#555"],
    ["Dashboard",()=>{localStorage.setItem("hisabi_setup_done","1");localStorage.setItem("hisabi_guest","1");location.reload();},"#2d6a1f"],
    ["Reset All",()=>{localStorage.clear();location.reload();},"#7a1f1f"],
  ].forEach(([label,action,bg])=>{
    const btn=document.createElement("button");
    btn.textContent=label;
    btn.style.cssText="background:"+bg+";color:#eee;border:none;border-radius:6px;padding:4px 10px;font-size:10px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:0.2px;white-space:nowrap;";
    btn.addEventListener("click",action);
    bar.appendChild(btn);
  });
  document.body.appendChild(bar);
}
