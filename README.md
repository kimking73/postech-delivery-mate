# postech-delivery-mate

POSTECH 구성원 전용 배달음식 공동구매 매칭 앱입니다(앱 이름은 임시).
모집 글을 올리면 사람들이 참여해 그룹 채팅으로 이야기하고, 주문과 정산은 참여자끼리 직접 합니다. 앱은 사람을 모으는 데에만 집중합니다.

## 팀 (5인)
| 담당 | 역할 | 맡는 작업 |
|---|---|---|
| P1 FE(혜인이) | 프론트엔드 개발: 앱 뼈대, 공용 부품, 모든 화면 코딩 | FE12, FE2–FE9, FE10a, FE11 |
| P2 디자인(민준이) | 디자인: 디자인 규칙, 화면 시안(코딩 순서대로), 매일 검수, 문구, 아이콘, 스토어 사진 | FE1, DS1–DS8, FE10b |
| P3 CL(재민이) | 인증 세션, 데이터 훅, 실시간 채팅, 푸시 클라이언트 | CL2–CL6, CL7a |
| P4 SV(하린이) | 스키마, RLS, RPC, 채팅 방송, 신고·제재 | SV1, SV3–SV7, SV9 |
| P5 OPS(김종연) | Expo·EAS, 도메인·메일, 푸시 워커, 딥링크, 운영 환경, 약관·스토어 | CL1, SV2, OP1–OP3, SV8, CL7b, CL8, SV10, CL9, SV11 |
| 공동 | 킥오프, 계약 고정, 데모, 동결, QA, 베타 | J1–J8 |

태그 접두사(FE, DS, CL, SV, OP, J)는 작업 종류이고 담당자와 다를 수 있습니다. 담당자별 수정 범위는 `tasks.json`의 각 작업 `paths`에 있습니다.

## 문서
| 문서 | 내용 |
|---|---|
| [기획서.md](docs/기획서.md) | 기능 범위(MUST/SHOULD/LATER), POSTECH 메일 인증 정책, 성공 지표 |
| [아키텍처.md](docs/아키텍처.md) | 구현 기준: 시스템 구성, DB 스키마, RPC 명세, RLS, 채팅·푸시, 환경, 보안 |
| [타임라인.md](docs/timeline.md) | 5인 10일 개발 일정, 작업 56개와 상태 (`docs/tasks/tasks.json`에서 생성) |
| [timeline.html](docs/timeline.html) | 최종 아티팩트와 같은 간트 페이지. 브라우저로 열면 볼 수 있다(저장은 아티팩트에서만) |
| [CLAUDE.md](CLAUDE.md) | Claude Code 작업 규칙: 문서 우선순위, 역할 경계, Git 규칙 |
| [작업 태그 절차](.claude/skills/task/SKILL.md) | `SV5 해줘`처럼 태그로 지시할 때 AI가 따르는 절차 |

## 타임라인 보기 (아티팩트)
- **[배달메이트 2주 개발 타임라인](https://claude.ai/artifact/Hv37uEizDEpgTyRJRp13zL)**: 최종 현황판입니다. 레인은 담당자, 막대 색은 작업 종류입니다. 같은 페이지가 저장소에 [`docs/timeline.html`](docs/timeline.html)로 있습니다.
  - 막대를 누르면 세부 내용이 열립니다. 맨 위 "쉽게 말하면" 상자는 비전공자용 설명입니다.
  - **완료 표시만 할 수 있습니다:** 막대 → "완료로 표시" → 상단 **"저장"**. 작업 추가·수정·삭제는 페이지에서 하지 않습니다.
- 작업 내용을 바꾸려면 저장소의 `tasks.json`을 고치고 `python3 docs/tasks/task.py gen`을 실행합니다. `timeline.md`와 `timeline.html`이 함께 다시 만들어지고, `timeline.html`을 아티팩트에 다시 게시하면 됩니다. 다시 게시하면 페이지의 완료 체크가 `tasks.json`의 status 기준으로 바뀌니, 게시 전에 페이지의 체크를 `task.py set`으로 옮겨 두세요.
- AI는 페이지를 보지 않고 `docs/tasks/tasks.json`만 봅니다.
- claude.ai 로그인이 필요하고, 소유자가 공유해 준 사람만 열 수 있습니다.

## 작업하는 법
```bash
git clone https://github.com/kimking73/postech-delivery-mate.git
cd postech-delivery-mate
claude
```
Claude Code에서 작업 태그로 지시하면 됩니다.

| 이렇게 말하면 | 이렇게 동작 |
|---|---|
| `SV5 해줘` / `/task SV5` | 선행 작업 확인 → 브랜치 생성 → 계획 → 구현 → 완료 기준 검증 → 완료 표시 → PR |
| `이어서 해줘` | 현재 브랜치 이름에서 태그를 찾아 남은 작업부터 진행 |
| `SV2 완료 처리해줘` | 상태만 변경 |
| `진행 상황 알려줘` | 완료·진행 중·시작 가능·막힌 작업 요약 |

작업 상태를 직접 보거나 바꾸려면 아래 명령을 씁니다.
```bash
python3 docs/tasks/task.py status         # 전체 현황
python3 docs/tasks/task.py status --owner P3   # 내 작업만(P1~P5 또는 이름)
python3 docs/tasks/task.py show SV5       # 작업 상세
python3 docs/tasks/task.py set SV5 done   # 상태 변경(timeline.md 자동 재생성)
```
