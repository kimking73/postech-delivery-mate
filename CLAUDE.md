# CLAUDE.md

POSTECH 구성원 전용 **배달음식 공동구매 매칭 앱**이다. 앱 이름은 임시로 `APP_NAME`을 쓴다.
사용자가 모집 글을 올리면 다른 사람들이 참여하고 그룹 채팅으로 소통한다. 주문, 결제, 정산은 사용자끼리 알아서 하고, 앱은 사람을 모으는 데에만 집중한다.
5명(P1 프론트엔드, P2 디자인, P3 클라이언트, P4 서버, P5 플랫폼·운영)이 10일 동안 개발해서 App Store와 Play Store에 출시한다.

## 문서 지도 (우선순위 순)
| 문서 | 내용 | 언제 읽나 |
|---|---|---|
| `docs/아키텍처.md` | **구현 기준**: 스키마, RPC 명세, RLS, 인증, 채팅, 푸시, 폴더 구조, 환경, 보안 | 작업의 `refs`에 적힌 절만 읽는다 |
| `docs/기획서.md` | 기능 범위(MUST, SHOULD, LATER), POSTECH 인증 정책, 지표 | 기능 범위가 애매할 때 |
| `docs/tasks/tasks.json` | **작업 56개의 기준 데이터**: 태그, 담당자(레인), 기간, 세부 작업, 선행 작업, 완료 기준, 참조 문서, 수정 허용 경로, 상태 | 작업 태그를 받았을 때 |
| `docs/timeline.md` | tasks.json에서 생성한 읽기용 문서. **직접 고치지 않는다** | 사람이 읽는 용도 |
| `docs/timeline.html` | tasks.json에서 생성한 간트 페이지(최종 아티팩트와 같은 화면). **직접 고치지 않는다** | 아티팩트에 게시할 때 |

문서끼리 내용이 다르면 아키텍처.md, 기획서.md, timeline.md 순서로 따른다. 명세와 다르게 구현해야 하면 사람의 승인을 받고, 같은 PR에서 아키텍처.md도 고친다.

## 작업 태그 처리
- 메시지에 `FE3`, `CL4`, `SV5`, `OP1`, `FE10a`, `J2` 같은 태그가 있으면 **`.claude/skills/task/SKILL.md`의 절차를 따른다.** `/task SV5`로 불러도 같다.
- 작업 브랜치에서 "이어서 해줘"라고 하면 브랜치 이름에서 태그를 찾는다.
- 작업 상태는 `docs/tasks/tasks.json`에만 기록한다. 사람용 현황판(claude.ai 아티팩트, 사람이 완료 체크만 함)은 읽지도 쓰지도 않는다. 둘이 달라도 된다.
- 상태를 바꿀 때는 tasks.json을 손으로 고치지 않고 반드시 아래 도구를 쓴다.

```bash
python3 docs/tasks/task.py show SV5          # 작업 상세, 선행 상태, 참조, 수정 허용 경로
python3 docs/tasks/task.py set SV5 doing     # todo | doing | done. timeline.md도 자동 재생성
python3 docs/tasks/task.py status            # 전체 현황
python3 docs/tasks/task.py status --owner P3 # 담당자 한 명의 작업
python3 docs/tasks/task.py gen               # timeline.md와 timeline.html 재생성
```

## 역할 경계
태그 접두사(FE, DS, CL, SV, OP, J)는 작업 종류이고, 누가 맡는지는 `tasks.json`의 레인(`l`)이 정한다. 예를 들어 CL1, SV2, SV8은 P5가 맡는다. 작업별 정확한 수정 범위는 그 작업의 `paths`가 기준이다.

| 담당 | 맡는 일 | 기본 수정 범위 |
|---|---|---|
| **P1 FE** (혜인이) | 프론트엔드 개발: 앱 화면 뼈대, 공용 부품, 모든 화면 코딩 | `app/**`(단 `app/_layout.tsx` 제외), `src/components/**`, `src/features/*/components/**`, `src/constants/{theme,strings}.ts`, `tailwind.config.js`, `assets/**` |
| **P2 디자인** (민준이) | 디자인 규칙, 화면 시안(코딩 순서대로), 매일 디자인 검수, 앱 문구, 아이콘·스플래시, 스토어 스크린샷 | `docs/design/**`, `assets/**`(아이콘·스플래시) |
| **P3 CL** (재민이) | 인증 세션·가드, 데이터 훅, 실시간 채팅, 푸시 수신 | `app/_layout.tsx`, `src/lib/{supabase,queryClient,mmkv,errors}.ts`, `src/features/*/{api,hooks,schema}.ts`, `src/constants/limits.ts`, `src/types/**` |
| **P4 SV** (하린이) | 스키마, RLS, RPC, 채팅 방송, cron, 신고·제재, 계정 삭제 | `supabase/migrations/**`, `supabase/tests/**`, `supabase/functions/{delete-account,admin-alert}/**`, `src/types/database.ts` |
| **P5 OPS** (김종연) | Expo 골격·EAS, 도메인·메일, 푸시 워커, 딥링크, 관측, production, 약관·스토어·구역 데이터 | `app.config.ts`, `eas.json`, `package.json`, `src/lib/{kakao,linking,sentry,analytics}.ts`, `web/**`, `supabase/functions/push-worker/**`, `.github/workflows/**`, `docs/{legal,store,ops}/**` |

- 화면(P1)은 데이터를 P3가 만든 훅으로만 가져온다. 훅이 아직 없으면 같은 타입의 목 훅을 쓴다.
- P2는 앱 코드를 고치지 않는다. 시안, 검수 목록, 문구는 `docs/design/`에 올리고 코드 반영은 P1이 한다. 시안은 P1이 그 화면을 코딩하기 하루 전까지 넘긴다.
- P3는 DB를 직접 고치지 않는다. RPC의 입력, 출력, 에러 코드를 바꿀 때는 P4가 아키텍처 §4를 먼저 고치고 `types/database.ts`를 다시 생성한다.
- 의존성 추가(`package.json`)와 빌드 설정(`app.config.ts`, `eas.json`)은 P5가 관리한다. 다른 사람은 P5에게 요청한다.
- 작업의 `paths` 밖을 고쳐야 하면 직접 고치지 않는다. 그 경로를 맡은 담당자에게 보낼 GitHub 이슈 초안을 만든다.

## Git 규칙
- **브랜치:** `feat/<태그 접두사 소문자>-<태그>-<요약>` (예: `feat/cl-CL3-auth`, `feat/op-OP1-legal`). 기능 동결(Day 8) 이후에는 `fix/*`만 만든다. 상태만 바꿀 때는 `chore/status-<태그>`를 쓴다.
- **커밋:** `<태그>: <요약>`. 문서만 바꿀 때는 `docs: <요약>`.
- **PR 제목:** `[<태그>] <작업명>`. PR은 1명 이상 리뷰하고 CI를 통과해야 머지한다.
- **충돌:**
  - `docs/timeline.md`와 `docs/timeline.html`은 충돌을 직접 풀지 말고 `task.py gen`으로 다시 생성한다.
  - `tasks.json`의 status는 더 진행된 값을 고른다(todo < doing < done).
- **비밀값 금지:** `.env*`, service_role 키, SMTP 비밀번호, 인증서(`.p8`, `.jks`)는 커밋하지 않는다.

## 기술 스택 요약
Expo(dev client, Expo Router, TS strict) · TanStack Query · Zustand · NativeWind · FlashList · Supabase(서울 리전: Postgres, RLS, RPC, Realtime Broadcast, pg_cron, pgmq, Edge Functions) · Resend SMTP · Expo Push · Sentry · PostHog · EAS. 자세한 내용은 아키텍처 §0과 §1에 있다.

## 현재 상태
- 앱 코드는 아직 없다. 첫 작업은 `J1`(킥오프), `CL1`(Expo 골격, P5), `SV1`(Supabase 환경, P4), `SV2`(도메인·Resend, P5), `OP3`(구역·픽업 장소 수집, P5), `FE1`(디자인 규칙, P2), `FE12`(화면 뼈대, P1)이다.
- 아직 임시 값인 것: 앱 이름, 도메인(`example.kr`), 생활 구역 목록, 픽업 장소 목록.
