# postech-delivery-mate

POSTECH 구성원 전용 배달음식 공동구매 매칭 앱입니다(앱 이름은 임시).
모집 글을 올리면 사람들이 참여해 그룹 채팅으로 이야기하고, 주문과 정산은 참여자끼리 직접 합니다. 앱은 사람을 모으는 데에만 집중합니다.

## 문서
| 문서 | 내용 |
|---|---|
| [기획서](docs/기획서.md) | 기능 범위(MUST/SHOULD/LATER), POSTECH 메일 인증 정책, 성공 지표 |
| [아키텍처](docs/아키텍처.md) | 구현 기준: 시스템 구성, DB 스키마, RPC 명세, RLS, 채팅·푸시, 환경, 보안 |
| [타임라인](docs/timeline.md) | 3인(FE·CL·SV) 10일 개발 일정, 작업 39개와 상태 (`docs/tasks/tasks.json`에서 생성) |
| [CLAUDE.md](CLAUDE.md) | Claude Code 작업 규칙: 문서 우선순위, 역할 경계, Git 규칙 |
| [작업 태그 절차](.claude/skills/task/SKILL.md) | `SV5 해줘`처럼 태그로 지시할 때 AI가 따르는 절차 |

## 타임라인 현황판
- **[배달메이트 2주 개발 타임라인](https://claude.ai/artifact/SRev9uoC3jv47UKhS7Jnz2)**: 작업 막대를 눌러 세부 내용을 보고, 완료 체크와 편집을 할 수 있는 간트입니다.
- 사람이 직접 체크하는 현황판입니다. AI는 이 페이지가 아니라 `docs/tasks/tasks.json`만 봅니다.
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
python3 docs/tasks/task.py show SV5       # 작업 상세
python3 docs/tasks/task.py set SV5 done   # 상태 변경(timeline.md 자동 재생성)
```
