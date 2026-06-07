// ── Palette ────────────────────────────────────────────────────────────────
const C={bg:"#F1EFE8",surface:"#fff",surface2:"#F8F7F3",border:"#E8E6DF",grove:"#3B6D11",leaf:"#97C459",sprout:"#C0DD97",mint:"#EAF3DE",teal:"#1D9E75",tealLight:"#E1F5EE",tealMid:"#5DCAA5",amber:"#EF9F27",amberLight:"#FAEEDA",amberMid:"#FAC775",coral:"#F0997B",coralLight:"#FAECE7",coralDark:"#D85A30",gray1:"#2C2C2A",gray2:"#888780",gray3:"#D3D1C7",gray4:"#F8F7F3"};

const CATS=["Housing","Food","Transport","Utilities","Entertainment","Health","Shopping","Savings","Other"];
const CAT_COLORS={Housing:C.grove,Food:C.amber,Transport:C.teal,Utilities:C.leaf,Entertainment:"#9B7FD4",Health:C.tealMid,Shopping:C.coral,Savings:C.teal,Other:C.gray2};
const CAT_ICONS={"Housing":"Ho","Food":"Fo","Transport":"Tr","Utilities":"Ut","Entertainment":"En","Health":"He","Shopping":"Sh","Savings":"Sa","Other":"Ot"};
const GOAL_ICONS=["◎","◈","◉","⊕","◐","◑","◒","◓","◔","◕","⊗","⊘","⊙","◇","◆","△","▽","☆"];
const GOAL_ICON_LABELS=["Ring","Diamond","Circle","Plus","Half","Split","Quarter","Dot","Arc","Full","Cross","Slash","Target","Square","Fill","Up","Down","Star"];
const GOAL_COLORS=[C.grove,C.teal,C.amber,C.coral,"#9B7FD4",C.leaf,C.tealMid,C.amberMid];

// Named SVG icon set for Quick Log shortcuts
const SC_ICONS={
  karak:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><path d="M6 2v2M10 2v2M14 2v2"/></svg>`,
  parking:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
  food:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="3" x2="8" y2="21"/><path d="M6 3v5a2 2 0 0 0 4 0V3"/><line x1="17" y1="3" x2="17" y2="21"/></svg>`,
  bag:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  fuel:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17"/><line x1="1" y1="22" x2="15" y2="22"/><path d="M15 8h2a2 2 0 0 1 2 2v3a1 1 0 0 0 2 0V9l-3-3"/><line x1="3" y1="11" x2="13" y2="11"/></svg>`,
  phone:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1" fill="currentColor" stroke="none"/></svg>`,
  wifi:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 8.5A14.5 14.5 0 0 1 12 4.5c4 0 7.6 1.6 10.2 4.2"/><path d="M5 12a9.9 9.9 0 0 1 7-2.9 9.9 9.9 0 0 1 7 2.9"/><path d="M8.5 15.5A5 5 0 0 1 12 14a5 5 0 0 1 3.5 1.5"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/></svg>`,
  car:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17H5a2 2 0 0 1-2-2V9l2-4h14l2 4v6a2 2 0 0 1-2 2z"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>`,
  pill:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7.07-7.07l7 7a5 5 0 0 1-7.07 7.07z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,
  scissors:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
  bulb:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.2-1.2 4.2-3 5.3V18H9v-3.7A6 6 0 0 1 6 9a6 6 0 0 1 6-6z"/></svg>`,
  water:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 5.5 9.5A6.5 6.5 0 1 0 18.5 9.5Z"/></svg>`,
  gym:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="12" x2="15" y2="12"/><rect x="3" y="9" width="6" height="6" rx="2"/><rect x="15" y="9" width="6" height="6" rx="2"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`,
  book:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  gift:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,
  wallet:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>`,
};
const SC_COLORS=[C.amber,C.grove,C.teal,C.coral,"#9B7FD4",C.leaf,C.tealMid,C.amberMid];
