(() => {
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 document.querySelectorAll("[data-tile]").forEach(el=>{el.classList.add("tile-placeholder")});
 const toggle=document.querySelector(".menu-toggle"),nav=document.querySelector("#site-nav");
 if(toggle&&nav){toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));nav.classList.toggle("open",!open)});nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{toggle.setAttribute("aria-expanded","false");nav.classList.remove("open")}))}
 const reveals=document.querySelectorAll(".reveal");
 if("IntersectionObserver"in window&&!reduced){const observer=new IntersectionObserver((entries,o)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");o.unobserve(e.target)}}),{threshold:.12});reveals.forEach(el=>observer.observe(el))}else reveals.forEach(el=>el.classList.add("is-visible"));
 const hero=document.querySelector(".hero"),person=document.querySelector("[data-tilt]");
 if(hero&&person&&!reduced&&matchMedia("(hover:hover) and (pointer:fine)").matches){hero.addEventListener("pointermove",e=>{const r=person.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/r.width,y=(e.clientY-(r.top+r.height/2))/r.height;person.style.transform=`translateX(-50%) rotateY(${x*5}deg) rotateX(${-y*4}deg)`},{passive:true});hero.addEventListener("pointerleave",()=>person.style.transform="translateX(-50%) rotateY(0deg) rotateX(0deg)")}
 document.querySelectorAll("[data-float]").forEach((el,i)=>{if(!reduced)el.style.animationDelay=`${i*-1.8}s`});
 const glow=document.querySelector(".cursor-glow");if(glow&&matchMedia("(hover:hover) and (pointer:fine)").matches){window.addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px";document.body.classList.add("pointer-active")},{passive:true});document.addEventListener("pointerleave",()=>document.body.classList.remove("pointer-active"))}
 const canvas=document.querySelector("#particles"),ctx=canvas?.getContext("2d");if(!canvas||!ctx||reduced)return;
 let w=0,h=0,particles=[],frame=0;const count=innerWidth<700?24:48;
 function resize(){const dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);particles=Array.from({length:count},()=>({x:Math.random()*w,y:Math.random()*h,r:.4+Math.random(),s:.08+Math.random()*.2,d:(Math.random()-.5)*.15,a:.12+Math.random()*.28}))}
 function draw(){ctx.clearRect(0,0,w,h);particles.forEach(p=>{p.y-=p.s;p.x+=p.d;if(p.y<-5){p.y=h+5;p.x=Math.random()*w}if(p.x<-5)p.x=w+5;if(p.x>w+5)p.x=-5;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(190,174,255,${p.a})`;ctx.fill()});frame=requestAnimationFrame(draw)}
 resize();draw();window.addEventListener("resize",resize,{passive:true});document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelAnimationFrame(frame);else if(!reduced)draw()});
})();