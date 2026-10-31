#!/usr/bin/env python3
"""Reproduce the complete AFTERMATH O*NET 31.0 catalog from official CSV files.

Usage: python3 scripts/import-onet.py [--refresh] [--offline]
No third-party Python packages required. Cached input lives in ignored work/onet/raw.
Only occupation records, all official task statements, aliases and selected numeric
rating domains are imported. No occupation/title sampling or task caps are used.
"""
import argparse
import csv
import hashlib
import json
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
VERSION = '31.0'
AS_OF = '2026-10-30'
BASE = 'https://www.onetcenter.org/dl_files/database/db_31_0_csv/'
FILES = ['occupation_data', 'job_titles', 'sample_of_reported_titles', 'task_statements',
         'task_ratings', 'abilities', 'essential_skills', 'transferable_skills',
         'work_activities', 'work_context', 'knowledge', 'content_model_reference',
         'scales_reference', 'job_zones', 'emerging_tasks']
EXPECTED_SHA256 = {'occupation_data': 'a09eae1d6609686e44e05b7290993a1c8b523d8ca224bc0eedc194c855c3ee02', 'job_titles': '75a3b46d6edc5996117c10c9ed488c9a06f7495d02969e9d12873ab14a21540c', 'sample_of_reported_titles': '5d76040b7b0602ea217660648f8363e7980edd1870f96574a2eeaa6a822d2666', 'task_statements': '4568e14d8db6f05551ad37e056e909b13ebae4a26bcb5ff915bb5f281d582c57', 'task_ratings': '52ee4ad320f1ca3c3865795aefc7393d422a9bfbfea3a5b5d9eaf2928c10eafe', 'abilities': '7e9cd79791ce6014e1d26d0a449ae5b1e7aa7ef52d39b3934c3bb8d438104b88', 'essential_skills': '68c4d31d8c55077238395dca40cc4e6d32e6a608b5474bb8264b1f98ae415bd7', 'transferable_skills': 'f17d0419e818a3bf2f55076510c76c4aef01cc8f5aee2670d2f44f6f44ac60f7', 'work_activities': '6c266205b2926c0c854a7a577aae29fe492c71bb0df7e197adca830b58fe4ea1', 'work_context': '599f6bff23cbc3e7d8915e25c0167324b1e00c4117bcbcd9a0c754fe47cb4fd7', 'knowledge': '88092e17d16096cdebe292fee4389deb460edda24ae8b4637212c69c71562f55', 'content_model_reference': '370033744006dbd5df048431d42a402f6741a00a229b6d0f4e4f4249b6399c04', 'scales_reference': 'bcba23858ce21ecaacbde303a8993e35d46724b4afb8c9ec2b10e04f42adcfc9', 'job_zones': '093f01891ac2e602a8cc6c859ecb619b5bc00eb50cd3f3c1134c05b704481944', 'emerging_tasks': '7b7f304c456617083150cb7b09eb2be885dc11351fce1dbcc33bf0839d6dbfac'}

DOMAINS = ['abilities', 'essential_skills', 'transferable_skills',
           'work_activities', 'work_context', 'knowledge']
SECTORS = {
 '11':'Management', '13':'Business and financial operations',
 '15':'Computer and mathematical', '17':'Architecture and engineering',
 '19':'Life, physical, and social science', '21':'Community and social service',
 '23':'Legal', '25':'Educational instruction and library',
 '27':'Arts, design, entertainment, sports, and media',
 '29':'Healthcare practitioners and technical', '31':'Healthcare support',
 '33':'Protective service', '35':'Food preparation and serving',
 '37':'Building and grounds cleaning and maintenance', '39':'Personal care and service',
 '41':'Sales and related', '43':'Office and administrative support',
 '45':'Farming, fishing, and forestry', '47':'Construction and extraction',
 '49':'Installation, maintenance, and repair', '51':'Production',
 '53':'Transportation and material moving', '55':'Military specific'
}

def digest(data):
 return hashlib.sha256(data).hexdigest()

def numeric(value):
 if value is None or value.strip() == '': return None
 n=float(value)
 return int(n) if n.is_integer() else n

def run():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--refresh',action='store_true',help='Re-download pinned official source files.')
 parser.add_argument('--offline',action='store_true',help='Use cached files only.')
 args=parser.parse_args()
 cache=ROOT/'work/onet/raw';cache.mkdir(parents=True,exist_ok=True)
 def download(name):
  path=cache/f'{name}.csv'
  if not path.exists() or args.refresh:
   if args.offline: raise FileNotFoundError(path)
   with urlopen(BASE+name+'.csv',timeout=180) as response:
    data=response.read()
   if b'O*NET-SOC Code' not in data[:1000] and name not in ['content_model_reference','scales_reference']:
    raise ValueError(f'Unexpected source format: {name}')
   tmp=path.with_suffix('.csv.part');tmp.write_bytes(data);tmp.replace(path)
  return name,path
 with ThreadPoolExecutor(max_workers=4) as pool:
  paths=dict(pool.map(download,FILES))
 def rows(name):
  with paths[name].open(encoding='utf-8-sig',newline='') as handle:
   yield from csv.DictReader(handle)
 for name,path in paths.items():
  if digest(path.read_bytes()) != EXPECTED_SHA256[name]:
   raise ValueError(f'Source checksum changed for {name}; review the pinned version before updating the lock.')
 file_counts={name:sum(1 for _ in rows(name)) for name in FILES}
 assert file_counts['occupation_data']==1016, 'Pinned 31.0 occupation count changed; investigate source.'
 assert file_counts['task_statements']==18838, 'Pinned 31.0 task count changed; investigate source.'
 roles={}
 for row in rows('occupation_data'):
  code=row['O*NET-SOC Code']
  assert code not in roles, f'Duplicate occupation code {code}'
  roles[code]={
   'id':f'onet:{code}','title':row['Title'],'aliases':[],
   'description':row['Description'],'sector':SECTORS.get(code[:2],'Other occupations'),
   'source':'onet','sourceCode':code,'sourceVersion':VERSION,
   'sourceUrl':f'https://www.onetonline.org/link/summary/{code}',
   'tasks':[],'features':{},'coverage':'description'
  }
 alias_sets={code:{role['title'].casefold()} for code,role in roles.items()}
 for file,column in [('job_titles','Job Title'),('sample_of_reported_titles','Reported Job Title')]:
  for row in rows(file):
   code=row['O*NET-SOC Code'];value=row[column].strip()
   assert code in roles, f'Alias references unknown occupation: {code}'
   if value and value.casefold() not in alias_sets[code]:
    roles[code]['aliases'].append(value);alias_sets[code].add(value.casefold())
   # Short titles are source-provided aliases as well, not generated synonyms.
   short=row.get('Short Title','').strip()
   if short and short.casefold() not in alias_sets[code]:
    roles[code]['aliases'].append(short);alias_sets[code].add(short.casefold())
 task_ratings={}
 for row in rows('task_ratings'):
  if row.get('Recommend Suppress')=='Y': continue
  if row['Scale ID'] in ['IM','RT'] and not row.get('Category','').strip():
   task_ratings.setdefault((row['O*NET-SOC Code'],row['Task ID']),{})[row['Scale ID']]=numeric(row['Data Value'])
 for row in rows('task_statements'):
  code=row['O*NET-SOC Code'];task_id=row['Task ID']
  assert code in roles, f'Task references unknown occupation: {code}'
  item={'id':f'onet:{code}:task:{task_id}','label':row['Task'],
        'sourceId':f'onet-31.0-task-{task_id}','type':row['Task Type'],
        'sourceDate':row['Date'],'domainSource':row['Domain Source']}
  rating=task_ratings.get((code,task_id),{})
  if rating.get('IM') is not None:item['importance']=rating['IM']
  if rating.get('RT') is not None:item['relevance']=rating['RT']
  roles[code]['tasks'].append(item);roles[code]['coverage']='tasks'
 elements={r['Element ID']:r for r in rows('content_model_reference')}
 scales={r['Scale ID']:{'name':r['Scale Name'],'minimum':numeric(r['Minimum']),'maximum':numeric(r['Maximum'])} for r in rows('scales_reference')}
 feature_definitions={};suppressed=Counter();categorical=Counter();data_dates={}
 for domain in DOMAINS:
  for row in rows(domain):
   code=row['O*NET-SOC Code']
   assert code in roles, f'Feature references unknown occupation: {code}'
   # Category distributions are not independent scalar requirements. Their
   # source files are fully cached, but the model receives only aggregate rows.
   if row.get('Category','').strip():categorical[domain]+=1;continue
   if row.get('Recommend Suppress')=='Y':suppressed[domain]+=1;continue
   value=numeric(row['Data Value'])
   if value is None:continue
   element=row['Element ID'];scale=row['Scale ID'];key=f'{element}:{scale}'
   if key in roles[code]['features']:raise ValueError(f'Duplicate scalar rating {code} {key}')
   roles[code]['features'][key]=value
   data_dates.setdefault(code,{}).setdefault(domain,set()).add(row.get('Date',''))
   if key not in feature_definitions:
    definition=elements.get(element,{})
    feature_definitions[key]={'elementId':element,'label':row['Element Name'],
     'description':definition.get('Description',''),'scaleId':scale,
     'scale':scales[scale]['name'],'min':scales[scale]['minimum'],
     'max':scales[scale]['maximum'],'domain':domain,'unit':'source scale, not a probability'}
 for code,dates in data_dates.items():roles[code]['ratingDates']={k:sorted(v) for k,v in dates.items()}
 for row in rows('job_zones'):
  roles[row['O*NET-SOC Code']]['jobZone']=int(row['Job Zone'])
 # Emerging statements are proposals, kept separate from established tasks.
 for i,row in enumerate(rows('emerging_tasks')):
  code=row['O*NET-SOC Code']
  item={'id':f'onet:{code}:emerging:{i+1}','label':row['Task'],'type':row['Category'],
        'sourceDate':row['Date'],'originalTaskId':row['Original Task ID'],
        'status':'Proposed for future data collection; not treated as established task evidence'}
  roles[code].setdefault('emergingTasks',[]).append(item)
 data=list(roles.values())
 counts={'occupations':len(data),'withTasks':sum(bool(r['tasks']) for r in data),
         'descriptionOnly':sum(not r['tasks'] for r in data),
         'taskStatements':sum(len(r['tasks']) for r in data),
         'aliases':sum(len(r['aliases']) for r in data),
         'withNumericFeatures':sum(bool(r['features']) for r in data),
         'numericFeatures':sum(len(r['features']) for r in data),
         'featureDefinitions':len(feature_definitions),
         'emergingTaskProposals':sum(len(r.get('emergingTasks',[])) for r in data),
         'majorSocGroups':len({r['sourceCode'][:2] for r in data})}
 assert counts['taskStatements']==18838
 assert len({t['id'] for r in data for t in r['tasks']})==counts['taskStatements']
 for r in data:
  assert all(isinstance(v,(int,float)) for v in r['features'].values())
  assert all(key in feature_definitions for key in r['features'])
 attribution=('This project includes information from the O*NET 31.0 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), used under CC BY 4.0. O*NET® is a trademark of USDOL/ETA. AFTERMATH has restructured the data, combined aliases, selected scalar ratings, and added independent model interpretations. USDOL/ETA has not approved, endorsed, or tested these modifications.')
 metadata={'name':'O*NET® 31.0 Database','version':VERSION,'releaseDate':'2026-08',
  'retrievedAt':AS_OF,'referenceDateTimezone':'America/Los_Angeles',
  'taxonomy':'O*NET-SOC 2019 (based on the 2018 SOC standard)',
  'urls':{'catalog':'https://www.onetcenter.org/database.html','releaseArchive':'https://www.onetcenter.org/db_releases.html','license':'https://www.onetcenter.org/license_db.html','files':{name:BASE+name+'.csv' for name in FILES}},
  'license':{'name':'Creative Commons Attribution 4.0 International','url':'https://creativecommons.org/licenses/by/4.0/','attribution':attribution},
  'counts':counts,'sourceRowCounts':file_counts,
  'sha256':{name:digest(path.read_bytes()) for name,path in paths.items()},
  'rolesSha256':digest(json.dumps(data,ensure_ascii=False,separators=(',',':')).encode()),
  'featureDefinitions':feature_definitions,'scales':scales,'socMajorGroups':SECTORS,
  'excludedRatingRows':{'recommendedSuppression':dict(suppressed),'categoryDistributions':dict(categorical)},
  'transformations':['Every Occupation Data record retained, including residual and military occupations.',
    'All Task Statements retained verbatim; no per-role cap or task sampling.',
    'Aliases merged from Job Titles, Short Title, and Sample of Reported Titles; case-insensitive duplicates and canonical titles removed.',
    'All nonsuppressed, category-free scalar ratings retained in selected domains; keys combine source element and scale IDs.',
    'O*NET raw scalar values are not automation percentages, probabilities, or forecasts.',
    'Emerging task proposals retained separately; not silently treated as established occupational tasks.',
    'Sector labels group source codes by their two-digit SOC major group.'],
  'limits':['Not a census of every possible job title; the source is a U.S. occupation classification.',
    'Some classification records have no task or rating data; descriptions are retained without inventing tasks.',
    'Publication version does not mean all survey ratings were collected that year; role ratingDates preserve available dates.',
    'Occupational source data does not establish automation dates.']}
 out=ROOT/'dist/data/onet.json';out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps({'metadata':metadata,'roles':data},ensure_ascii=False,separators=(',',':'))+'\n')
 print(json.dumps({'output':str(out),'bytes':out.stat().st_size,'counts':counts,'sourceRows':file_counts},indent=2))

if __name__=='__main__':run()
