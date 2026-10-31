#!/usr/bin/env python3
"""Import a pinned public research snapshot; exact task joins happen at build time."""
import csv
import hashlib
import json
from pathlib import Path
from urllib.request import urlretrieve

ROOT = Path(__file__).resolve().parents[1]
COMMIT = '430f214c438dd25e0e26a3e5b84dc502d6894997'
BASE = f'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/{COMMIT}/robot_exposure/'
CACHE = ROOT / 'work/model-revision/robot-evidence'
CACHE.mkdir(parents=True, exist_ok=True)
csv.field_size_limit(10_000_000)

def source_file(name):
    path = CACHE / name
    if not path.exists():
        urlretrieve(BASE + name, path)
    return path

source = source_file('robot_exposure_tasks.csv')
rows = []
seen = set()
citations = 0
for row in csv.DictReader(source.open(encoding='utf-8')):
    key = f"onet:{row['onetsoc_code']}:task:{row['task_id']}"
    if key in seen:
        raise ValueError(f'Duplicate research task {key}')
    seen.add(key)
    instances = json.loads(row['instances'] or '[]')
    references = json.loads(row['sources'] or '[]')
    citations += len(references)
    rows.append({
        'taskId': key,
        'label': row['task_statement'],
        'physical': row['physical'] == 'Yes',
        'exposureTier': row['exposure_tier'] or None,
        'sourceId': 'robot-task-evidence',
        'assessmentType': 'Published AI-assisted research assessment; not an independently observed task trial',
        'instances': [{
            'id': item.get('instance'), 'label': item.get('description'),
            'tier': item.get('tier'), 'settingTier': item.get('setting_tier'),
            'sourceNumbers': item.get('sources'),
        } for item in instances],
        'sources': [{
            'number': item.get('source'), 'system': item.get('system'),
            'developer': item.get('developer'), 'date': item.get('date'),
            'maturity': item.get('maturity'), 'autonomyStatus': item.get('autonomy_status'),
            'title': item.get('source_title'), 'url': item.get('url'),
            'claim': item.get('claim'), 'transferJustification': item.get('transfer_justification'),
        } for item in references],
    })

if len(rows) != 18796 or citations != 56933:
    raise ValueError(f'Unexpected reviewed source counts: {len(rows)} tasks / {citations} citations')

payload = {
    'metadata': {
        'title': 'What work can robots do? — task evidence',
        'publisher': 'Legate-Yang and Massenkoff / Anthropic',
        'publishedAt': '2026-09-30', 'reviewedAt': '2026-10-31',
        'sourceUrl': BASE + 'robot_exposure_tasks.csv', 'sourceCommit': COMMIT,
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'sourceOccupationVersion': 'O*NET 29.3', 'taskCount': len(rows),
        'physicalTaskCount': sum(row['physical'] for row in rows),
        'citationCount': citations, 'license': 'CC BY 4.0',
        'licenseUrl': 'https://creativecommons.org/licenses/by/4.0/',
        'scope': 'Published AI-assisted ratings and cited examples; not direct measurements of full job automation or forecasts of completion dates.',
        'transformations': 'Retained physical classification, tiers, example requirements and all cited source links/claims. Omitted generated time shares, generated prevalence weights, quotes and extended reasoning. Joins require the same occupation code, task ID and normalized task statement.',
    },
    'tasks': rows,
}
target = ROOT / 'dist/data/robot-task-evidence.json'
target.write_text(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
print(json.dumps({**payload['metadata'], 'outputBytes': target.stat().st_size}, indent=2))
