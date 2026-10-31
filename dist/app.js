import {catalog, resolveRole, buildReport, scenarios, frontierDefinitions, MODEL_VERSION} from './engine.js';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {software:'⌘',support:'◉',accounting:'▤',nursing:'✚',electrical:'ϟ',design:'◇',teaching:'▧',driving:'▰',legal:'§',culinary:'♨',marketing:'↗','data-entry':'▦'};
const physical = new Set(['nursing','electrical','teaching','driving','culinary']);
let filter = 'all', expanded = false, state = null, currentReport = null, activeTab = 'frontiers', taskSerial = 0;
const dialog = $('#analysis-dialog');
function renderIndex() {
  const roles = catalog.filter(r => filter === 'all' || (filter === 'physical' ? physical.has(r.id) : !physical.has(r.id)));
  const visible = expanded ? roles : roles.slice(0, 4);
  $('#role-count').textContent = `${String(roles.length).padStart(2,'0')} OCCUPATIONS IN RANGE`;
  $('#occupation-grid').innerHTML = visible.map(r => {
    const fronts = new Set(r.tasks.flatMap(t => t.frontierIds));
    return `<button class="occupation-card" data-role="${r.id}" aria-label="Analyze ${esc(r.title)}"><span class="card-icon" aria-hidden="true">${icons[r.id]}</span><span class="card-arrow">↗</span><h3>${esc(r.title)}</h3><p>${esc(r.sector.toUpperCase())}</p><div class="card-bottom"><span>${r.tasks.length} TASKS MAPPED</span><span>${fronts.size} TECH ${fronts.size === 1 ? 'FRONT' : 'FRONTS'}</span></div></button>`;
  }).join('');
  $('#more-roles').hidden = roles.length <= 4;
  $('#more-roles').innerHTML = expanded ? 'SHOW FEWER OCCUPATIONS <span>↑</span>' : `VIEW ALL ${roles.length} OCCUPATIONS <span>↓</span>`;
}
function begin(input) {
  const resolved = resolveRole(input);
  state = {title:resolved.role?.title || input.trim(), tasks:resolved.role ? resolved.role.tasks.map(t => ({...t})) : [], location:'United States', scenario:'central', message:resolved.message, matched:resolved.matched};
  activeTab = 'frontiers'; currentReport = null;
  renderEditor();
  if(!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
}
function editorRows() {
  return state.tasks.map((t,i) => `<div class="task-edit-row"><span>${String(i+1).padStart(2,'0')}</span><input aria-label="Task ${i+1}" data-task-index="${i}" value="${esc(t.label)}" maxlength="500"><button type="button" data-remove="${i}" aria-label="Remove task ${i+1}">−</button></div>`).join('');
}
function renderEditor() {
  $('#dialog-content').innerHTML = `<div class="step-label">01 / DEFINE THE TARGET</div><h2 id="dialog-title" class="dialog-title">${esc(state.title)}</h2><p class="dialog-description">${esc(state.message)} The horizon covers every task listed below. Add missing responsibilities or remove tasks you don’t do.</p><div class="context-row"><label for="location">REFERENCE LOCATION</label><select id="location"><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>Other / global</option></select></div><div class="task-edit-list">${editorRows()}</div><form id="add-task-form" class="add-task-form"><input id="new-task" aria-label="New task" placeholder="Add a task, e.g. repair wiring in occupied buildings" maxlength="500" required><button type="submit">+ ADD TASK</button></form><div id="editor-error" class="error" role="status"></div><div class="dialog-actions"><span>KNOWN TASKS → MAPPED TECHNOLOGY FRONTS<br>CUSTOM TASKS → BROAD, GENERIC SCENARIO</span><button id="generate-report" class="primary-button">CALCULATE FULL AUTOMATION <span>↗</span></button></div>`;
  $('#location').value = state.location;
  $('#location').addEventListener('change', e => state.location = e.target.value);
  $('#add-task-form').addEventListener('submit', e => {
    e.preventDefault(); const label = $('#new-task').value.trim();
    if(!label) return;
    if(state.tasks.length >= 30) { $('#editor-error').textContent='Keep this analysis to 30 tasks. Combine related activities to continue.'; return; }
    if(state.tasks.some(t => t.label.toLowerCase() === label.toLowerCase())) { $('#editor-error').textContent='That task is already listed.'; return; }
    state.tasks.push({id:`added-${++taskSerial}`,label}); renderEditor(); $('#new-task').focus();
  });
  $('#generate-report').addEventListener('click', () => {
    state.tasks = state.tasks.filter(t => t.label.trim());
    if(!state.tasks.length) { $('#editor-error').textContent='Add at least one task so the complete workflow has a defined scope.'; $('#new-task').focus(); return; }
    updateReport(); renderReport(); dialog.scrollTop=0;
  });
}
function updateReport(){currentReport = buildReport(state);}
function renderReport() {
  const r = currentReport, f = r.fullAutomation;
  const unmapped = r.frontiers.some(x => x.id === 'unclassified');
  $('#dialog-content').innerHTML = `<div class="step-label">02 / FULL AUTOMATION FORECAST</div><div class="report-heading"><div><h2 id="dialog-title" class="dialog-title">${esc(r.title)}</h2><p class="report-topline">${esc(r.location)} · ${r.tasks.length} ${r.tasks.length===1?'TASK':'TASKS'} · ${unmapped?'FRONTS NOT FULLY MAPPED':`${r.frontiers.length} TECHNOLOGY ${r.frontiers.length===1?'FRONT':'FRONTS'}`} </p></div><button class="outline-button" id="edit-tasks">EDIT TASKS <span>↶</span></button></div><section class="report-summary" aria-label="Full automation horizon"><div class="report-summary-header"><span>FULL AUTOMATION HORIZON</span><span>${esc(r.scenarioLabel.toUpperCase())} SCENARIO</span></div><div class="report-years">${esc(f.label)}</div><p>${esc(f.durationLabel)} from ${r.assessmentYear} · ${esc(r.confidence)}</p><div class="report-tags"><span>${r.tasks.length===1?'1 SELECTED TASK':`ALL ${r.tasks.length} SELECTED TASKS`}</span><span>${unmapped?'GENERIC / UNMAPPED REQUIREMENTS':r.frontiers.length === 1 ? 'SINGLE-FRONT PATH' : 'MULTI-FRONT CONVERGENCE'}</span><span>END-TO-END AUTONOMY</span></div><p>Full automation of this task profile—not a date for universal adoption. The model assumes the required discoveries eventually happen.</p></section><div class="report-tabs" role="tablist" aria-label="Report sections">${[['frontiers','Technology fronts'],['tasks','Task breakdown'],['scenarios','Scenarios'],['evidence','Evidence & limits']].map(([key,label])=>`<button role="tab" id="tab-${key}" aria-controls="report-panel" aria-selected="${activeTab===key}" tabindex="${activeTab===key?0:-1}" data-tab="${key}">${label}</button>`).join('')}</div><section id="report-panel" class="tab-panel" role="tabpanel" aria-labelledby="tab-${activeTab}" tabindex="0"></section><div class="report-foot"><span>MODEL ${esc(MODEL_VERSION)} / SPECULATIVE SCENARIO<br>NO INPUT SAVED TO A SERVER</span><button id="download-report" class="outline-button">DOWNLOAD REPORT <span>↓</span></button></div>`;
  renderPanel();
  $('#edit-tasks').addEventListener('click', () => {renderEditor();dialog.scrollTop=0;});
  $('#download-report').addEventListener('click', downloadReport);
}
function renderPanel() {
  const r=currentReport, f=r.fullAutomation;
  if(activeTab==='frontiers') {
    const max=Math.max(120,...r.frontiers.map(x=>x.yearsMax));
    $('#report-panel').innerHTML=`<p class="panel-intro">${r.frontiers.some(x=>x.id==='unclassified')?'Some requirements are not yet mapped. The generic range is a placeholder assumption, not evidence that this work needs only one discovery front.':r.frontiers.length===1?'This task profile depends on one technology front.':'These discoveries can advance in parallel. Full automation requires all of them to converge.'} The slowest required frontier sets the technical horizon; system integration comes after it.</p>${r.frontiers.map(x=>`<article class="frontier-card"><div class="frontier-card-top"><h3>${esc(x.label)}${x.id!=='unclassified'&&f.bottleneckIds.includes(x.id)?'<span class="bottleneck-label">CRITICAL FRONTIER</span>':''}</h3><strong>${x.yearsMin}–${x.yearsMax}${x.openEnded?'+':''} YEARS</strong></div><p>${esc(x.requirements)}</p><div class="horizon-track" aria-hidden="true"><span style="width:${Math.max(2,x.yearsMax/max*100)}%"></span></div></article>`).join('')}<div class="integration-note">${esc(f.basis)}<br>All ranges are authored assumptions. They are not measured discovery dates.</div>`;
  } else if(activeTab==='tasks') {
    $('#report-panel').innerHTML=`<p class="panel-intro">What must become autonomous for every selected task to be automated. These task windows describe technical capability before the separate workflow integration buffer.</p>${r.tasks.map((t,i)=>`<article class="report-task"><header><h3>${String(i+1).padStart(2,'0')} / ${esc(t.label)}</h3><span>${esc(t.automationWindow.label)}</span></header><p>${esc(t.requirements)}</p><div class="frontier-chips">${t.frontierIds.map(id=>`<span>${esc(frontierDefinitions[id].label)}</span>`).join('')}</div><p>${esc(t.automationWindow.basis)}</p></article>`).join('')}`;
  } else if(activeTab==='scenarios') {
    $('#report-panel').innerHTML=`<p class="panel-intro">Change the pace of discoveries and integration. These are three hypothetical paths to the same endpoint: complete automation of the selected workflow.</p><div class="scenario-options">${['accelerated','central','conservative'].map(key=>{const estimate=buildReport({...state,scenario:key});return `<button class="scenario-card ${key===state.scenario?'selected':''}" data-scenario="${key}" aria-pressed="${key===state.scenario}"><h3>${esc(scenarios[key].label.toUpperCase())}${key===state.scenario?' / ACTIVE':''}</h3><strong>${esc(estimate.fullAutomation.label)}</strong><p>${esc(scenarios[key].description)}</p></button>`;}).join('')}</div><h3 style="font-size:13px;margin-top:25px">Assumptions behind this scenario</h3><ul class="assumption-list">${r.assumptions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul><h3 style="font-size:13px">Deployment conditions, separate from discoveries</h3><ul class="assumption-list">${r.deploymentAssumptions.map(a=>`<li>${esc(a)}</li>`).join('')}</ul>`;
  } else {
    $('#report-panel').innerHTML=`<p class="panel-intro">The occupation references ground the task descriptions. <strong>They do not supply or validate the automation dates.</strong> Technology horizons and scenario multipliers are transparent modeling assumptions in this prototype.</p>${r.sources.map(s=>`<a class="evidence-card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><h3>${esc(s.title)} <span>↗</span></h3><small>${esc(s.publisher)} · ${esc(s.date)}</small><p>${esc(s.note)}</p></a>`).join('')}<h3 style="font-size:13px;margin-top:25px">Model boundaries</h3><ul class="assumption-list">${r.limits.map(l=>`<li>${esc(l)}</li>`).join('')}<li>Non-U.S. locations do not currently adjust the model; the starter task references are U.S.-based.</li><li>Custom or edited tasks use a generic discovery front and an open-ended horizon.</li></ul>`;
  }
}
function downloadReport() {
  const r=currentReport;
  const text=[`AFTERMATH / FULL AUTOMATION REPORT`,`Occupation: ${r.title}`,`Location: ${r.location}`,`Generated: ${r.generatedAt}`,`Model: ${r.version}`,`Scenario: ${r.scenarioLabel}`,``, `FULL AUTOMATION HORIZON: ${r.fullAutomation.label}`,r.fullAutomation.durationLabel,r.confidence,r.summary,``,r.fullAutomation.basis,``, `TECHNOLOGY FRONTS`,...r.frontiers.map(f=>`${f.label}: ${f.yearsMin}–${f.yearsMax}${f.openEnded?'+':''} years\n${f.requirements}`),``,`TASKS`,...r.tasks.map(t=>`${t.label}\nTechnical window: ${t.automationWindow.label}\n${t.requirements}\nDependencies: ${t.frontierIds.map(id=>frontierDefinitions[id].label).join(', ')}\n${t.automationWindow.basis}\n`),`SCENARIO ASSUMPTIONS`,...r.assumptions.map(x=>`- ${x}`),``,`DEPLOYMENT CONDITIONS`,...r.deploymentAssumptions.map(x=>`- ${x}`),``,`LIMITS`,...r.limits.map(x=>`- ${x}`),``,`SOURCES (support tasks/context, NOT estimated dates)`,...r.sources.map(s=>`${s.title}\n${s.publisher} · ${s.date}\n${s.url}\n${s.note}\n`)].join('\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`aftermath-${r.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,60)}.txt`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Report downloaded.');
}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';setTimeout(()=>$('#toast').style.display='none',3000);}
$('#scan-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#job-input').value.trim();if(input)begin(input);else{$('#job-input').setCustomValidity('Enter an occupation or describe your work.');$('#job-input').reportValidity();}});
$('#job-input').addEventListener('input',()=>$('#job-input').setCustomValidity(''));
$('#more-roles').addEventListener('click',()=>{expanded=!expanded;renderIndex();});
$('#close-dialog').addEventListener('click',()=>dialog.close());
$('#privacy-button').addEventListener('click',()=>$('#privacy-dialog').showModal());
$('#close-privacy').addEventListener('click',()=>$('#privacy-dialog').close());
document.addEventListener('click',e=>{
  const role=e.target.closest('[data-role]');if(role){begin(catalog.find(r=>r.id===role.dataset.role).title);return;}
  const filtered=e.target.closest('[data-filter]');if(filtered){filter=filtered.dataset.filter;expanded=false;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('selected',b===filtered));renderIndex();return;}
  const remove=e.target.closest('[data-remove]');if(remove){const i=Number(remove.dataset.remove);state.tasks.splice(i,1);renderEditor();return;}
  const tab=e.target.closest('[data-tab]');if(tab){activeTab=tab.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>{b.setAttribute('aria-selected',String(b===tab));b.tabIndex=b===tab?0:-1;});$('#report-panel').setAttribute('aria-labelledby',tab.id);renderPanel();return;}
  const scenario=e.target.closest('[data-scenario]');if(scenario){const position=dialog.scrollTop;state.scenario=scenario.dataset.scenario;updateReport();renderReport();dialog.scrollTop=position;document.querySelector(`[data-scenario="${state.scenario}"]`).focus({preventScroll:true});}
});
document.addEventListener('input',e=>{if(e.target.matches('[data-task-index]'))state.tasks[Number(e.target.dataset.taskIndex)].label=e.target.value;});
document.addEventListener('keydown',e=>{if(e.target.matches('[role="tab"]')&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const tabs=[...document.querySelectorAll('[role="tab"]')];let index=tabs.indexOf(e.target);index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[index].click();tabs[index].focus();}});
renderIndex();
