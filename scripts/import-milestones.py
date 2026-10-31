#!/usr/bin/env python3
"""Reproduce granular 2023 ESPAI milestone statistics from pinned public data.

Requires numpy and scipy for --fit; raw-only export uses the standard library.
python3 scripts/import-milestones.py --raw-only
work/milestones/venv/bin/python scripts/import-milestones.py --fit
Inputs are downloaded once to work/milestones. No respondent rows are published.
"""
import argparse, ast, concurrent.futures, csv, hashlib, io, json, math, statistics, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CACHE=ROOT/'work/milestones'
COMMIT='5bea2ed3014d5360d1599bad989d3252d3b8ba3c'
DATA_URL=f'https://raw.githubusercontent.com/tadamcz/espai/{COMMIT}/data/2023%20ESPAI%20-%20Cleaned%20and%20Anonymized%20Responses.csv'
PAPER='https://arxiv.org/html/2401.02843v3'
METHOD='https://aiimpacts.org/how-should-we-analyse-survey-forecasts-of-ai-timelines/'
# Scope-preserving paraphrases of the paper's Appendix C; not generic capabilities.
TASKS=[
('Rosetta','Translate a newly discovered language','Translate difficult new-language text as well as human experts using one bilingual document containing every required word.','language'),
('translatespeech','Learn speech translation from subtitled films','Translate a new language using unlimited subtitled films in that language and existing bilingual data for other languages.','language'),
('translatetext','Translate common languages','Translate most text types in popular languages at the level of a fluent bilingual person without professional translation training.','language'),
('phonebanking','Provide telephone banking','Match human telephone banking operators on varied requests, including one-off card and website problems, without greater customer annoyance.','social'),
('groupimages','Classify unseen object categories','Group images of unseen object classes after training on a different but similar labeled dataset.','perception'),
('oneshotlearning','Recognize objects after one example','Recognize a new object across varied real-world scenes after seeing one labeled example, with ordinary human competence.','perception'),
('3D','Reconstruct a scene from video','Build a scene model from a short video and render a realistic video from a substantially different viewpoint.','perception'),
('transcribe','Transcribe noisy accented speech','Match a typical human transcribing speech with varied accents in noisy conditions.','language'),
('recording','Produce indistinguishable voice recordings','Render written text as speech that an expert listener cannot distinguish from a voice actor recording.','creative'),
('provemath','Originate publishable mathematical theorems','Routinely propose and prove theorems publishable in top mathematics journals without human guidance.','discovery'),
('Putnam','Match top Putnam competitors','Perform at the level of the strongest human entrants on difficult Putnam competition problems with known solutions.','reasoning'),
('Go','Master Go with human-scale experience','Defeat the strongest human Go players after no more training games than those players experienced.','reasoning'),
('Starcraft','Beat top StarCraft II players from video','Win at least half of games against the strongest human StarCraft II players using only screen video as observations.','reasoning'),
('randomPCgame','Learn an unfamiliar computer game rapidly','Match a novice human on a randomly selected, potentially difficult computer game after under ten minutes of play; other-game training is allowed.','reasoning'),
('AngryBirds','Beat humans on new Angry Birds levels','Surpass the strongest human players on previously unseen Angry Birds levels.','reasoning'),
('profAtari','Beat professional Atari testers','Surpass professional game testers across every Atari game without game-specific knowledge.','reasoning'),
('novAtari','Learn half of Atari games quickly','Beat novice humans on half of Atari games after only twenty minutes of training play and no game-specific knowledge.','reasoning'),
('laundry','Fold laundry at worker speed and quality','Fold laundry as well and as quickly as the median clothing-store employee.','physical'),
('run','Win a five-kilometre city race','A bipedal robot outruns the fastest humans over five kilometres of city streets.','physical'),
('LEGO','Assemble arbitrary LEGO sets','Use nonspecialized robotics hardware to assemble any LEGO set from its supplied parts and instructions.','physical'),
('sortlist','Generalize a sorting procedure','Learn efficient sorting for number lists much longer than training examples without being supplied the solution structure.','digital'),
('Python','Write simple algorithm implementations','Produce efficient, readable Python for a simple algorithm such as quicksort from a task specification and input/output examples.','digital'),
('Googleable','Answer searchable fact questions','Find online information and answer easily searchable natural-language factoid questions better than a domain expert with internet access.','digital'),
('openGoogleable','Answer searchable open questions','Find online information and answer easily searchable open-ended factual questions better than an internet-equipped domain expert.','digital'),
('NoDefAnswer','Answer unsettled factual questions','Give useful natural-language answers to factual questions lacking a definitive known answer.','reasoning'),
('essay','Write high-scoring school history essays','Write an original high-school history essay that receives high grades and passes plagiarism checks.','creative'),
('songTop40','Compose a chart-quality song','Output a complete audio song of sufficient quality to reach the United States Top 40.','creative'),
('songartist','Compose indistinguishable artist-style songs','Create a song experienced listeners cannot distinguish from a previously unheard song by a particular popular artist.','creative'),
('bestseller','Write bestseller-quality fiction','Write a novel or short story good enough for the New York Times bestseller list.','creative'),
('explainmove','Explain game-playing decisions','For any machine-playable computer game, explain its moves concisely and completely enough for a layperson.','reasoning'),
('poker','Win the World Series of Poker','Play poker at the level required to win the World Series of Poker.','reasoning'),
('virtualworld','Discover simulated physical laws','Explore a virtual world and output its governing differential equations symbolically, such as discovering Newtonian mechanics through simulated experiments.','discovery'),
('wiring','Install a new home electrical system','Physically install electrical wiring in a new home from a one-sentence instruction and the information a human would receive, without further human input.','physical'),
('finetuneLLM','Fine-tune a language model autonomously','From one instruction, download and fine-tune an open-source language model to improve a predetermined benchmark without further human input.','digital'),
('MillenniumPrize','Solve a long-standing mathematics problem','Solve an item from a list of longstanding open mathematical problems, such as a Millennium Prize problem, without further human input.','discovery'),
('MLresearch','Conduct a publishable machine-learning study','From a one-sentence research question, run an informative study and write a leading-conference-quality machine-learning paper without further human input.','discovery'),
('replicateML','Replicate a machine-learning paper','Independently replicate a leading-conference machine-learning study to the ML Reproducibility Challenge standards.','discovery'),
('paymentsite','Build an entire payment website','Build a complete website from specifications, including frontend, backend and secure payment integration, without further human input.','digital'),
('findandpatch','Find and repair a popular-project security flaw','From one instruction, find and patch a security flaw in an open-source project with over 100,000 users without further human input.','digital'),
]

def numeric(value):
    try:
        result=float(value)
        return result if math.isfinite(result) else None
    except (TypeError,ValueError): return None

def percentile(values,p):
    values=sorted(values); position=(len(values)-1)*p; low=int(position); high=math.ceil(position)
    return values[low]+(values[high]-values[low])*(position-low)

def responses(rows,prefix,framing):
    levels=[10,50,90] if framing=='FP' else [10,20,40 if prefix=='hlmi' else 50]
    suffix='percent' if framing=='FP' else 'years'
    fields=[f'{prefix}_{p}{suffix}_clean' for p in levels]
    valid=[];counts={'missingOrNonnumeric':0,'negative':0,'nonmonotonic':0,'outOfProbabilityRange':0}
    for row in rows:
        values=[numeric(row.get(field)) for field in fields]
        if None in values:counts['missingOrNonnumeric']+=1;continue
        if min(values)<0:counts['negative']+=1;continue
        if values!=sorted(values):counts['nonmonotonic']+=1;continue
        if framing=='FY' and max(values)>100:counts['outOfProbabilityRange']+=1;continue
        valid.append(values)
    return levels,fields,valid,counts

def fit_response(key):
    """Gamma CDF squared-probability-error fit, zero location, positive parameters.

    The objective/family follow the published method. Our deterministic log-space
    optimizer and boundary handling are independently implemented and disclosed.
    """
    import numpy as np
    from scipy.special import gammainc
    from scipy.optimize import least_squares
    xs=np.array(key[:3]);ps=np.array(key[3:])
    # Boundary opinions are finite-horizon censored judgments, not a claim of
    # "never" or a measured arrival. Keep them in the same gamma fit family.
    positive=xs[xs>0]; scale_guess=float(np.median(positive)) if len(positive) else 1.0
    starts=[(1,scale_guess),(0.2,scale_guess*5),(5,max(.01,scale_guess/5)),(1,100)]
    best=None
    def residual(z):
        a,scale=np.exp(z);return gammainc(a,xs/scale)-ps
    for shape,scale in starts:
        result=least_squares(residual,np.log([shape,scale]),bounds=([-20,-25],[30,60]),max_nfev=350)
        loss=float(np.mean(result.fun**2))
        if best is None or loss<best['loss']:
            a,s=np.exp(result.x);best={'kind':'gamma','shape':float(a),'scale':float(s),'loss':loss,'converged':bool(result.success),'boundaryUnidentified':bool(np.all(ps==0) or np.all(ps==1) or np.all(xs==0))}
    return best

def aggregate_quantiles(fp,fy,fy_years,fit_cache):
    import numpy as np
    from scipy.special import gammainc
    from scipy.optimize import brentq
    groups=[];losses=[];boundary_counts={}
    for values,framing in [(fp,'FP'),(fy,'FY')]:
        fit=[]
        for triple in values:
            key=tuple(float(x) for x in (triple+[.1,.5,.9] if framing=='FP' else fy_years+[x/100 for x in triple]))
            fit.append(fit_cache[str(key)])
        gammas=[x for x in fit if x['kind']=='gamma'];losses += [x['loss'] for x in fit]
        boundary_counts['fixedProbability' if framing=='FP' else 'fixedYears']=sum(bool(x.get('boundaryUnidentified')) for x in fit)
        groups.append((len(fit),sum(x['kind']=='already' for x in fit),np.array([x['shape'] for x in gammas]),np.array([x['scale'] for x in gammas])))
    def cdf(years):
        return sum((already+gammainc(shape,years/scale).sum())/n for n,already,shape,scale in groups)/2
    result={}
    for q in [.1,.25,.5,.75,.9]:
        if cdf(0)>=q:years=0.0
        else:
            upper=100.0
            while upper<1e15 and cdf(upper)<q:upper*=10
            years=None if cdf(upper)<q else float(brentq(lambda t:cdf(t)-q,0,upper,xtol=1e-8))
        result[f'p{int(q*100)}']=None if years is None else round(2023+years,3)
    # Publish aggregate samples, not respondent-level fit coefficients. These are
    # direct evaluations of the same fitted mixture used for the quantiles.
    calendar_years=list(range(2023,2324))+list(range(2328,3024,5))
    curve={
        'baseYear':2023,
        'years':calendar_years,
        'probabilities':[round(float(cdf(year-2023)),10) for year in calendar_years],
        'method':'Direct evaluation of independently fitted gamma CDFs; mean within each elicitation framing, then equal 0.5 framing weights. Not interpolated from quantiles.',
        'tailPolicy':'No extrapolation beyond the grid. A joint probability crossing outside 2023–3023 is unresolved and must return null, not the last grid year.',
        'boundaryUnidentifiedResponses':boundary_counts,
        'limits':'Aggregate 2023 expert beliefs, not calibrated event probabilities. Values beyond elicitation points are gamma functional-form extrapolations; boundary-response tails remain underidentified. Dependence across milestones is not estimated by this grid.',
    }
    return result,{'meanSquaredFitError':round(statistics.mean(losses),8),'fitsAbove0_01MSE':sum(x>.01 for x in losses),'weighting':'Equal 0.5 weight per elicitation framing; arithmetic mean of CDF probabilities within framing.'},curve

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--fit',action='store_true');parser.add_argument('--raw-only',action='store_true');args=parser.parse_args()
    CACHE.mkdir(parents=True,exist_ok=True);path=CACHE/'responses.csv'
    if not path.exists():path.write_bytes(urllib.request.urlopen(DATA_URL,timeout=120).read())
    raw=path.read_bytes();rows=list(csv.DictReader(io.StringIO(raw.decode())))
    assert len(rows)==3270
    specs=[('task_'+key,label,outcome,domain,'task') for key,label,outcome,domain in TASKS]
    for key,label in [('truckdriver','Truck driver'),('surgeon','Surgeon'),('retail_salesperson','Retail salesperson'),('AIresearcher','AI researcher')]:
        specs.append((key,'Full automation: '+label,f'Unaided machines perform the entire occupation of {label.lower()} better and more cheaply than human workers; intrinsic advantages of being human are excluded. Feasibility, not adoption.','occupation','occupation'))
    specs.extend([('hlmi','All-task human-level machine intelligence','Unaided machines perform every task better and more cheaply than human workers, excluding intrinsic human advantages, conditional on undisrupted scientific activity.','general','general'),('faol','Full automation of every occupation','Machines could be built to perform every occupation better and more cheaply than human workers, excluding intrinsic human advantages. Feasibility, not adoption.','general','general'),('final_occupation','Respondent-selected final occupation','Full automation of whichever existing occupation each respondent nominated as among the last to automate; respondents forecast different underlying outcomes.','heterogeneous','heterogeneous')])
    profiles=[];unique_fits=set()
    for prefix,label,outcome,domain,kind in specs:
        pl,pfields,fp,fp_excluded=responses(rows,prefix,'FP');yl,yfields,fy,fy_excluded=responses(rows,prefix,'FY')
        quantiles={f'p{q}':round(2023+statistics.median([v[i] for v in fp]),3) for i,q in enumerate(pl)}
        disagreement={f'p{q}':{'respondentP25':2023+percentile([v[i] for v in fp],.25),'respondentP75':2023+percentile([v[i] for v in fp],.75)} for i,q in enumerate(pl)}
        fy_summary=[{'year':2023+y,'meanProbability':round(statistics.mean([v[i]/100 for v in fy]),6),'medianProbability':statistics.median([v[i]/100 for v in fy])} for i,y in enumerate(yl)]
        profiles.append({'sourceId':'espai-2023-cleaned','milestoneId':'espai-'+prefix.replace('_','-').lower(),'sourceColumnPrefix':prefix,'label':label,'observableOutcome':outcome,'domain':domain,'kind':kind,'baseDate':'2023-10','baseYear':2023,'quantiles':quantiles,'quantileMethod':'Median respondent elicited year at each probability, fixed-probability framing only; not the paper aggregate CDF.','fixedProbabilityMedians':quantiles.copy(),'respondentDisagreement':disagreement,'fixedYearResponses':fy_summary,'sampleCounts':{'fixedProbability':len(fp),'fixedYears':len(fy)},'inputFields':{'fixedProbability':pfields,'fixedYears':yfields},'excludedRows':{'fixedProbability':fp_excluded,'fixedYears':fy_excluded},'applicability':'Same narrowly defined outcome only; mapping another duty to this milestone requires an explicit transfer assumption.','limits':['Expert judgments elicited in October 2023, not measurements of future dates or calibrated probabilities.','Narrow task feasibility assumes a well-resourced lab could implement the task within one year if it chose to; full workplace deployment is outside that endpoint.','An elapsed forecast date does not establish that the outcome was achieved; this dataset is not an updated capability evaluation.','No automatic extension from this scope to all requirements in a job.']})
        for v in fp:unique_fits.add(tuple(float(x) for x in v+[.1,.5,.9]))
        for v in fy:unique_fits.add(tuple(float(x) for x in yl+[x/100 for x in v]))
    if args.fit:
        fit_path=CACHE/'gamma-fits.json';cached=json.loads(fit_path.read_text()) if fit_path.exists() else {}
        fit_cache={str(tuple(float(v) for v in ast.literal_eval(key))):value for key,value in cached.items() if value['kind']=='gamma'}
        missing=[key for key in sorted(unique_fits) if str(key) not in fit_cache]
        print('Fitting',len(missing),'new unique response triples;',len(unique_fits),'total',flush=True)
        with concurrent.futures.ProcessPoolExecutor(max_workers=4) as pool:
            for i,(key,result) in enumerate(zip(missing,pool.map(fit_response,missing,chunksize=10))):
                fit_cache[str(key)]=result
                if i%100==0:fit_path.write_text(json.dumps(fit_cache));print('fit',i+1,'/',len(missing),flush=True)
        fit_path.write_text(json.dumps(fit_cache))
        for profile in profiles:
            prefix=profile['sourceColumnPrefix'];_,_,fp,_=responses(rows,prefix,'FP');yl,_,fy,_=responses(rows,prefix,'FY')
            quantiles,diagnostics,curve=aggregate_quantiles(fp,fy,yl,fit_cache)
            profile['quantiles']=quantiles;profile['fitDiagnostics']=diagnostics;profile['cdf']=curve
            profile['fitDiagnostics']['zeroProbabilityThroughLastHorizon']=sum(max(v)==0 for v in fy)
            profile['fitDiagnostics']['unitProbabilityFromFirstHorizon']=sum(min(v)==100 for v in fy)
            profile['fitDiagnostics']['zeroYearsAtAllProbabilities']=sum(max(v)==0 for v in fp)
            profile['fitDiagnostics']['tailWarning']='Beyond supplied elicitation points, gamma tails are functional-form extrapolations. All-zero fixed-year answers do not mean never; their future tail is underidentified. Extreme high quantiles are particularly unstable.'
            profile['quantileMethod']='Independent reproduction of published gamma-CDF fitting / arithmetic probability pooling; equally weighted FP/FY framings. Not copied published point estimates.'
    metadata={'version':'1.1.0','retrievedAt':datetime.now(timezone.utc).isoformat(timespec='seconds'),'researchCutoff':'2026-10-31','surveyFieldDates':['2023-10-11','2023-10-24'],'sourceRepositoryCommit':COMMIT,'sourceRepositoryCommitDate':'2024-12-15','sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceRows':len(rows),'milestoneCounts':{'tasks':39,'namedOccupations':4,'general':2,'heterogeneousNotForMapping':1},'sourceUrls':[PAPER,DATA_URL,'https://github.com/tadamcz/espai',METHOD],'license':'Paper CC BY 4.0; author-linked data repository MIT. Derived aggregate statistics; respondent rows are not distributed.','attribution':'Grace et al., Thousands of AI Authors on the Future of AI (2023 ESPAI); public-data repository and methodological reanalysis by Tom Adamczewski.','fitCompleted':bool(args.fit),'dateConvention':'Calendar-year number = 2023 + elicited elapsed years. Base month is October; decimal years are numeric precision, not exact calendar-day forecasts.','limitations':['Probabilities represent aggregate expert beliefs, not demonstrated calibration.','Forecast framing and aggregation choices materially affect dates.','Do not shift survey predictions forward by adding the current year; keep the original date anchor.','Do not treat quantiles as independent technology distributions or multiply them without dependence assumptions.','A single benchmark or elicited task is not an entire occupation.']}
    metadata['numericalMethod']='Independent gamma-CDF fits minimizing mean squared probability error; positive shape/scale optimized in log space from four starts. Fits within each framing are averaged as CDF probabilities; the FP and FY aggregates each receive 0.5 weight. Boundary responses remain gamma-fit responses, not assertions of never.'
    metadata['numericalLimits']='This reproduces the published family/objective/pooling principle, not the original software or all cleaning/exclusion decisions. See publishedChecks: HLMI median is close; FAOL differs by approximately seven years. Do not label these derived figures as exact published estimates. Tail quantiles are especially sensitive to fitting and extrapolation.'
    metadata['licenseDetail']='The repository LICENSE is MIT (copyright Tom Adamczewski 2024), but no separate original-response dataset licence was identified. This output distributes derived numerical facts and original scope-preserving paraphrases of the CC BY 4.0 paper, not raw response records or third-party analysis code.'
    metadata['surveyParticipantsReportedInPaper']=2778
    metadata['publicSheetComparison']={'verifiedAt':'2026-10-31','rows':3270,'columns':461,'changedCells':0,'note':'Pinned CSV and current author-linked public spreadsheet export matched cell-for-cell; byte differences are line endings.'}
    if args.fit:
        import numpy,scipy
        metadata['software']={'numpy':numpy.__version__,'scipy':scipy.__version__}
        metadata['cdfGrid']={'startYear':2023,'endYear':3023,'pointCount':441,'segments':[{'startYear':2023,'endYear':2323,'stepYears':1},{'startYear':2328,'endYear':3023,'stepYears':5}],'probabilityDecimalPlaces':10,'outsideGrid':None,'notCalibrated':True}
    for profile in profiles:
        profile['quantityKind']='derivedAggregateBeliefQuantiles' if args.fit else 'medianElicitedQuantilesOneFraming'
        if profile['kind']!='task':
            profile['limits'][1]='Occupation/global forecasts concern technical and cost feasibility under the stated exclusions, not observed deployment, regulatory approval or adoption.'
        if profile['kind']=='heterogeneous':profile['applicability']='Do not map to a specific task or occupation: different respondents selected different final occupations.'
    observations=[
        {'sourceId':'srt-h-2025','milestoneId':'observed-srt-h-steps','label':'Autonomous cholecystectomy steps in ex vivo tissue','observableOutcome':'The SRT-H system completed the evaluated surgical steps in eight previously unseen ex vivo gallbladders.','baseDate':'2025-07-08','quantiles':None,'measurements':{'successfulTrials':8,'totalTrials':8,'reportedSuccessRate':1.0},'applicability':'Bounded surgical manipulation and recovery feasibility.','limits':['Eight ex vivo trials do not establish clinical complication rates, all surgical duties, patient care, approval, or a full surgeon automation date.'],'sourceUrl':'https://arxiv.org/abs/2505.10251v3'},
        {'sourceId':'behavior-winner-2025','milestoneId':'observed-behavior-household','label':'Long-horizon household simulation performance','observableOutcome':'Winning 2025 BEHAVIOR Challenge policy evaluated across 50 household task types.','baseDate':'2025-12-21','quantiles':None,'measurements':{'taskTypes':50,'privateFullTaskSuccess':0.124,'privateQScoreIncludingPartialSuccess':0.260,'meanDemonstrationDurationMinutes':6.6},'applicability':'Separates complete task execution from partial progress for coupled manipulation, navigation and planning.','limits':['Simulation benchmark and challenge-specific corrections; does not establish real-home robustness or any future calendar date.','A 26% q-score is not a 26% whole-task success rate.'],'sourceUrl':'https://robot-learning-collective.github.io/winning-behavior-1k-challenge','paperUrl':'https://arxiv.org/abs/2512.06951v2'},
        {'sourceId':'vision-economics-2024','milestoneId':'modeled-vision-economics','label':'Economically attractive computer-vision automation','observableOutcome':'Cost model of US vision-task wages under the study technology and firm-scale assumptions.','baseDate':'2024-01','quantiles':None,'measurements':{'visionTaskWageShareEconomicallyAttractiveToAutomate':0.23},'applicability':'Technical exposure and cost-effective deployment require distinct treatment.','limits':['Modeled share of wages in vision tasks, not 23% of jobs or observed layoffs.','Cannot convert this cost snapshot into a universal deployment-delay constant.'],'sourceUrl':'https://ide.mit.edu/wp-content/uploads/2024/01/Beyond-AI-Exposure-Which-Tasks-are-Cost-Effective-to-Automate-with-Computer-Vision.pdf'},
    ]
    sources=[
        {'id':'espai-2023-cleaned','title':'2023 Expert Survey on Progress in AI — cleaned responses and reproduced milestone distributions','publisher':'AI Impacts; Grace et al.; data repository by Tom Adamczewski','url':DATA_URL,'paperUrl':PAPER,'date':'2024-12-15','domains':['digital','reasoning','perception','dexterity','mobility','social','creative','discovery'],'type':'primary survey dataset; independently derived distribution','observation':'The October 2023 survey elicited 10/50/90% years or probabilities at fixed horizons for 39 tasks, four named occupations, HLMI and FAOL. This project independently fits gamma CDFs and pools both framings to derive milestone belief quantiles.','limitation':'Expert beliefs are not calibrated capability measurements. Task feasibility and full occupations have different scopes. Derived fitting is not the exact original pipeline; FAOL median differs by about seven years from the published result. Tails and transfer to other tasks are especially uncertain.','forecastUse':'Provides dated, scope-specific conditional milestone anchors. Numerical transfer, integration, reliability and deployment adjustments remain separate modeling assumptions.'},
        {'id':'srt-h-2025','title':'SRT-H: A Hierarchical Framework for Autonomous Surgery via Language Conditioned Imitation Learning','publisher':'Kim et al. / Johns Hopkins / Stanford','url':'https://arxiv.org/abs/2505.10251v3','date':'2025-07-08','domains':['dexterity','perception','safety'],'type':'research paper','observation':'Reports successful autonomous execution of evaluated cholecystectomy steps in all eight trials on unseen ex vivo gallbladders.','limitation':'Small ex vivo experiment on selected steps; it does not establish clinical complication rates, autonomous patient care or full surgeon automation.','forecastUse':'A bounded demonstrated surgical milestone; does not itself supply a future automation year.'},
        {'id':'behavior-winner-2025','title':'Task adaptation of Vision-Language-Action model: 1st Place Solution for the 2025 BEHAVIOR Challenge','publisher':'Larchenko, Zarin and Karnatak / Robot Learning Collective','url':'https://arxiv.org/abs/2512.06951v2','dataUrl':'https://robot-learning-collective.github.io/winning-behavior-1k-challenge','date':'2025-12-21','domains':['dexterity','perception','mobility','reasoning'],'type':'research paper and author results report','observation':'Winning 50-task household simulation policy reported private full-task success 0.124 and partial-progress q-score 0.260; demonstrations averaged 6.6 minutes.','limitation':'Simulation, task-specific training and inference corrections; a q-score is not the complete-task success rate, and neither establishes real-home deployment reliability.','forecastUse':'Separates partial progress from end-to-end success and supports coupled physical requirements; no calendar forecast is supplied.'},
        {'id':'vision-economics-2024','title':'Beyond AI Exposure: Which Tasks are Cost-Effective to Automate with Computer Vision?','publisher':'Svanberg et al. / MIT Initiative on the Digital Economy','url':observations[2]['sourceUrl'],'date':'2024-01','domains':['perception','hardware'],'type':'working paper','observation':'The study cost model finds 23% of wages paid for US vision tasks economically attractive to automate at the costs and firm scales examined.','limitation':'A modeled wage share within vision tasks, not 23% of all jobs, observed deployment or a universal future adoption rate.','forecastUse':'Motivates separating technical performance and economic deployment; cannot set a universal number of integration years.'},
    ]
    output={'metadata':metadata,'sources':sources,'milestones':profiles,'publishedChecks':[{'milestoneId':'espai-hlmi','quantiles':{'p10':2027,'p50':2047},'source':PAPER,'method':'Published mean-CDF aggregate, paper v3 Table 6.'},{'milestoneId':'espai-faol','quantiles':{'p10':2037,'p50':2116},'source':PAPER,'method':'Published mean-CDF aggregate, paper v3 Table 6.'}],'observations':observations}
    (ROOT/'dist/data/milestone-evidence.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
    print('Wrote',len(profiles),'milestones',flush=True)
    for p in profiles:
        print(p['milestoneId'],p['sampleCounts'],p['quantiles'],flush=True)

if __name__=='__main__':main()
