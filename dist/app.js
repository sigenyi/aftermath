import {catalog, resolveRole, buildReport, MODEL_VERSION} from './engine.js';
import {searchOccupations, hasExactOccupation} from './search.js';

const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const input = $('#job-input');
const form = $('#scan-form');
const suggestions = $('#suggestions');
const dialog = $('#analysis-dialog');
const scenarioLabels = {accelerated:'Faster',central:'Baseline',conservative:'Slower'};
const breakthroughs = {
  intelligence:{name:'AI reasoning',copy:'Plan, make decisions, and solve unfamiliar problems independently.'},
  dexterity:{name:'Robotic hands',copy:'Handle delicate, unpredictable physical work with precision.'},
  navigation:{name:'Real-world awareness',copy:'Understand changing surroundings and move safely through them.'},
  social:{name:'Social understanding',copy:'Read intent, communicate clearly, and navigate difficult interactions.'},
  reliability:{name:'Dependable machines',copy:'Catch mistakes and recover safely, even when the stakes are high.'},
  unclassified:{name:'Requirements still unknown',copy:'This work needs a closer look. Its necessary technologies have not been mapped yet.'}
};
let matches = [], activeSuggestion = -1, state = null, report = null, activeTab = 'breakthroughs', taskSerial = 0, detailsOpen = false, ignoreFocus = false, toastTimer;

function closeSuggestions() {
  suggestions.hidden = true;
  input.setAttribute('aria-expanded','false');
  input.removeAttribute('aria-activedescendant');
  activeSuggestion = -1;
}
function renderSuggestions() {
  const query=input.value.trim();
  const exact=hasExactOccupation(query);
  const roles=searchOccupations(query,query && !exact ? 5 : 6);
  matches=roles.map(role=>({role}));
  if(query && !exact) matches.push({custom:query});
  activeSuggestion=-1;
  suggestions.innerHTML=matches.map((match,i)=>`<div id="job-option-${i}" class="suggestion${match.custom?' suggestion-custom':''}" role="option" aria-selected="false" data-suggestion="${i}"><span class="suggestion-copy"><span class="suggestion-title">${match.role?esc(match.role.title):`Explore “${esc(match.custom)}”`}</span><span class="suggestion-subtitle">${match.role?esc(match.role.sector):'Add your own tasks'}</span></span><span class="suggestion-arrow" aria-hidden="true">↗</span></div>`).join('');
  suggestions.hidden=!matches.length;
  const rect=form.getBoundingClientRect();
  const viewport=window.visualViewport;
  const bottom=viewport?viewport.height+viewport.offsetTop:window.innerHeight;
  const below=bottom-rect.bottom-18, above=rect.top-(viewport?.offsetTop||0)-18;
  const desiredHeight=Math.min(340,matches.length*61+14);
  const opensUp=below<Math.min(260,desiredHeight)&&above>below;
  suggestions.classList.toggle('opens-up',opensUp);
  suggestions.style.maxHeight=`${Math.max(110,Math.min(340,opensUp?above:below))}px`; 
  input.setAttribute('aria-expanded',String(!!matches.length));
  input.removeAttribute('aria-activedescendant');
  $('#search-status').textContent=query ? `${roles.length} matching ${roles.length===1?'occupation':'occupations'}${!exact?'. You can also add your own job.':'.'}` : 'Popular occupations. Use the arrow keys to choose.';
}
function highlightSuggestion(index) {
  if(!matches.length) return;
  activeSuggestion=(index+matches.length)%matches.length;
  suggestions.querySelectorAll('[data-suggestion]').forEach((el,i)=>{
    const selected=i===activeSuggestion;
    el.classList.toggle('is-active',selected);
    el.setAttribute('aria-selected',String(selected));
    if(selected) el.scrollIntoView({block:'nearest'});
  });
  input.setAttribute('aria-activedescendant',`job-option-${activeSuggestion}`);
}
function chooseSuggestion(index) {
  const selected=matches[index];
  if(!selected) return;
  const title=selected.role?.title || selected.custom;
  input.value=title;
  closeSuggestions();
  begin(title,selected.role);
}
function begin(query, chosenRole) {
  input.setCustomValidity('');
  const resolved=resolveRole(query);
  const role=chosenRole || (resolved.confidence==='Title match' ? resolved.role : null);
  state={title:role?.title || query.trim(),tasks:role?role.tasks.map(task=>({...task})):[],location:'United States',scenario:'central',matched:!!role};
  activeTab='breakthroughs';detailsOpen=false;
  closeSuggestions();
  if(role){updateReport();renderReport();} else renderEditor();
  if(!dialog.open) dialog.showModal();
  dialog.scrollTop=0;
  $('#dialog-title').focus({preventScroll:true});
}
function updateReport(){report=buildReport(state);}

function editorRows() {
  return state.tasks.map((task,i)=>`<div class="task-edit-row"><span aria-hidden="true">${String(i+1).padStart(2,'0')}</span><input aria-label="Task ${i+1}" data-task-index="${i}" value="${esc(task.label)}" maxlength="500"><button type="button" data-remove="${i}" aria-label="Remove task ${i+1}">×</button></div>`).join('');
}
function renderEditor() {
  $('#dialog-content').innerHTML=`<p class="report-kicker">${state.matched?'Make it your job':'Tell us what you do'}</p><h2 id="dialog-title" class="dialog-title" tabindex="-1">${esc(state.title)}</h2><p class="dialog-description">${state.matched?'Keep the tasks that fit. Add anything missing.':'Add a few day-to-day tasks to explore a rough automation timeline.'}</p><div class="task-edit-list">${editorRows()}</div><form id="add-task-form" class="add-task-form"><input id="new-task" aria-label="New task" placeholder="Add a task you do…" maxlength="500" required><button type="submit" aria-label="Add task">Add <span aria-hidden="true">+</span></button></form><p id="editor-error" class="editor-error" role="status"></p><div class="dialog-actions"><span>New or edited tasks use a broad estimate.</span><button type="button" id="generate-report" class="primary-button">See my timeline <span aria-hidden="true">↗</span></button></div>`;
  $('#add-task-form').addEventListener('submit',event=>{
    event.preventDefault();const label=$('#new-task').value.trim();
    if(!label) return;
    if(state.tasks.length>=30){$('#editor-error').textContent='Use up to 30 tasks. Combine similar activities to make room.';return;}
    if(state.tasks.some(t=>t.label.trim().toLocaleLowerCase()===label.toLocaleLowerCase())){$('#editor-error').textContent='That task is already in your list.';return;}
    state.tasks.push({id:`added-${++taskSerial}`,label});renderEditor();$('#new-task').focus();
  });
  $('#generate-report').addEventListener('click',()=>{
    state.tasks=state.tasks.filter(task=>task.label.trim());
    if(!state.tasks.length){$('#editor-error').textContent='Add at least one task to continue.';$('#new-task').focus();return;}
    updateReport();renderReport();dialog.scrollTop=0;$('#dialog-title').focus({preventScroll:true});
  });
}
function renderReport() {
  const r=report,f=r.fullAutomation;
  const unknown=r.frontiers.some(front=>front.id==='unclassified');
  $('#dialog-content').innerHTML=`<p class="report-kicker">Your automation outlook</p><div class="report-title-row"><div><h2 id="dialog-title" class="dialog-title" tabindex="-1">${esc(r.title)}</h2><p class="report-meta">${r.tasks.length} ${r.tasks.length===1?'task':'tasks'} · ${unknown?'Requirements partly unknown':`${r.frontiers.length} ${r.frontiers.length===1?'technology':'technologies'} needed`}</p></div><button type="button" class="quiet-button" id="edit-tasks">Edit tasks <span aria-hidden="true">↗</span></button></div><section class="report-summary" aria-label="Estimated full automation"><p class="report-kicker">Estimated full automation</p><div class="report-years">${esc(f.label)}</div><p class="report-disclaimer">${unknown?'A broad starting assumption. Your custom work has not been researched.':'A speculative scenario, not a proven prediction.'}</p></section><div class="scenario-switch" role="group" aria-label="Pace of development">${['accelerated','central','conservative'].map(key=>`<button type="button" class="scenario-pill${key===state.scenario?' selected':''}" data-scenario="${key}" aria-pressed="${key===state.scenario}">${scenarioLabels[key]}</button>`).join('')}</div><div class="report-tabs" role="tablist" aria-label="Explore your result">${[['breakthroughs','What needs to happen'],['tasks','The tasks']].map(([key,label])=>`<button type="button" role="tab" id="tab-${key}" aria-controls="report-panel" aria-selected="${activeTab===key}" tabindex="${activeTab===key?0:-1}" data-tab="${key}">${label}</button>`).join('')}</div><section id="report-panel" class="tab-panel" role="tabpanel" aria-labelledby="tab-${activeTab}" tabindex="0"></section><details class="report-details" ${detailsOpen?'open':''}><summary>Sources & assumptions <span aria-hidden="true">+</span></summary><div class="report-detail-copy"><p>These dates come from a simple scenario model. They describe complete automation of the listed tasks, assuming the necessary discoveries happen. They do not predict a personal layoff or when every employer will adopt the technology.</p><p>${unknown?'Custom tasks start with a generic 20–100+ year range. Their specific requirements are still unknown. ':''}The baseline allows 5–15 additional years to connect the technologies into a working system. Faster and slower scenarios multiply the starting ranges by 0.55 and 1.75.</p><p>Affordable operation, suitable hardware, and permission to deploy are assumed. Task references are U.S.-based; this version has no live research feed.</p><p>These sources describe occupations or research context. <strong>They do not validate the dates.</strong></p>${r.sources.map(source=>`<a class="report-source" href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(source.title)} <span aria-hidden="true">↗</span></span><small>${esc(source.publisher)} · ${esc(source.date)}</small></a>`).join('')}<p class="model-version">Model ${esc(MODEL_VERSION)}</p></div></details><div class="report-foot"><span>Your search stays in this browser.</span><button type="button" id="download-report" class="quiet-button">Save report <span aria-hidden="true">↓</span></button></div>`;
  renderPanel();
  $('#edit-tasks').addEventListener('click',()=>{renderEditor();dialog.scrollTop=0;$('#dialog-title').focus({preventScroll:true});});
  $('#download-report').addEventListener('click',downloadReport);
  $('.report-details').addEventListener('toggle',event=>{detailsOpen=event.target.open;});
}
function renderPanel() {
  const r=report,f=r.fullAutomation;
  if(activeTab==='breakthroughs') {
    const unknown=r.frontiers.some(front=>front.id==='unclassified');
    const description=unknown?'Some requirements still need to be identified. A custom job may need one breakthrough or several.':r.frontiers.length===1?'One area of progress drives this timeline. Every listed task must become autonomous.':`${r.frontiers.length} technologies need to come together. Full automation waits for the slowest one.`;
    const max=Math.max(...r.frontiers.map(front=>front.yearsMax));
    $('#report-panel').innerHTML=`<p class="panel-intro">${description}</p>${r.frontiers.map(front=>{const text=breakthroughs[front.id];const slowest=front.id!=='unclassified'&&f.bottleneckIds.includes(front.id);return `<article class="breakthrough"><div class="breakthrough-heading"><h3>${esc(text.name)}${slowest && r.frontiers.length>1?'<span class="breakthrough-note">Sets the pace</span>':''}</h3><span class="breakthrough-range">${front.yearsMin}–${front.yearsMax}${front.openEnded?'+':''} years</span></div><p>${esc(text.copy)}</p><div class="breakthrough-track" aria-hidden="true"><span style="width:${Math.max(4,front.yearsMax/max*100)}%"></span></div></article>`;}).join('')}<p class="integration-note">Then allow ${f.integrationYears.min}–${f.integrationYears.max} years to make everything work together.</p>`;
  } else {
    $('#report-panel').innerHTML=`<p class="panel-intro">Every one of these tasks needs to run independently. The dates below cover capability, before the systems are connected.</p>${r.tasks.map(task=>`<article class="report-task"><header><h3>${esc(task.label)}</h3><span>${esc(task.automationWindow.label)}</span></header><p>${esc(task.requirements)}</p></article>`).join('')}`;
  }
}
function downloadReport() {
  const r=report;
  const contents=[`AFTERMATH — ${r.title}`,`Estimated full automation: ${r.fullAutomation.label}`,`Scenario: ${scenarioLabels[r.scenario]}`,`Generated: ${r.generatedAt}`,`Speculative scenario, not a proven prediction.`,``,`WHAT NEEDS TO HAPPEN`,...r.frontiers.map(front=>`${breakthroughs[front.id].name}: ${front.yearsMin}–${front.yearsMax}${front.openEnded?'+':''} years\n${breakthroughs[front.id].copy}`),`Then allow ${r.fullAutomation.integrationYears.min}–${r.fullAutomation.integrationYears.max} years to connect the systems.`,``,`TASKS`,...r.tasks.map(task=>`${task.label}: ${task.automationWindow.label}\n${task.requirements}`),``,`ASSUMPTIONS`,...r.assumptions,...r.deploymentAssumptions,``,`LIMITS`,...r.limits,``,`SOURCES — describe the work, not the estimated dates`,...r.sources.map(source=>`${source.title}\n${source.publisher} · ${source.date}\n${source.url}\n${source.note}`),``,`Model ${MODEL_VERSION}`].join('\n');
  const url=URL.createObjectURL(new Blob([contents],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`aftermath-${r.title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').slice(0,60)||'report'}.txt`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  clearTimeout(toastTimer);$('#toast').textContent='Report saved.';$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;},3000);
}

input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-controls','suggestions');input.setAttribute('aria-expanded','false');input.autocomplete='off';
suggestions.setAttribute('role','listbox');suggestions.setAttribute('aria-label','Available occupations');
input.addEventListener('focus',()=>{if(ignoreFocus){ignoreFocus=false;return;}renderSuggestions();});
input.addEventListener('input',()=>{input.setCustomValidity('');renderSuggestions();});
input.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();if(suggestions.hidden)renderSuggestions();highlightSuggestion(event.key==='ArrowDown'?activeSuggestion+1:(activeSuggestion<0?matches.length-1:activeSuggestion-1));
  } else if(event.key==='Escape'){event.preventDefault();closeSuggestions();}
  else if(event.key==='Enter'&&!suggestions.hidden&&activeSuggestion>=0){event.preventDefault();chooseSuggestion(activeSuggestion);}
  else if(event.key==='Tab')closeSuggestions();
});
form.addEventListener('submit',event=>{
  event.preventDefault();const query=input.value.trim();
  if(!query){input.setCustomValidity('Enter your job title.');input.reportValidity();return;}
  if(!suggestions.hidden&&activeSuggestion>=0)chooseSuggestion(activeSuggestion);else begin(query);
});
suggestions.addEventListener('pointerdown',event=>{if(event.target.closest('[data-suggestion]'))event.preventDefault();});
suggestions.addEventListener('click',event=>{const item=event.target.closest('[data-suggestion]');if(item)chooseSuggestion(Number(item.dataset.suggestion));});
document.addEventListener('pointerdown',event=>{if(!form.contains(event.target))closeSuggestions();});
$('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{ignoreFocus=true;input.focus({preventScroll:true});closeSuggestions();});
$('#about-button')?.addEventListener('click',()=>$('#about-dialog').showModal());
$('#close-about')?.addEventListener('click',()=>$('#about-dialog').close());
document.addEventListener('click',event=>{
  const example=event.target.closest('[data-role]');if(example){const role=catalog.find(item=>item.id===example.dataset.role);if(role){input.value=role.title;begin(role.title,role);}return;}
  const remove=event.target.closest('[data-remove]');if(remove){const i=Number(remove.dataset.remove);state.tasks.splice(i,1);renderEditor();const next=document.querySelector(`[data-task-index="${Math.min(i,state.tasks.length-1)}"]`);(next||$('#new-task')).focus();return;}
  const selectedTab=event.target.closest('[data-tab]');if(selectedTab){activeTab=selectedTab.dataset.tab;document.querySelectorAll('[data-tab]').forEach(button=>{const selected=button===selectedTab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});$('#report-panel').setAttribute('aria-labelledby',selectedTab.id);renderPanel();return;}
  const scenario=event.target.closest('[data-scenario]');if(scenario){const position=dialog.scrollTop;state.scenario=scenario.dataset.scenario;updateReport();renderReport();dialog.scrollTop=position;document.querySelector(`[data-scenario="${state.scenario}"]`).focus({preventScroll:true});}
});
document.addEventListener('input',event=>{if(event.target.matches('[data-task-index]'))state.tasks[Number(event.target.dataset.taskIndex)].label=event.target.value;});
document.addEventListener('keydown',event=>{
  if(!event.target.matches('[role="tab"]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();const tabs=[...document.querySelectorAll('[role="tab"]')];let index=tabs.indexOf(event.target);index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[index].click();tabs[index].focus();
});
closeSuggestions();
