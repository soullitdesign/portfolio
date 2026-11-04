(() => {
 const grid=document.querySelector("#collection-grid");if(!grid)return;
 const items=Array.isArray(window.collectionItems)?window.collectionItems:[];
 const lightbox=document.querySelector(".lightbox"),preview=lightbox?.querySelector(".lightbox-image"),closeButton=lightbox?.querySelector("button");
 const filters=document.querySelectorAll("[data-filter]");
 const setTile=(el,n)=>{el.style.backgroundImage="radial-gradient(ellipse at 50% 35%,rgba(134,103,255,.22),transparent 58%),linear-gradient(145deg,#191722,#0b0b10)";};
 items.forEach((item,i)=>{
  const card=document.createElement("article");card.className="collection-card reveal";card.dataset.category=item.category||"All";
  const art=document.createElement("div");art.className="collection-card-image";art.setAttribute("role","img");art.setAttribute("aria-label",item.title||"Portfolio artwork");setTile(art,Number(item.tile));
  const info=document.createElement("div");info.className="collection-meta";
  const type=document.createElement("small"),title=document.createElement("h2");type.textContent=`${String(i+1).padStart(2,"0")} / ${item.type||"PROJECT"}`;title.textContent=item.title||"Untitled";info.append(type,title);card.append(art,info);grid.append(card);
  card.addEventListener("click",()=>{if(preview){setTile(preview,Number(item.tile));preview.setAttribute("aria-label",item.title||"Artwork preview");lightbox.classList.add("open");document.body.style.overflow="hidden"}});
 });
 const filterCards=(category)=>{grid.querySelectorAll(".collection-card").forEach(card=>{card.hidden=category!=="All"&&card.dataset.category!==category});filters.forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.filter===category)))};
 filters.forEach(button=>button.addEventListener("click",()=>filterCards(button.dataset.filter||"All")));filterCards("All");
 const close=()=>{lightbox?.classList.remove("open");document.body.style.overflow=""};closeButton?.addEventListener("click",close);lightbox?.addEventListener("click",e=>{if(e.target===lightbox)close()});document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});
 if("IntersectionObserver"in window){const observer=new IntersectionObserver((entries,o)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");o.unobserve(e.target)}}),{threshold:.08});grid.querySelectorAll(".reveal").forEach(el=>observer.observe(el))}else grid.querySelectorAll(".reveal").forEach(el=>el.classList.add("is-visible"));
})();