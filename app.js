(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const paths = {
    bookmark:'<path d="M6 4h12v17l-6-4-6 4z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="m6 6 12 12M18 6 6 18"/>',
    'arrow-right':'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3"/>',
    pen:'<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-4-4L5 15z"/>',
    work:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',
    book:'<path d="M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19"/>',
    sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'
  };
  function icon(name) { const span=document.createElement('span'); span.dataset.icon=name; span.innerHTML=`<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]||paths.sparkles}</svg>`; return span; }
  document.querySelectorAll('[data-icon]').forEach(el=>el.replaceWith(icon(el.dataset.icon)));
  const categories={写作:{name:'写作表达',icon:'pen',cls:''},工作:{name:'工作效率',icon:'work',cls:'work'},学习:{name:'学习成长',icon:'book',cls:'study'},生活:{name:'生活灵感',icon:'sun',cls:'life'}};
  const KEY='linggan-pocket-v1';
  let custom=[], favorites=new Set(), category='全部', query='', selected=null, toastTimer, detailOpener=null;
  try {
    const saved=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(Array.isArray(saved.custom)) custom=saved.custom.filter(p=>p&&typeof p.id==='string'&&p.id.startsWith('custom-')&&typeof p.title==='string'&&p.title.trim()&&p.title.length<=40&&typeof p.content==='string'&&p.content.trim()&&p.content.length<=10000&&Object.hasOwn(categories,p.category)).slice(0,100).map(p=>({...p,description:p.content.replace(/\s+/g,' ').slice(0,50),tags:['我的提示词'],custom:true}));
    const allIds=new Set([...window.POCKET_PROMPTS,...custom].map(p=>p.id));
    if(Array.isArray(saved.favorites)) favorites=new Set(saved.favorites.filter(id=>allIds.has(id)));
  } catch { $('#storage-notice').hidden=false; }
  function persist(){try{localStorage.setItem(KEY,JSON.stringify({custom,favorites:[...favorites]}));$('#storage-notice').hidden=true;return true;}catch{$('#storage-notice').hidden=false;return false;}}
  function notify(message){clearTimeout(toastTimer);const target=$('#detail-dialog').open?$('#detail-feedback'):$('#toast');target.textContent=message;target.hidden=false;if(target.id==='toast')toastTimer=setTimeout(()=>target.hidden=true,2800);}
  function focusList(index=0){const buttons=[...document.querySelectorAll('[data-save-id]')];(buttons[Math.min(Math.max(index,0),buttons.length-1)]||document.querySelector('.filter.active')||$('#reset-filter')).focus();}
  function activeCardIndex(){return [...document.querySelectorAll('.prompt-card')].indexOf(document.activeElement?.closest('.prompt-card'));}
  function all(){return [...window.POCKET_PROMPTS,...custom];}
  function tag(p){const c=categories[p.category];const el=document.createElement('span');el.className='category-tag '+c.cls;el.append(icon(c.icon),document.createTextNode(c.name));return el;}
  function makeButton(label,cls,handler){const el=document.createElement('button');el.type='button';el.className=cls;el.setAttribute('aria-label',label);el.addEventListener('click',handler);return el;}
  function syncFavoriteButtons(){document.querySelectorAll('[data-save-id]').forEach(b=>{const yes=favorites.has(b.dataset.saveId);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',(yes?'取消收藏：':'收藏：')+(all().find(p=>p.id===b.dataset.saveId)?.title||''));});$('#favorite-count').textContent=favorites.size;if(selected){$('#detail-save').setAttribute('aria-pressed',String(favorites.has(selected.id)));$('#detail-save-label').textContent=favorites.has(selected.id)?'已收藏':'收藏提示词';}}
  function toggleFavorite(p){const focusIndex=activeCardIndex();const yes=!favorites.has(p.id);if(yes)favorites.add(p.id);else favorites.delete(p.id);const saved=persist();if(category==='收藏'){render();if(!$('#detail-dialog').open)focusList(focusIndex);}else syncFavoriteButtons();notify(saved?(yes?'已收进口袋':'已取消收藏'):'本次已更新，但浏览器未能保存');}
  function openPrompt(p){detailOpener=document.activeElement;$('#detail-feedback').hidden=true;selected=p;$('#detail-title').textContent=p.title;$('#detail-description').textContent=p.description;$('#detail-content').textContent=p.content;const t=tag(p);t.id='detail-category';$('#detail-category').replaceWith(t);syncFavoriteButtons();$('#detail-dialog').showModal();$('#detail-content').scrollTop=0;}
  function card(p){const el=document.createElement('article');el.className='prompt-card';el.dataset.id=p.id;
    const top=document.createElement('div');top.className='card-top';top.append(tag(p));const save=makeButton('收藏：'+p.title,'icon-button',()=>toggleFavorite(p));save.dataset.saveId=p.id;save.append(icon('bookmark'));top.append(save);el.append(top);
    if(p.custom){const del=makeButton('删除：'+p.title,'icon-button delete-custom',()=>{if(confirm('删除这条自建提示词？删除后无法恢复。')){const focusIndex=activeCardIndex();custom=custom.filter(x=>x.id!==p.id);favorites.delete(p.id);const saved=persist();render();focusList(focusIndex);notify(saved?'已删除这条提示词':'本次已删除，但浏览器未能保存');}});del.append(icon('trash'));el.append(del);}
    const heading=document.createElement('h3');heading.className='card-title';const open=makeButton('查看：'+p.title,'',()=>openPrompt(p));open.textContent=p.title;heading.append(open);el.append(heading);
    const description=document.createElement('p');description.className='card-description';description.textContent=p.description;el.append(description);
    const bottom=document.createElement('div');bottom.className='card-bottom';const tags=document.createElement('div');tags.className='card-tags';for(const value of p.tags||[]){const item=document.createElement('span');item.textContent='# '+value;tags.append(item);}const more=makeButton('展开提示词：'+p.title,'card-open',()=>openPrompt(p));more.append(document.createTextNode('展开提示词'),icon('arrow-right'));bottom.append(tags,more);el.append(bottom);return el;
  }
  function render(){const items=all().filter(p=>(category==='全部'||(category==='收藏'?favorites.has(p.id):p.category===category))&&(!query||[p.title,p.description,p.content,...p.tags].join(' ').toLowerCase().includes(query)));
    $('#prompt-grid').replaceChildren(...items.map(card));$('#prompt-grid').hidden=!items.length;$('#empty-state').hidden=!!items.length;$('#result-count').textContent=items.length+' 条提示词';$('#prompt-total').textContent=window.POCKET_PROMPTS.length;
    $('#empty-title').textContent=category==='收藏'&&!query?'口袋里还没有收藏':'暂时没有匹配的提示词';$('#empty-text').textContent=category==='收藏'&&!query?'点击卡片右上角的收藏图标，把好用的提示词留下来。':'换个关键词，或试试其他分类。';document.querySelectorAll('.filter').forEach(b=>{const yes=b.dataset.category===category;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});syncFavoriteButtons();
  }
  document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.category;render();}));
  $('#search').addEventListener('input',e=>{query=e.target.value.trim().toLowerCase();render();});
  $('#reset-filter').addEventListener('click',()=>{category='全部';query='';$('#search').value='';render();});
  $('#nav-favorites').addEventListener('click',()=>{category='收藏';query='';$('#search').value='';render();$('#library').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>document.getElementById(b.dataset.close).close()));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const rect=d.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)d.close();}}));
  $('#detail-dialog').addEventListener('close',()=>{if(detailOpener&&!detailOpener.isConnected)focusList();});
  $('#detail-save').addEventListener('click',()=>selected&&toggleFavorite(selected));
  $('#detail-copy').addEventListener('click',async()=>{
    if(!selected)return;const text=selected.content;let done=false;try{await navigator.clipboard.writeText(text);done=true;}catch{const field=document.createElement('textarea');field.value=text;field.style.cssText='position:fixed;left:-9999px;top:0';$('#detail-dialog').append(field);field.select();try{done=document.execCommand('copy');}catch{}field.remove();}
    if(done)notify('已复制，粘贴到常用 AI 即可');else{const range=document.createRange();range.selectNodeContents($('#detail-content'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);notify('复制受限，已选中文字，可手动复制');}
  });
  $('#add-prompt').addEventListener('click',()=>{$('#form-error').textContent='';$('#add-dialog').showModal();});
  $('#add-form').addEventListener('submit',e=>{e.preventDefault();const fields=new FormData(e.target);const title=String(fields.get('title')).trim();const content=String(fields.get('content')).trim();const cat=String(fields.get('category'));
    if(!title||!content){$('#form-error').textContent='请填写标题和完整提示词。';return;}
    if(custom.length>=100){$('#form-error').textContent='当前浏览器最多保存 100 条自建提示词，请先删除不需要的内容。';return;}
    if(title.length>40||content.length>10000||!Object.hasOwn(categories,cat)){return;}
    const p={id:'custom-'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)),title,category:cat,content,description:content.replace(/\s+/g,' ').slice(0,50),tags:['我的提示词'],custom:true};custom.unshift(p);favorites.add(p.id);const saved=persist();category='收藏';query='';$('#search').value='';render();$('#add-dialog').close();e.target.reset();$('#library').scrollIntoView({behavior:'smooth'});notify(saved?'已保存到口袋':'本次已添加，但浏览器未能保存');
  });
  render();
})();
