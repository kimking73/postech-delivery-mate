# CLAUDE.md

POSTECH 구성원 전용 **배달음식 공동구매 매칭 앱**이다. 앱 이름은 임시로 `APP_NAME`을 쓴다.
사용자가 모집 글을 올리면 다른 사람들이 참여하고 그룹 채팅으로 소통한다. 주문, 결제, 정산은 사용자끼리 알아서 하고, 앱은 사람을 모으는 데에만 집중한다.
3명(FE 프론트엔드, CL 클라이언트, SV 서버)이 10일 동안 개발해서 App Store와 Play Store에 출시한다.

## 문서 지도 (우선순위 순)
| 문서 | 내용 | 언제 읽나 |
|---|---|---|
| `docs/아키텍처.md` | **구현 기준**: 스키마, RPC 명세, RLS, 인증, 채팅, 푸시, 폴더 구조, 환경, 보안 | 작업의 `refs`에 적힌 절만 읽는다 |
| `docs/기획서.md` | 기능 범위(MUST, SHOULD, LATER), POSTECH 인증 정책, 지표 | 기능 범위가 애매할 때 |
| `docs/tasks/tasks.json` | **작업 39개의 기준 데이터**: 태그, 기간, 세부 작업, 선행 작업, 완료 기준, 참조 문서, 수정 허용 경로, 상태 | 작업 태그를 받았을 때 |
| `docs/timeline.md` | tasks.json에서 생성한 읽기용 문서. **직접 고치지 않는다** | 사람이 읽는 용도 |

문서끼리 내용이 다르면 아키텍처.md, 기획서.md, timeline.md 순서로 따른다. 명세와 다르게 구현해야 하면 사람의 승인을 받고, 같은 PR에서 아키텍처.md도 고친다.

## 작업 태그 처리
- 메시지에 `FE3`, `CL4`, `SV5`, `J2` 같은 태그가 있으면 **`.claude/skills/task/SKILL.md`의 절차를 따른다.** `/task SV5`로 불러도 같다.
- 작업 브랜치에서 "이어서 해줘"라고 하면 브랜치 이름에서 태그를 찾는다.
- 작업 상태는 `docs/tasks/tasks.json`에만 기록한다. 사람용 현황판(claude.ai 아티팩트)은 읽지도 쓰지도 않는다.
- 상태를 바꿀 때는 tasks.json을 손으로 고치지 않고 반드시 아래 도구를 쓴다.

```bash
python3 docs/tasks/task.py show SV5          # 작업 상세, 선행 상태, 참조, 수정 허용 경로
python3 docs/tasks/task.py set SV5 doing     # todo | doing | done. timeline.md도 자동 재생성
python3 docs/tasks/task.py status            # 전체 현황
python3 docs/tasks/task.py gen               # timeline.md만 재생성
```

## 역할 경계
- **FE:** 화면과 UI만 만든다(`app/**` 화면, `src/components/**`, `src/features/*/components/**`). 데이터는 CL이 만든 훅으로만 가져오고, 훅이 아직 없으면 같은 타입의 목 훅을 쓴다.
- **CL:** 앱 로직을 맡는다(`src/lib/**`, `src/features/*/{api,hooks,schema}.ts`, `app/_layout.tsx`, `app.config.ts`, `eas.json`, `web/**`). DB는 직접 고치지 않는다.
- **SV:** 서버를 맡는다(`supabase/**`, `.github/workflows/**`). RPC의 입력, 출력, 에러 코드를 바꿀 때는 아키텍처 §4를 먼저 고치고 `types/database.ts`를 다시 생성한다.
- 작업의 `paths` 밖을 고쳐야 하면 직접 고치지 않는다. 담당 레인에 보낼 GitHub 이슈 초안을 만든다.

## Git 규칙
- **브랜치:** `feat/<레인 소문자>-<태그>-<요약>` (예: `feat/cl-CL3-auth`). 기능 동결(Day 8) 이후에는 `fix/*`만 만든다. 상태만 바꿀 때는 `chore/status-<태그>`를 쓴다.
- **커밋:** `<태그>: <요약>`. 문서만 바꿀 때는 `docs: <요약>`.
- **PR 제목:** `[<태그>] <작업명>`. PR은 1명 이상 리뷰하고 CI를 통과해야 머지한다.
- **충돌:**
  - `docs/timeline.md`는 충돌을 직접 풀지 말고 `task.py gen`으로 다시 생성한다.
  - `tasks.json`의 status는 더 진행된 값을 고른다(todo < doing < done).
- **비밀값 금지:** `.env*`, service_role 키, SMTP 비밀번호, 인증서(`.p8`, `.jks`)는 커밋하지 않는다.

## 기술 스택 요약
Expo(dev client, Expo Router, TS strict) · TanStack Query · Zustand · NativeWind · FlashList · Supabase(서울 리전: Postgres, RLS, RPC, Realtime Broadcast, pg_cron, pgmq, Edge Functions) · Resend SMTP · Expo Push · Sentry · PostHog · EAS. 자세한 내용은 아키텍처 §0과 §1에 있다.

## 현재 상태
- 앱 코드는 아직 없다. 첫 작업은 `J1`(킥오프), `CL1`(Expo 골격), `SV1`(Supabase 환경), `SV2`(도메인·Resend), `FE1`(디자인 토큰)이다.
- 아직 임시 값인 것: 앱 이름, 도메인(`example.kr`), 생활 구역 목록, 픽업 장소 목록.
