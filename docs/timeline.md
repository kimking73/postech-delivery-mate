# 배달메이트 2주 개발 타임라인

> ⚠️ 이 파일은 `docs/tasks/tasks.json`에서 생성된다. 직접 고치지 말고 `python3 docs/tasks/task.py gen`을 실행한다.  
> 기준 문서: [기획서](./기획서.md), [아키텍처](./아키텍처.md)  
> 기간: 10일(Day 1–10), 순서 기준. 실제 시작일은 팀 일정에 맞춰 정한다.  
> 목표: Day 10에 MUST 기능을 갖춘 베타 빌드를 TestFlight / Play 내부 테스트에 올린다. 스토어 심사와 공개 베타는 그다음 주.  
> 사람용 현황판: 아티팩트 "배달메이트 2주 개발 타임라인"(사람이 완료 체크만 한다. AI는 이 저장소의 tasks.json만 본다).

## 레인(역할)

| 레인 | 담당 범위 | 기본 수정 범위(작업별 정확한 범위는 각 작업의 paths) |
|---|---|---|
| **P1 FE-A(혜인이)** | 디자인 규칙·화면 설계도, 가입·첫 실행·글 상세·설정·신고 화면을 직접 코딩 | `app/(auth)/**`, `app/post/[id]/index.tsx`, `app/(tabs)/rooms.tsx`, `app/(tabs)/settings.tsx`, `app/settings/**`, `src/features/auth/components/**`, `src/features/profile/components/**`, `src/features/moderation/components/**`, `src/constants/strings.ts` |
| **P2 FE-B(민준이)** | 공용 화면 부품, 글 목록·글쓰기·채팅·송금 화면을 직접 코딩, 스토어 사진 | `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts` |
| **P3 CL(재민이)** | 인증 세션, 데이터 훅, 실시간 채팅, 푸시 클라이언트 | `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**` |
| **P4 SV(하린이)** | 스키마, RLS, RPC, 채팅 방송, 신고·제재 | `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts` |
| **P5 OPS(김종연)** | Expo·EAS, 도메인·메일, 푸시 워커, 딥링크, 운영 환경, 약관·스토어 | `app.config.ts`, `eas.json`, `package.json`, `src/lib/{kakao,linking,sentry,analytics}.ts`, `web/**`, `supabase/functions/push-worker/**`, `.github/workflows/**`, `docs/legal/**`, `docs/store/**`, `docs/ops/**` |
| **공동** | 킥오프, 계약 고정, 데모, 동결, QA, 베타 | `docs/**` |

작업 태그 접두사(`FE`, `CL`, `SV`, `OP`, `J`)는 작업 종류이고, 담당자는 레인이 정한다. 예를 들어 CL1, SV2, SV8은 P5가 맡는다.

**경계 규칙**: 화면(P1·P2)은 P3가 만든 훅만 쓴다(서버가 준비되기 전에는 같은 타입의 목 훅). 공용 UI(`src/components/ui`)는 P2만 고친다. P3는 DB를 직접 고치지 않고 P4에 요청한다. RPC를 바꿀 때는 P4가 [아키텍처 §4](./아키텍처.md)를 먼저 고치고 공지한다. 빌드·배포 설정(`app.config.ts`, `eas.json`, `package.json`)은 P5가 관리한다.

## 마일스톤

| 순서 | 마일스톤 | 완료 기준 |
|---|---|---|
| Day 2 | J2 계약 고정 | 5명이 같은 타입 파일로 개발 |
| Day 4 | J3 인증 E2E 확인 | iOS·Android 각 1대에서 통과 |
| Day 5 | J4 1주차 데모 | 데모 시나리오 끊김 없이 동작 |
| Day 7 | J5 채팅 E2E | 시나리오 4종 통과 |
| Day 8 | J6 기능 동결 | MUST 항목 전부 main에 있음 |
| Day 10 | J8 베타 빌드·회고 | 테스터에게 설치 링크 전달 |

## 작업 상태

한 줄에 작업 하나. 상태는 `task.py set`으로만 바꾼다.

| 태그 | 작업 | 담당 | 기간 | 선행 | 상태 |
|---|---|---|---|---|---|
| FE1 | 디자인 규칙·화면 설계도 | P1 | Day 1 | J1 | ⬜ todo |
| FE3 | 가입·로그인 화면 | P1 | Day 2–3 | FE2, CL2 | ⬜ todo |
| FE4 | 첫 실행 안내·프로필 설정 화면 | P1 | Day 3 | FE2, CL2 | ⬜ todo |
| FE6 | 글 상세·내 채팅방 목록 화면 | P1 | Day 4–5 | FE2 | ⬜ todo |
| FE9 | 신고·차단·설정 화면 | P1 | Day 6–7 | FE2 | ⬜ todo |
| FE10a | 화면 마무리 점검 (가입·첫 실행·설정·신고) | P1 | Day 8–9 | J6 | ⬜ todo |
| FE2 | 공용 화면 부품(UI 키트) | P2 | Day 2 | FE1 | ⬜ todo |
| FE5 | 글 목록(피드)·글쓰기 화면 | P2 | Day 3–4 | FE2 | ⬜ todo |
| FE7 | 채팅 화면 | P2 | Day 5–6 | FE5 | ⬜ todo |
| FE8 | 송금 확인 표시·알림 설정 화면 | P2 | Day 7 | FE7 | ⬜ todo |
| FE10b | 화면 마무리 점검 (글 목록·상세·채팅·송금) | P2 | Day 9 | J6 | ⬜ todo |
| FE11 | QA 버그 수정·스토어 사진 | P2 | Day 10 | J7 | ⬜ todo |
| CL2 | 인증 가드·타입·목 훅 | P3 | Day 2 | CL1, SV3 | ⬜ todo |
| CL3 | 인증 훅·실기기 E2E | P3 | Day 3–4 | CL2, SV4 | ⬜ todo |
| CL4 | 피드·글·참여 훅 | P3 | Day 4–5 | CL3, SV5 | ⬜ todo |
| CL5 | 실시간 채팅 클라이언트 | P3 | Day 6–7 | CL4, SV7 | ⬜ todo |
| CL6 | 푸시 클라이언트 | P3 | Day 7 | CL5, SV8 | ⬜ todo |
| CL7a | 신고·차단 훅 | P3 | Day 8 | CL4, SV9 | ⬜ todo |
| SV1 | Supabase 환경·핵심 테이블 | P4 | Day 1 | J1 | ⬜ todo |
| SV3 | 나머지 테이블·RPC 스텁·Auth 설정 | P4 | Day 2 | SV1, SV2 | ⬜ todo |
| SV4 | 프로필 RPC·RLS·메일 실측 | P4 | Day 3 | SV3 | ⬜ todo |
| SV5 | 글·참여 RPC | P4 | Day 4 | SV4, OP3 | ⬜ todo |
| SV6 | 상태 전이·cron | P4 | Day 5 | SV5 | ⬜ todo |
| SV7 | 채팅 RPC·방송 | P4 | Day 6 | SV6 | ⬜ todo |
| SV9 | 신고·제재·탈퇴·관리자 알림 | P4 | Day 8 | SV8 | ⬜ todo |
| CL1 | Expo 프로젝트·기반 | P5 | Day 1 | J1 | ⬜ todo |
| SV2 | 도메인·Resend DNS | P5 | Day 1 | — | ⬜ todo |
| OP3 | 생활 구역·픽업 장소 수집 | P5 | Day 1–3 | J1 | ⬜ todo |
| OP1 | 약관·개인정보처리방침·EULA | P5 | Day 2–4 | J1 | ⬜ todo |
| OP2 | 스토어 등록 자료 | P5 | Day 6–9 | OP1 | ⬜ todo |
| SV8 | 송금 RPC·푸시 파이프라인 | P5 | Day 7 | SV7 | ⬜ todo |
| CL7b | 카카오 공유·딥링크 | P5 | Day 8 | CL1, CL4 | ⬜ todo |
| CL8 | 폴백 웹·관측 도구 | P5 | Day 9 | CL7b | ⬜ todo |
| SV10 | 보안 점검·production 구성 | P5 | Day 9 | SV9 | ⬜ todo |
| CL9 | 베타 빌드 배포 | P5 | Day 10 | J7, SV10 | ⬜ todo |
| SV11 | 심사 계정·지표·모니터링 | P5 | Day 10 | SV10 | ⬜ todo |
| J1 | 킥오프 | J | Day 1 | — | ⬜ todo |
| J2 | 계약 고정 | J | Day 2 | SV3, CL2, FE2 | ⬜ todo |
| J3 | 인증 E2E 확인 | J | Day 4 | CL3, FE3, FE4, SV4 | ⬜ todo |
| J4 | 1주차 데모 | J | Day 5 | CL4, FE6, SV6 | ⬜ todo |
| J5 | 채팅 E2E | J | Day 7 | CL5, CL6, FE8, SV8 | ⬜ todo |
| J6 | 기능 동결 | J | Day 8 | FE9, CL7a, CL7b, SV9 | ⬜ todo |
| J7 | 통합 QA | J | Day 9 | J6, FE10a, FE10b, CL8, SV10 | ⬜ todo |
| J8 | 베타 빌드·회고 | J | Day 10 | CL9, FE11, SV11 | ⬜ todo |

## 순서별 보기

| 순서 | P1 FE-A(혜인이) | P2 FE-B(민준이) | P3 CL(재민이) | P4 SV(하린이) | P5 OPS(김종연) | 공동 |
|---|---|---|---|---|---|---|
| **Day 1** | FE1 디자인 규칙·화면 설계도 | — | — | SV1 Supabase 환경·핵심 테이블 | CL1 Expo 프로젝트·기반<br>SV2 도메인·Resend DNS<br>OP3 생활 구역·픽업 장소 수집 | J1 킥오프 |
| **Day 2** | FE3 가입·로그인 화면 | FE2 공용 화면 부품(UI 키트) | CL2 인증 가드·타입·목 훅 | SV3 나머지 테이블·RPC 스텁·Auth 설정 | OP3 생활 구역·픽업 장소 수집<br>OP1 약관·개인정보처리방침·EULA | J2 계약 고정 |
| **Day 3** | FE3 가입·로그인 화면<br>FE4 첫 실행 안내·프로필 설정 화면 | FE5 글 목록(피드)·글쓰기 화면 | CL3 인증 훅·실기기 E2E | SV4 프로필 RPC·RLS·메일 실측 | OP3 생활 구역·픽업 장소 수집<br>OP1 약관·개인정보처리방침·EULA | — |
| **Day 4** | FE6 글 상세·내 채팅방 목록 화면 | FE5 글 목록(피드)·글쓰기 화면 | CL3 인증 훅·실기기 E2E<br>CL4 피드·글·참여 훅 | SV5 글·참여 RPC | OP1 약관·개인정보처리방침·EULA | J3 인증 E2E 확인 |
| **Day 5** | FE6 글 상세·내 채팅방 목록 화면 | FE7 채팅 화면 | CL4 피드·글·참여 훅 | SV6 상태 전이·cron | — | J4 1주차 데모 |
| **Day 6** | FE9 신고·차단·설정 화면 | FE7 채팅 화면 | CL5 실시간 채팅 클라이언트 | SV7 채팅 RPC·방송 | OP2 스토어 등록 자료 | — |
| **Day 7** | FE9 신고·차단·설정 화면 | FE8 송금 확인 표시·알림 설정 화면 | CL5 실시간 채팅 클라이언트<br>CL6 푸시 클라이언트 | — | OP2 스토어 등록 자료<br>SV8 송금 RPC·푸시 파이프라인 | J5 채팅 E2E |
| **Day 8** | FE10a 화면 마무리 점검 (가입·첫 실행·설정·신고) | — | CL7a 신고·차단 훅 | SV9 신고·제재·탈퇴·관리자 알림 | OP2 스토어 등록 자료<br>CL7b 카카오 공유·딥링크 | J6 기능 동결 |
| **Day 9** | FE10a 화면 마무리 점검 (가입·첫 실행·설정·신고) | FE10b 화면 마무리 점검 (글 목록·상세·채팅·송금) | — | — | OP2 스토어 등록 자료<br>CL8 폴백 웹·관측 도구<br>SV10 보안 점검·production 구성 | J7 통합 QA |
| **Day 10** | — | FE11 QA 버그 수정·스토어 사진 | — | — | CL9 베타 빌드 배포<br>SV11 심사 계정·지표·모니터링 | J8 베타 빌드·회고 |

## 작업 상세

### P1 FE-A(혜인이)

#### FE1 · 디자인 규칙·화면 설계도  
`Day 1` · 1일 · 1주차

앱의 색, 글씨 크기, 여백 같은 '디자인 규칙'을 정하고, 모든 화면의 대략적인 설계도(와이어프레임)를 그린다. 이후 모든 화면이 이 규칙을 따른다.

**세부 작업**
1. 앱에서 쓸 색, 글씨 크기, 여백, 모서리 둥글기를 정해 코드에 기준값으로 저장(theme.ts). 어두운 화면(다크모드) 색도 함께 정함
2. 정한 규칙이 실제 앱 화면에 적용되는지 확인(NativeWind 연결)
3. 화면 설계도: 가입·로그인 6개 화면, 글 목록, 글 상세, 글쓰기, 채팅, 내 채팅방 목록, 설정
4. 사용 흐름 그림: 가입 → 프로필 만들기 → 글 목록 → 참여 → 채팅

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 디자인 규칙 파일(theme.ts), 화면 설계도, 사용 흐름 그림 | J1 킥오프 | 화면마다 어떤 정보가 필요한지 P3(앱 로직)·P4(서버)와 맞춰 보고 빠진 것이 없음 |

참조: 아키텍처 §9, 기획서 §1 · 수정 허용: `src/constants/theme.ts`, `tailwind.config.js`, `global.css`, `assets/**`, `docs/design/**`

#### FE3 · 가입·로그인 화면  
`Day 2–3` · 2일 · 1주차

POSTECH 메일로 가입하고, 메일로 받은 인증번호를 넣고, 로그인과 비밀번호 찾기까지 하는 화면을 만든다.

**세부 작업**
1. 로그인 화면, 회원가입 화면(메일·비밀번호 입력, 약관 동의)
2. 인증번호 입력 화면: 숫자 6칸, '다시 보내기'는 60초 뒤에 누를 수 있음
3. 비밀번호 찾기·새 비밀번호 설정 화면
4. @postech.ac.kr이 아닌 메일을 넣었을 때 보여줄 안내 문구

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 가입·로그인 화면들(app/(auth)) | FE2 공용 화면 부품(UI 키트), CL2 인증 가드·타입·목 훅 | 서버 연결 전 가짜 데이터(목 훅)로 가입 → 인증번호 입력 → 로그인 순서로 화면이 넘어감 |

참조: 아키텍처 §3-3, 기획서 §1-1 · 수정 허용: `app/(auth)/**`, `app/post/[id]/index.tsx`, `app/(tabs)/rooms.tsx`, `app/(tabs)/settings.tsx`, `app/settings/**`, `src/features/auth/components/**`, `src/features/profile/components/**`, `src/features/moderation/components/**`, `src/constants/strings.ts`

#### FE4 · 첫 실행 안내·프로필 설정 화면  
`Day 3` · 1일 · 1주차

앱을 처음 켰을 때 보는 화면들(권한 안내, 약관 동의, 닉네임·생활 구역 정하기)을 만든다.

**세부 작업**
1. 알림 같은 휴대폰 권한을 왜 쓰는지 안내(필수·선택 구분, 법에서 요구하는 안내)
2. 이용약관·개인정보처리방침·이용 규칙(EULA) 동의 화면. 문구는 P5가 OP1에서 작성
3. 프로필 설정: 닉네임(이미 있는 이름이나 금지어면 오류 표시), 생활 구역 선택
4. 입력이 잘못됐을 때 칸 아래에 뜨는 안내 문구(react-hook-form + zod)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 권한 안내·약관 동의·프로필 설정 화면 | FE2 공용 화면 부품(UI 키트), CL2 인증 가드·타입·목 훅 | 가짜 데이터로 첫 실행 안내부터 프로필 저장까지 끝까지 진행됨 |

참조: 아키텍처 §3-3, 기획서 §1-1 · 수정 허용: `app/(auth)/**`, `app/post/[id]/index.tsx`, `app/(tabs)/rooms.tsx`, `app/(tabs)/settings.tsx`, `app/settings/**`, `src/features/auth/components/**`, `src/features/profile/components/**`, `src/features/moderation/components/**`, `src/constants/strings.ts`

#### FE6 · 글 상세·내 채팅방 목록 화면  
`Day 4–5` · 2일 · 1주차

모집 글 하나를 눌렀을 때 보이는 상세 화면과, 내가 참여한 채팅방 목록 화면을 만든다.

**세부 작업**
1. 글 상세: 가게·마감 시간·픽업 장소 등 정보, 참여자 프로필 사진, 방장 표시
2. '참여하기' 버튼이 상황에 따라 바뀜: 참여 가능 / 정원 다 참 / 마감됨 / 내보내짐 / 이미 참여함
3. 방장 전용 메뉴: 모집 마감, 주문 완료, 모집 취소, 참여자 내보내기
4. 내 채팅방 목록: 마지막 메시지 미리보기, 안 읽은 메시지 수(99개가 넘으면 99+)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 글 상세 화면, 내 채팅방 목록 화면 | FE2 공용 화면 부품(UI 키트) | 가짜 데이터로 상황별 버튼과 방장 메뉴가 바르게 바뀜 |

참조: 아키텍처 §4-2, 아키텍처 §4 · 수정 허용: `app/(auth)/**`, `app/post/[id]/index.tsx`, `app/(tabs)/rooms.tsx`, `app/(tabs)/settings.tsx`, `app/settings/**`, `src/features/auth/components/**`, `src/features/profile/components/**`, `src/features/moderation/components/**`, `src/constants/strings.ts`

#### FE9 · 신고·차단·설정 화면  
`Day 6–7` · 2일 · 2주차

앱스토어 심사에서 꼭 확인하는 '안전 기능' 화면(신고, 차단, 계정 삭제)과 설정 화면을 만든다.

**세부 작업**
1. 신고 창: 신고 이유 고르기, 자세한 내용 쓰기
2. 차단 확인 창, 내가 차단한 사람 목록
3. 돈을 안 보냈거나 약속 장소에 안 나온 사람 신고 버튼(마감 후 참여자 메뉴)
4. 비밀번호 변경, 계정 삭제(한 번 더 확인), 약관 다시 보기

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 신고 창, 설정 화면들 | FE2 공용 화면 부품(UI 키트) | 글·메시지·사용자 세 곳 모두에서 신고 버튼이 보이고 신고 창이 열림 |

참조: 아키텍처 §4-3, 아키텍처 §4 · 수정 허용: `app/(auth)/**`, `app/post/[id]/index.tsx`, `app/(tabs)/rooms.tsx`, `app/(tabs)/settings.tsx`, `app/settings/**`, `src/features/auth/components/**`, `src/features/profile/components/**`, `src/features/moderation/components/**`, `src/constants/strings.ts`

#### FE10a · 화면 마무리 점검 (가입·첫 실행·설정·신고)  
`Day 8–9` · 2일 · 2주차

기능 추가를 멈춘 뒤, 내가 만든 화면이 어떤 상황에서도 어색하지 않은지 점검하고 고친다.

**세부 작업**
1. 불러오는 중 / 오류가 났을 때 / 내용이 없을 때 화면이 제대로 나오는지
2. 작은 휴대폰, 큰 글씨 설정, 어두운 화면에서 깨지지 않는지
3. 시각장애인용 화면 읽기 기능(VoiceOver·TalkBack)이 버튼 이름을 읽어 주는지

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 수정한 코드(PR) | J6 기능 동결 | 점검표의 모든 항목 통과 |

참조: 아키텍처 §9 · 수정 허용: `app/(auth)/**`, `app/post/[id]/index.tsx`, `app/(tabs)/rooms.tsx`, `app/(tabs)/settings.tsx`, `app/settings/**`, `src/features/auth/components/**`, `src/features/profile/components/**`, `src/features/moderation/components/**`, `src/constants/strings.ts`

### P2 FE-B(민준이)

#### FE2 · 공용 화면 부품(UI 키트)  
`Day 2` · 1일 · 1주차

버튼, 입력칸, 안내 창처럼 여러 화면에서 반복해 쓰는 '부품'을 먼저 만든다. 레고 블록처럼 이후 화면은 이 부품을 조립해서 만든다.

**세부 작업**
1. 기본 부품: 버튼, 글자 입력칸, 선택 버튼(구역·음식 종류 고르기), 카드(글 하나를 담는 상자), 숫자 표시(안 읽은 메시지 수)
2. 화면 아래에서 올라오는 메뉴 창, 잠깐 떴다 사라지는 안내 메시지, 내용이 없을 때 안내 화면, 불러오는 중 회색 자리 표시
3. 밝은 화면·어두운 화면 양쪽에서 확인, 손가락으로 누르기 충분한 크기(44pt 이상)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 공용 부품 모음(src/components/ui) | FE1 디자인 규칙·화면 설계도 | 부품 견본 화면에서 모든 부품이 밝은·어두운 화면 둘 다 제대로 보임 |

참조: 아키텍처 §9 · 수정 허용: `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts`

#### FE5 · 글 목록(피드)·글쓰기 화면  
`Day 3–4` · 2일 · 1주차

앱의 첫 화면인 모집 글 목록과, 새 모집 글을 쓰는 화면을 만든다. 사용자가 가장 많이 보는 화면이다.

**세부 작업**
1. 글 목록: 위쪽 구역 선택 버튼, 글 상자(음식 종류, 모인 인원 막대, 마감까지 남은 시간)
2. 글이 없을 때: '지금 글 올리기', '이 음식 새 글 알림 받기' 버튼
3. 아래로 당기면 새로고침, 끝까지 내리면 다음 글을 자동으로 불러오기
4. 글쓰기 창: 음식 종류, 가게 이름, 배달앱 링크, 픽업 장소(목록에서 고르기), 인원(2~8명), 마감(15·30·60분 중 선택), 메모

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 글 목록 화면, 글쓰기 화면 | FE2 공용 화면 부품(UI 키트) | 가짜 데이터로 글 목록이 끊김 없이 내려가고 글쓰기 제출이 됨 |

참조: 아키텍처 §2-2, 아키텍처 §4, 기획서 §1 · 수정 허용: `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts`

#### FE7 · 채팅 화면  
`Day 5–6` · 2일 · 1주차

참여자끼리 실시간으로 대화하는 단체 채팅 화면을 만든다. 휴대폰 키보드 처리와 메시지가 많을 때의 속도 때문에 가장 까다로운 화면이다.

**세부 작업**
1. 메시지 목록: 내 말풍선·상대 말풍선, '○○님이 참여했어요' 같은 안내 메시지, 날짜 구분선(FlashList)
2. 입력창: 키보드가 올라와도 입력창이 가려지지 않게 처리, 보내는 중 표시(keyboard-controller)
3. 맨 위 고정 안내: '앱은 결제에 관여하지 않습니다'
4. 내가 차단한 사람의 메시지는 접어서 보여줌

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅 화면 | FE5 글 목록(피드)·글쓰기 화면 | 가짜 메시지 500개를 끊김 없이 스크롤, 아이폰·안드로이드 모두 키보드가 입력창을 가리지 않음 |

참조: 아키텍처 §6 · 수정 허용: `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts`

#### FE8 · 송금 확인 표시·알림 설정 화면  
`Day 7` · 1일 · 2주차

누가 돈을 보냈는지 채팅방 위에 보여주는 표시줄과, 알림을 켜고 끄는 설정 화면을 만든다. 앱은 돈을 직접 다루지 않고 '보냈다·받았다' 기록만 남긴다.

**세부 작업**
1. 송금 표시줄: 참여자는 '보냈어요' 버튼, 방장은 사람마다 '받았어요' 확인
2. 마감·완료·취소된 방은 보기만 되고 입력은 막힌 상태로 표시
3. 알림 설정 화면(채팅 알림, 글 관련 알림), 채팅방마다 알림 끄기 스위치

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅방 위 송금 표시줄, 알림 설정 화면 | FE7 채팅 화면 | 송금 상태 3단계(안 보냄 → 보냈어요 → 받았어요)가 화면에서 구분돼 보임 |

참조: 아키텍처 §4-2, 아키텍처 §7-1 · 수정 허용: `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts`

#### FE10b · 화면 마무리 점검 (글 목록·상세·채팅·송금)  
`Day 9` · 1일 · 2주차

기능 추가를 멈춘 뒤, 내가 만든 화면이 어떤 상황에서도 어색하지 않은지 점검하고 고친다.

**세부 작업**
1. 불러오는 중 / 오류가 났을 때 / 내용이 없을 때 화면이 제대로 나오는지
2. 작은 휴대폰, 큰 글씨 설정, 어두운 화면에서 깨지지 않는지
3. 채팅 화면의 키보드와 스크롤 속도 다시 점검

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 수정한 코드(PR) | J6 기능 동결 | 점검표의 모든 항목 통과 |

참조: 아키텍처 §9 · 수정 허용: `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts`

#### FE11 · QA 버그 수정·스토어 사진  
`Day 10` · 1일 · 2주차

전체 테스트(J7)에서 나온 화면 문제를 고치고, 앱스토어·플레이스토어에 올릴 화면 사진과 앱 아이콘을 준비한다.

**세부 작업**
1. 전체 테스트(J7)에서 발견된 화면 버그 수정
2. 스토어용 화면 사진: 아이폰 큰 화면(6.7")·작은 화면(5.5"), 안드로이드
3. 앱 아이콘과 앱을 켤 때 잠깐 보이는 첫 화면(스플래시) 최종본

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 스토어 화면 사진 모음, 수정된 앱 | J7 통합 QA | 앱을 쓸 수 없게 만드는 심각한 화면 버그 0건 |

참조: 기획서 §1 · 수정 허용: `src/components/**`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/post/new.tsx`, `app/post/[id]/chat.tsx`, `app/settings/notifications.tsx`, `src/features/posts/components/**`, `src/features/chat/components/**`, `src/features/notifications/components/**`, `src/constants/strings.ts`, `assets/**`, `docs/store/**`

### P3 CL(재민이)

#### CL2 · 인증 가드·타입·목 훅  
`Day 2` · 1일 · 1주차

> **쉽게 말하면: 화면과 서버를 잇는 '약속' 만들기**  
> 서버가 완성되기 전에도 화면 담당(P1·P2)이 작업할 수 있도록, 서버가 줄 데이터의 모양을 미리 정하고 가짜 데이터를 만들어 나눠 준다. 로그인하지 않은 사람은 로그인 화면으로 보내는 '출입 관리'도 만든다.

FE가 서버 없이도 개발할 수 있게 계약을 코드로 만듦.

**세부 작업**
1. 인증 가드: 세션 없음 → auth, 프로필 없음 → profile-setup, 둘 다 있음 → tabs
2. supabase gen types 스크립트 → types/database.ts
3. RPC 시그니처 기준 목 훅 세트 작성 후 FE에 전달
4. lib/errors.ts: 에러 코드 17종 → 한국어 문구

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
1. signUp(Turnstile), verifyOtp(signup·recovery), signInWithPassword
2. 인증 안 된 계정 로그인 시 코드 재전송 후 verify로 이동
3. resetPasswordForEmail, updateUser(비밀번호)
4. zod 스키마와 constants/limits.ts(서버와 같은 숫자)
5. AppState 복귀 시 startAutoRefresh, 첫 실기기 dev 빌드

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
1. useFeed(구역별, 커서 무한 스크롤), useCreatePost
2. usePost, useJoin, useLeave, 상태 변경 훅
3. 낙관적 업데이트와 에러 코드별 롤백
4. useMyRooms

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/posts 훅 | CL3 인증 훅·실기기 E2E, SV5 글·참여 RPC | staging에서 글 작성 → 다른 계정 참여 → 방 목록 표시 |

참조: 아키텍처 §4, 아키텍처 §4-1, 아키텍처 §4-2 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

#### CL5 · 실시간 채팅 클라이언트  
`Day 6–7` · 2일 · 2주차

> **쉽게 말하면: 채팅이 실시간으로 오가게 만들기**  
> 메시지를 보내면 같은 방 사람들 화면에 바로 나타나게 한다. 앱을 잠깐 닫았다 다시 열어도 놓친 메시지를 채워 넣고, 전송에 실패하면 '다시 보내기' 버튼을 보여 준다.

Broadcast 채널로 실시간 채팅을 동작하게 함.

**세부 작업**
1. private 채널 room:{id}, realtime.setAuth
2. get_messages 커서 로딩, 수신 메시지 id 중복 제거
3. client_msg_id로 낙관적 전송, 실패 시 재전송 버튼
4. AppState 복귀 시 재구독과 놓친 메시지 채우기, mark_read

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/chat 훅 | CL4 피드·글·참여 훅, SV7 채팅 RPC·방송 | 기기 2대에서 실시간 송수신, 백그라운드 30초 후 복구 |

참조: 아키텍처 §6 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

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
1. useReport, useBlock
2. 차단한 사용자 메시지 접기 로직
3. 노쇼 신고 진입점 연결

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| features/moderation 훅 | CL4 피드·글·참여 훅, SV9 신고·제재·탈퇴·관리자 알림 | 글·메시지·사용자 신고가 서버에 기록되고 차단 시 메시지가 접힘 |

참조: 아키텍처 §4-3 · 수정 허용: `app/_layout.tsx`, `src/lib/supabase.ts`, `src/lib/queryClient.ts`, `src/lib/mmkv.ts`, `src/lib/errors.ts`, `src/features/*/api.ts`, `src/features/*/hooks.ts`, `src/features/*/schema.ts`, `src/constants/limits.ts`, `src/types/**`

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
> 앱이 서버에 요청할 수 있는 기능 목록(글 쓰기, 참여하기 등 21가지)의 이름과 주고받을 내용을 확정한다. 이 메뉴판이 정해져야 다른 사람들이 동시에 개발할 수 있다. POSTECH 메일만 가입되게 하는 설정도 이때 한다.

전 팀이 쓸 계약(스키마와 RPC 시그니처)을 고정함.

**세부 작업**
1. reports, blocks, sanctions, push_tokens, category_subscriptions, banned_words, deleted_accounts, rate_events
2. 헬퍼 함수: is_verified_member, is_participant, is_blocked_between, is_sanctioned, assert_rate, assert_clean
3. RPC 21종 시그니처를 빈 함수로 마이그레이션 → 타입 생성 가능
4. Before User Created Hook(@postech.ac.kr), OTP 6자리·10분, 비밀번호 정책, Resend SMTP
5. CI: PR마다 db reset + pgTAP

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| migrations 0003–0005 스텁, Auth 설정, GitHub Actions | SV1 Supabase 환경·핵심 테이블, SV2 도메인·Resend DNS | CL이 타입을 생성해 목 훅 작성 시작 |

참조: 아키텍처 §2-2, 아키텍처 §2-3, 아키텍처 §3, 아키텍처 §4, 아키텍처 §11 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`, `.github/workflows/**`

#### SV4 · 프로필 RPC·RLS·메일 실측  
`Day 3` · 1일 · 1주차

> **쉽게 말하면: '누가 무엇을 볼 수 있나' 규칙 정하기**  
> 인증된 POSTECH 구성원만 데이터를 볼 수 있고 남의 정보는 고칠 수 없도록 서버에 보안 규칙을 건다. 실제 POSTECH 메일함에 인증 메일이 1분 안에 오는지도 확인한다.

인증 이후의 권한 경계를 완성함.

**세부 작업**
1. create_profile, update_profile
2. 0004_rls: 전 테이블 정책, 직접 쓰기 REVOKE
3. pgTAP: 도메인 거부 4종, 미인증 토큰 조회 0건
4. POSTECH 메일 수신 실측(받은편지함·도착 시간), 문제 시 즉시 공유

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| RLS 정책, 인증 pgTAP | SV3 나머지 테이블·RPC 스텁·Auth 설정 | pgTAP 통과, POSTECH 메일함에 1분 안에 코드 도착 |

참조: 아키텍처 §3-1, 아키텍처 §4, 아키텍처 §5 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

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

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| posts·participants RPC, seed | SV4 프로필 RPC·RLS·메일 실측, OP3 생활 구역·픽업 장소 수집 | 동시성 pgTAP 통과 |

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
| 채팅 RPC, 방송 트리거 | SV6 상태 전이·cron | 비참여자는 채널 구독이 거부됨 |

참조: 아키텍처 §6, 아키텍처 §5 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

#### SV9 · 신고·제재·탈퇴·관리자 알림  
`Day 8` · 1일 · 2주차

> **쉽게 말하면: 신고·정지·계정 삭제의 서버 쪽 처리**  
> 3명이 신고하면 글을 자동으로 숨기고, 약속을 어긴 사람은 횟수에 따라 이용을 정지한다. 계정 삭제 요청을 처리하고, 신고가 들어오면 운영자 Slack으로 알림을 보낸다.

안전 장치와 계정 삭제를 서버에 구현함.

**세부 작업**
1. report: 3명 신고 시 자동 숨김, 노쇼 누적(방 단위 1회), 3회 14일·5회 영구 정지
2. block_user, unblock_user, 모든 RPC에 is_sanctioned 적용
3. Edge Function delete-account: 익명화, 메일 해시 90일 보관, auth 삭제
4. Edge Function admin-alert: reports → Slack
5. 관심 카테고리 구독 RPC와 새 글 알림

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| moderation RPC, delete-account, admin-alert | SV8 송금 RPC·푸시 파이프라인 | 정지 계정의 글 작성·참여가 SANCTIONED로 거부 |

참조: 아키텍처 §4-3, 아키텍처 §3-3 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/seed.sql`, `supabase/config.toml`, `supabase/functions/delete-account/**`, `supabase/functions/admin-alert/**`, `src/types/database.ts`

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

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 앱 저장소 골격, eas.json | J1 킥오프 | 5명 모두 dev client로 앱 실행 |

참조: 아키텍처 §9, 아키텍처 §11 · 수정 허용: `**`

#### SV2 · 도메인·Resend DNS  
`Day 1` · 1일 · 1주차

> **쉽게 말하면: 인증 메일을 보낼 주소 준비**  
> 인증번호 메일이 스팸함으로 가지 않도록 우리 도메인(인터넷 주소)을 사고, 메일 발송 서비스(Resend)에 '우리가 보낸 메일이 맞다'는 증명 설정을 한다.

인증 메일 발송을 위한 도메인을 준비함.

**세부 작업**
1. 도메인 구매(임시 example.kr)
2. Resend 도메인 등록, mail. 서브도메인
3. SPF, DKIM, DMARC DNS 레코드 설정(전파 대기)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 발신 도메인 | 없음 | Resend 대시보드에서 도메인 Verified |

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
1. 이용약관: 회원 간 거래, 회사는 당사자가 아님
2. 개인정보처리방침: 수집 항목, 국외 이전(Resend·Sentry·PostHog·Expo), 보관 기간(메일 해시·메시지 90일)
3. EULA: 부적절한 콘텐츠 무관용
4. 접근권한 고지 문구
5. 변호사 검토 요청

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| docs/legal/terms.md, privacy.md, eula.md, 앱 표시용 문구(strings.ts) | J1 킥오프 | 초안 완성, FE4 화면에 문구 반영 가능 |

참조: 기획서 §1, 기획서 §1-1 · 수정 허용: `docs/legal/**`, `src/constants/strings.ts`

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
1. mark_paid, confirm_paid(되돌리기 불가)
2. pgmq push 큐, 핵심 이벤트 9종 enqueue 트리거
3. Edge Function push-worker: 30초 묶음, 설정·mute·차단 재확인, 100건 배치, receipt로 만료 토큰 삭제
4. pg_cron 10초마다 pg_net으로 push-worker 호출

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 송금 RPC, push-worker | SV7 채팅 RPC·방송 | 메시지 10개 연속 전송 시 알림 1건으로 묶여 도착 |

참조: 아키텍처 §7 · 수정 허용: `supabase/migrations/**`, `supabase/tests/**`, `supabase/functions/push-worker/**`

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

#### CL8 · 폴백 웹·관측 도구  
`Day 9` · 1일 · 2주차

> **쉽게 말하면: 앱 없는 사람용 웹페이지·오류 감시 도구**  
> 앱이 없는 사람이 공유 링크를 누르면 안내 웹페이지가 뜨게 한다. 앱에서 오류가 나면 자동으로 알려 주는 도구(Sentry)와 사용 통계 도구(PostHog)를 연결한다.

앱 밖 경로와 운영 관측을 마무리함.

**세부 작업**
1. web/ 폴백 페이지(인증 후 확인 안내), AASA, assetlinks.json → Cloudflare Pages
2. 카카오 키 해시 3종(디버그, EAS 업로드, Play 앱 서명)
3. Sentry 소스맵(EAS Build·Update)
4. PostHog 이벤트(아키텍처 §12)

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| web/ 배포, Sentry·PostHog 연결 | CL7b 카카오 공유·딥링크 | 앱 미설치 기기에서 링크 → 폴백 페이지, Sentry에 테스트 오류 수신 |

참조: 아키텍처 §10, 아키텍처 §12 · 수정 허용: `web/**`, `app.config.ts`, `eas.json`, `package.json`, `src/lib/sentry.ts`, `src/lib/analytics.ts`

#### SV10 · 보안 점검·production 구성  
`Day 9` · 1일 · 2주차

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
| production 환경 | SV9 신고·제재·탈퇴·관리자 알림 | production에서 가입·로그인 1회 성공 |

참조: 아키텍처 §13, 아키텍처 §11 · 수정 허용: `supabase/**`, `.github/workflows/**`

#### CL9 · 베타 빌드 배포  
`Day 10` · 1일 · 2주차

> **쉽게 말하면: 테스트용 앱 배포**  
> 실제 사용자용 앱을 만들어 테스터들이 설치할 수 있게 앱스토어(TestFlight)와 플레이스토어 내부 테스트에 올린다.

production 빌드를 테스터에게 배포함.

**세부 작업**
1. EAS production 빌드(iOS·Android)
2. TestFlight·Play 내부 테스트 업로드
3. 심사용 계정으로 로그인 확인
4. EAS Update 채널(production, preview) 확인

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
1. 오전 킥오프 30분: 역할, 브랜치 규칙(feat/fe-*, feat/cl-*, feat/sv-*, feat/op-*), PR 리뷰 1명
2. 계정 점검: Apple·Google 개발자, Supabase, Resend, Sentry, PostHog, Slack, 카카오
3. 테스트용 POSTECH 메일 3개 이상 확보
4. 담당자별 수정 범위(tasks.json의 paths) 확인

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

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 고정된 계약 | SV3 나머지 테이블·RPC 스텁·Auth 설정, CL2 인증 가드·타입·목 훅, FE2 공용 화면 부품(UI 키트) | 5명이 같은 타입 파일로 개발 |

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
1. 16:00 staging 데모: 글 작성 → 참여 → 상세 → 방 목록
2. 버그 분류(치명·일반·나중)
3. 2주차 범위 재확인

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
1. 실시간 채팅 왕복
2. 자동 마감 → 전원 푸시
3. 보냈어요 → 방장 확인
4. 백그라운드 복귀 후 놓친 메시지 복구

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| 채팅 확인 기록 | CL5 실시간 채팅 클라이언트, CL6 푸시 클라이언트, FE8 송금 확인 표시·알림 설정 화면, SV8 송금 RPC·푸시 파이프라인 | 시나리오 4종 통과 |

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
| 동결 빌드 | FE9 신고·차단·설정 화면, CL7a 신고·차단 훅, CL7b 카카오 공유·딥링크, SV9 신고·제재·탈퇴·관리자 알림 | MUST 항목 전부 main에 있음 |

참조: timeline 메모 · 수정 허용: `docs/**`

#### J7 · 통합 QA  
`Day 9` · 1일 · 2주차

> **쉽게 말하면: 전체 테스트**  
> 아이폰·안드로이드 실제 휴대폰으로 9가지 사용 시나리오를 처음부터 끝까지 해 보고, 발견한 문제를 담당자에게 배정한다.

시나리오 9종으로 전체를 점검함.

**세부 작업**
1. 14:00~ iOS·Android 실기기 각 1대 이상
2. 1 도메인 거부·POSTECH 가입 2 동시 참여 정원 3 백그라운드 복구
3. 4 자동 마감·송금·완료 5 이탈·방장 위임 6 신고 숨김·노쇼 정지
4. 7 차단 8 카카오 공유·폴백 9 계정 삭제

| 산출물 | 선행 작업 | 완료 기준 |
|---|---|---|
| QA 결과표, 버그 목록 | J6 기능 동결, FE10a 화면 마무리 점검 (가입·첫 실행·설정·신고), FE10b 화면 마무리 점검 (글 목록·상세·채팅·송금), CL8 폴백 웹·관측 도구, SV10 보안 점검·production 구성 | 치명 버그 목록 확정, 담당자(P1~P5) 배정 |

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
| 베타 빌드, 다음 주 계획 | CL9 베타 빌드 배포, FE11 QA 버그 수정·스토어 사진, SV11 심사 계정·지표·모니터링 | 테스터에게 설치 링크 전달 |

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
- SV7 방송 → CL5 실시간 → SV8 푸시 → J5 채팅 E2E
- 이 경로가 지연되면 전체 일정이 밀림.

## 협업 규칙

- **작업 지시**: Claude Code에 태그를 말한다(`SV5 해줘`, `/task SV5`). 절차는 `.claude/skills/task/SKILL.md`.
- **스탠드업**: 매일 10:00, 15분. 어제 한 일, 오늘 할 일, 막힌 것.
- **브랜치**: `feat/<태그 접두사 소문자>-<태그>-<요약>` (예: `feat/sv-SV5-join-post`, `feat/op-OP1-legal`) → `main`. PR 리뷰 1명, CI 통과 필수. 동결(Day 8) 후에는 `fix/*`만.
- **리뷰 짝**: P1↔P2(화면), P3↔P4(훅·RPC 계약), P5는 P4(서버 쪽)·P3(앱 설정)에게 받는다.
- **계약 변경**: P4가 아키텍처 §4 수정 → `types/database.ts` 재생성 커밋 → P3가 훅 갱신 → P1·P2에 공지.
- **30분 규칙**: 30분 넘게 막히면 바로 공유. 일정에 영향이 있으면 그날 스탠드업에서 범위를 다시 조정한다.
