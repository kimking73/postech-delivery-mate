#!/usr/bin/env python3
"""작업(태그) 관리 도구. 표준 라이브러리만 쓴다.

사용법 (저장소 루트에서):
  python3 docs/tasks/task.py show SV5          # 작업 상세 + 선행 작업 상태 + 참조 + 수정 허용 경로
  python3 docs/tasks/task.py set SV5 doing     # 상태 변경(todo|doing|done) 후 timeline.md 재생성
  python3 docs/tasks/task.py status            # 전체 진행 현황(완료·진행·막힘·시작 가능)
  python3 docs/tasks/task.py gen               # tasks.json → docs/timeline.md 재생성
  python3 docs/tasks/task.py html OUT.html     # 사람용 타임라인 아티팩트 HTML 생성(선택)
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TASKS = os.path.join(ROOT, "docs", "tasks", "tasks.json")
TEMPLATE = os.path.join(ROOT, "docs", "tasks", "template.html")
TIMELINE = os.path.join(ROOT, "docs", "timeline.md")
STATUSES = ("todo", "doing", "done")
LABEL = {"todo": "⬜ todo", "doing": "🟨 doing", "done": "✅ done"}


def load():
    with open(TASKS, encoding="utf-8") as f:
        return json.load(f)


def save(D):
    with open(TASKS, "w", encoding="utf-8") as f:
        f.write(json.dumps(D, ensure_ascii=False, indent=2) + "\n")


def index(D):
    return {t["id"]: t for t in D["tasks"]}


def find(D, tid):
    tid = tid.strip().upper()
    t = index(D).get(tid)
    if not t:
        sys.exit(f"작업 {tid}을(를) 찾을 수 없음. 태그 예: FE3, CL4, SV5, J2")
    return t


def span(t):
    return f"Day {t['s']}" + (f"–{t['e']}" if t["e"] != t["s"] else "")


def lane_name(D, k):
    for l in D["lanes"]:
        if l["k"] == k:
            return l["n"]
    return k


def validate(D):
    ids = index(D)
    for t in D["tasks"]:
        assert t["status"] in STATUSES, f"{t['id']}: 잘못된 status {t['status']}"
        for d in t["dep"]:
            assert d in ids, f"{t['id']}: 없는 선행 작업 {d}"
        assert 1 <= t["s"] <= t["e"] <= D["days"], f"{t['id']}: 기간 오류"


# ---------- commands ----------
def cmd_show(D, tid):
    t = find(D, tid)
    ids = index(D)
    print(f"[{t['id']}] {t['t']}  ({lane_name(D, t['l'])}, {span(t)}, 상태: {t['status']})")
    print(f"요약: {t['sum']}")
    print("세부 작업:")
    for i, w in enumerate(t["w"], 1):
        print(f"  {i}. {w}")
    print("산출물: " + (", ".join(t["out"]) or "없음"))
    print("완료 기준: " + (t["done"] or "없음"))
    print("선행 작업:")
    if not t["dep"]:
        print("  없음")
    for d in t["dep"]:
        print(f"  {d} {ids[d]['t']} — {ids[d]['status']}")
    nxt = [x["id"] for x in D["tasks"] if t["id"] in x["dep"]]
    print("후속 작업: " + (", ".join(nxt) or "없음"))
    print("참조 문서: " + ", ".join(t["refs"]))
    print("수정 허용 경로: " + ", ".join(t["paths"]))
    blocked = [d for d in t["dep"] if ids[d]["status"] != "done"]
    print("시작 가능: " + ("예" if not blocked else "아니오 (미완료 선행: " + ", ".join(blocked) + ")"))


def cmd_set(D, tid, st):
    if st not in STATUSES:
        sys.exit("상태는 todo | doing | done 중 하나")
    t = find(D, tid)
    old = t["status"]
    t["status"] = st
    save(D)
    gen(D)
    print(f"{t['id']}: {old} → {st}. timeline.md 재생성 완료.")


def cmd_status(D):
    ids = index(D)
    done = [t for t in D["tasks"] if t["status"] == "done"]
    doing = [t for t in D["tasks"] if t["status"] == "doing"]
    todo = [t for t in D["tasks"] if t["status"] == "todo"]
    ready = [t for t in todo if all(ids[d]["status"] == "done" for d in t["dep"])]
    blocked = [t for t in todo if t not in ready]
    print(f"완료 {len(done)}/{len(D['tasks'])}")
    print("진행 중: " + (", ".join(f"{t['id']} {t['t']}" for t in doing) or "없음"))
    print("시작 가능: " + (", ".join(f"{t['id']}({span(t)})" for t in sorted(ready, key=lambda x: x['s'])) or "없음"))
    print("막힘: " + (", ".join(f"{t['id']}←" + "/".join(d for d in t['dep'] if ids[d]['status'] != 'done') for t in sorted(blocked, key=lambda x: x['s'])[:12]) or "없음"))
    for l in D["lanes"]:
        ts = [t for t in D["tasks"] if t["l"] == l["k"]]
        n = sum(1 for t in ts if t["status"] == "done")
        print(f"  {l['n']}: {n}/{len(ts)}")


def gen(D):
    validate(D)
    title = {t["id"]: t["t"] for t in D["tasks"]}
    L = []
    a = L.append
    a(f"# {D['title']}\n")
    a("> ⚠️ 이 파일은 `docs/tasks/tasks.json`에서 생성된다. 직접 고치지 말고 `python3 docs/tasks/task.py gen`을 실행한다.  ")
    a("> 기준 문서: [기획서](./기획서.md), [아키텍처](./아키텍처.md)  ")
    a("> 기간: 10일(Day 1–10), 순서 기준. 실제 시작일은 팀 일정에 맞춰 정한다.  ")
    a("> 목표: Day 10에 MUST 기능을 갖춘 베타 빌드를 TestFlight / Play 내부 테스트에 올린다. 스토어 심사와 공개 베타는 그다음 주.  ")
    a("> 사람용 현황판: 아티팩트 \"배달메이트 2주 개발 타임라인\"(체크는 사람이 직접, AI는 이 저장소의 tasks.json만 본다).\n")
    a("## 레인(역할)\n")
    a("| 레인 | 담당 범위 | 수정 허용 경로(기본) |\n|---|---|---|")
    for l in D["lanes"]:
        ex = next((t for t in D["tasks"] if t["l"] == l["k"] and t["paths"] != ["**"]), None)
        a(f"| **{l['n']}** | {l['d']} | {', '.join('`'+p+'`' for p in (ex['paths'] if ex else []))} |")
    a("\n**경계 규칙**: FE는 CL이 만든 훅만 쓴다(서버가 준비되기 전에는 같은 타입의 목 훅). CL은 DB를 직접 고치지 않고 SV에 요청한다. SV는 RPC를 바꿀 때 [아키텍처 §4](./아키텍처.md)를 먼저 고치고 공지한다.\n")
    a("## 마일스톤\n")
    a("| 순서 | 마일스톤 | 완료 기준 |\n|---|---|---|")
    for t in D["tasks"]:
        if t["l"] == "J" and t["s"] in D["ms"]:
            a(f"| Day {t['s']} | {t['id']} {t['t']} | {t['done']} |")
    a("")
    a("## 작업 상태\n")
    a("한 줄에 작업 하나. 상태는 `task.py set`으로만 바꾼다.\n")
    a("| 태그 | 작업 | 레인 | 기간 | 선행 | 상태 |\n|---|---|---|---|---|---|")
    for t in D["tasks"]:
        a(f"| {t['id']} | {t['t']} | {t['l']} | {span(t)} | {', '.join(t['dep']) or '—'} | {LABEL[t['status']]} |")
    a("")
    a("## 순서별 보기\n")
    a("| 순서 | " + " | ".join(l["n"] for l in D["lanes"]) + " |\n|---|" + "---|" * len(D["lanes"]))
    for d in range(1, D["days"] + 1):
        cells = []
        for l in D["lanes"]:
            ts = [t for t in D["tasks"] if t["l"] == l["k"] and t["s"] <= d <= t["e"]]
            cells.append("<br>".join(f"{t['id']} {t['t']}" for t in ts) or "—")
        a(f"| **Day {d}** | " + " | ".join(cells) + " |")
    a("")
    a("## 작업 상세\n")
    for l in D["lanes"]:
        a(f"### {l['n']}\n")
        for t in sorted([t for t in D["tasks"] if t["l"] == l["k"]], key=lambda t: (t["s"], t["e"])):
            a(f"#### {t['id']} · {t['t']}  \n`{span(t)}` · {t['e']-t['s']+1}일 · {(t['s']-1)//D['wl']+1}주차\n")
            a(f"{t['sum']}\n")
            a("**세부 작업**")
            for i, w in enumerate(t["w"], 1):
                a(f"{i}. {w}")
            a("")
            dep = ", ".join(f"{d} {title[d]}" for d in t["dep"]) or "없음"
            a("| 산출물 | 선행 작업 | 완료 기준 |\n|---|---|---|")
            a(f"| {', '.join(t['out']) or '없음'} | {dep} | {t['done']} |\n")
            a(f"참조: {', '.join(t['refs'])} · 수정 허용: {', '.join('`'+p+'`' for p in t['paths'])}\n")
    a("## 메모\n")
    for nt in D["notes"]:
        a(f"### {nt['h']}")
        for x in [x.strip() for x in nt["b"].split("\n") if x.strip()]:
            a(f"- {x}")
        a("")
    a("## 협업 규칙\n")
    a("- **작업 지시**: Claude Code에 태그를 말한다(`SV5 해줘`, `/task SV5`). 절차는 `.claude/skills/task/SKILL.md`.")
    a("- **스탠드업**: 매일 10:00, 15분. 어제 한 일, 오늘 할 일, 막힌 것.")
    a("- **브랜치**: `feat/<레인 소문자>-<태그>-<요약>` (예: `feat/sv-SV5-join-post`) → `main`. PR 리뷰 1명, CI 통과 필수. 동결(Day 8) 후에는 `fix/*`만.")
    a("- **계약 변경**: SV가 아키텍처 §4 수정 → `types/database.ts` 재생성 커밋 → CL이 훅 갱신 → FE에 공지.")
    a("- **30분 규칙**: 30분 넘게 막히면 바로 공유. 일정에 영향이 있으면 그날 스탠드업에서 범위를 다시 조정한다.")
    with open(TIMELINE, "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")


def cmd_html(D, out):
    validate(D)
    V = json.loads(json.dumps(D))
    V.pop("_comment", None)
    for t in V["tasks"]:
        t["c"] = t["status"] == "done"
        for k in ("status", "refs", "paths"):
            t.pop(k, None)
    st = json.dumps(V, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")
    with open(TEMPLATE, encoding="utf-8") as f:
        html = f.read().replace("__STATE__", st)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"{out} 생성 ({len(html)} bytes)")


def main(argv):
    if len(argv) < 2:
        sys.exit(__doc__)
    D = load()
    c = argv[1]
    if c == "show" and len(argv) == 3:
        cmd_show(D, argv[2])
    elif c == "set" and len(argv) == 4:
        cmd_set(D, argv[2], argv[3].lower())
    elif c == "status":
        cmd_status(D)
    elif c == "gen":
        gen(D)
        print("timeline.md 재생성 완료.")
    elif c == "html" and len(argv) == 3:
        cmd_html(D, argv[2])
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv)
