import {makezitie} from './danci.js';
let current=null, activePage=1, busy=false, queued=null, generation=0;
const tell=(type,extra={})=>parent.postMessage({source:'copybook-renderer',type,...extra},location.origin);
window.message=(text)=>tell('error',{text:String(text)});
window.loading={obj:$('#loadingFont'),mess(text){this.obj.text(text).show()},hide(){this.obj.hide()}};
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const margins=(str)=>{const v=String(str).split('-').map(Number);return [v[0]||0,v[1]??v[0]??0,v[2]??v[0]??0,v[3]??v[1]??v[0]??0]};
const finite=(v,f=0)=>Number.isFinite(Number(v))?Number(v):f;
function showPage(n){activePage=Math.max(1,Math.min(n,document.querySelectorAll('.paper').length));document.querySelectorAll('.paper').forEach((p,i)=>p.style.display=i===activePage-1?'block':'none')}
export async function render(data){
 if(busy){queued=data;return} busy=true; current=data; const version=++generation;
 try{
 const cfg={...data.config}; const size=cfg.pagesize.split(',').map(Number),split=cfg.yzy.split(',').map(Number),pad=margins(cfg.ppd),bleed=margins(cfg.papercx);
 const w=size[0],h=size[1],cols=split[0],rows=split[1],cw=w/cols-pad[1]-pad[3],ch=h/rows-pad[0]-pad[2];
 if(![w,h,cols,rows,cw,ch].every(n=>Number.isFinite(n)&&n>0))throw Error('纸张或边距设置无效，请留出足够的书写区域。');
 document.querySelector('#geometry').textContent=`@page{size:${w+bleed[1]+bleed[3]}mm ${h+bleed[0]+bleed[2]}mm;margin:0}:root{--paper-height:${h+bleed[0]+bleed[2]}mm}html,body,.paper{width:${w+bleed[1]+bleed[3]}mm;height:${h+bleed[0]+bleed[2]}mm}.paper{padding:${bleed.join('mm ')}mm;box-sizing:border-box}.page{width:${cw}mm;height:${ch}mm;padding:${pad.join('mm ')}mm}.cont{width:${cw}mm}`;
 document.querySelector('#allpage').innerHTML='<div class="paper"><div class="page"><div class="cont" id="temp_cont"></div></div></div>';
 const font=cfg.fonttype.replace(/\.woff$/,'');
 
 document.querySelector("#copybook-fonts").textContent = `@font-face{font-family:"${font}";src:url("${new URL("../font/"+encodeURIComponent(cfg.fonttype),import.meta.url)}")}`;
 await document.fonts.load(`33px "${font}"`);
 for(const k of ['words','titlestr','headcont','footcont'])cfg[k]=esc(cfg[k]);
 for(const k of ['sysfont','secondfont'])cfg[k]=String(cfg[k]||'').replace(/[<>;{}"']/g,'');
 cfg.flogo='';cfg.yulian=0;cfg.okwords={cds:cfg.words,words:[],moreText:data.moreText||{},gconfig:{}};for(const k of ['titlestr','headcont','footcont'])if(data.moreText?.[k])cfg.okwords.gconfig[k]={style:data.moreText[k]};
 makezitie(cfg,gc=>{gc.show();if(data.config.toolbc)document.querySelectorAll('.paper').forEach(p=>{const d=document.createElement('div');d.className='ruler';d.innerHTML=gc.biaochi();p.append(d)})});
 await document.fonts.ready;
 const count=document.querySelectorAll('.paper').length;
 renderAdditions(data.additions||[]);
 showPage(data.page||activePage);
 tell('rendered',{count,page:activePage,version,width:w+bleed[1]+bleed[3],height:h+bleed[0]+bleed[2],requestId:data.requestId});
 }catch(e){tell('error',{text:e.message||String(e),requestId:data.requestId});}finally{loading.hide();busy=false;if(queued){const q=queued;queued=null;render(q)}}
}
function pageMatches(value,page){return value==='all'||value==='全部'||(value==='odd'&&page%2===1)||(value==='even'&&page%2===0)||String(value).split(/[,，]/).some(v=>{if(v.includes('-')){const [a,b]=v.split('-').map(Number);return page>=a&&page<=b}return Number(v)===page})}
function renderAdditions(additions){document.querySelectorAll('.paper').forEach((p,index)=>{for(const a of additions){if(a.type==='qr')continue;if(!pageMatches(a.page,index+1))continue;const el=document.createElement('div');el.className='addition';el.dataset.id=a.id;el.dataset.locked=String(!!a.locked);Object.assign(el.style,{left:a.x+'mm',top:a.y+'mm',width:a.width+'mm',height:a.height+'mm',fontSize:a.size+'px',color:a.color,opacity:String(a.opacity/100),transform:`rotate(${a.rotation}deg)`,zIndex:a.behind?'1':'600',whiteSpace:'pre-wrap'});
 if(a.type==='text')el.textContent=a.text.replaceAll('#页码#',String(index+1));
 if(a.type==='image'&&/^data:image\/(png|jpeg|webp|gif);base64,/.test(a.src||'')){const img=new Image();img.src=a.src;img.draggable=false;img.style.objectFit='fill';el.append(img)}
 if(a.type==='grid'){const step=Math.max(2,a.size),lines=[];for(let y=0;y<=a.height;y+=step){lines.push(`<path d="M0 ${y}H${a.width}"/>`);if(a.grid==='english')for(let j=1;j<3;j++)lines.push(`<path d="M0 ${y+step*j/3}H${a.width}" stroke-dasharray="1 1"/>`)}if(a.grid!=='english')for(let x=0;x<=a.width;x+=step)lines.push(`<path d="M${x} 0V${a.height}"/>`);el.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a.width} ${a.height}" preserveAspectRatio="none"><g fill="none" stroke="${esc(a.color)}" stroke-width="0.25">${lines.join('')}</g></svg>`}
 if(a.type==='qr'){const q=document.createElement('div');$(q).qrcode({width:256,height:256,text:unescape(encodeURIComponent(a.text)),foreground:a.color,correctLevel:1});const c=q.querySelector('canvas');if(c){const img=new Image();img.src=c.toDataURL();el.append(img)}}
 p.append(el);}})}
let drag=null;
document.addEventListener('pointerdown',e=>{const el=e.target.closest('.addition');if(!el)return;const a=current.additions.find(a=>a.id===el.dataset.id);if(a.locked)return;el.setPointerCapture(e.pointerId);drag={el,a,x:e.clientX,y:e.clientY,moved:false}});
document.addEventListener('pointermove',e=>{if(!drag)return;const dx=(e.clientX-drag.x)*25.4/96,dy=(e.clientY-drag.y)*25.4/96;if(Math.abs(dx)+Math.abs(dy)>1)drag.moved=true;drag.el.style.left=drag.a.x+dx+'mm';drag.el.style.top=drag.a.y+dy+'mm'});
document.addEventListener('pointerup',()=>{if(!drag)return;const d=drag;drag=null;if(d.moved)tell('move',{id:d.a.id,x:parseFloat(d.el.style.left),y:parseFloat(d.el.style.top)});else tell('edit-addition',{id:d.a.id})});
document.addEventListener('click',e=>{if(e.target.closest('.addition'))return;const el=e.target.closest('[class*="moretext-"],.titlestr,.headcont,.footcont');if(el){const cls=[...el.classList].find(c=>c.startsWith('moretext-'))||el.classList[0];tell('edit-style',{key:cls})}});
window.addEventListener('message',async e=>{if(e.origin!==location.origin||e.source!==parent||e.data?.source!=='copybook-editor')return;const d=e.data;if(d.type==='render')render(d);if(d.type==='page')showPage(d.page);if(d.type==='print'){await document.fonts.ready;window.focus();window.print()}if(d.type==='export-html'){await exportHtml()}});
tell('ready');

async function exportHtml(){
 try{await document.fonts.ready;const clone=document.documentElement.cloneNode(true);clone.querySelectorAll('script,meta[http-equiv],#loadingFont,#copybook-fonts').forEach(e=>e.remove());clone.querySelectorAll('.paper').forEach(e=>e.style.display='block');
 const css=await (await fetch(new URL('./paper.css',import.meta.url))).text();const style=document.createElement('style');style.textContent=css.replace(/@font-face\{[^}]+\}/g,'')+'html,body{width:auto!important;height:auto!important;overflow:visible!important}';clone.querySelector('link[rel="stylesheet"]').replaceWith(style);
 const names=[current.config.fonttype,'HwyPinyin.woff'];let fontCss='';for(const name of names){const blob=await (await fetch(new URL('../font/'+encodeURIComponent(name),import.meta.url))).blob();const url=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob)});fontCss+=`@font-face{font-family:"${name==='HwyPinyin.woff'?'hy-py':name.replace('.woff','')}";src:url("${url}")}`}
 const fs=document.createElement('style');fs.textContent=fontCss;clone.querySelector('head').append(fs);tell('html',{html:'<!doctype html>'+clone.outerHTML});}catch(e){tell('error',{text:'打印文件导出失败：'+e.message})}
}
