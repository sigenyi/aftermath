#!/usr/bin/env python3
"""Reproduce the software benchmark calibration using only Python's standard library.

Default: use the checked-in official data snapshot. --refresh downloads a new
snapshot, still rejecting release dates beyond the declared evidence cutoff.
This fits published model-level horizon estimates, not the underlying task runs.
"""
import argparse
import datetime as dt
import hashlib
import json
import math
from pathlib import Path
import random
import re
import statistics
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'research/digital-source/benchmark_results_1_1.yaml'
URL = 'https://metr.org/assets/benchmark_results_1_1.yaml'
CUTOFF = '2026-10-31'
EPOCH = dt.date(2023, 1, 1)


def parse_snapshot(raw):
    """Parse only the documented, scalar fields used from METR's YAML schema."""
    blocks = re.findall(r'^  ([a-zA-Z0-9_]+):\n(.*?)(?=^  [a-zA-Z0-9_]+:|\Z)', raw.split('results:\n', 1)[1], re.M | re.S)
    rows = []
    for model, block in blocks:
        date = re.search(r'^    release_date: (\d{4}-\d\d-\d\d)', block, re.M).group(1)
        suite = re.search(r'^    benchmark_name: (.+)', block, re.M).group(1)
        row = {'model': model, 'releaseDate': date, 'benchmark': suite, 'frontier': 'is_sota: true' in block}
        for metric in ('p50', 'p80'):
            section = re.search(metric + r'_horizon_length:\n((?:        .+\n)+)', block).group(1)
            for source_key, output_key in [('estimate', 'Minutes'), ('ci_low', 'LowMinutes'), ('ci_high', 'HighMinutes')]:
                row[metric + output_key] = float(re.search(source_key + r': ([\d.]+)', section).group(1))
        if date > CUTOFF:
            row['exclusion'] = 'release after evidence cutoff'
        elif suite != 'METR-Horizon-v1.1':
            row['exclusion'] = 'different task-suite version; no stitching in primary fit'
        elif row['p50Minutes'] > 960:
            row['exclusion'] = 'p50 exceeds METR task-suite reliable measurement boundary of 16 hours'
        else:
            row['exclusion'] = None
        row['primaryIncluded'] = row['exclusion'] is None and row['frontier']
        row['daysSinceEpoch'] = (dt.date.fromisoformat(date) - EPOCH).days
        if not 0 < row['p80Minutes'] < row['p50Minutes']:
            raise ValueError(f'Invalid horizon ordering for {model}')
        rows.append(row)
    if len(rows) < 10:
        raise ValueError('Unexpected METR schema or too few observations')
    return sorted(rows, key=lambda r: (r['releaseDate'], r['model']))


def fit(rows, metric):
    xs = [r['daysSinceEpoch'] for r in rows]
    ys = [math.log2(r[metric + 'Minutes']) for r in rows]
    xm, ym = statistics.mean(xs), statistics.mean(ys)
    xx = sum((x - xm) ** 2 for x in xs)
    if not xx:
        raise ValueError('Zero release-date variance')
    slope = sum((x - xm) * (y - ym) for x, y in zip(xs, ys)) / xx
    intercept = ym - slope * xm
    residuals = [y - intercept - slope * x for x, y in zip(xs, ys)]
    sse = sum(e * e for e in residuals)
    sst = sum((y - ym) ** 2 for y in ys)
    return {'n': len(rows), 'interceptLog2Minutes': intercept, 'slopeLog2MinutesPerDay': slope,
            'doublingDays': 1 / slope, 'rSquared': 1 - sse / sst,
            'residualRmseLog2': math.sqrt(sse / len(rows)),
            'firstRelease': min(r['releaseDate'] for r in rows),
            'lastRelease': max(r['releaseDate'] for r in rows),
            'modelIds': [r['model'] for r in rows]}


def validation(rows, metric):
    train = [r for r in rows if r['releaseDate'] < '2025-01-01']
    test = [r for r in rows if r['releaseDate'] >= '2025-01-01']
    model = fit(train, metric)
    anchor = max(train, key=lambda r: r['releaseDate'])[metric + 'Minutes']
    predictions = []
    for r in test:
        yhat = model['interceptLog2Minutes'] + model['slopeLog2MinutesPerDay'] * r['daysSinceEpoch']
        error = yhat - math.log2(r[metric + 'Minutes'])
        predictions.append({'model': r['model'], 'releaseDate': r['releaseDate'], 'observedMinutes': r[metric + 'Minutes'],
                            'predictedMinutes': 2 ** yhat, 'errorLog2': error,
                            'errorEquivalentDays': error / model['slopeLog2MinutesPerDay']})
    rmse = math.sqrt(statistics.mean(p['errorLog2'] ** 2 for p in predictions))
    baseline_rmse = math.sqrt(statistics.mean((math.log2(anchor) - math.log2(p['observedMinutes'])) ** 2 for p in predictions))
    rolling = []
    for row in rows:
        previous = [r for r in rows if r['releaseDate'] < row['releaseDate']]
        if len(previous) < 6:
            continue
        model_i = fit(previous, metric)
        yhat = model_i['interceptLog2Minutes'] + model_i['slopeLog2MinutesPerDay'] * row['daysSinceEpoch']
        rolling.append({'model': row['model'], 'trainingN': len(previous), 'releaseDate': row['releaseDate'],
                        'observedMinutes': row[metric + 'Minutes'], 'predictedMinutes': 2 ** yhat,
                        'errorLog2': yhat - math.log2(row[metric + 'Minutes'])})
    return {'type': 'Retrospective model-release holdout on a common later-measured task suite; not a contemporaneous forecasting backtest',
            'splitDate': '2025-01-01', 'trainingN': len(train), 'testN': len(test),
            'rmseLog2': rmse, 'rmseMultiplicativeFactor': 2 ** rmse,
            'noProgressBaselineRmseLog2': baseline_rmse,
            'predictions': predictions, 'rolling': rolling,
            'rollingRmseLog2': math.sqrt(statistics.mean(p['errorLog2'] ** 2 for p in rolling))}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--refresh', action='store_true')
    args = parser.parse_args()
    if args.refresh:
        SOURCE.parent.mkdir(parents=True, exist_ok=True)
        SOURCE.write_bytes(urllib.request.urlopen(URL, timeout=45).read())
    raw = SOURCE.read_bytes()
    rows = parse_snapshot(raw.decode())
    primary = [r for r in rows if r['primaryIncluded']]
    eligible = [r for r in rows if r['exclusion'] is None]
    recent = [r for r in primary if r['releaseDate'] >= '2024-01-01']
    output = {
        'metadata': {'version': '1.0.0', 'reviewedAt': CUTOFF, 'cutoff': CUTOFF, 'sourceUrl': URL,
                     'sourceSha256': hashlib.sha256(raw).hexdigest(), 'sourceBytes': len(raw),
                     'dashboardLastUpdated': '2026-09-08', 'dashboardActivelyMaintained': False,
                     'epochDate': EPOCH.isoformat(), 'units': 'human expert task-completion minutes, not AI wall-clock runtime',
                     'selection': 'METR-Horizon-v1.1, source is_sota=true, p50<=960 minutes, release<=cutoff',
                     'measurementBoundaryMinutes': 960, 'observations': len(rows), 'primaryN': len(primary),
                     'supportedSuccessTargets': [0.5, 0.8],
                     'numericStatus': 'OLS estimates fitted to published numerical benchmark measurements; not calibrated occupational forecasts'},
        'observations': rows, 'fits': {}, 'validation': {}, 'bootstrap': {},
        'assumptions': [
            'The empirical log2 horizon trend continues beyond observed model releases.',
            'An input task belongs to the measured distribution of well-specified, self-contained software, ML or cybersecurity tasks.',
            'The supplied duration is a valid human-expert completion-time estimate; task labels alone do not measure duration.',
            'The selected 50% or 80% benchmark success target is meaningful for the task; neither is full-workflow reliability.',
            'Model-point resampling and alternative fit windows are sensitivity diagnostics, not calibrated future confidence intervals.'
        ],
        'limitations': [
            'No empirical estimate is supplied for 99%, 99.9% or 100% success.',
            'Measurements above 16 hours are unreliable with this suite; larger requested thresholds extrapolate outside its measured range.',
            'Published horizon confidence bounds share task and measurement uncertainty; this simple regression does not independently model that covariance.',
            'The point estimates use the same later-measured suite for old and new models; release-date holdouts are retrospective, not genuine historical forecasts.',
            'Task duration is not a complete difficulty measure; a 2026 statistical reanalysis reports nonlinearities in its relation to AI success.',
            'Software benchmarks do not establish arbitrary business judgment, social acceptance, physical capability, deployment cost or entire-job automation.',
            'Unobserved model releases, changed scaffolds, data contamination and changing benchmark composition can affect observed trends.',
        ],
        'evidenceIds': ['metr-horizon', 'metr-th11', 'metr-horizon-data', 'metr-horizon-validity']
    }
    for metric in ('p50', 'p80'):
        output['fits'][metric] = {'primary': fit(primary, metric), 'allComparableModels': fit(eligible, metric), 'frontierSince2024': fit(recent, metric)}
        output['validation'][metric] = validation(primary, metric)
        rng = random.Random(20261031 + (50 if metric == 'p50' else 80))
        pairs = []
        for _ in range(1000):
            sample = [rng.choice(primary) for _ in primary]
            try:
                model = fit(sample, metric)
            except ValueError:
                continue
            if model['slopeLog2MinutesPerDay'] > 0:
                pairs.append([model['interceptLog2Minutes'], model['slopeLog2MinutesPerDay']])
        output['bootstrap'][metric] = {'kind': 'model-point resampling sensitivity', 'seed': 20261031 + (50 if metric == 'p50' else 80),
                                       'iterations': len(pairs), 'coefficientPairs': pairs}
    # Reproduction guard against data-parser mistakes: match METR's published same-suite fit.
    official = float(re.search(r'from_2023_on:\n(?:    .+\n)*?    point_estimate: ([\d.]+)', raw.decode()).group(1))
    output['metadata']['officialP50DoublingDays'] = official
    output['metadata']['reproductionDifferenceDays'] = output['fits']['p50']['primary']['doublingDays'] - official
    if abs(output['metadata']['reproductionDifferenceDays']) > .01:
        raise ValueError('Fit no longer reproduces official p50 trend; inspect source changes before releasing.')
    destination = ROOT / 'dist/data/digital-calibration.json'
    destination.write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
    # Browser-compatible generated constants avoid JSON module assertions or network access.
    compact = {key: output[key] for key in ('metadata', 'fits', 'validation', 'bootstrap', 'assumptions', 'limitations', 'evidenceIds')}
    (ROOT / 'dist/digital-calibration-data.js').write_text('// Generated by scripts/calibrate-digital.py; do not hand edit.\nexport default ' + json.dumps(compact, separators=(',', ':')) + ';\n')
    print(json.dumps({'observations': len(rows), 'primaryN': len(primary), 'p50DoublingDays': output['fits']['p50']['primary']['doublingDays'],
                      'p80DoublingDays': output['fits']['p80']['primary']['doublingDays'],
                      'p50HoldoutRmseFactor': output['validation']['p50']['rmseMultiplicativeFactor'],
                      'p80HoldoutRmseFactor': output['validation']['p80']['rmseMultiplicativeFactor']}, indent=2))


if __name__ == '__main__':
    main()
