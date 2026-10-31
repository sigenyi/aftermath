#!/usr/bin/env python3
"""Import the complete English ESCO 1.2.1 catalogue and ISCO-08 unit groups.

Uses the European Commission's documented public API, pinned to a release.
No registration tokens or private endpoints are used. Only Python stdlib needed.
Run from the repository root: python3 scripts/import-esco.py
Raw source caches stay under work/esco; published outputs go under dist/data.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import gzip
import hashlib
import json
import math
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "work/esco"
OUT = ROOT / "dist/data"
VERSION = "v1.2.1"
EXPECTED_ESCO = 3039
EXPECTED_ISCO = 436
LIMIT = 100
ESCO_BASE = "https://ec.europa.eu/esco/api/search"
ISCO_URL = "https://www.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN%20Structure%20and%20definitions.xlsx"
ISCO_PAGE = "https://ilostat.ilo.org/methods/concepts-and-definitions/classification-occupation/"
ESCO_ATTRIBUTION = "This service uses the ESCO classification of the European Commission."
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def source_url(page: int) -> str:
    # The ESCO API's offset parameter is a PAGE number, not a row offset.
    return ESCO_BASE + "?" + urllib.parse.urlencode({
        "type": "occupation", "language": "en", "limit": LIMIT,
        "offset": page, "full": "true", "selectedVersion": VERSION,
    })


def download(url: str, destination: Path) -> bytes:
    if destination.exists():
        return destination.read_bytes()
    for attempt in range(6):
        try:
            request = urllib.request.Request(url, headers={
                "User-Agent": "AFTERMATH-OpenOccupationCatalogue/1.0",
                "Accept-Encoding": "gzip",
            })
            with urllib.request.urlopen(request, timeout=150) as response:
                data = response.read()
                if response.headers.get("Content-Encoding") == "gzip":
                    data = gzip.decompress(data)
            # Write only a completed download; interrupted downloads never become cache hits.
            temporary = destination.with_suffix(destination.suffix + ".partial")
            temporary.write_bytes(data)
            temporary.replace(destination)
            print("Downloaded", destination.name, len(data), flush=True)
            return data
        except Exception:
            if attempt == 5:
                raise
            time.sleep(min(2 ** attempt, 20))
    raise AssertionError("unreachable")


def load_esco_page(page: int) -> tuple[int, dict, str]:
    raw = download(source_url(page), CACHE / f"page-{page:04d}.json")
    parsed = json.loads(raw)
    assert parsed.get("total") == EXPECTED_ESCO, (page, parsed.get("total"))
    assert parsed.get("offset") == page, (page, parsed.get("offset"))
    assert len(parsed["_embedded"]["results"]) == min(LIMIT, EXPECTED_ESCO - page * LIMIT)
    return page, parsed, sha256(raw)


def workbook_rows(raw: bytes) -> list[dict]:
    # The official workbook uses shared strings; preserve leading zeros in codes.
    import io
    with zipfile.ZipFile(io.BytesIO(raw)) as archive:
        strings = ["".join(n.itertext()) for n in ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", NS)]
        sheet = ET.fromstring(archive.read("xl/worksheets/sheet1.xml"))
        rows = []
        for row in sheet.findall("m:sheetData/m:row", NS):
            cells = {}
            for cell in row.findall("m:c", NS):
                value = cell.find("m:v", NS)
                if value is None:
                    continue
                text = value.text or ""
                if cell.get("t") == "s":
                    text = strings[int(text)]
                cells[re.sub(r"\d+", "", cell.get("r", ""))] = text.strip()
            if cells.get("A", "").isdigit():
                rows.append(cells)
    return rows


def normalise_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def literal(record: dict, key: str) -> str:
    value = record.get(key, {}).get("en", "")
    return normalise_text(value.get("literal", "") if isinstance(value, dict) else value)


def skill_link(link: dict, relation: str) -> dict:
    uri = link["uri"]
    source_id = "esco:" + uri.rsplit("/", 1)[-1]
    return {
        "id": source_id,
        "label": normalise_text(link["title"]),
        "sourceId": source_id,
        "type": relation,
        "skillType": link.get("skillType", "").rsplit("/", 1)[-1] or "unspecified",
    }


def write_json(path: Path, metadata: dict, roles: list[dict]) -> None:
    # Hash the canonical roles payload (metadata itself contains that hash).
    canonical = json.dumps(roles, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    metadata["sha256"] = sha256(canonical)
    metadata["sha256Scope"] = "roles serialized as UTF-8 JSON, sorted keys, compact separators"
    path.write_text(json.dumps({"metadata": metadata, "roles": roles}, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(path.relative_to(ROOT), len(roles), "roles", path.stat().st_size, "bytes", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=3, help="API download concurrency, 1–4")
    args = parser.parse_args()
    assert 1 <= args.workers <= 4
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    raw_isco = download(ISCO_URL, CACHE / "isco08.xlsx")
    rows = workbook_rows(raw_isco)
    major = {r["B"].zfill(1): r["C"] for r in rows if r["A"] == "1"}
    unit = {r["B"].zfill(4): r for r in rows if r["A"] == "4"}
    assert len(unit) == EXPECTED_ISCO
    pages = {}
    hashes = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        for page, record, digest in executor.map(load_esco_page, range(math.ceil(EXPECTED_ESCO / LIMIT))):
            pages[page] = record
            hashes[str(page)] = digest
            print("Verified ESCO page", page + 1, "of", math.ceil(EXPECTED_ESCO / LIMIT), flush=True)
    all_records = [r for page in sorted(pages) for r in pages[page]["_embedded"]["results"]]
    assert len(all_records) == EXPECTED_ESCO
    assert len({r["uri"] for r in all_records}) == EXPECTED_ESCO, "Duplicate or skipped API pages"
    esco_roles = []
    for r in all_records:
        code = r["code"]
        isco_code = code.split(".")[0].zfill(4)
        assert isco_code in unit, (r["title"], code)
        links = r["_links"]
        essential = [skill_link(s, "essential-skill") for s in links.get("hasEssentialSkill", [])]
        optional = [skill_link(s, "optional-skill") for s in links.get("hasOptionalSkill", [])]
        assert len({s["id"] for s in essential}) == len(essential)
        assert len({s["id"] for s in optional}) == len(optional)
        aliases = list(dict.fromkeys(normalise_text(s) for s in r.get("alternativeLabel", {}).get("en", [])))
        esco_roles.append({
            "id": "esco:" + r["uri"].rsplit("/", 1)[-1],
            "title": r["preferredLabel"]["en"],
            "aliases": aliases,
            "description": literal(r, "description"),
            "scopeNote": literal(r, "scopeNote"),
            "sector": major[isco_code[0]],
            "source": "esco", "sourceCode": code, "sourceUrl": r["uri"],
            "iscoCode": isco_code, "tasks": essential, "optionalSkills": optional,
            "features": {}, "coverage": "skills" if essential else "description",
            "requirementKind": "Essential skill and knowledge proxies; not enumerated job duties",
        })
    esco_roles.sort(key=lambda r: (r["title"].casefold(), r["id"]))
    retrieved_at = datetime.fromtimestamp(max(p.stat().st_mtime for p in CACHE.glob("page-*.json")), timezone.utc).isoformat(timespec="seconds")
    esco_counts = {
        "roles": len(esco_roles), "expectedRoles": EXPECTED_ESCO,
        "aliases": sum(len(r["aliases"]) for r in esco_roles),
        "essentialSkillRelationships": sum(len(r["tasks"]) for r in esco_roles),
        "optionalSkillRelationships": sum(len(r["optionalSkills"]) for r in esco_roles),
        "distinctReferencedSkills": len({s["id"] for r in esco_roles for s in r["tasks"] + r["optionalSkills"]}),
        "rolesWithoutDescription": sum(not r["description"] for r in esco_roles),
        "rolesWithoutEssentialSkills": sum(not r["tasks"] for r in esco_roles),
        "relationshipsWithUnspecifiedSkillType": sum(s["skillType"] == "unspecified" for r in esco_roles for s in r["tasks"] + r["optionalSkills"]),
        "iscoGroupsRepresented": len({r["iscoCode"] for r in esco_roles}),
        "omittedOccupationConcepts": 0,
    }
    esco_metadata = {
        "version": "ESCO 1.2.1", "releaseDate": "2025-12-10", "retrievedAt": retrieved_at,
        "language": "en", "scope": "Complete English released ESCO occupation concepts; other languages and obsolete concepts excluded.",
        "urls": ["https://esco.ec.europa.eu/en/use-esco/download", "https://esco.ec.europa.eu/en/use-esco/use-esco-services-api", source_url(0)],
        "license": "European Commission Decision 2011/833/EU; free reuse with acknowledgement and indication of modifications.",
        "licenseUrl": "https://esco.ec.europa.eu/en/about-esco/faq?page=1",
        "attribution": ESCO_ATTRIBUTION,
        "adaptation": "English selection, whitespace normalization, source fields restructured as JSON; no source labels or requirements intentionally changed.",
        "counts": esco_counts, "sourcePageSha256": hashes,
        "requirements": "tasks holds all essential skill/knowledge links as proxies. optionalSkills preserves all optional links separately, never silently required for every worker. These are classification requirements, not observed time-on-task or automation dates.",
    }
    write_json(OUT / "esco.json", esco_metadata, esco_roles)
    # ISCO's old definitions are copyrighted; its 2012/2021 files do not inherit
    # ILO's 2023 open-data licence automatically. Publish the factual code/title
    # catalogue with linked-source and ESCO mapping, not the old prose/duties.
    related = {}
    for r in esco_roles:
        related.setdefault(r["iscoCode"], []).append(r["id"])
    isco_roles = [{
        "id": "isco:" + code, "title": row["C"], "aliases": [],
        "description": "", "sector": major[code[0]],
        "source": "isco", "sourceCode": code, "sourceUrl": ISCO_PAGE,
        "iscoCode": code, "tasks": [], "features": {}, "coverage": "classification",
        "relatedEscoIds": related.get(code, []),
        "recordKind": "ISCO-08 unit group (an occupational category, not an individual job)",
    } for code, row in sorted(unit.items())]
    isco_metadata = {
        "version": "ISCO-08", "releaseDate": "2008", "retrievedAt": retrieved_at,
        "language": "en", "scope": "All 436 factual ISCO-08 unit-group codes and titles; original definition/duty prose is linked, not redistributed.",
        "urls": [ISCO_PAGE, ISCO_URL],
        "license": "Factual classification codes and short titles only. Copyright International Labour Organization. The source predates the 2023 open-data policy; no CC BY licence is asserted for its definitions/duties.",
        "licenseUrl": "https://www.ilo.org/rights-and-permissions",
        "attribution": "International Standard Classification of Occupations (ISCO-08), International Labour Organization.",
        "counts": {"roles": len(isco_roles), "expectedUnitGroups": EXPECTED_ISCO, "majorGroups": len(major), "groupsWithEscoMappings": len(related), "omittedUnitGroups": 0, "definitionAndDutyProseNotRedistributed": EXPECTED_ISCO},
        "sourceSha256": sha256(raw_isco),
        "limitations": "ISCO groups intentionally have no copied duty statements or automatic inheritance of all child ESCO skills. Forecasting must show category scope and classification-only coverage, or use a selected mapped ESCO role.",
    }
    write_json(OUT / "isco.json", isco_metadata, isco_roles)
    print(json.dumps({"esco": esco_counts, "isco": isco_metadata["counts"]}, indent=2), flush=True)


if __name__ == "__main__":
    main()
