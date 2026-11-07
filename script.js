const $ = (id) => document.getElementById(id);

// These are clearly labelled demo records, not verified live vacancies.
const demoOpportunities = [
  {id:1,title:"AI & Machine Learning Intern",company:"Example Technology Lab",location:"Pakistan",status:"Unverified",field:"Artificial Intelligence",deadline:"Check official website",description:"Illustrative listing for the demo interface. Replace with an opportunity verified on the organization's official website.",url:"",tags:["Python","Machine Learning","Student"]},
  {id:2,title:"Remote Data Science Intern",company:"Sample Data Studio",location:"Remote",status:"Unverified",field:"Data Science",deadline:"Check official website",description:"Sample remote role to demonstrate search, filtering and saving. This is not a real vacancy.",url:"",tags:["Python","Pandas","Data Analysis"]},
  {id:3,title:"Computer Vision Intern",company:"Demo Research Group",location:"International",status:"Unverified",field:"Computer Vision",deadline:"Check official website",description:"Example card only. Add a verified organization link before treating an opportunity as active.",url:"",tags:["OpenCV","CNN","Python"]}
];
let opportunities = JSON.parse(localStorage.getItem("internmatch_opportunities") || "null") || demoOpportunities;
let saved = JSON.parse(localStorage.getItem("internmatch_saved") || "[]");

function persist(){
  localStorage.setItem("internmatch_opportunities",JSON.stringify(opportunities));
  localStorage.setItem("internmatch_saved",JSON.stringify(saved));
}
function escapeHTML(value=""){
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function render(){
  const query=$("searchInput").value.trim().toLowerCase();
  const location=$("locationFilter").value,status=$("statusFilter").value,field=$("typeFilter").value;
  const filtered=opportunities.filter(o=>{
    const text=[o.title,o.company,o.field,...(o.tags||[])].join(" ").toLowerCase();
    return (!query||text.includes(query))&&(location==="all"||o.location===location)&&(status==="all"||o.status===status)&&(field==="all"||o.field===field);
  });
  $("opportunityGrid").innerHTML=filtered.map(o=>{
    const isSaved=saved.includes(o.id), statusClass=o.status.toLowerCase();
    const link=o.url?`<a class="card-link" href="${escapeHTML(o.url)}" target="_blank" rel="noopener noreferrer">Official website ↗</a>`:`<span class="card-link disabled">No official link added</span>`;
    return `<article class="opportunity-card">
      <div class="card-top"><div class="company-logo">${escapeHTML((o.company||"IN").slice(0,2).toUpperCase())}</div>
      <div class="card-title"><h3>${escapeHTML(o.title)}</h3><div class="company-name">${escapeHTML(o.company)}</div></div>
      <button class="save-button ${isSaved?"saved":""}" data-save="${o.id}" aria-label="${isSaved?"Unsave":"Save"} opportunity">${isSaved?"♥":"♡"}</button></div>
      <div style="margin-top:13px"><span class="status ${statusClass}">${escapeHTML(o.status)}</span></div>
      <p class="card-description">${escapeHTML(o.description||"No description added.")}</p>
      <div class="tags"><span class="tag">${escapeHTML(o.location)}</span><span class="tag">${escapeHTML(o.field)}</span>${(o.tags||[]).slice(0,2).map(t=>`<span class="tag">${escapeHTML(t)}</span>`).join("")}</div>
      <div class="card-footer"><span class="card-meta">Deadline: ${escapeHTML(o.deadline||"Not specified")}</span>${link}</div>
    </article>`;
  }).join("");
  $("emptyState").hidden=filtered.length!==0;
  $("resultsText").textContent=`Showing ${filtered.length} of ${opportunities.length} opportunities`;
  $("totalStat").textContent=opportunities.length;
  $("openStat").textContent=opportunities.filter(o=>o.status==="Open").length;
  $("savedStat").textContent=saved.length;
  $("savedCount").textContent=saved.length;
}
["searchInput","locationFilter","statusFilter","typeFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",render));
$("clearFilters").addEventListener("click",()=>{$("searchInput").value="";$("locationFilter").value="all";$("statusFilter").value="all";$("typeFilter").value="all";render();});
$("opportunityGrid").addEventListener("click",e=>{
  const btn=e.target.closest("[data-save]"); if(!btn)return;
  const id=Number(btn.dataset.save);
  saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];
  persist();render();
});
const dialog=$("opportunityDialog");
$("addOpportunityBtn").addEventListener("click",()=>dialog.showModal());
$("closeDialog").addEventListener("click",()=>dialog.close());
$("opportunityForm").addEventListener("submit",e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const url=(data.get("url")||"").trim();
  if(url && !/^https?:\/\//i.test(url)){alert("Please enter a valid http:// or https:// URL.");return;}
  opportunities.unshift({id:Date.now(),title:data.get("title").trim(),company:data.get("company").trim(),location:data.get("location"),status:data.get("status"),field:data.get("field"),deadline:data.get("deadline").trim()||"Not specified",description:"Added to your personal opportunity board. Verify details on the official organization website.",url,tags:["Added by you"]});
  persist();e.currentTarget.reset();dialog.close();render();
});
$("themeToggle").addEventListener("click",()=>{document.body.classList.toggle("dark");localStorage.setItem("internmatch_dark",document.body.classList.contains("dark")?"1":"0");});
if(localStorage.getItem("internmatch_dark")==="1")document.body.classList.add("dark");
$("todayLabel").textContent=new Intl.DateTimeFormat("en",{weekday:"short",month:"short",day:"numeric"}).format(new Date());
render();
