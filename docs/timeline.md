# 배달메이트 2주 개발 타임라인

> ⚠️ 이 파일은 `docs/tasks/tasks.json`에서 생성된다. 직접 고치지 말고 `python3 docs/tasks/task.py gen`을 실행한다.  
> 기준 문서: [기획서](./기획서.md), [아키텍처](./아키텍처.md)  
> 기간: 10일(Day 1–10), 순서 기준. 실제 시작일은 팀 일정에 맞춰 정한다.  
> 목표: Day 10에 MUST 기능을 갖춘 베타 빌드를 TestFlight / Play 내부 테스트에 올린다. 스토어 심사와 공개 베타는 그다음 주.  
> 사람용 현황판: 아티팩트 "배달메이트 2주 개발 타임라인"(사람이 완료 체크만 한다. AI는 이 저장소의 tasks.json만 본다).

## 레인(역할)

| 레인 | 담당 범위 | 기본 수정 범위(작업별 정확한 범위는 각 작업의 paths) |
|---|---|---|
| **P1 FE(혜인이)** | 프론트엔드 개발: 앱 뼈대, 공용 부품, 모든 화면 코딩 | `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**` |
| **P2 디자인(민준이)** | 디자인: 디자인 규칙, 화면 시안(코딩 순서대로), 매일 검수, 문구, 아이콘, 스토어 사진 | `docs/design/**`, `assets/**` |
| **P3 CL(재민이)** | 인증 세션, 데이터 훅, 실시간 채팅, 푸시 클라이언트 | `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**` |
| **P4 SV(하린이)** | 스키마, RLS, RPC, 채팅 방송, 신고·제재 | `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts` |
| **P5 OPS(김종연)** | Expo·EAS, 도메인·메일, 푸시 워커, 딥링크, 운영 환경, 약관·스토어 | `app.config.ts`, `eas.json`, `package.json`, `src/lib/{kakao,linking,sentry,analytics}.ts`, `web/**`, `supabase/functions/push-worker/**`, `.github/workflows/**`, `docs/legal/**`, `docs/store/**`, `docs/ops/**` |
| **공동** | 킥오프, 계약 고정, 데모, 동결, QA, 베타 | `docs/**` |

작업 태그 접두사(`FE`, `DS`, `CL`, `SV`, `OP`, `J`)는 작업 종류이고, 담당자는 레인이 정한다. 예를 들어 CL1, SV2, SV8은 P5가 맡는다.

**경계 규칙**: 화면(P1)은 P3가 만든 훅만 쓴다(서버가 준비되기 전에는 같은 타입의 목 훅). P2(디자인)는 앱 코드를 고치지 않고 시안·검수 목록·문구를 `docs/design/`에 올리며, 시안은 P1이 코딩하기 하루 전까지 넘긴다. P3는 DB를 직접 고치지 않고 P4에 요청한다. RPC를 바꿀 때는 P4가 [아키텍처 §4](./아키텍처.md)를 먼저 고치고 공지한다. 빌드·배포 설정(`app.config.ts`, `eas.json`, `package.json`)은 P5가 관리한다.

## 마일스톤

| 순서 | 마일스톤 | 완료 기준 |
|---|---|---|
| Day 2 | J2 계약 고정 | 5명이 같은 타입 파일로 개발 |
| Day 4 | J3 인증 E2E 확인 | iOS·Android 각 1대에서 통과 |
| Day 5 | J4 1주차 데모 | 데모 시나리오 끊김 없이 동작 |
| Day 7 | J5 채팅 E2E | 시나리오 6종 통과 |
| Day 8 | J6 기능 동결 | MUST 항목 전부 main에 있음 |
| Day 10 | J8 베타 빌드·회고 | 테스터에게 설치 링크 전달 |

## 작업 상태

한 줄에 작업 하나. 상태는 `task.py set`으로만 바꾼다.

| 태그 | 작업 | 담당 | 기간 | 선행 | 상태 |
|---|---|---|---|---|---|
| FE12 | 앱 화면 뼈대·디자인 규칙 코드화 | P1 | Day 1 | CL1, FE1 | ⬜ todo |
| FE2 | 공용 부품 코딩(UI 키트) | P1 | Day 2 | FE12, FE1 | ⬜ todo |
| FE3 | 가입·로그인 화면 | P1 | Day 3 | FE2, CL2, DS1 | ⬜ todo |
| FE4 | 첫 실행 안내·프로필 설정 화면 | P1 | Day 4 | FE2, CL2, DS1 | ⬜ todo |
| FE5 | 글 목록·글쓰기 화면 | P1 | Day 4–5 | FE2, DS2 | ⬜ todo |
| FE6 | 글 상세·내 채팅방 목록 화면 | P1 | Day 5 | FE2, DS2 | ⬜ todo |
| FE7 | 채팅 화면 | P1 | Day 6–7 | FE5, DS3 | ⬜ todo |
| FE8 | 송금 표시·알림 설정 화면 | P1 | Day 7 | FE7, DS3 | ⬜ todo |
| FE9 | 방장 메뉴·신고·차단·설정 화면 | P1 | Day 8 | FE2, DS4 | ⬜ todo |
| FE10a | 화면 마무리 수정 | P1 | Day 9 | J6, FE10b, DS6, OP1 | ⬜ todo |
| FE11 | QA 버그 수정 | P1 | Day 10 | J7 | ⬜ todo |
| FE1 | 디자인 규칙·공용 부품 모양·화면 흐름 | P2 | Day 1 | J1 | ⬜ todo |
| DS1 | 시안 ① 가입·로그인·첫 실행 | P2 | Day 2 | FE1 | ⬜ todo |
| DS2 | 시안 ② 글 목록·글쓰기·글 상세·내 채팅방 | P2 | Day 3 | FE1 | ⬜ todo |
| DS3 | 시안 ③ 채팅·송금 표시·알림 설정 | P2 | Day 4–5 | FE1 | ⬜ todo |
| DS4 | 시안 ④ 방장 메뉴·신고·차단·설정 | P2 | Day 6 | FE1 | ⬜ todo |
| DS5 | 디자인 검수 (매일 15분) | P2 | Day 4–8 | DS1 | ⬜ todo |
| DS6 | 앱 문구 다듬기 | P2 | Day 6–7 | DS2 | ⬜ todo |
| DS7 | 앱 아이콘·스플래시 | P2 | Day 7–8 | FE1 | ⬜ todo |
| FE10b | 디자인 마무리 검수 | P2 | Day 8 | J6 | ⬜ todo |
| DS8 | 스토어 스크린샷 | P2 | Day 9–10 | FE10b | ⬜ todo |
| CL2 | 인증 가드·타입·목 훅 | P3 | Day 2 | CL1, SV3 | ✅ done |
| CL3 | 인증 훅·실기기 E2E | P3 | Day 3–4 | CL2, SV4 | 🟨 doing |
| CL4 | 피드·글·참여 훅 | P3 | Day 4–5 | CL3, SV5, J3 | ⬜ todo |
| CL5 | 실시간 채팅 클라이언트 | P3 | Day 6–7 | CL4, SV7, J4 | ⬜ todo |
| CL6 | 푸시 클라이언트 | P3 | Day 7 | CL5, SV8 | ⬜ todo |
| CL7a | 신고·차단 훅 | P3 | Day 8 | CL4, SV9 | ⬜ todo |
| CL10 | QA 버그 수정 (앱 로직) | P3 | Day 10 | J7 | ⬜ todo |
| SV1 | Supabase 환경·핵심 테이블 | P4 | Day 1 | J1 | ✅ done |
| SV3 | 나머지 테이블·RPC 스텁·Auth 설정 | P4 | Day 2 | SV1, SV2 | ✅ done |
| SV4 | 프로필 RPC·RLS·메일 실측 | P4 | Day 3 | SV3, J2 | ✅ done |
| SV5 | 글·참여 RPC | P4 | Day 4 | SV4, OP3 | ⬜ todo |
| SV6 | 상태 전이·cron | P4 | Day 5 | SV5 | ⬜ todo |
| SV7 | 채팅 RPC·방송 | P4 | Day 6 | SV6 | ⬜ todo |
| SV9 | 신고·제재·탈퇴·관리자 알림 | P4 | Day 7–8 | SV7 | ⬜ todo |
| SV12 | QA 버그 수정 (서버) | P4 | Day 10 | J7 | ⬜ todo |
| CL1 | Expo 프로젝트·기반 | P5 | Day 1 | J1 | ✅ done |
| SV2 | 공용 Gmail SMTP 준비 | P5 | Day 1 | — | ✅ done |
| OP3 | 생활 구역·픽업 장소 수집 | P5 | Day 1–3 | J1 | ⬜ todo |
| OP1 | 약관·개인정보처리방침·EULA | P5 | Day 2–4 | J1 | ⬜ todo |
| OP2 | 스토어 등록 자료 | P5 | Day 6–9 | OP1 | ⬜ todo |
| SV8 | 송금 RPC·푸시 파이프라인 | P5 | Day 7 | SV7 | ⬜ todo |
| CL7b | 카카오 공유·딥링크 | P5 | Day 8 | CL1, CL4 | ⬜ todo |
| CL8a | 관측 도구 연결 (Sentry·PostHog) | P5 | Day 5 | CL1 | ⬜ todo |
| CL8b | 폴백 웹·카카오 키 해시 | P5 | Day 9 | CL7b | ⬜ todo |
| SV10 | 보안 점검·production 구성 | P5 | Day 9–10 | SV9 | ⬜ todo |
| CL9 | 베타 빌드 배포 | P5 | Day 10 | J7, SV10 | ⬜ todo |
| SV11 | 심사 계정·지표·모니터링 | P5 | Day 10 | SV10 | ⬜ todo |
| J1 | 킥오프 | J | Day 1 | — | ✅ done |
| J2 | 계약 고정 | J | Day 2 | SV3, CL2 | ✅ done |
| J3 | 인증 E2E 확인 | J | Day 4 | CL3, FE3, FE4, SV4 | ⬜ todo |
| J4 | 1주차 데모 | J | Day 5 | CL4, FE6, SV6 | ⬜ todo |
| J5 | 채팅 E2E | J | Day 7 | CL5, CL6, FE8, SV8 | ⬜ todo |
| J6 | 기능 동결 | J | Day 8 | FE9, CL7a, CL7b, SV9, J5 | ⬜ todo |
| J7 | 통합 QA | J | Day 9 | J6, FE10a, FE10b, CL8b, CL8a | ⬜ todo |
| J8 | 베타 빌드·회고 | J | Day 10 | CL9, FE11, SV11, CL10, SV12 | ⬜ todo |

## 순서별 보기

| 순서 | P1 FE(혜인이) | P2 디자인(민준이) | P3 CL(재민이) | P4 SV(하린이) | P5 OPS(김종연) | 공동 |
|---|---|---|---|---|---|---|
| **Day 1** | FE12 앱 화면 뼈대·디자인 규칙 코드화 | FE1 디자인 규칙·공용 부품 모양·화면 흐름 | — | SV1 Supabase 환경·핵심 테이블 | CL1 Expo 프로젝트·기반<br>SV2 공용 Gmail SMTP 준비<br>OP3 생활 구역·픽업 장소 수집 | J1 킥오프 |
| **Day 2** | FE2 공용 부품 코딩(UI 키트) | DS1 시안 ① 가입·로그인·첫 실행 | CL2 인증 가드·타입·목 훅 | SV3 나머지 테이블·RPC 스텁·Auth 설정 | OP3 생활 구역·픽업 장소 수집<br>OP1 약관·개인정보처리방침·EULA | J2 계약 고정 |
| **Day 3** | FE3 가입·로그인 화면 | DS2 시안 ② 글 목록·글쓰기·글 상세·내 채팅방 | CL3 인증 훅·실기기 E2E | SV4 프로필 RPC·RLS·메일 실측 | OP3 생활 구역·픽업 장소 수집<br>OP1 약관·개인정보처리방침·EULA | — |
| **Day 4** | FE4 첫 실행 안내·프로필 설정 화면<br>FE5 글 목록·글쓰기 화면 | DS3 시안 ③ 채팅·송금 표시·알림 설정<br>DS5 디자인 검수 (매일 15분) | CL3 인증 훅·실기기 E2E<br>CL4 피드·글·참여 훅 | SV5 글·참여 RPC | OP1 약관·개인정보처리방침·EULA | J3 인증 E2E 확인 |
| **Day 5** | FE5 글 목록·글쓰기 화면<br>FE6 글 상세·내 채팅방 목록 화면 | DS3 시안 ③ 채팅·송금 표시·알림 설정<br>DS5 디자인 검수 (매일 15분) | CL4 피드·글·참여 훅 | SV6 상태 전이·cron | CL8a 관측 도구 연결 (Sentry·PostHog) | J4 1주차 데모 |
| **Day 6** | FE7 채팅 화면 | DS4 시안 ④ 방장 메뉴·신고·차단·설정<br>DS5 디자인 검수 (매일 15분)<br>DS6 앱 문구 다듬기 | CL5 실시간 채팅 클라이언트 | SV7 채팅 RPC·방송 | OP2 스토어 등록 자료 | — |
| **Day 7** | FE7 채팅 화면<br>FE8 송금 표시·알림 설정 화면 | DS5 디자인 검수 (매일 15분)<br>DS6 앱 문구 다듬기<br>DS7 앱 아이콘·스플래시 | CL5 실시간 채팅 클라이언트<br>CL6 푸시 클라이언트 | SV9 신고·제재·탈퇴·관리자 알림 | OP2 스토어 등록 자료<br>SV8 송금 RPC·푸시 파이프라인 | J5 채팅 E2E |
| **Day 8** | FE9 방장 메뉴·신고·차단·설정 화면 | DS5 디자인 검수 (매일 15분)<br>DS7 앱 아이콘·스플래시<br>FE10b 디자인 마무리 검수 | CL7a 신고·차단 훅 | SV9 신고·제재·탈퇴·관리자 알림 | OP2 스토어 등록 자료<br>CL7b 카카오 공유·딥링크 | J6 기능 동결 |
| **Day 9** | FE10a 화면 마무리 수정 | DS8 스토어 스크린샷 | — | — | OP2 스토어 등록 자료<br>CL8b 폴백 웹·카카오 키 해시<br>SV10 보안 점검·production 구성 | J7 통합 QA |
| **Day 10** | FE11 QA 버그 수정 | DS8 스토어 스크린샷 | CL10 QA 버그 수정 (앱 로직) | SV12 QA 버그 수정 (서버) | SV10 보안 점검·production 구성<br>CL9 베타 빌드 배포<br>SV11 심사 계정·지표·모니터링 | J8 베타 빌드·회고 |

## 작업 상세

### P1 FE(혜인이)

#### FE12 · 앱 화면 뼈대·디자인 규칙 코드화  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 빈 화면들로 앱의 길부터 깔기**  
> P2가 오전에 준 디자인 규칙을 코드에 옮기고, 앱의 모든 화면을 빈 화면으로 먼저 만들어 서로 이동할 수 있게 연결한다. 이후에는 화면 하나씩 내용을 채우기만 하면 된다.

theme.ts·NativeWind 설정과 Expo Router 라우트 골격(빈 화면) 작성.

**세부 작업**
1. CL1(Expo 골격) 머지 후 시작
2. theme.ts에 디자인 토큰 입력, NativeWind 연결, 다크모드 전환 확인
3. 아키텍처 §9의 전체 라우트를 빈 화면으로 생성: (auth), (tabs), post/new, post/[id], post/[id]/chat, settings/*
4. 탭 바와 화면 이동 연결

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| theme.ts, 라우트 골격 | CL1 Expo 프로젝트·기반, FE1 디자인 규칙·공용 부품 모양·화면 흐름 | 모든 화면 사이를 실제 기기에서 이동할 수 있음 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE2 · 공용 부품 코딩(UI 키트)  
`Day 2` · 1일 · 1주차

> **쉽게 말하면: 레고 블록 만들기**  
> P2가 정한 모양대로 버튼, 입력칸, 카드, 아래 메뉴 창 같은 공용 부품을 코드로 만든다. 모든 화면이 이 부품을 조립해서 만들어진다.

src/components/ui 공용 컴포넌트 구현.

**세부 작업**
1. Button, Input, Chip, Card, Badge
2. Sheet(bottom-sheet), Toast, EmptyState, Skeleton
3. 라이트·다크 양쪽 확인, 터치 영역 44pt 이상
4. 부품 견본 화면(개발용)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| src/components/ui/* | FE12 앱 화면 뼈대·디자인 규칙 코드화, FE1 디자인 규칙·공용 부품 모양·화면 흐름 | 견본 화면에서 모든 부품이 두 테마로 표시 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE3 · 가입·로그인 화면  
`Day 3` · 1일 · 1주차

> **쉽게 말하면: POSTECH 메일 가입 화면 만들기**  
> 시안 ①대로 가입, 인증번호 입력, 로그인, 비밀번호 찾기 화면을 만든다. 처음엔 가짜 데이터로 동작시키고, P3가 실제 서버에 연결한다.

app/(auth) 인증 화면 구현(목 훅 기반).

**세부 작업**
1. 로그인, 회원가입(메일·비밀번호·약관 동의 체크)
2. 인증번호 6칸 입력, 재전송 60초 타이머
3. 비밀번호 찾기·재설정
4. @postech.ac.kr 형식 오류 안내

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| app/(auth)/* 화면 | FE2 공용 부품 코딩(UI 키트), CL2 인증 가드·타입·목 훅, DS1 시안 ① 가입·로그인·첫 실행 | 목 훅으로 가입 → 인증번호 → 로그인 화면 전환 동작 |

참조: 아키텍처 §3-3, 기획서 §1-1 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE4 · 첫 실행 안내·프로필 설정 화면  
`Day 4` · 1일 · 1주차

> **쉽게 말하면: 처음 켰을 때 보는 화면 만들기**  
> 권한 안내, 약관 동의, 닉네임·생활 구역 설정 화면을 만든다. Day 4 오후 인증 확인(J3)에 들어가므로 오전 중에 끝낸다.

permissions·terms·profile-setup 화면 구현(오전 완료).

**세부 작업**
1. 권한 안내(필수·선택 구분)
2. 약관 동의: OP1이 끝나기 전이라 임시 문구로 넣음
3. 프로필 설정: 닉네임(중복·금칙어 오류), 생활 구역 선택(react-hook-form + zod)
4. 프로필 설정 다음 단계: 송금 받을 계좌 입력(건너뛰기 가능)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 온보딩 화면 | FE2 공용 부품 코딩(UI 키트), CL2 인증 가드·타입·목 훅, DS1 시안 ① 가입·로그인·첫 실행 | 오전 중 머지, 목 훅으로 첫 실행부터 프로필 저장까지 진행 |

참조: 아키텍처 §3-3, 기획서 §1-1, 아키텍처 §2-2 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE5 · 글 목록·글쓰기 화면  
`Day 4–5` · 2일 · 1주차

> **쉽게 말하면: 앱의 첫 화면 만들기**  
> 시안 ②대로 모집 글 목록과 글쓰기 창을 만든다. 사용자가 가장 많이 보는 화면이다.

(tabs)/index 피드, post/new 작성 모달 구현.

**세부 작업**
1. Day 4 오후: 글 목록(구역 칩, 글 카드, 남은 시간 카운트다운, 빈 화면)
2. 당겨서 새로고침, 무한 스크롤
3. Day 5 오전: 글쓰기 창(카테고리, 가게명, 링크, 픽업 장소, 정원 2~8, 마감 15·30·60분, 메모)
4. 글쓰기 전에 계좌가 없으면 계좌 입력 시트(ACCOUNT_REQUIRED)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 피드·글쓰기 화면 | FE2 공용 부품 코딩(UI 키트), DS2 시안 ② 글 목록·글쓰기·글 상세·내 채팅방 | Day 5 오전 머지, 목 데이터로 목록 스크롤과 글쓰기 제출 동작 |

참조: 아키텍처 §2-2, 아키텍처 §4, 기획서 §1 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE6 · 글 상세·내 채팅방 목록 화면  
`Day 5` · 1일 · 1주차

> **쉽게 말하면: 글을 눌렀을 때와 내 방 목록**  
> 글 상세 화면(참여 버튼)과 내 채팅방 목록을 만든다. Day 5 오후 1주차 시연(J4)의 마지막 단계라 15:00까지 머지한다. 방장 메뉴는 Day 8로 미뤘다.

post/[id] 상세, (tabs)/rooms 구현(방장 메뉴는 FE9에서).

**세부 작업**
1. 글 상세: 정보, 참여자 아바타, 방장 표시
2. 참여 버튼 상태 5종: 참여 가능, 정원 참, 마감, 내보내짐, 이미 참여
3. 내 채팅방 목록: 마지막 메시지, 안 읽은 배지(99+)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 상세·방 목록 화면 | FE2 공용 부품 코딩(UI 키트), DS2 시안 ② 글 목록·글쓰기·글 상세·내 채팅방 | 15:00까지 머지, 상황별 버튼이 목 데이터로 전환 |

참조: 아키텍처 §4-2, 아키텍처 §4 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE7 · 채팅 화면  
`Day 6–7` · 2일 · 2주차

> **쉽게 말하면: 실시간 단체 채팅 화면 만들기**  
> 시안 ③대로 채팅 화면을 만든다. 메시지가 많아도 끊기지 않고, 키보드가 올라와도 입력창이 가려지지 않게 하는 것이 핵심이다.

post/[id]/chat 구현(FlashList, keyboard-controller).

**세부 작업**
1. FlashList 역순 목록, 말풍선, 시스템 메시지, 날짜 구분선
2. 입력창: keyboard-controller, 전송 중·실패·재전송 표시
3. 상단 고정 안내: "송금은 방장 계좌로 직접 해요. 앱은 돈을 보관하지 않아요"
4. 차단한 사용자 메시지 접힘
5. 마감 뒤 방장 계좌 카드(복사 버튼, 토스 링크 열기)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅 화면 | FE5 글 목록·글쓰기 화면, DS3 시안 ③ 채팅·송금 표시·알림 설정 | Day 7 오전 머지, 목 메시지 500개 스크롤이 끊기지 않고 iOS·Android 키보드 정상 |

참조: 아키텍처 §6 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE8 · 송금 표시·알림 설정 화면  
`Day 7` · 1일 · 2주차

> **쉽게 말하면: 누가 돈을 보냈는지 보여 주기**  
> 채팅방 위 송금 확인 표시줄과 알림 설정 화면을 만든다. Day 7 오후 채팅 확인(J5)에 쓰이므로 15:00까지 머지한다.

송금 체크 바, settings/notifications 구현.

**세부 작업**
1. 송금 표시줄: 멤버 "보냈어요"와 남은 기한, 방장은 멤버별 "입금 확인"·"입금 안 됨"
2. 마감·완료·취소된 방의 읽기 전용 상태
3. 알림 설정 화면, 방별 알림 끄기
4. 방장 "주문하러 가기" 버튼: 남은 멤버 전원 입금 확인 전에는 잠김

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 송금 표시줄, 알림 설정 화면 | FE7 채팅 화면, DS3 시안 ③ 채팅·송금 표시·알림 설정 | 15:00까지 머지, 송금 3단계와 '입금 안 됨' 되돌리기가 구분되어 표시 |

참조: 아키텍처 §4-2, 아키텍처 §7-1 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE9 · 방장 메뉴·신고·차단·설정 화면  
`Day 8` · 1일 · 2주차

> **쉽게 말하면: 방장 기능과 안전 기능 화면**  
> 시안 ④대로 방장 메뉴(마감, 완료, 취소, 내보내기), 신고·차단, 설정·계정 삭제 화면을 만든다. 모두 공용 아래 메뉴 창을 재사용해서 하루에 만든다. Day 8 기능 동결(J6) 전까지 끝낸다.

방장 메뉴 시트, 신고 시트, settings/* 구현.

**세부 작업**
1. 방장 메뉴 시트: 마감, 완료, 취소, 내보내기
2. 신고 시트(글·메시지·사용자), 차단 확인, 차단 목록
3. 비밀번호 변경, 계정 삭제(재확인), 약관 보기
4. 설정: 송금 받을 계좌 수정(settings/payout-account)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 방장 메뉴, 신고·설정 화면 | FE2 공용 부품 코딩(UI 키트), DS4 시안 ④ 방장 메뉴·신고·차단·설정 | 15:00까지 머지, 세 곳에서 신고 진입 가능 |

참조: 아키텍처 §4-2, 아키텍처 §4-3 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE10a · 화면 마무리 수정  
`Day 9` · 1일 · 2주차

> **쉽게 말하면: 검수 목록대로 전 화면 다듬기**  
> P2의 최종 검수 목록(FE10b)과 문구 모음(DS6)을 반영하고, 약관 문구를 OP1 확정본으로 바꾼다. 오후 전체 테스트(J7) 전에 끝낸다.

디자인 QA·카피·약관 문구 반영, 예외 상태·접근성 수정.

**세부 작업**
1. FE10b 최종 검수 목록 수정
2. DS6 문구 반영(strings.ts)
3. 약관·권한 안내 문구를 OP1 확정본으로 교체
4. VoiceOver·TalkBack 라벨

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| UI 수정 PR | J6 기능 동결, FE10b 디자인 마무리 검수, DS6 앱 문구 다듬기, OP1 약관·개인정보처리방침·EULA | 14:00 전 머지, 검수 목록 전 항목 처리 |

참조: 아키텍처 §9 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

#### FE11 · QA 버그 수정  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 테스트에서 나온 화면 문제 고치기**  
> 전체 테스트(J7)에서 나온 화면 버그를 고친다. 베타 빌드가 오전에 먼저 나가므로 수정은 앱 재설치 없이 내려받는 업데이트(EAS Update)로 보낸다.

J7 UI 버그 수정, EAS Update 배포 범위에서 처리.

**세부 작업**
1. J7 버그 목록 중 화면 항목 수정
2. DS8 스크린샷 촬영용 최종 화면 P2에게 제공
3. 수정은 JS 범위에서 처리해 EAS Update로 배포

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 수정 PR | J7 통합 QA | 화면 치명 버그 0건 |

참조: 기획서 §1 · 수정 허용: `app/(auth)/**`, `app/(tabs)/**`, `app/post/**`, `app/settings/**`, `src/components/**`, `src/features/*/components/**`, `src/constants/theme.ts`, `src/constants/strings.ts`, `tailwind.config.js`, `global.css`, `assets/**`

### P2 디자인(민준이)

#### FE1 · 디자인 규칙·공용 부품 모양·화면 흐름  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 모든 화면이 따를 디자인 기준 정하기**  
> 색, 글씨, 여백 같은 디자인 규칙과 버튼·입력칸 같은 공용 부품의 모양을 정하고, 앱에 어떤 화면이 있고 어떻게 이동하는지 그린다. P1이 오후부터 이걸로 앱 뼈대를 만든다.

디자인 토큰, 공용 컴포넌트 시안, 전체 화면 목록·이동 흐름을 확정함.

**세부 작업**
1. 오전: 디자인 규칙(색, 글씨 크기, 여백, 모서리, 다크모드 색) 표 → P1에게 전달
2. 오후: 공용 부품 모양(버튼, 입력칸, 선택 칩, 카드, 숫자 배지, 아래 메뉴 창, 안내 메시지, 빈 화면, 불러오는 중 표시)
3. 전체 화면 목록과 이동 흐름: 가입 → 프로필 → 글 목록 → 상세·참여 → 채팅, 탭 구성

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 디자인 규칙 표, 공용 부품 시안, 화면 목록·이동 흐름도 | J1 킥오프 | 오전 중 디자인 규칙, 퇴근 전 공용 부품 시안이 P1에게 전달됨 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS1 · 시안 ① 가입·로그인·첫 실행  
`Day 2` · 1일 · 1주차

> **쉽게 말하면: P1이 Day 3에 만들 화면 디자인**  
> POSTECH 메일 가입, 인증번호 입력, 로그인, 비밀번호 찾기, 권한 안내, 약관 동의, 프로필 설정 화면을 완성 디자인으로 만든다. Day 4 인증 확인(J3) 전에 화면이 다 나와야 해서 가장 먼저 한다.

인증·온보딩 화면 시안(코딩 순서 1번).

**세부 작업**
1. 로그인, 회원가입, 인증번호 6칸 입력(재전송 60초), 비밀번호 찾기·재설정
2. 권한 안내, 약관 동의, 프로필 설정(닉네임·구역 선택)
3. 오류 상태: 다른 메일 주소, 틀린 인증번호, 닉네임 중복
4. 밝은·어두운 화면 두 벌
5. 송금 받을 계좌 입력 화면(은행 선택·계좌번호·예금주 또는 토스 링크, 건너뛰기 가능)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 인증·온보딩 시안 | FE1 디자인 규칙·공용 부품 모양·화면 흐름 | 퇴근 전 시안 전달, P1이 보고 바로 코딩할 수 있음 |

참조: 아키텍처 §9, 기획서 §1, 아키텍처 §2-2 · 수정 허용: `docs/design/**`, `assets/**`

#### DS2 · 시안 ② 글 목록·글쓰기·글 상세·내 채팅방  
`Day 3` · 1일 · 1주차

> **쉽게 말하면: P1이 Day 4–5에 만들 화면 디자인**  
> 앱의 첫 화면인 글 목록, 글쓰기 창, 글 상세(참여 버튼), 내 채팅방 목록을 디자인한다. Day 5 1주차 시연(J4)에 쓰이는 화면들이다.

피드·작성·상세·방 목록 시안(코딩 순서 2번).

**세부 작업**
1. 글 목록: 구역 칩, 글 카드(음식 종류, 인원 막대, 남은 시간), 글이 없을 때 화면
2. 글쓰기 창: 입력 순서, 픽업 장소·인원·마감 선택
3. 글 상세: 정보, 참여자, 상황별 참여 버튼 5종
4. 내 채팅방 목록: 마지막 메시지, 안 읽은 수
5. 글쓰기 창: 계좌 미등록 시 계좌 입력 시트

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 피드·상세 시안 | FE1 디자인 규칙·공용 부품 모양·화면 흐름 | 퇴근 전 시안 전달 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS3 · 시안 ③ 채팅·송금 표시·알림 설정  
`Day 4–5` · 2일 · 1주차

> **쉽게 말하면: P1이 Day 6–7에 만들 화면 디자인**  
> 가장 복잡한 채팅 화면과, 채팅방 위의 송금 확인 표시줄, 알림 설정 화면을 디자인한다. 키보드가 올라왔을 때 모습까지 그린다.

채팅·송금·알림 설정 시안(코딩 순서 3번).

**세부 작업**
1. 말풍선(나·상대), 안내 메시지, 날짜 구분선, 차단한 사람 메시지 접힘
2. 입력창과 키보드가 올라온 상태, 전송 실패·다시 보내기
3. 송금 표시줄: 안 보냄 → 보냈어요 → 입금 확인, 방장의 '입금 안 됨', 남은 송금 기한, 마감된 방의 읽기 전용 상태
4. 알림 설정 화면, 방별 알림 끄기
5. 방장 계좌 카드(마감 뒤에만), 방장의 '주문하러 가기' 버튼 잠김 상태

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅·송금 시안 | FE1 디자인 규칙·공용 부품 모양·화면 흐름 | Day 5 퇴근 전 시안 전달 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS5 · 디자인 검수 (매일 15분)  
`Day 4–8` · 5일 · 1주차

> **쉽게 말하면: 만들어진 화면을 시안과 비교해 바로 고치기**  
> P1이 화면을 하나 끝낼 때마다 시안과 다른 점을 짚어 준다. 매일 오후에 15분씩 같이 보고, 작은 차이는 그날 바로 고친다. 그래야 마지막 날에 수정이 몰리지 않는다.

화면 단위 디자인 QA를 매일 진행해 마지막 수정 몰림을 막음.

**세부 작업**
1. 매일 오후 15분: 그날 머지된 화면을 실제 기기로 확인
2. 차이점을 목록으로 남기고 작은 것은 그날 수정
3. 시안에 없던 상황(긴 가게 이름, 긴 닉네임 등)이 나오면 바로 보완

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 일일 검수 목록(docs/design/review.md) | DS1 시안 ① 가입·로그인·첫 실행 | Day 8까지 머지된 모든 화면이 한 번 이상 검수됨 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS4 · 시안 ④ 방장 메뉴·신고·차단·설정  
`Day 6` · 1일 · 2주차

> **쉽게 말하면: P1이 Day 8에 만들 화면 디자인**  
> 방장이 쓰는 메뉴(마감, 완료, 취소, 내보내기), 신고 창, 차단, 설정, 계정 삭제 화면을 디자인한다. 앱스토어 심사에서 꼭 보는 안전 기능 화면이다.

방장 메뉴·안전 기능·설정 시안(코딩 순서 4번).

**세부 작업**
1. 방장 메뉴 시트: 모집 마감, 주문 완료, 모집 취소, 참여자 내보내기
2. 신고 창(사유 선택·상세), 차단 확인, 차단 목록
3. 설정: 비밀번호 변경, 계정 삭제(재확인), 약관 보기

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 안전 기능·설정 시안 | FE1 디자인 규칙·공용 부품 모양·화면 흐름 | 퇴근 전 시안 전달 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS6 · 앱 문구 다듬기  
`Day 6–7` · 2일 · 2주차

> **쉽게 말하면: 앱에 들어가는 글을 사용자 눈높이로**  
> 버튼 이름, 오류 안내, 빈 화면, 알림 문구를 사용자가 이해하기 쉬운 말로 정리한다. P1이 마무리 기간(Day 9)에 한꺼번에 반영한다.

UX 카피 정리. 오류 문구는 P3의 errors.ts 문구를 다듬는 방식으로 협의.

**세부 작업**
1. 오류 안내 17종: P3가 만든 errors.ts 문구를 사용자 말투로 다듬어 P3에게 전달
2. 빈 화면·첫 실행 안내·버튼 이름 정리
3. 푸시 알림 문구 정리(P5와 협의)
4. 송금 문구: 채팅 상단 안내, 송금 기한 임박·입금 안 됨·입금 확인·기한 초과·환불 안내 알림

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 앱 문구 모음(docs/design/copy.md) | DS2 시안 ② 글 목록·글쓰기·글 상세·내 채팅방 | 모든 화면의 문구가 정해져 P1·P3에게 전달됨 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS7 · 앱 아이콘·스플래시  
`Day 7–8` · 2일 · 2주차

> **쉽게 말하면: 앱의 얼굴 만들기**  
> 홈 화면에 보일 앱 아이콘과 앱을 켤 때 잠깐 보이는 첫 화면(스플래시)을 완성한다. P5가 Day 10 베타 빌드에 넣는다.

아이콘·스플래시 최종 에셋.

**세부 작업**
1. 앱 아이콘(iOS 1024, Android 적응형 아이콘)
2. 스플래시 화면
3. 다크모드에서 확인

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 아이콘·스플래시 파일(assets/) | FE1 디자인 규칙·공용 부품 모양·화면 흐름 | Day 9 전에 규격 파일이 assets/에 들어가 P5가 빌드에 쓸 수 있음 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### FE10b · 디자인 마무리 검수  
`Day 8` · 1일 · 2주차

> **쉽게 말하면: 기능 추가가 끝난 뒤 전체 화면 최종 점검**  
> 기능 동결(J6) 직후 모든 화면을 처음부터 끝까지 넘겨 보며, 어색한 곳과 다양한 휴대폰 환경에서 깨지는 곳을 목록으로 만든다. P1이 다음 날 고친다.

동결 직후 전 화면 디자인·접근성 점검.

**세부 작업**
1. 불러오는 중 / 오류 / 내용 없음 화면이 시안대로인지
2. 작은 휴대폰, 큰 글씨, 어두운 화면에서 깨지는 곳
3. 글자 대비, 누르는 영역 크기(44pt 이상)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 최종 검수 목록 | J6 기능 동결 | Day 8 퇴근 전 검수 목록이 P1에게 전달됨 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

#### DS8 · 스토어 스크린샷  
`Day 9–10` · 2일 · 2주차

> **쉽게 말하면: 앱스토어에 올릴 화면 사진 만들기**  
> Day 9에 스크린샷 틀(배경, 설명 문구)을 만들어 두고, Day 10에 버그를 고친 최종 화면을 찍어 끼워 넣는다.

스토어 등록용 스크린샷 세트.

**세부 작업**
1. Day 9: 스크린샷 틀과 설명 문구(글 목록, 참여, 채팅, 송금 확인, POSTECH 인증)
2. Day 10: 최종 화면 캡처 후 완성
3. 아이폰 6.7"·5.5", 안드로이드 규격

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 스토어 스크린샷 세트 | FE10b 디자인 마무리 검수 | P5가 스토어에 바로 올릴 수 있는 규격으로 완성 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `docs/design/**`, `assets/**`

### P3 CL(재민이)

#### CL2 · 인증 가드·타입·목 훅  
`Day 2` · 1일 · 1주차

> **쉽게 말하면: 화면과 서버를 잇는 '약속' 만들기**  
> 서버가 완성되기 전에도 화면 담당(P1·P2)이 작업할 수 있도록, 서버가 줄 데이터의 모양을 미리 정하고 가짜 데이터를 만들어 나눠 준다. 로그인하지 않은 사람은 로그인 화면으로 보내는 '출입 관리'도 만든다.

FE가 서버 없이도 개발할 수 있게 계약을 코드로 만듦.

**세부 작업**
1. 첫날 오전은 목 데이터로 시작하고, SV3가 머지되면 실제 서버에 연결
2. 인증 가드: 세션 없음 → auth, 프로필 없음 → profile-setup, 둘 다 있음 → tabs
3. supabase gen types 스크립트 → types/database.ts
4. RPC 시그니처 기준 목 훅 세트 작성 후 FE에 전달
5. lib/errors.ts: 에러 코드 17종 → 한국어 문구

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| types/database.ts, 목 훅, errors.ts | CL1 Expo 프로젝트·기반, SV3 나머지 테이블·RPC 스텁·Auth 설정 | FE가 목 훅만으로 화면을 그릴 수 있음 |

참조: 아키텍처 §3-3, 아키텍처 §4, 아키텍처 §4-4 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

#### CL3 · 인증 훅·실기기 E2E  
`Day 3–4` · 2일 · 1주차

> **쉽게 말하면: 실제 POSTECH 메일로 가입·로그인 연결**  
> 가입·로그인 화면을 실제 서버에 연결한다. 실제 휴대폰에서 POSTECH 메일로 가입부터 로그인까지 되고, 다른 메일은 막히는지 확인한다.

실제 POSTECH 메일로 가입부터 로그인까지 연결함.

**세부 작업**
1. 첫날 오전은 목 데이터로 시작하고, SV4가 머지되면 실제 서버에 연결
2. signUp(Turnstile), verifyOtp(signup·recovery), signInWithPassword
3. 인증 안 된 계정 로그인 시 코드 재전송 후 verify로 이동
4. resetPasswordForEmail, updateUser(비밀번호)
5. zod 스키마와 constants/limits.ts(서버와 같은 숫자)
6. AppState 복귀 시 startAutoRefresh, 첫 실기기 dev 빌드

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/auth 훅, limits.ts | CL2 인증 가드·타입·목 훅, SV4 프로필 RPC·RLS·메일 실측 | 실기기에서 POSTECH 메일 가입·로그인, 다른 도메인 거부 |

참조: 아키텍처 §3, 기획서 §1-1 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

#### CL4 · 피드·글·참여 훅  
`Day 4–5` · 2일 · 1주차

> **쉽게 말하면: 글 목록·글쓰기·참여 버튼을 실제로 동작시키기**  
> 화면의 가짜 데이터를 실제 서버 데이터로 바꾼다. 글을 쓰면 저장되고, 다른 사람이 '참여하기'를 누르면 바로 반영된다. 버튼을 누르면 결과를 먼저 보여 주고, 실패하면 원래대로 되돌린다.

피드와 참여 흐름을 실제 서버에 연결함.

**세부 작업**
1. 첫날 오전은 목 데이터로 시작하고, SV5가 머지되면 실제 서버에 연결
2. useFeed(구역별, 커서 무한 스크롤), useCreatePost
3. usePost, useJoin, useLeave, 상태 변경 훅
4. 낙관적 업데이트와 에러 코드별 롤백
5. useMyRooms
6. usePayoutAccount, useSetPayoutAccount, ACCOUNT_REQUIRED 처리

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/posts 훅 | CL3 인증 훅·실기기 E2E, SV5 글·참여 RPC, J3 인증 E2E 확인 | staging에서 글 작성 → 다른 계정 참여 → 방 목록 표시 |

참조: 아키텍처 §4, 아키텍처 §4-1, 아키텍처 §4-2 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

#### CL5 · 실시간 채팅 클라이언트  
`Day 6–7` · 2일 · 2주차

> **쉽게 말하면: 채팅이 실시간으로 오가게 만들기**  
> 메시지를 보내면 같은 방 사람들 화면에 바로 나타나게 한다. 앱을 잠깐 닫았다 다시 열어도 놓친 메시지를 채워 넣고, 전송에 실패하면 '다시 보내기' 버튼을 보여 준다.

Broadcast 채널로 실시간 채팅을 동작하게 함.

**세부 작업**
1. 첫날 오전은 목 데이터로 시작하고, SV7가 머지되면 실제 서버에 연결
2. private 채널 room:{id}, realtime.setAuth
3. get_messages 커서 로딩, 수신 메시지 id 중복 제거
4. client_msg_id로 낙관적 전송, 실패 시 재전송 버튼
5. AppState 복귀 시 재구독과 놓친 메시지 채우기, mark_read
6. 송금 훅: useHostAccount(get_host_account), useMarkPaid, useConfirmPaid, useRejectPaid, 송금 이벤트 방송 반영

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/chat 훅 | CL4 피드·글·참여 훅, SV7 채팅 RPC·방송, J4 1주차 데모 | 기기 2대에서 실시간 송수신, 백그라운드 30초 후 복구 |

참조: 아키텍처 §6, 아키텍처 §4-2 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

#### CL6 · 푸시 클라이언트  
`Day 7` · 1일 · 2주차

> **쉽게 말하면: 휴대폰 알림 받기**  
> 새 메시지, 마감 같은 알림이 휴대폰에 뜨고, 알림을 누르면 그 채팅방으로 바로 들어가게 한다. 지금 보고 있는 방의 알림은 띄우지 않는다.

알림을 받고 눌러서 해당 방으로 이동하게 함.

**세부 작업**
1. 권한 요청 시점: 첫 참여 직후
2. 토큰 등록(register_push_token), 로그아웃 시 해제
3. 포그라운드에서 지금 보는 방 알림 숨김
4. 알림 탭 → /post/{id}/chat 이동(앱 종료 상태 포함)
5. Android 채널 3개, APNs(.p8)·FCM v1 credentials 등록
6. 송금 알림 5종(기한 임박, 입금 안 됨, 입금 확인, 기한 초과, 환불 안내) 탭 → 해당 방

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/notifications | CL5 실시간 채팅 클라이언트, SV8 송금 RPC·푸시 파이프라인 | iOS·Android 실기기에서 알림 수신과 탭 이동 |

참조: 아키텍처 §7 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`, `app.config.ts`

#### CL7a · 신고·차단 훅  
`Day 8` · 1일 · 2주차

> **쉽게 말하면: 신고·차단 버튼을 실제로 동작시키기**  
> 신고·차단 화면을 서버에 연결한다. 신고하면 서버에 기록되고, 차단한 사람의 메시지는 접혀서 보인다.

신고·차단 기능을 서버에 연결함.

**세부 작업**
1. 첫날 오전은 목 데이터로 시작하고, SV9가 머지되면 실제 서버에 연결
2. useReport, useBlock
3. 차단한 사용자 메시지 접기 로직
4. 노쇼 신고 진입점 연결

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/moderation 훅 | CL4 피드·글·참여 훅, SV9 신고·제재·탈퇴·관리자 알림 | 글·메시지·사용자 신고가 서버에 기록되고 차단 시 메시지가 접힘 |

참조: 아키텍처 §4-3 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

#### CL10 · QA 버그 수정 (앱 로직)  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 테스트에서 나온 앱 동작 문제 고치기**  
> 전체 테스트(J7)에서 나온 문제 중 로그인, 데이터 불러오기, 채팅 연결, 알림처럼 앱 동작 쪽 문제를 고친다.

J7에서 나온 훅·세션·실시간·푸시 수신 버그를 수정함.

**세부 작업**
1. J7 버그 목록 중 CL 담당 항목 수정
2. 수정은 EAS Update로 내보낼 수 있게 JS 범위에서 처리

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 수정 PR | J7 통합 QA | QA에서 나온 담당 영역 치명 버그 0건 |

참조: 아키텍처 §6, 아키텍처 §7 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

### P4 SV(하린이)

#### SV1 · Supabase 환경·핵심 테이블  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 서버와 데이터 창고 만들기**  
> 앱의 모든 정보(회원, 글, 참여자, 메시지)를 저장할 데이터베이스를 만들고 개발용 서버를 준비한다. 엑셀로 치면 어떤 시트에 어떤 칸을 둘지 정하는 일이다.

로컬과 staging DB를 만들고 핵심 테이블을 정의함.

**세부 작업**
1. Supabase local(Docker)·staging 프로젝트 생성
2. 0001_extensions(pgcrypto, pg_cron, pg_net, pgmq)
3. 0002_tables: zones, categories, pickup_places, profiles, posts, participants, messages
4. enum 타입(post_status 등), 인덱스

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| supabase/migrations 0001–0002 | J1 킥오프 | supabase db reset이 오류 없이 끝남 |

참조: 아키텍처 §2, 아키텍처 §11 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV3 · 나머지 테이블·RPC 스텁·Auth 설정  
`Day 2` · 1일 · 1주차

> **쉽게 말하면: 서버 '메뉴판' 확정하기**  
> 앱이 서버에 요청할 수 있는 기능 목록(글 쓰기, 참여하기, 계좌 등록 등 24가지)의 이름과 주고받을 내용을 확정한다. 이 메뉴판이 정해져야 다른 사람들이 동시에 개발할 수 있다. POSTECH 메일만 가입되게 하는 설정도 이때 한다.

전 팀이 쓸 계약(스키마와 RPC 시그니처)을 고정함.

**세부 작업**
1. reports, blocks, sanctions, push_tokens, category_subscriptions, banned_words, deleted_accounts, rate_events
2. 헬퍼 함수: is_verified_member, is_participant, is_blocked_between, is_sanctioned, assert_rate, assert_clean
3. RPC 24종 시그니처(송금 3종 포함)를 빈 함수로 마이그레이션 → 타입 생성 가능
4. Before User Created Hook(@postech.ac.kr), OTP 6자리·10분, 비밀번호 정책, Gmail SMTP
5. CI: PR마다 db reset + pgTAP
6. 수동 송금: payout_accounts 테이블, posts.pay_due_at·pay_reminded_at, participants.paid_at, can_view_payout 헬퍼
7. 송금 RPC 스텁 추가: set_payout_account, get_host_account, reject_paid / 에러 코드 ACCOUNT_REQUIRED, PAY_DEADLINE_PASSED

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| migrations 0003–0005 스텁, Auth 설정, GitHub Actions | SV1 Supabase 환경·핵심 테이블, SV2 공용 Gmail SMTP 준비 | CL이 타입을 생성해 목 훅 작성 시작 · 오전 중 main에 머지(받는 쪽이 오후에 바로 이어서 작업) |

참조: 아키텍처 §2-2, 아키텍처 §2-3, 아키텍처 §3, 아키텍처 §4, 아키텍처 §11, 기획서 §1 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`, `.github/workflows/**`

#### SV4 · 프로필 RPC·RLS·메일 실측  
`Day 3` · 1일 · 1주차

> **쉽게 말하면: '누가 무엇을 볼 수 있나' 규칙 정하기**  
> 인증된 POSTECH 구성원만 데이터를 볼 수 있고 남의 정보는 고칠 수 없도록 서버에 보안 규칙을 건다. 실제 POSTECH 메일함에 인증 메일이 1분 안에 오는지도 확인한다.

인증 이후의 권한 경계를 완성함.

**세부 작업**
1. create_profile, update_profile
2. 0008_rls: 전 테이블 정책, 직접 쓰기 REVOKE
3. pgTAP: 도메인 거부 4종, 미인증 토큰 조회 0건
4. POSTECH 메일 수신 실측(받은편지함·도착 시간), 문제 시 즉시 공유
5. set_payout_account, get_host_account 구현, payout_accounts RLS(본인만)
6. pgTAP: 마감 전 참여자·비참여자는 방장 계좌 조회 거부, 마감 뒤 참여자만 허용

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| RLS 정책, 인증 pgTAP | SV3 나머지 테이블·RPC 스텁·Auth 설정, J2 계약 고정 | pgTAP 통과, POSTECH 메일함에 1분 안에 코드 도착 · 오전 중 main에 머지(받는 쪽이 오후에 바로 이어서 작업) |

참조: 아키텍처 §3-1, 아키텍처 §4, 아키텍처 §5, 아키텍처 §2-2, 아키텍처 §2-3 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV5 · 글·참여 RPC  
`Day 4` · 1일 · 1주차

> **쉽게 말하면: 글쓰기·참여하기의 서버 쪽 처리**  
> 글 저장, 글 목록, 참여·나가기를 서버에서 처리한다. 자리가 1명 남았을 때 두 사람이 동시에 눌러도 한 명만 들어가게 막는 것이 핵심이다. 도배 방지와 금지어 검사도 넣는다.

모집 글과 참여의 핵심 로직을 구현함.

**세부 작업**
1. create_post(1시간 5회, 금칙어), get_feed(커서, 차단 제외)
2. join_post: FOR UPDATE → 6단계 검증 → upsert → member_count
3. leave_post(이탈 기록, 방장 위임, 자동 취소), kick_member
4. seed: 임시 구역 3개, 픽업 장소, 카테고리, 금칙어
5. pgTAP: 정원 1명 남은 글 동시 참여 2건 중 1건만 성공, 마감 후 참여 거부
6. create_post: 방장 계좌 없으면 ACCOUNT_REQUIRED

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| posts·participants RPC, seed | SV4 프로필 RPC·RLS·메일 실측, OP3 생활 구역·픽업 장소 수집 | 동시성 pgTAP 통과 · 오전 중 main에 머지(받는 쪽이 오후에 바로 이어서 작업) |

참조: 아키텍처 §4, 아키텍처 §4-1, 아키텍처 §4-2 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV6 · 상태 전이·cron  
`Day 5` · 1일 · 1주차

> **쉽게 말하면: 마감·완료·취소 자동 처리**  
> 글의 상태(모집 중 → 마감 → 완료 또는 취소)를 바꾸는 규칙을 만들고, 마감 시간이 되면 서버가 알아서 마감하게 한다. 마감 10분 전 알림을 받을 사람도 이때 정한다.

글 상태 변경과 자동 마감을 구현함.

**세부 작업**
1. close_post, complete_post, cancel_post, 상태 전이 검증
2. 시스템 메시지 삽입
3. get_my_rooms(마지막 메시지, 안 읽은 수)
4. pg_cron: 1분 자동 마감, 마감 10분 전 알림 대상, 1시간 자동 완료
5. 마감 시 pay_due_at = closed_at + 30분, closed에서 취소 시 송금한 멤버가 있으면 환불 안내 큐
6. pg_cron 1분: 송금 기한 10분 전 알림 대상, 기한 지난 미송금 멤버 dropped 처리

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 상태 RPC, cron 작업 | SV5 글·참여 RPC | 마감 시각 1분 뒤 글이 closed로 바뀜 |

참조: 아키텍처 §4-2, 아키텍처 §8 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV7 · 채팅 RPC·방송  
`Day 6` · 1일 · 2주차

> **쉽게 말하면: 채팅 메시지 저장과 전달**  
> 메시지를 서버에 저장하고 같은 방 참여자에게만 실시간으로 전달한다. 참여하지 않은 사람은 대화를 엿볼 수 없게 막는다.

메시지 저장과 실시간 전달을 구현함.

**세부 작업**
1. send_message(10초 10회, 금칙어, client_msg_id), get_messages(커서), mark_read
2. messages INSERT 트리거 → realtime.send(room:{post_id})
3. realtime.messages RLS: 참여자만 구독
4. 상태 변경·송금 이벤트도 같은 채널로 방송
5. Day 6 오전: Realtime Authorization 최소 예제 먼저 검증

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅 RPC, 방송 트리거 | SV6 상태 전이·cron | 비참여자는 채널 구독이 거부됨 · 오전 중 main에 머지(받는 쪽이 오후에 바로 이어서 작업) |

참조: 아키텍처 §6, 아키텍처 §5 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV9 · 신고·제재·탈퇴·관리자 알림  
`Day 7–8` · 2일 · 2주차

> **쉽게 말하면: 신고·정지·계정 삭제의 서버 쪽 처리**  
> 3명이 신고하면 글을 자동으로 숨기고, 약속을 어긴 사람은 횟수에 따라 이용을 정지한다. 계정 삭제 요청을 처리하고, 신고가 들어오면 운영자 Slack으로 알림을 보낸다.

안전 장치와 계정 삭제를 서버에 구현함.

**세부 작업**
1. report: 3명 신고 시 자동 숨김, 노쇼 누적(방 단위 1회), 3회 14일·5회 영구 정지
2. block_user, unblock_user, 모든 RPC에 is_sanctioned 적용
3. Edge Function delete-account: 익명화, 메일 해시 90일 보관, auth 삭제
4. Edge Function admin-alert: reports → Slack (Slack 웹훅 직접 호출, 푸시 파이프라인과 무관)
5. 관심 카테고리 구독 RPC와 새 글 알림 — 푸시 발송 연결은 SV8 머지 후
6. delete-account: payout_accounts 행 즉시 삭제

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| moderation RPC, delete-account, admin-alert | SV7 채팅 RPC·방송 | 정지 계정의 글 작성·참여가 SANCTIONED로 거부 · 오전 중 main에 머지(받는 쪽이 오후에 바로 이어서 작업) |

참조: 아키텍처 §4-3, 아키텍처 §3-3 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV12 · QA 버그 수정 (서버)  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 테스트에서 나온 서버 문제 고치기**  
> 전체 테스트(J7)에서 나온 문제 중 데이터 저장, 권한, 자동 마감처럼 서버 쪽 문제를 고치고 production 서버에도 반영한다.

J7에서 나온 RPC·RLS·cron 버그를 수정하고 production에 반영함.

**세부 작업**
1. J7 버그 목록 중 SV 담당 항목 수정
2. pgTAP 테스트 추가 후 staging·production 마이그레이션

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 수정 PR | J7 통합 QA | QA에서 나온 담당 영역 치명 버그 0건 |

참조: 아키텍처 §4, 아키텍처 §5 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

### P5 OPS(김종연)

#### CL1 · Expo 프로젝트·기반  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 앱 프로젝트의 뼈대 만들기**  
> 모든 개발자가 같은 앱 프로젝트에서 작업을 시작할 수 있도록 기본 틀, 폴더 구조, 설정을 만든다. 5명 모두 자기 휴대폰에서 개발용 앱을 실행할 수 있으면 끝이다.

5명이 같은 앱 프로젝트로 개발을 시작할 수 있게 함.

**세부 작업**
1. Expo 프로젝트 생성: dev client, Expo Router, TS strict, New Architecture
2. ESLint·Prettier, 폴더 구조(아키텍처 §9)
3. lib/supabase.ts(MMKV 세션 저장), lib/queryClient.ts
4. 환경변수 구조(EXPO_PUBLIC_*), eas.json 프로필 3종
5. Apple 번들 ID·Android 패키지명 등록
6. P3가 함께 진행: lib/supabase.ts, lib/queryClient.ts 부분

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 앱 저장소 골격, eas.json | J1 킥오프 | 5명 모두 dev client로 앱 실행 |

참조: 아키텍처 §9, 아키텍처 §11 · 수정 허용: `**`

#### SV2 · 공용 Gmail SMTP 준비  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 인증 메일을 보낼 주소 준비**  
> 인증번호 메일을 보낼 팀 공용 Gmail 계정을 만들고, Supabase가 그 계정으로 메일을 보낼 수 있게 앱 비밀번호를 발급한다.

인증 메일 발송용 공용 Gmail과 앱 비밀번호를 준비함.

**세부 작업**
1. 팀 공용 Gmail 계정 생성, 2단계 인증 켜기, 복구 수단 팀원 2명 등록
2. 앱 비밀번호 발급, 비밀번호 관리자에만 보관
3. SMTP로 테스트 메일 1통 발송(smtp.gmail.com:465)
4. Day 2까지 POSTECH 메일로 테스트 메일 1통 발송해 도착·스팸함 여부 확인

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 발신 Gmail 계정과 앱 비밀번호 | 없음 | Gmail SMTP로 보낸 테스트 메일이 POSTECH 받은편지함에 도착. POSTECH 메일 게이트웨이의 Authentication-Results에서 SPF·DKIM·DMARC pass(학교 서버를 거친 뒤 Outlook 단계의 SPF softfail은 전달 때문이라 허용) |

참조: 아키텍처 §0, 아키텍처 §3-2 · 수정 허용: `docs/**`

#### OP3 · 생활 구역·픽업 장소 수집  
`Day 1–3` · 3일 · 1주차

> **쉽게 말하면: 생활 구역과 음식 받을 장소 정하기**  
> 캠퍼스를 어떤 구역으로 나눌지, 구역마다 배달 음식을 받을 공용 장소를 어디로 할지 조사해 표로 만든다. 서버 담당(P4)이 이 표를 앱에 넣는다.

seed에 넣을 실제 구역과 픽업 장소를 정함.

**세부 작업**
1. 캠퍼스 생활 구역 목록과 경계
2. 구역별 공용 픽업 장소 3~6곳
3. 장소 이름 표기 통일

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| docs/ops/zones.md (구역·픽업 장소 표) | J1 킥오프 | SV5 seed에 바로 넣을 수 있는 표 완성 |

참조: 아키텍처 §0, 아키텍처 §2-2 · 수정 허용: `docs/ops/**`

#### OP1 · 약관·개인정보처리방침·EULA  
`Day 2–4` · 3일 · 1주차

> **쉽게 말하면: 약관·개인정보처리방침 쓰기**  
> 앱 출시에 꼭 필요한 법적 문서(이용약관, 개인정보처리방침, 이용 규칙)를 쓴다. '앱은 거래 당사자가 아니다', '어떤 정보를 얼마나 보관하는지' 같은 내용이 들어간다.

출시에 필요한 법적 문서를 만듦.

**세부 작업**
1. 이용약관: 회원 간 거래, 회사는 당사자가 아님, 송금·환불은 회원 간 직접 하고 앱은 돈을 보관하지 않음
2. 개인정보처리방침: 수집 항목(메일, 닉네임, 송금 받을 계좌, 기기 토큰, 이용 기록), 국외 이전(Google(Gmail)·Sentry·PostHog·Expo), 보관 기간(메일 해시·메시지 90일, 계좌 탈퇴 즉시 삭제)
3. EULA: 부적절한 콘텐츠 무관용
4. 접근권한 고지 문구
5. 변호사 검토 요청

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| docs/legal/terms.md, privacy.md, eula.md, 앱 표시용 문구(strings.ts) | J1 킥오프 | 초안 완성, FE4 화면에 문구 반영 가능 |

참조: 기획서 §1, 기획서 §1-1, 아키텍처 §13 · 수정 허용: `docs/legal/**`, `src/constants/strings.ts`

#### CL8a · 관측 도구 연결 (Sentry·PostHog)  
`Day 5` · 1일 · 1주차

> **쉽게 말하면: 오류 감시·사용 통계 도구 연결**  
> 앱에서 오류가 나면 자동으로 알려 주는 도구(Sentry)와 사용 통계 도구(PostHog)를 미리 연결해, 2주차 개발과 테스트 동안 생기는 오류를 빠짐없이 모은다.

오류 감시와 사용 통계 도구를 일찍 연결해 2주차 개발·QA 동안 오류를 모은다.

**세부 작업**
1. Sentry 연결과 소스맵 업로드(EAS Build·Update)
2. Edge Function 오류도 Sentry로 수집
3. PostHog 이벤트(아키텍처 §12)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| Sentry·PostHog 연결 | CL1 Expo 프로젝트·기반 | staging 앱에서 낸 테스트 오류가 Sentry에 들어옴 |

참조: 아키텍처 §12 · 수정 허용: `app.config.ts`, `eas.json`, `package.json`, `src/lib/sentry.ts`, `src/lib/analytics.ts`

#### OP2 · 스토어 등록 자료  
`Day 6–9` · 4일 · 2주차

> **쉽게 말하면: 앱스토어 등록 자료 준비**  
> 앱스토어·플레이스토어에 올릴 앱 이름, 소개 글, 검색 키워드, 심사 담당자에게 보낼 설명, 개인정보 수집 항목 표를 준비한다.

App Store·Play 심사 제출 자료를 준비함.

**세부 작업**
1. 앱 이름·부제·설명·키워드
2. 심사 노트: 심사용 계정, UGC 대응(신고·차단·EULA), 결제 미취급 설명
3. 연령 등급, 개인정보 라벨(App Privacy, Data safety)
4. Play 계정 삭제 웹 URL

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| docs/store/metadata.md | OP1 약관·개인정보처리방침·EULA | App Store Connect·Play Console에 입력 완료(스크린샷 제외) |

참조: 기획서 §1, 기획서 §1-1 · 수정 허용: `docs/store/**`

#### SV8 · 송금 RPC·푸시 파이프라인  
`Day 7` · 1일 · 2주차

> **쉽게 말하면: 송금 기록·알림 발송 장치**  
> '보냈어요·받았어요' 기록을 서버에 저장하고, 일이 생기면 휴대폰 알림을 보내는 발송 장치를 만든다. 메시지가 연달아 와도 알림이 쏟아지지 않게 묶어서 보낸다.

송금 체크와 알림 발송 경로를 구현함.

**세부 작업**
1. mark_paid(closed·기한 전만), confirm_paid(되돌리기 불가), reject_paid(확인 전 sent → none)
2. pgmq push 큐, 핵심 이벤트 9종 + 송금 이벤트(기한 임박, 입금 안 됨, 기한 초과, 환불 안내) enqueue
3. Edge Function push-worker: 30초 묶음, 설정·mute·차단 재확인, 100건 배치, receipt로 만료 토큰 삭제
4. pg_cron 10초마다 pg_net으로 push-worker 호출

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 송금 RPC, push-worker | SV7 채팅 RPC·방송 | 메시지 10개 연속 전송 시 알림 1건으로 묶여 도착 |

참조: 아키텍처 §7, 아키텍처 §4-2, 아키텍처 §8 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/functions/push-worker/**`

#### CL7b · 카카오 공유·딥링크  
`Day 8` · 1일 · 2주차

> **쉽게 말하면: 카카오톡 공유 기능**  
> 모집 글을 카카오톡으로 공유하고, 받은 사람이 링크를 누르면 앱의 그 글이 바로 열리게 한다.

공유 경로를 만듦.

**세부 작업**
1. 카카오 SDK config plugin, 피드 템플릿 공유
2. Universal Links·App Links 설정(app.config)
3. 공유 실패 시 OS 기본 공유 시트로 대체

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| lib/kakao.ts, lib/linking.ts | CL1 Expo 프로젝트·기반, CL4 피드·글·참여 훅 | 카카오톡 공유 링크로 상세 화면이 열림 |

참조: 아키텍처 §10 · 수정 허용: `app.config.ts`, `package.json`, `src/lib/kakao.ts`, `src/lib/linking.ts`

#### CL8b · 폴백 웹·카카오 키 해시  
`Day 9` · 1일 · 2주차

> **쉽게 말하면: 앱 없는 사람용 웹페이지**  
> 앱이 없는 사람이 공유 링크를 누르면 안내 웹페이지가 뜨게 하고, 카카오 공유가 모든 빌드에서 동작하도록 키를 등록한다.

앱 밖에서 링크를 연 사람을 위한 경로를 마무리함.

**세부 작업**
1. web/ 폴백 페이지(인증 후 확인 안내), AASA, assetlinks.json → Cloudflare Pages
2. 카카오 키 해시 3종(디버그, EAS 업로드, Play 앱 서명)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| web/ 배포 | CL7b 카카오 공유·딥링크 | 앱 미설치 기기에서 링크 → 폴백 페이지 |

참조: 아키텍처 §10 · 수정 허용: `web/**`, `app.config.ts`

#### SV10 · 보안 점검·production 구성  
`Day 9–10` · 2일 · 2주차

> **쉽게 말하면: 보안 점검·실제 운영 서버 준비**  
> 출시 전 보안 체크리스트를 점검하고, 개발용과 분리된 실제 사용자용 서버를 만든다. 데이터를 매주 백업하도록 설정한다.

운영 환경을 만들고 보안 체크리스트를 통과시킴.

**세부 작업**
1. 보안 체크리스트(아키텍처 §13): Advisors 0건, REVOKE, search_path, gitleaks
2. production 프로젝트(서울 리전 Pro): 마이그레이션, Hook 등록, SMTP, Turnstile
3. Vault email_pepper, cron, Edge Function secrets
4. 주간 pg_dump 백업 설정

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| production 환경 | SV9 신고·제재·탈퇴·관리자 알림 | Day 10 오전까지 production에서 가입·로그인 1회 성공 |

참조: 아키텍처 §13, 아키텍처 §11 · 수정 허용: `supabase/**`, `.github/workflows/**`

#### CL9 · 베타 빌드 배포  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 테스트용 앱 배포**  
> 실제 사용자용 앱을 만들어 테스터들이 설치할 수 있게 앱스토어(TestFlight)와 플레이스토어 내부 테스트에 올린다.

production 빌드를 테스터에게 배포함.

**세부 작업**
1. Day 10 오전에 Day 9 코드로 production 빌드 시작(빌드·TestFlight 처리에 몇 시간 걸림)
2. EAS production 빌드(iOS·Android)
3. TestFlight·Play 내부 테스트 업로드
4. 심사용 계정으로 로그인 확인
5. EAS Update 채널(production, preview) 확인
6. 빌드 후 나온 수정(FE11 등)은 EAS Update로 배포

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 베타 빌드 | J7 통합 QA, SV10 보안 점검·production 구성 | 테스터 기기에 설치 후 전체 흐름 동작 |

참조: 아키텍처 §11 · 수정 허용: `app.config.ts`, `eas.json`, `package.json`

#### SV11 · 심사 계정·지표·모니터링  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 심사용 계정·운영 지표·장애 알림**  
> 앱스토어 심사 담당자가 쓸 테스트 계정을 준비하고, '매칭 성공률' 같은 핵심 숫자를 볼 수 있게 한다. 서버에 문제가 생기면 Slack으로 바로 알림이 오게 한다.

출시 운영에 필요한 장치를 마무리함.

**세부 작업**
1. 심사용 POSTECH 계정 생성·인증, 심사 노트 작성
2. 지표 SQL 뷰: 매칭률, 첫 참여 중앙값, 일간 글 수, Day 7 리텐션
3. 모니터링 알림: DB CPU 80%, Realtime 70%, push-worker 실패율 5%

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 심사 계정, 지표 뷰, 알림 설정 | SV10 보안 점검·production 구성 | Slack에 테스트 알림 수신 |

참조: 아키텍처 §12, 기획서 §1-1 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `docs/**`

### 공동

#### J1 · 킥오프  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 첫 회의: 역할과 규칙 정하기**  
> 5명이 모여 누가 무엇을 맡는지, 작업을 어떻게 올리고 서로 검토하는지 정한다. 필요한 서비스 계정에 모두 접속할 수 있는지 확인한다.

역할·규칙·도구를 합의하고 시작함.

**세부 작업**
1. Day 0 사전 점검 결과 확인(아래 메모 'Day 0 사전 점검')
2. 오전 킥오프 30분: 역할, 브랜치 규칙(feat/fe-*, feat/cl-*, feat/sv-*, feat/op-*), PR 리뷰 1명
3. 계정 점검: Apple·Google 개발자, Supabase, 공용 Gmail, Sentry, PostHog, Slack, 카카오
4. 테스트용 POSTECH 메일 3개 이상 확보
5. 담당자별 수정 범위(tasks.json의 paths) 확인

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 협업 규칙 | 없음 | 5명 모두 저장소·콘솔 접근 가능 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J2 · 계약 고정  
`Day 2` · 1일 · 1주차

> **쉽게 말하면: 서버 '메뉴판' 함께 확정**  
> 서버가 제공할 기능 목록과 데이터 모양을 모두 함께 확인하고 고정한다. 이후에는 함부로 바꾸지 않는다. 그래야 각자 동시에 개발해도 나중에 잘 맞물린다.

마일스톤 1. 스키마와 RPC 시그니처를 동결함.

**세부 작업**
1. SV3 결과 리뷰: 테이블, RPC 입력·출력, 에러 코드
2. types/database.ts 커밋, 목 훅 공유
3. 이후 변경은 아키텍처 §4 수정 → 공지 순서로만
4. 수동 송금 계약 확인: 계좌 저장 위치·노출 범위(마감 뒤 참여자만), 송금 기한 30분, reject_paid, 호실 수집 여부 결정

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 고정된 계약 | SV3 나머지 테이블·RPC 스텁·Auth 설정, CL2 인증 가드·타입·목 훅 | 5명이 같은 타입 파일로 개발 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J3 · 인증 E2E 확인  
`Day 4` · 1일 · 1주차

> **쉽게 말하면: 가입·로그인 실제 확인**  
> 실제 휴대폰으로 POSTECH 메일 가입부터 로그인까지 해 보고, 다른 메일로는 가입이 안 되는지 확인한다.

마일스톤 2. 실기기에서 POSTECH 인증을 끝까지 확인함.

**세부 작업**
1. 실제 POSTECH 메일로 가입 → 코드 → 로그인 → 프로필
2. @gmail.com 등 다른 도메인 가입 거부 확인
3. 비밀번호 재설정 확인

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 인증 확인 기록 | CL3 인증 훅·실기기 E2E, FE3 가입·로그인 화면, FE4 첫 실행 안내·프로필 설정 화면, SV4 프로필 RPC·RLS·메일 실측 | iOS·Android 각 1대에서 통과 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J4 · 1주차 데모  
`Day 5` · 1일 · 1주차

> **쉽게 말하면: 1주차 시연**  
> 글 쓰기 → 참여 → 글 상세 → 채팅방 목록까지 실제로 동작하는 모습을 함께 본다. 발견한 문제를 중요도별로 나누고 2주차 계획을 다시 확인한다.

마일스톤 3. 피드·글·참여를 staging에서 시연함.

**세부 작업**
1. 15:00까지 데모에 쓸 코드 머지(16:00 데모)
2. 16:00 staging 데모: 글 작성 → 참여 → 상세 → 방 목록
3. 버그 분류(치명·일반·나중)
4. 2주차 범위 재확인

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 버그 목록, 2주차 범위 | CL4 피드·글·참여 훅, FE6 글 상세·내 채팅방 목록 화면, SV6 상태 전이·cron | 데모 시나리오 끊김 없이 동작 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J5 · 채팅 E2E  
`Day 7` · 1일 · 2주차

> **쉽게 말하면: 채팅·알림 실제 확인**  
> 휴대폰 2대로 채팅, 자동 마감 알림, 송금 확인, 앱을 껐다 켰을 때 메시지 복구를 확인한다.

마일스톤 4. 채팅·마감·송금·푸시를 기기 2대로 확인함.

**세부 작업**
1. 15:00까지 확인에 쓸 코드 머지
2. 실시간 채팅 왕복
3. 자동 마감 → 전원 푸시
4. 보냈어요 → 방장 입금 안 됨 → 다시 보냈어요 → 입금 확인
5. 백그라운드 복귀 후 놓친 메시지 복구
6. 미입금자가 있을 때 '주문하러 가기' 잠김, 송금 기한 초과 시 미송금자 자동 제외(기한을 짧게 바꾼 staging에서)
7. 마감 전에는 계좌가 안 보이고 마감 뒤 참여자에게만 보임

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅 확인 기록 | CL5 실시간 채팅 클라이언트, CL6 푸시 클라이언트, FE8 송금 표시·알림 설정 화면, SV8 송금 RPC·푸시 파이프라인 | 시나리오 6종 통과 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J6 · 기능 동결  
`Day 8` · 1일 · 2주차

> **쉽게 말하면: 기능 추가 마감**  
> 출시에 꼭 필요한 기능이 모두 들어갔는지 확인하고, 이후에는 새 기능 없이 버그 수정만 한다.

마일스톤 5. MUST 기능을 모두 머지하고 버그 수정만 함.

**세부 작업**
1. MUST 기능 체크리스트 대조
2. 미완료 항목은 대체안 적용 또는 다음 주로 이동
3. main 보호, 이후 PR은 fix/ 만

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 동결 빌드 | FE9 방장 메뉴·신고·차단·설정 화면, CL7a 신고·차단 훅, CL7b 카카오 공유·딥링크, SV9 신고·제재·탈퇴·관리자 알림, J5 채팅 E2E | MUST 항목 전부 main에 있음 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J7 · 통합 QA  
`Day 9` · 1일 · 2주차

> **쉽게 말하면: 전체 테스트**  
> 아이폰·안드로이드 실제 휴대폰으로 9가지 사용 시나리오를 처음부터 끝까지 해 보고, 발견한 문제를 담당자에게 배정한다.

시나리오 9종으로 전체를 점검함.

**세부 작업**
1. staging 서버에서 진행(production은 SV10이 따로 준비)
2. 14:00~ iOS·Android 실기기 각 1대 이상
3. 1 도메인 거부·POSTECH 가입 2 동시 참여 정원 3 백그라운드 복구
4. 4 자동 마감·송금·완료 5 이탈·방장 위임 6 신고 숨김·노쇼 정지
5. 7 차단 8 카카오 공유·폴백 9 계정 삭제

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| QA 결과표, 버그 목록 | J6 기능 동결, FE10a 화면 마무리 수정, FE10b 디자인 마무리 검수, CL8b 폴백 웹·카카오 키 해시, CL8a 관측 도구 연결 (Sentry·PostHog) | 치명 버그 목록 확정, 담당자(P1~P5) 배정 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J8 · 베타 빌드·회고  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 테스트 앱 배포·회고**  
> 테스터에게 앱 설치 링크를 보내고, 10일 동안 잘된 점과 아쉬운 점을 돌아보며 다음 주(스토어 심사, 베타 모집) 계획을 세운다.

마일스톤 6. 베타 빌드를 내보내고 다음 주를 계획함.

**세부 작업**
1. TestFlight·Play 내부 테스트 배포 확인
2. 16:00 회고 30분
3. 다음 주: 베타 모집, 스토어 심사 제출, 앰배서더

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 베타 빌드, 다음 주 계획 | CL9 베타 빌드 배포, FE11 QA 버그 수정, SV11 심사 계정·지표·모니터링, CL10 QA 버그 수정 (앱 로직), SV12 QA 버그 수정 (서버) | 테스터에게 설치 링크 전달 |

참조: timeline 메모 · 수정 허용: `docs/**`

## 메모

### 마일스톤
- Day 2: 계약 고정
- Day 4: 인증 E2E
- Day 5: 1주차 데모
- Day 7: 채팅 E2E
- Day 8: 기능 동결
- Day 10: 베타 빌드

### 핵심 경로
- SV3 계약 → CL2 타입·목 훅 → SV4 RLS → CL3 인증 E2E
- SV5 참여 RPC → CL4 피드·참여 훅 → J4 데모
- SV7 방송 → CL5 실시간 → J5 채팅 E2E → J6 동결
- SV7 → SV9 신고·제재(Day 7–8) → J6 동결 → J7 QA → CL9 베타
- 서버 → 앱 인계(SV3·SV4·SV5·SV7·SV9)는 그날 오전에 머지한다.

### Day 0 사전 점검
- Apple 개발자 계정: 단체 계정은 D-U-N-S 발급에 1~2주. 미리 등록
- Google Play: 새 개인 계정은 정식 출시 전 12명 이상·14일 비공개 테스트 필요(다음 주 출시 계획에 반영)
- 테스트용 POSTECH 메일 3개 이상 확보
- Supabase·공용 Gmail·Sentry·PostHog·Slack·카카오 계정 생성

### P1·P2 인계
- 시안은 P1이 코딩하기 하루 전까지 전달: ①가입(D2→D3) ②목록·상세(D3→D4) ③채팅(D5→D6) ④방장·신고(D6→D8)
- 매일 오후 15분 함께 화면 검수(DS5), 작은 수정은 그날 반영
- P2는 코드를 고치지 않고 시안·검수 목록·문구를 docs/design에 올림, 반영은 P1
- P1이 밀리면 빼는 순서: 다크모드 세부 → 99+ 배지 → 차단 목록 화면 → 스켈레톤 로딩

## 협업 규칙

- **작업 지시**: Claude Code에 태그를 말한다(`SV5 해줘`, `/task SV5`). 절차는 `.claude/skills/task/SKILL.md`.
- **스탠드업**: 매일 10:00, 15분. 어제 한 일, 오늘 할 일, 막힌 것.
- **브랜치**: `feat/<태그 접두사 소문자>-<태그>-<요약>` (예: `feat/sv-SV5-join-post`, `feat/op-OP1-legal`) → `main`. PR 리뷰 1명, CI 통과 필수. 동결(Day 8) 후에는 `fix/*`만.
- **리뷰 짝**: P1의 화면 PR은 P3(코드)와 P2(디자인 확인)가, P3↔P4(훅·RPC 계약), P5는 P4(서버 쪽)·P3(앱 설정)에게 받는다.
- **계약 변경**: P4가 아키텍처 §4 수정 → `types/database.ts` 재생성 커밋 → P3가 훅 갱신 → P1·P2에 공지.
- **오전 인계**: 서버 → 앱으로 넘기는 작업(SV3·SV4·SV5·SV7·SV9)은 그날 오전에 main에 머지한다. 받는 쪽은 오전에 목 데이터로 시작한다.
- **30분 규칙**: 30분 넘게 막히면 바로 공유. 일정에 영향이 있으면 그날 스탠드업에서 범위를 다시 조정한다.
