/** Requirement mapping only: no occupation-specific dates or horizon parameters.
 * Physical execution requires a physical action/effect, not a human motor rating
 * or a reference to hardware in a document. See research/MAPPING-REVIEW.md.
 */
const clamp = n => Math.max(0,Math.min(1,n));
const unique = values => [...new Set(values)];
const textOf = task => String(typeof task==='string'?task:(task?.label??task?.description??task?.name??'')).normalize('NFKC').toLowerCase();

const rules = [
  ['digital',.32,'Records and routine information processing',/\b(record|document|file|enter|input|process|update|compile|retrieve|transcrib|schedul|invoice|billing|payroll|bookkeep|spreadsheet|database|data entry|clerical|administrative|accounting|calculate|type|typist)\w*\b/],
  ['digital',.55,'Software, systems or technical information workflows',/\b(software|programming|programmer|code|coding|computer|cybersecurity|network security|algorithm|application development|debug|configure|web(site)?|digital|information technolog)\w*\b/],
  ['digital',.60,'Data science and computational models',/\b(machine learning|data mining|neural network|statistical model|mathematical model|simulation model|datasets?|data collection|data processing|flow charts?|logical operational)\b/],
  ['digital',.35,'Financial transactions and administrative records',/\b(receipts?|payments?|cash registers?|count money|bank deposits?|order supplies|order materials|order equipment|purchase|procure|procurement|buy merchandise|requisition|inventory|register|registration|keep track|daily reports?|accident reports?)\b/],
  ['reasoning',.48,'Analysis, planning and decisions',/\b(analy[sz]|evaluat|assess|investigat|diagnos|interpret|audit|review|plan|design|strateg|decid|decision|judg|troubleshoot|optimi[sz]|forecast|budget|manage|direct|coordinat|supervis|policy|policies|legal|advise|recommend|resolv|problem.solv)\w*\b/],
  ['reasoning',.72,'Complex or unfamiliar decisions',/\b(unfamiliar|unprecedented|ambiguous|complex|novel problems?|strategic|differential diagnos|litigat|adjudicat|arbitrat)\w*\b/],
  ['reasoning',.55,'Abstract problem solving and delivery constraints',/\b(think abstractly|address problems critically|meet deadlines|demonstrate disciplinary expertise|execute analytical mathematical calculations|comprehend financial|product comprehension)\b/],
  ['social',.30,'Communication and routine service interaction',/\b(?:communicat\w*|correspond\w*|contact(?:s|ed|ing)?|answer\w*|telephone\w*|reception\w*|customers?|clients?|guests?|interview\w*|present\w*|explain\w*|inform(?:s|ed|ing)?|discuss\w*|consult\w*|sell\w*|sales|serv(?:e|es|ed|ing)|service users|public relations)\b/],
  ['social',.35,'Coordination and participation with people',/\b(?:confer(?:s|red|ring)?|collaborat\w*|notify|notifies|notified|notifying|announc(?:e|es|ed|ing)|ask speakers|meetings?|conferences?|community events?|recruitment|reprimand\w*|warn persons|teamwork|work as part of a team|work as a member of a team|refer(?:s|red|ring)?|referral|accommodate\w*|attend to special needs)\b/],
  ['social',.45,'Language, listening and relationship skills',/\b(speak different languages|listen actively|build business relationships|build rapport|promote inclusion|recruit employees|multicultural environment|encourage students|disseminate results|promote social change)\b/],
  ['social',.68,'Teaching, negotiation, leadership or care',/\b(?:teach\w*|train(?:s|ed|ing)?|instruct\w*|educat\w*|mentor\w*|coach\w*|counsel\w*|psychotherap\w*|therap\w*|empath\w*|persuad\w*|negotiat\w*|mediat\w*|motivat\w*|leadership|lead teams|pastoral|clergy|chaplain|minister\w*|childcare|child care|nurs(?:e|es|ing)|care for|caregiving|social work|resolve conflicts|conflict resolution)\b/],
  ['creative',.60,'Original expressive work',/\b(choreograph\w*|perform music|live performance|theatrical\w*|entertain\w*|music\w*|artistic|creative|creativity|illustrat\w*|graphic design|fashion design|interior design|fiction|poetry|screenwrit\w*|novel writing|storytell\w*|scenograph\w*|acting|actors?|actress\w*|dance|dancing|sing|singing|sculpt\w*|compose music|compose songs|new cuisines|create jewelry)\b/],
  ['creative',.42,'Expressive writing or visual production',/\b(?:photograph\w*|video production|film production|copywrit\w*|journalis\w*)\b|\b(?:write|writing|edit|editing|author|authoring|publish|publishing)\b[^.;]{0,65}\b(?:articles?|editorials?|essays?|stories|fiction|poems?|poetry|novels?|screenplays?|lyrics|songs?|advertising copy|marketing copy|books?|narratives?|creative content)\b/],
  ['creative',.55,'Visual animation and applied artistic creation',/\b(animate|animation|3d organic forms|costume design|dye fabrics)\b/],
  ['discovery',.57,'Experimental or scientific research',/\b(scientific research|scientific investigat|research stud|conduct research|fundamental research|basic research|hypothes|experiment|discover|laboratory research|clinical research|chemical research|theoretical|new materials|new compounds|new treatment|new drug|scientific theor|research and develop)\w*\b/],
  ['safety',.66,'Clinical, emergency or other consequential interventions',/\b(patient|clinical|medical|medication|pharmac|prescrib|surg|dental|dentist|diagnos|emergency|rescue|firefight|police|law enforcement|prison|correctional|child safety|aviation safety|air traffic|nuclear|toxic|hazardous|high.voltage|life.threat|health and safety|occupational safety)\w*\b/],
  ['safety',.88,'Critical interventions and rare-failure recovery',/\b(emergency surg|critical care|intensive care|trauma|life.support|resuscitat|crisis intervention|disaster response|explosive|bomb disposal|radiation|reactor|air traffic control)\w*\b/],
  ['safety',.55,'Protective measures and applied safety procedures',/\b(protective gear|work ergonomically|students' safety|food safety|work safely|harmful movements|animal illness|disability care|legislation related to health care)\b/],
  ['frontier',1,'Explicitly speculative scientific prerequisite',/\b(new laws of physics|unknown physics|new physics|quantum gravity|faster.than.light|interstellar colon|interstellar travel|terraform|artificial consciousness|prove consciousness|cure all diseases|universal cure|unproven physical principle|room.temperature superconduct|whole.brain emulat|human brain emulat)\w*\b/]
];
const featureRules = [
  ['1.A.1.b.2:LV','creative',7,.50,'Originality'],
  ['1.A.1.b.4:LV','reasoning',7,.50,'Deductive reasoning'],
  ['1.A.1.b.5:LV','reasoning',7,.50,'Inductive reasoning'],
  ['1.A.2.a.2:LV','dexterity',7,.36,'Manual dexterity'],
  ['1.A.2.a.3:LV','dexterity',7,.43,'Finger dexterity'],
  ['1.A.2.b.1:LV','dexterity',7,.43,'Control precision'],
  ['1.A.3.a.1:LV','hardware',7,.40,'Static strength'],
  ['2.B.4.e:LV','reasoning',7,.50,'Judgment and decision making'],
  ['4.A.2.b.1:LV','reasoning',7,.50,'Making decisions and solving problems'],
  ['4.A.3.a.4:LV','mobility',7,.36,'Operating vehicles'],
  ['4.A.4.a.7:LV','social',7,.40,'Resolving conflicts'],
  ['4.C.2.c.1.d:CX','hardware',5,.50,'Hazardous conditions'],
  ['4.C.2.c.1.e:CX','safety',5,.60,'Hazardous equipment'],
  ['4.C.3.a.1:CX','safety',5,.65,'Consequence of error'],
  ['4.C.1.c.1:CX','safety',5,.70,'Responsibility for health and safety'],
  ['4.C.1.d.3:CX','safety',5,.50,'Violent or physically aggressive people'],
  ['4.C.2.a.1.c:CX','hardware',5,.65,'Outdoors in weather'],
  ['4.C.2.d.1.g:CX','dexterity',5,.75,'Using hands to handle or control objects']
];

// Ambiguous terms are deliberately absent: tools, engines, models, sites, loads,
// measures and inputs can all name entirely digital work. Physical terms alone
// are also insufficient: describing an engine is different from repairing it.
const physicalObjects=/\b(?:wires?|wiring|sensors?|cables?|circuit breakers?|electrical circuits?|pipes?|plumbing|conduits?|motors?|pumps?|valves?|levers?|gears?|bearings?|bolts?|screws?|screwdriver|metal|wood|glass|fabric|fabrics|textiles?|clothing|garments?|leather|jewelry|jewellery|paper|cards?|disks?|tapes?|bricks?|concrete|pavement|walls?|roofs?|ladders?|scaffolds?|furniture|cabinets?|fittings?|fixtures?|appliances?|hardware|computers?|printers?|machinery|machines?|robots?|robotic (?:arms?|equipment)|industrial equipment|electrical equipment|medical equipment|laboratory equipment|hand tools?|power tools?|instruments?|specimens?|samples?|tissue|wounds?|teeth|tooth|patients?|animals?|livestock|crops?|plants?|trees?|branches|food|ingredients?|dough|dishes|utensils|bottles?|containers?|chemicals?|liquids?|powders?|materials?|objects?|pieces|packages?|parcels?|goods|shelves|merchandise|supplies|products|equipment|components?|workpieces?|parts?|weights?|surfaces?|moulds?|molds?|metals?|apparel|conveyor belts?|gauges?|waste|mail|construction profiles|chalk line|vessels?|boats?|ships?|trucks?|vehicles?|tires?|oil|fuel|auxiliary power systems|idle reduction systems|fuel cells|cargo|debris|trailers?|jack|locks?|chains?|ropes?|lines?|assays|floodlights?|generators?|flares|lathe|lathes)\b/;
const digitalObjects=/\b(?:software|code|coding|programming|web(?:site)?|web sites?|web pages?|hypertext|http|database|datasets?|data|spreadsheets?|digital|virtual|online|algorithm|machine learning|neural network|computer programs?|applications?|operating systems?|domain names?|directories|directory trees|email|e-mail|server configuration|security measures|search engines?|game engines?|rendering engines?|data-driven|journal entries|financial accounts?)\b/;
const physicalVerbs=/\b(?:assembl(?:e|es|ed|ing)|disassembl(?:e|es|ed|ing)|install(?:s|ed|ing)?|repair(?:s|ed|ing)?|maintain(?:s|ed|ing)?|operat(?:e|es|ed|ing)|servic(?:e|es|ed|ing)|adjust(?:s|ed|ing)?|calibrat(?:e|es|ed|ing)|align(?:s|ed|ing)?|connect(?:s|ed|ing)?|disconnect(?:s|ed|ing)?|attach(?:es|ed|ing)?|detach(?:es|ed|ing)?|replac(?:e|es|ed|ing)|remov(?:e|es|ed|ing)|insert(?:s|ed|ing)?|load(?:s|ed|ing)?|unload(?:s|ed|ing)?|pack(?:s|ed|ing)?|wrap(?:s|ped|ping)?|fill(?:s|ed|ing)?|empty|empties|emptied|emptying|mix(?:es|ed|ing)?|pour(?:s|ed|ing)?|dispens(?:e|es|ed|ing)|lift(?:s|ed|ing)?|lower(?:s|ed|ing)?|carry|carries|carried|carrying|mov(?:e|es|ed|ing)|handl(?:e|es|ed|ing)|position(?:s|ed|ing)?|plac(?:e|es|ed|ing)|arrang(?:e|es|ed|ing)|clean(?:s|ed|ing)?|wash(?:es|ed|ing)?|steriliz(?:e|es|ed|ing)|sterilis(?:e|es|ed|ing)|cut(?:s|ting)?|trim(?:s|med|ming)?|sand(?:s|ed|ing)?|grind(?:s|ing)?|polish(?:es|ed|ing)?|paint(?:s|ed|ing)?|drill(?:s|ed|ing)?|fasten(?:s|ed|ing)?|fabricat(?:e|es|ed|ing)|manufactur(?:e|es|ed|ing)|mold(?:s|ed|ing)?|mould(?:s|ed|ing)?|construct(?:s|ed|ing)?|build(?:s|ing)?|built|manipulat(?:e|es|ed|ing)|stock(?:s|ed|ing)?|replenish(?:es|ed|ing)?|sort(?:s|ed|ing)?|collect(?:s|ed|ing)?|join(?:s|ed|ing)?|secur(?:e|es|ed|ing)|stack(?:s|ed|ing)?|set up|prepare|preparing|administer(?:s|ed|ing)?|pump(?:s|ed|ing)?|work with|crank(?:s|ed|ing)?|coupl(?:e|es|ed|ing)|uncoupl(?:e|es|ed|ing)|automate|supply|supplies|supplying|dispose|extract|decorate|alter|smooth|iron|ironing|moor|unmoor|snap)\b/g;
const intrinsicallyPhysical=/\b(?:weld(?:s|ed|ing)?|solder\w*|sew(?:s|ed|ing)?|stitch\w*|knit\w*|sutur\w*|dissect\w*|massag\w*|groom\w*|shav\w*|bath(?:e|es|ed|ing)|harvest\w*|prun(?:e|es|ed|ing)|plumb\w*|carv\w*|sculpt\w*|butcher\w*|slaughter\w*|excavat\w*|plough\w*|plow\w*|dig|digs|digging|dug|shovel\w*|sweep\w*|vacuum\w*|rinse\w*|lay bricks?|make incisions|de-limb trees)\b/g;
const physicalSensory=/\b(?:inspect\w*|measur\w*|examin\w*|weigh(?:s|ed|ing)?|observ\w*|detect\w*|scan(?:s|ned|ning)?|monitor\w*|check\w*|test(?:s|ed|ing)?|distinguish|recogni[sz]e|spot|mark differences)\b/g;
const sensoryObjects=/\b(?:specimens?|samples?|tissue|patients?|symptoms?|wounds?|animals?|livestock|crops?|plants?|trees?|metal|wood|fabric|fabrics|textiles?|colou?rs?|defects?|imperfections?|dimensions?|temperature|pressure|voltage|circuits?|electrical systems?|machinery|physical (?:objects|equipment|environment)|construction sites?|buildings?|structures?|terrain|land|water|air|food|chemicals?|gas|sound|light|equipment|machines?|gauges?|valves?|components?|workpieces?|parts?|materials?|products?|merchandise|supplies|accessories|conveyor belts?|pipeline|electrical characteristics|clearances?|tolerances?|cargo|loads|goods|trailers?|vehicles?|fetuses|foetuses|infants|children|adolescents|refrigeration systems|corrosion|pipelines?|generators?|fish|fields|ph)\b/;
const travelObjects=/\b(?:vehicles?|cars?|trucks?|buses|bus|forklifts?|tractors?|locomotives?|trains?|ships?|boats?|vessels?|aircraft|airplanes?|aeroplanes?|helicopters?|drones?|roads?|streets?|routes?|terrain|patients?|passengers|goods|packages|parcels|mail|food|water|supplies|agricultural machines|heavy construction equipment|urban areas|stairs|ladders|roofs)\b/;
const mobilityVerbs=/\b(?:driv(?:e|es|ing)|drove|driven|pilot(?:s|ed|ing)?|navigat\w*|transport\w*|deliver(?:s|ed|ing)?|park(?:s|ed|ing)?|steer\w*|maneuv(?:er|re)\w*|fly|flies|flying|sail\w*|patrol\w*|walk(?:s|ed|ing)?|climb\w*|swim\w*|div(?:e|es|ed|ing)|move patients)\b/g;
const inherentMovement=/\b(?:walk(?:s|ed|ing)?|climb(?:s|ed|ing)?|swim(?:s|ming)?|scuba diving|patrol(?:s|led|ling)?|travel to (?:sites|locations|homes)|fly aircraft)\b/g;
const hazardEnvironment=/\b(?:heavy (?:equipment|loads|lifting|objects)|underground|offshore|construction sites?|mines?|mining|forestry|outdoors?|all.weather|extreme temperatures?|harsh environments?|firefighting|agricultural fields|farm fields|livestock|wind turbines?|oil rigs?|ship repair)\b/;

// A coordinating/descriptive verb at the head does not make a later infinitive
// an action personally performed. Explicit conjunctions can introduce a second
// action: "design and assemble circuits" retains the assembly requirement.
function directAction(text,match) {
  const before=text.slice(0,match.index);
  if(!before.trim())return true;
  const governing=/\b(?:plan|design|document|describe|recommend|research|study|analy[sz]e|evaluate|supervise|oversee|coordinate|manage|direct|train|teach|instruct|write|develop|program|obtain|report|record|follow|simulate|model|inspect|examine|check|observe|monitor|test|provide descriptions|provide specifications)\w*\b/;
  if(governing.test(before)) {
    if(/^follow\b/.test(before)&&/\bsuch as\s+(?:(?:checking|providing|feeding|measuring|inspecting)\b.*)?$/.test(before))return true;
    if(/(?:\band|;)\s+(?:personally|physically)\s+$/.test(before))return true;
    // Allow a real series of main verbs; reject supervision of somebody else's
    // series of actions and references to installation/operation as nouns.
    return /(?:[,;]|\band|\bor)\s*$/.test(before)&&!/\b(?:supervise|oversee|coordinate|manage|direct|train|teach|instruct|obtain|report|record|follow)\b/.test(before)&&!before.replace(/\b(?:research|design|evaluate|plan|select|inspect|examine|check|observe|monitor|test|and|or)\b|[\s,]/g,'');
  }
  return !/\b(?:for|of|about|regarding|into|from|through)\s+$/.test(before);
}
function effect(text,verbs,objects=null) {
  for(const match of text.matchAll(verbs)) {
    if(!directAction(text,match))continue;
    // A work object must belong to the action's clause, rather than an unrelated
    // specification several sentences later. Preserve comma-separated verb lists.
    const after=text.slice(match.index+match[0].length).split(/[.;]/,1)[0].slice(0,170);
    const objectPhrase=after.split(/\b(?:and|or|using|with|from|to|by|for)\b|,/,1)[0];
    if(objects&&/\b(?:data|records?|reports?|information|statistics|readings|measurements|logs?|charts?|plans?|estimates)\b/.test(objectPhrase))continue;
    if(objects===physicalObjects&&/^\s+(?:the\s+|a\s+|an\s+|existing\s+|new\s+|current\s+|accurate\s+|appropriate\s+)*(?:software|code|data|databases?|spreadsheets?|files?|documents?|reports?|sketches?|drawings?|blueprints?|plans?|policies|procedures|programs?|journal|routes?|information|records?|licen[cs]e|identification|malware|digital|virtual|web|computer (?:programs?|software)|operating systems?)\b/.test(after))continue;
    if(objects&&!objects.test(after))continue;
    return {action:match[0],objectContext:after.trim()};
  }
  return null;
}
function physicalText(text) {
  return text
    .replace(/\b(?:identification|registration|membership|credit|debit) cards?\b/g,'credential')
    .replace(/\b(?:software|development|authoring|creation|management|digital|design|programming|analysis|web) tools?\b/g,'digital utilities')
    .replace(/\b(?:operating systems?|search engines?|game engines?|rendering engines?|physical (?:data )?models?|machine learning|data mining|data[- ]driven|web sites?|web pages?)\b/g,'digital concept')
    .replace(/\b(?:computer|software|virtual|digital|mathematical|statistical|simulation|3d) (?:components?|models?|simulations?|objects?|environments?|materials?|tools?|machines?)\b/g,'digital representation');
}
function physicalEffects(text) {
  const concrete=physicalText(text);
  const digital=digitalObjects.test(text);
  let manipulation=effect(concrete,physicalVerbs,physicalObjects)||effect(concrete,/\buse\b/g,/\b(?:hand tools?|power tools?|hammers?|screwdrivers?|pliers|wrenches?|scalpels?|forceps)\b/)||(!digital?effect(concrete,intrinsicallyPhysical):null);
  let perception=effect(concrete,physicalSensory,sensoryObjects);
  const interfaceOperation=/\b(?:computers?|radios?|phones?|gps|keyboards?|terminals?|software|digital concept)\b/.test(concrete)&&!/\b(?:lathe|lathes|wires?|cables?|circuits?|motors?|pumps?|robots?|physical|material|metal|wood|food|patient|paper|cards|tape)\b/.test(concrete);
  if(manipulation&&/^operat/.test(manipulation.action)&&interfaceOperation)manipulation=null;
  if(perception&&interfaceOperation)perception=null;
  const movement=effect(concrete,mobilityVerbs,travelObjects)||(!digital?effect(concrete,inherentMovement):null);
  const equipmentOperation=manipulation&&/^operat/.test(manipulation.action)&&!/\b(?:hand tools?|power tools?|instruments?)\b/.test(concrete)?manipulation:null;
  if(equipmentOperation)manipulation=null;
  const endurance=hazardEnvironment.test(concrete)&&(manipulation||movement||perception||equipmentOperation);
  return {manipulation,perception,movement,endurance,equipmentOperation};
}

// Common ESCO execution labels missed by the earlier verb-prefix rules. These
// describe ordinary work requirements, not undiscovered scientific prerequisites.
const contextualRules=[
  ['digital',.35,'Business transactions, registration and records',/\b(?:financial transactions?|order intake|quotes from prospective shippers|renew domain|domain name registrations?|relevant licen[cs]es|track shipments|track shipping sites|report on|report defective|financial accounts?|rental overdues|business records|financial services|file tax|tax returns?)\b/],
  ['digital',.55,'Computational work and digital infrastructure',/\b(?:back up|backups?|server|directories|directory trees|domain names?|email|e-mail|firewalls?|encryption|data migration|migrate existing data|system components|search engine|computer network|ICT|gps systems|radio systems)\b/i],
  ['reasoning',.50,'Self-management, adaptation and accountable decisions',/\b(?:accept own accountability|tolerate stress|stay alert|practice vigilance|keep up with (?:trends|innovations)|adapt to changing situations|time-critical environments|deal with pressure|handle stressful|company growth|minimi[sz]e .*cost|mitigate waste|reduce environmental impact|comply with|managing a business|work independently)\b/],
  ['reasoning',.48,'Proposals, business development and technical specifications',/\b(?:propose solutions|solicit new business|device lists|timing charts|technical drawings|business with great care)\b/],
  ['digital',.35,'Information reporting and communications',/\b(?:report\w*|receipts?|signatures?|global positioning systems|two-way radio|radiotelephone)\b/],
  ['digital',.40,'Records, markets, inventory status and scheduling',/\b(?:monitor stock (?:level|market)|monitor merchandise delivery|administer multi-modal logistics|order construction supplies|trade securities|administer appointments|radio equipment|radio navigation instruments|collect biological data|draw blueprints)\b/],
  ['digital',.45,'Data gathering, inspection and information workflows',/\b(?:inspect data|gather data|collect data|data analysis|data quality|data management|disseminate messages)\b/],
  ['digital',.40,'Routine written and technical information',/\b(?:write|writing|edit|editing|prepare)\b[^.;]{0,70}\b(?:reports?|technical documentation|specifications?|user manuals?|manuals?|procedures?|instructions?|records?|correspondence|proposals?)\b/],
  ['reasoning',.48,'Evaluation, confidentiality and operational decisions',/\b(?:observe confidentiality|undertake inspections|lead inspections|set quality assurance objectives|monitor sociological trends|monitor technology trends|monitor proper product handling|act reliably|spatial awareness|stay up to date|work in shifts|handover|work according to recipe)\b/],
  ['reasoning',.52,'Comparison, self-management and operational goals',/\b(?:meet productivity targets|compare property values|react calmly|cope with challenging demands|personalise sports programme|grade patterns)\b/],
  ['social',.55,'Feedback, people and social-service delivery',/\b(?:give constructive feedback|deliver social services|monitor student.s behaviour|show diplomacy|lead military troops)\b/],
  ['social',.55,'Relationships, emotional understanding and advocacy',/\b(?:emotional intelligence|advocate for others|build a network of suppliers|promote mental health|treat animals ethically)\b/],
  ['safety',.60,'Hazard recognition and prevention of harm',/\b(?:recognise the hazards|recognize the hazards|disease prevention|avoid contamination|employee.s health|power contingencies|survive at sea|prevent pipeline deterioration)\b/],
  ['creative',.55,'Innovation in product design',/\b(?:innovate in|innovate products|product innovation)\b/],
  ['social',.45,'Coordination, demonstration and relationships',/\b(?:liaise|cooperate|interact|enquiries|inquiries|demonstrate products|handle carriers|work (?:within communities|in .*teams?|in an? .*team)|build trust|build community relations|respond to enquiries|intercultural awareness|inter.professional|lead a team|upsell|promote human rights|promote environmental awareness|promote sustainable energy|deal with challenging people)\b/],
  ['social',.68,'Teaching and support of people',/\b(?:assign homework|work in vocational school|children.s problems|student.s situation|prevent social problems|safeguarding of young people|continuity of health care)\b/],
  ['safety',.60,'Protection, care and safe working practices',/\b(?:own safety|protecting individuals from harm|health teams|unsafe environments|prevent shoplifting|veterinary emergencies|secure working area|prevent damage to utility infrastructure|respond to changing situations in health care|extinguish fires|tolerate strong smells)\b/],
  ['creative',.52,'Artistic production or rehearsal',/\b(?:attend rehearsals|technical drawings of fashion|fashion pieces|storyboards?|moodboards?|visual design|visuals|user experience|animation)\b/]
];

export function mapTask(task,index=0,occupation={}) {
  const original=typeof task==='string'?{id:`task:${index}`,label:task}:{...task};
  original.id??=`task:${index}`;original.label??=original.description??original.name??'';
  const text=textOf(original),matches=new Map(),details=[];
  const selfLearning=/\bthrough continuing education\b|^(?:maintain|keep|update|develop|improve)\b[^.;]{0,80}\b(?:understanding|knowledge|familiarity|own skills)\b|^(?:attend|complete|participate in|take|pursue)\b[^.;]{0,60}\b(?:training|education|courses?|workshops?|conferences?|professional development)\b/.test(text);
  const instructingOthers=/\b(?:teach\w*|train\w*|instruct\w*|educat\w*)\s+(?:(?:the|other|a|an)\s+)?(?:people|staff|students?|employees?|clients?|workers?|teams?|classes|class|courses?|seminars?)\b|\b(?:deliver training|provide instruction|present lectures|discuss with|confer with)\b/.test(text);
  const softwareContext=/\b(?:software|programming|programmer|coding|computer|cybersecurity|network security|algorithm|application development|debug|configure|web(?:site)?|digital|information technolog)\w*\b/.test(text);
  const codeAsSoftware=/\b(?:source|machine|computer|program|software) code\b|\b(?:write|test|debug|compile)\s+(?:the\s+|supporting\s+)?code\b/.test(text);
  // A task-level research assessment is usable only while source provenance is
  // still present. Editing the wording must invalidate this attached evidence.
  const sourceEvidence=original.sourceId&&original.automationEvidence&&typeof original.automationEvidence.physical==='boolean'?original.automationEvidence:null;
  const add=(id,severity,reason,basis='task text',extra={})=>{
    const previous=matches.get(id);
    matches.set(id,{severity:Math.max(severity,previous?.severity??0),requirements:unique([...(previous?.requirements??[]),reason])});
    details.push({capabilityId:id,basis,reason,severity,...extra});
  };
  if(original.skillType==='knowledge'&&original.sourceId&&/skill/.test(original.type??'')) {
    add('reasoning',.40,`Source-classified knowledge requirement: ${original.label}`,'broad requirement inference');
    details.push({basis:'ESCO knowledge type',reason:'Knowledge does not establish hands-on execution or an undiscovered scientific prerequisite.'});
  }else{
    for(const [id,severity,reason,pattern] of [...rules,...contextualRules]) {
      if(!pattern.test(text))continue;
      if(id==='digital'&&reason==='Software, systems or technical information workflows'&&!softwareContext&&!codeAsSoftware)continue;
      if(id==='social'&&selfLearning&&!instructingOthers)continue;
      if(id==='creative'&&/\b(?:software|code|coding|programming|database|computer program)\w*\b/.test(text)&&!/\b(?:artistic|creative|music|graphic|fiction|story|poetry|illustrat)\w*\b/.test(text))continue;
      if(id==='social'&&/\btrain\w*\b/.test(text)&&/\b(?:machine learning|neural network|models?|algorithms?)\b/.test(text)&&!/\b(?:people|students?|staff|employees?|workers?|clients?)\b/.test(text))continue;
      if(id==='safety'&&/\bdiagnos\w*\b/.test(text)&&!/\b(?:patient|medical|clinical|health|disease|surg\w*|dental|toxic|hazard\w*|emergency|high.voltage|nuclear)\b/.test(text))continue;
      add(id,severity,reason);
    }
    if(selfLearning)add('reasoning',.40,'Maintaining one’s own knowledge and professional skills','broad requirement inference');
    const effects=physicalEffects(text);
    const occupationText=String(occupation.description??'').toLowerCase();
    const digitalContext=/\b(?:software|web|programming|digital|data analysis|computer systems?)\b/.test(occupationText);
    const purelyDigitalContext=digitalContext&&!/\b(?:robots?|robotics|manufacturing|electrical|medical|laboratory|physical equipment|hardware repair|mechanical)\b/.test(occupationText);
    const concreteObservation=/\b(?:specimens?|samples?|tissue|patients?|symptoms?|wounds?|animals?|crops?|plants?|metal|wood|fabric|temperature|pressure|voltage|circuits?|terrain|water|food|chemicals?|sensor|physical|machinery)\b/.test(text);
    if(effects.manipulation&&purelyDigitalContext&&sourceEvidence?.physical!==true&&!concreteObservation&&/\b(?:components?|models?|interfaces?)\b/.test(effects.manipulation.objectContext)) {
      effects.manipulation=null;
      add('digital',.50,'Component or model operations in the source-described digital environment','source description context');
    }
    if(effects.perception&&!concreteObservation&&(digitalContext||sourceEvidence?.physical===false)) {
      effects.perception=null;
      add('digital',.50,'Equipment monitoring in a source-described digital workflow; no physical observation effect is specified','source description context');
      details.push({basis:'physical evidence gate',reason:'Generic equipment monitoring does not by itself require embodied sensing.'});
    }
    if(effects.manipulation) {
      const delicate=/\b(?:surg\w*|sutur\w*|dissect\w*|tissue|wounds?|teeth|tooth|intravenous|inject\w*|venipuncture|deformable|fragile|delicate)\b/.test(text);
      add('dexterity',delicate?.83:.53,`Physical manipulation: ${effects.manipulation.action} ${effects.manipulation.objectContext}`.trim(),'explicit physical effect',{physicalEvidence:true});
    }
    if(effects.perception)add('perception',.48,`Physical observation: ${effects.perception.action} ${effects.perception.objectContext}`.trim(),'explicit physical effect',{physicalEvidence:true});
    if(effects.movement)add('mobility',.55,`Physical movement: ${effects.movement.action} ${effects.movement.objectContext}`.trim(),'explicit physical effect',{physicalEvidence:true});
    if(effects.equipmentOperation)add('hardware',.48,`Physical equipment operation: ${effects.equipmentOperation.action} ${effects.equipmentOperation.objectContext}`.trim(),'explicit physical effect',{physicalEvidence:true});
    if(effects.endurance)add('hardware',.60,'Physical work in demanding or exposed conditions','explicit physical effect',{physicalEvidence:true});
    if(/^(?:assess|survey|inspect|examine|measure)\w*\b/.test(text)&&/\b(?:sites?|properties|property|terrain|land)\b/.test(text)&&/\b(?:tape measures?|compasses|surveying instruments|laser measurement|physical measurements)\b/.test(text))add('perception',.55,'Instrumented measurement of the physical site','explicit physical effect',{physicalEvidence:true});
    if(/^conduct physical examinations? of (?:property|buildings?|sites?)\b/.test(text))add('perception',.55,'Physical examination of property or a site','explicit physical effect',{physicalEvidence:true});
    if(/^set (?:and verify )?(?:parts?|bearing|valve) clearances\b/.test(text)) {
      add('dexterity',.58,'Set mechanical part clearances','explicit physical effect',{physicalEvidence:true});
      add('perception',.55,'Verify mechanical part clearances','explicit physical effect',{physicalEvidence:true});
    }
    if(/^keep .*equipment in good condition\b/.test(text))add('dexterity',.53,'Maintaining the condition of physical equipment','explicit physical effect',{physicalEvidence:true});
    if(/^(?:operate|operating)\s+(?:(?:a|the)\s+)?(?:forklift|vehicle|truck|crane|tractor|aircraft|boat|ship)\b/.test(text))add('mobility',.55,'Operating a physical vehicle','explicit physical effect',{physicalEvidence:true});
    if(/^work in outdoors? conditions\b/.test(text))add('hardware',.55,'Execution is explicitly required in exposed outdoor conditions','explicit physical effect',{physicalEvidence:true});
    // Explicit clinical interventions specify a physical effect even when the
    // action is phrased as administering treatment rather than manipulation.
    if(/\b(?:administer (?:medications?|drugs?|anesthetics?|anaesthetics?|local|inhalation|intravenous)|perform (?:emergency )?surgery|perform transplantation operations|perform physical examinations|provide (?:first aid|immunizations?)|dress wounds|inject|venipuncture)\b/.test(text)&&!/^(?:plan|teach|describe|document|supervise)\b/.test(text)||/^follow established surgical techniques during the operation\b/.test(text)||/^provide (?:consultation and )?surgical assistance\b/.test(text)) {
      add('dexterity',.83,'Physical clinical intervention','explicit physical effect',{physicalEvidence:true});
      add('safety',.70,'Clinical intervention requires patient safety and error recovery');
    }
    if(/\b(?:treat|treatment|therapy|therapies)\w*\b/.test(text)&&/\b(?:disorder|disease|patient|health|brain|heart|lung|kidney|cancer|diabetes|medical)\w*\b/.test(text))add('safety',.70,'Treatment of health conditions');
    if(/\b(?:trustee|guardian|executor|subpoena|oath|courtroom|enforce|traffic laws)\w*\b/.test(text))add('reasoning',.60,'Institutional judgment and rule application');
    // Source context can disambiguate broad technical execution language. It is
    // never a job-title lookup and never a reason to erase unresolved text.
    if(!matches.size&&/\b(?:configure|integrate|deploy|back up|renew|register|debug|version|interface|query|encrypt|authenticate)\w*\b/.test(text)) {
      const context=String(occupation.description??'').toLowerCase();
      if(digitalObjects.test(context))add('digital',.50,'Technical execution in the source-described digital work environment','source description context');
    }
    if(!matches.size&&/\b(?:research|study|studies|knowledge|understand|principles|standards|regulations|procedures|methods|practices|ensure|organis|organiz|develop|support|assist|control|prepare|provide|apply|perform|conduct|identify|determine|establish|implement|maintain|check|test|testing|select|arrange|follow|use|utili[sz]|read|define|formulate|devise|participate|complete|submit|verify|oversee|find|locate|count|estimate|start|claim|create|acquire|distribute|store)\w*\b/.test(text))add('reasoning',.40,'General knowledge or procedural requirement; execution detail is incomplete','broad requirement inference');
    if(!matches.size)add('unknown',.65,'The supplied wording does not establish a capability requirement; more task detail is needed','unresolved requirement');
  }
  const demanding=/\b(?:unstructured|unpredictable|unfamiliar|unprecedented|high.precision|delicate|extreme|complex|novel|critical|emergency|changing environments|without supervision|independently)\w*\b/.test(text);
  if(demanding)for(const [id,value] of matches)if(id!=='unknown') {
    value.severity=Math.max(value.severity,id==='frontier'?1:.78);
    value.requirements.push('Variable, demanding or consequential execution specified in the requirement');
  }
  if(original.type==='description-proxy')details.push({basis:'description proxy',reason:'An occupational summary is not an exhaustive task inventory.'});
  if(/skill/.test(original.type??''))details.push({basis:'skill proxy',reason:'A skill or knowledge requirement is not an observed task or complete workflow.'});
  if(sourceEvidence) {
    const physicalMapped=details.some(detail=>detail.physicalEvidence);
    details.push({basis:'published task assessment',sourceId:sourceEvidence.sourceId,physical:sourceEvidence.physical,exposureTier:sourceEvidence.exposureTier,disagreement:sourceEvidence.physical!==physicalMapped,reason:sourceEvidence.physical===physicalMapped?'Source task classification agrees with the mapped physical effects.':sourceEvidence.physical?'The source classifies this task as physical; the wording does not yet identify a specific physical capability.':'The source labels this task nonphysical, but an explicit physical effect is present; the disagreement is retained for review.'});
  }
  return {original,matches,details};
}

export function occupationConstraints(occupation={},mapped=[]) {
  const constraints=[],suppressedConstraints=[],features=occupation.features??{};
  const physical=new Set(mapped.flatMap(task=>task.details.filter(detail=>detail.physicalEvidence).map(detail=>detail.capabilityId)));
  let structuredFeatureCount=0;
  for(const [key,id,max,threshold,label] of featureRules) {
    const raw=features[key];if(typeof raw!=='number'||!Number.isFinite(raw))continue;
    structuredFeatureCount++;
    const normalized=clamp(key.endsWith(':CX')?(raw-1)/(max-1):raw/max);
    if(normalized<threshold)continue;
    // Originality measures novel ideas and problem solving, not necessarily art.
    // Only a separately identified expressive task justifies creative direction.
    const expressive=mapped.some(task=>task.matches.has('creative'));
    const targetId=key==='1.A.1.b.2:LV'&&!expressive?'reasoning':id;
    const item={id:targetId,severity:normalized,reason:`${label}: ${raw} (${key}; source scale ${key.endsWith(':CX')?'1':'0'}–${max})${targetId!==id?'; general idea generation, without an established expressive-output requirement':''}`,basis:'O*NET occupation-level rating',key};
    const physicalConstraint=['dexterity','mobility','hardware'].includes(id);
    const hasEffect=physical.has(id)||(id==='hardware'&&physical.size>0);
    if(physicalConstraint&&!hasEffect) {
      suppressedConstraints.push({...item,reason:`${label} was observed for human workers, but supplied duties do not establish the corresponding physical effect. Computer interaction or a classification code alone does not require a robot.`});
      continue;
    }
    constraints.push(item);
  }
  return {constraints,structuredFeatureCount,suppressedConstraints};
}
