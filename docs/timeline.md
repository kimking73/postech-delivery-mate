# 2주 개발 타임라인 (3인 체제)

> 기준 문서: [기획서](./기획서.md), [아키텍처](./아키텍처.md)
> 기간: **2026-11-16(월) ~ 2026-11-27(금)**, 영업일 10일. 주말은 버퍼로 비워 둔다.
> 목표: **2주차 금요일에 기획서의 MUST 기능을 갖춘 베타 빌드(TestFlight / Play 내부 테스트)를 내보낸다.** 스토어 심사와 공개 베타는 그 다음 주에 진행한다.

## 0. 역할 정의

| 역할 | 담당 | 맡는 범위 | 산출물 |
|---|---|---|---|
| **FE** | 프론트엔드 (UI) | 화면, 디자인 시스템, 컴포넌트, 화면 전환, 입력 폼 UI, 빈 화면·로딩·에러 상태, 접근성, 문구 | `app/**` 화면 파일, `src/components/ui/*`, `src/features/*/components/*`, `constants/theme.ts`, `strings.ts` |
| **CL** | 클라이언트 (앱 로직·플랫폼) | Expo 프로젝트와 빌드, Supabase 연동, 인증 세션과 라우팅 가드, TanStack Query 훅, 실시간 채팅 로직, 푸시, 딥링크와 카카오 공유, Sentry·PostHog, EAS 배포 | `src/lib/*`, `src/features/*/{api,hooks,schema}.ts`, `app/_layout.tsx`, `app.config.ts`, `eas.json`, `web/` |
| **SV** | 서버 (Supabase) | 스키마, RLS, RPC, 트리거, cron, Auth 설정(도메인 hook, Resend SMTP), Edge Functions, pgTAP 테스트, CI | `supabase/**`, `.github/workflows/*`, 운영 체크리스트 |

**경계 규칙**
- FE는 데이터를 직접 가져오지 않는다. CL이 만든 훅(`usePosts()` 등)만 쓴다. 훅이 아직 없으면 같은 반환 타입을 쓰는 **목(mock) 훅**으로 먼저 개발한다.
- CL은 DB를 직접 고치지 않는다. 스키마나 RPC를 바꿔야 하면 SV에게 요청한다.
- SV는 RPC의 입력·출력·에러 코드를 바꿀 때 [아키텍처 §4](./아키텍처.md)를 먼저 고치고 팀에 공지한다.

## 1. 2주 안에 하기 위한 범위 조정
| 구분 | 내용 |
|---|---|
| ✅ 포함 (MUST) | POSTECH 메일 가입·인증·로그인·비밀번호 재설정, 프로필·구역 설정, 피드, 글 작성, 참여·나가기·방장 위임, 상태 변경(자동 마감), 실시간 채팅, 송금 체크, 신고·차단·노쇼 제재, 푸시(핵심 알림), 계정 삭제, 약관·EULA·권한 안내, 카카오톡 공유와 딥링크 |
| ⏸ 단순화 | 관리자 도구는 Slack 알림과 SQL 콘솔만 쓴다. 관심 카테고리 알림은 구독 기능까지만 만들고 23시~08시 발송 제한은 나중에 넣는다. 폴백 웹페이지는 정적 페이지 1장으로 만든다. |
| ❌ 제외 (2주 뒤) | 링크 미리보기, 자주 모이는 시간대 표시, 매너 평점, 이미지 메시지, 재인증, 정식 관리자 웹 |

## 2. 마일스톤
| 날짜 | 마일스톤 | 완료 기준 |
|---|---|---|
| **D2 (11/17 화)** | 🔗 계약 고정 | DB 스키마와 RPC 시그니처를 확정하고 `types/database.ts`를 생성해 공유한다. 디자인 토큰과 UI 키트 1차를 완성한다. |
| **D4 (11/19 목)** | 🔐 인증 E2E | 실제 POSTECH 메일로 가입, 인증 코드, 로그인, 프로필 설정까지 실기기에서 동작한다. 다른 도메인 메일은 가입이 거부된다. |
| **D5 (11/20 금)** | 📋 1주차 데모 | 피드 조회, 글 작성, 참여가 staging DB에서 동작한다. 동시 참여 테스트를 통과한다. |
| **D7 (11/24 화)** | 💬 채팅 E2E | 2대의 기기로 실시간 채팅, 마감, 송금 체크가 된다. 백그라운드에서 돌아왔을 때 메시지 복구가 된다. |
| **D8 (11/25 수)** | 🧊 기능 동결 | MUST 기능을 모두 머지한다. 이후로는 버그 수정만 한다. |
| **D10 (11/27 금)** | 🚀 베타 빌드 | production 프로젝트를 구성하고, EAS production 빌드를 TestFlight와 Play 내부 테스트에 올린다. |

## 3. 일자별 타임라인

### 1주차

#### D1 — 11/16 (월) · 킥오프와 기반
| FE | CL | SV |
|---|---|---|
| 디자인 토큰(색, 타이포, 간격, 다크모드) `theme.ts` 정의, NativeWind 설정 확인 | Expo 프로젝트 생성(dev client, Expo Router, TS strict), ESLint·Prettier, 폴더 구조 | Supabase local·staging 프로젝트 생성, `0001_extensions`, `0002_tables`(zones, categories, pickup_places, profiles, posts, participants, messages) |
| 와이어프레임 확정: 인증 6화면, 피드, 상세, 글쓰기, 채팅, 방 목록, 설정 | `lib/supabase.ts`(MMKV 세션 저장), `lib/queryClient.ts`, 환경변수 구조, EAS 프로필 3종 | 도메인 구매 → Resend 도메인 등록, SPF·DKIM·DMARC DNS 설정(전파 대기) |
| **공동:** 오전에 킥오프 30분, 역할과 브랜치 규칙 합의(`feat/<role>-<topic>`, PR 1명 리뷰) | | |

#### D2 — 11/17 (화) · 계약 고정 🔗
| FE | CL | SV |
|---|---|---|
| UI 키트: Button, Input, Chip, Card, Badge, Sheet, Toast, EmptyState, Skeleton | 인증 가드 라우팅 골격(세션 없음 → auth, 프로필 없음 → profile-setup, 둘 다 있음 → tabs) | 나머지 테이블(reports, blocks, sanctions, push_tokens, category_subscriptions, banned_words, deleted_accounts, rate_events), 헬퍼 함수 |
| 인증 화면 UI: 로그인, 가입, 인증 코드 입력(6칸, 재전송 타이머), 비밀번호 찾기·재설정 | `supabase gen types`로 타입 생성 스크립트 → 받은 RPC 시그니처로 **목 훅 세트** 작성 후 FE에 전달 | **RPC 시그니처(빈 함수 스텁) 전부 마이그레이션**으로 작성 → 타입 생성이 가능하게 함. Before User Created Hook, Auth 설정(OTP 6자리, 비밀번호 정책, Resend SMTP) |
| | `lib/errors.ts`(에러 코드 → 한국어 문구) | CI: PR마다 `db reset`과 pgTAP 실행 |

#### D3 — 11/18 (수) · 인증 구현
| FE | CL | SV |
|---|---|---|
| 권한 안내 화면, 약관·EULA 동의 화면, 프로필 설정(닉네임, 구역 선택) | 인증 훅 구현: signUp(Turnstile), verifyOtp, signIn(인증 안 된 계정 처리), reset, updateUser | `create_profile`, `update_profile`, RLS `0004_rls`(전체 테이블), `is_verified_member` |
| 폼 검증 메시지 UI (react-hook-form + zod, 스키마는 CL 제공) | zod 스키마와 `constants/limits.ts`(SV의 검증 규칙과 같은 숫자) | pgTAP: 도메인 hook 거부 케이스 4종, 인증 안 된 토큰은 조회 0건 |
| | | **POSTECH 메일 수신 실측**(받은편지함인지 스팸함인지, 도착 시간) → 문제 있으면 즉시 공유 |

#### D4 — 11/19 (목) · 피드·글 작성 🔐
| FE | CL | SV |
|---|---|---|
| 피드 화면: 구역 칩, 글 카드(카테고리, 인원 바, 남은 시간 카운트다운), 빈 화면, 당겨서 새로고침 | **인증 E2E 연결**(실기기), 앱이 다시 열릴 때 `startAutoRefresh` | `create_post`(요청 횟수 제한, 금칙어 검사), `get_feed`(커서), seed 데이터(임시 구역, 픽업 장소, 카테고리, 금칙어) |
| 글 작성 모달: 카테고리, 가게명, 링크, 픽업 장소 프리셋, 정원 스테퍼, 마감 프리셋(15/30/60분), 메모 | `useFeed`, `useCreatePost` 실제 연결(TanStack Query, 무한 스크롤) | `join_post`(행 잠금, 6개 검증), `leave_post`(방장 위임, 자동 취소), `kick_member` |
| | | pgTAP: 정원 1명 남은 글에 동시 참여 2건 → 1건만 성공, 마감 지난 글 참여 거부 |

#### D5 — 11/20 (금) · 상세·참여 📋 1주차 데모
| FE | CL | SV |
|---|---|---|
| 글 상세 화면: 정보, 참여자 아바타, 참여·나가기 버튼 상태(정원 참, 마감, 강퇴), 방장 메뉴 시트 | `usePost`, `useJoin`, `useLeave`, 상태 변경 훅, 낙관적 업데이트와 롤백 | `close_post`, `complete_post`, `cancel_post`, 상태 전이 검증, 시스템 메시지 삽입 |
| 내 채팅방 탭 목록 UI(마지막 메시지, 안 읽은 배지) | `useMyRooms` | `get_my_rooms`, pg_cron 자동 마감과 12시간 뒤 자동 완료 |
| **공동 16:00:** staging 데모, 버그 분류, 2주차 범위 재확인 | | |

### 2주차

#### D6 — 11/23 (월) · 채팅
| FE | CL | SV |
|---|---|---|
| 채팅 화면: FlashList 역순 목록, 말풍선, 시스템 메시지, 날짜 구분선, 입력창(keyboard-controller), 고정 안내 배너 | Realtime 클라이언트: private 채널 `room:{id}`, `setAuth`, 수신 메시지 id 중복 제거, `client_msg_id`로 낙관적 전송 | `send_message`(10초에 10회, 금칙어), `get_messages`(커서), `mark_read`, messages INSERT 트리거에서 `realtime.send` |
| | | `realtime.messages` RLS(참여자만 구독), 상태 변경·송금 이벤트도 방송 |

#### D7 — 11/24 (화) · 송금 체크·푸시 💬
| FE | CL | SV |
|---|---|---|
| 송금 체크 바(멤버: 보냈어요 / 방장: 멤버별 확인), 마감·완료·취소된 방은 읽기 전용 UI | 앱이 다시 열릴 때 재구독과 놓친 메시지 채우기, 읽음 처리 | `mark_paid`, `confirm_paid`, pgmq `push` 큐, 알림을 큐에 넣는 트리거(매트릭스 §7-1의 핵심 이벤트 9종) |
| 알림 설정 화면, 방별 알림 끄기 토글 | expo-notifications: 권한 요청 시점(첫 참여 시), 토큰 등록, 포그라운드에서 지금 보는 방 알림 숨김, 알림 탭하면 채팅으로 이동, Android 채널 3개 | Edge Function `push-worker`(묶어 보내기, Expo Push로 100건씩, receipt로 만료 토큰 정리), cron 10초 |
| | APNs(.p8)와 FCM v1 credentials 등록 | |

#### D8 — 11/25 (수) · 신뢰·안전 🧊 기능 동결
| FE | CL | SV |
|---|---|---|
| 신고 시트(사유 선택, 상세 입력), 차단 확인, 차단 목록 화면, 노쇼 신고 진입점(마감 후 참여자 메뉴) | `useReport`, `useBlock`, 차단한 사용자 메시지를 접어서 표시하는 로직 | `report`(자동 숨김, 노쇼 누적, 자동 제재), `block_user`, `unblock_user`, `is_sanctioned` 적용 |
| 비밀번호 변경, 계정 삭제(재확인), 약관 보기 화면 | 카카오 SDK config plugin, 공유 템플릿, Universal / App Links 설정 | Edge Function `delete-account`(익명화, 메일 해시 보관, auth 삭제), `admin-alert`(reports를 Slack으로) |
| | | 관심 카테고리 구독 RPC와 새 글 알림 |

#### D9 — 11/26 (목) · 통합 QA
| FE | CL | SV |
|---|---|---|
| UI 다듬기: 로딩·에러·빈 화면 전 화면 점검, 작은 화면과 다크모드, 접근성 라벨 | `web/` 폴백 페이지와 AASA, assetlinks 배포(Cloudflare Pages), 카카오 키 해시 3종 등록 | 보안 체크리스트 §13 실행: Advisors 경고 0건, REVOKE 확인, search_path, gitleaks |
| | Sentry(소스맵), PostHog 이벤트 §12 심기 | **production 프로젝트 구성**: 마이그레이션, Hook 등록, SMTP, Vault pepper, cron, secrets |
| **공동 14:00~:** 시나리오 QA, 기기 2대 이상(iOS와 Android 각 1대 이상). 시나리오는 §4 참고 | | |

#### D10 — 11/27 (금) · 베타 빌드 🚀
| FE | CL | SV |
|---|---|---|
| QA에서 나온 UI 버그 수정, 스토어 스크린샷 원본 제작 | EAS production 빌드 → TestFlight와 Play 내부 테스트 업로드, 심사용 계정으로 로그인 확인 | 심사용 POSTECH 계정 생성과 인증, 운영 지표 SQL 뷰, 모니터링 알림(DB CPU, push-worker 실패율) |
| **공동 16:00:** 회고 30분, 다음 주 계획(베타 모집, 스토어 심사 제출, 앰배서더) | | |

## 4. 통합 QA 시나리오 (D9)
1. `@gmail.com` 가입 → 거부된다. `@postech.ac.kr` 가입 → 인증 코드 도착(1분 안, 받은편지함) → 프로필 설정
2. A가 글 작성(정원 3) → B, C가 동시에 참여 → D 참여 시도 시 "정원 참"
3. 채팅을 주고받는다 → B가 앱을 백그라운드로 보냈다가 30초 뒤 복귀 → 놓친 메시지가 복구된다
4. 마감 시각이 지나면 자동 마감되고 전원이 푸시를 받는다 → B "보냈어요" → A 확인 → A가 완료
5. 마감 후 C가 나가면 이탈로 기록되고 A가 푸시를 받는다 / A(방장)가 나가면 B가 방장이 된다
6. 메시지를 3명이 신고하면 숨겨진다. Slack 알림을 확인한다. 노쇼 3회면 정지되고, 정지된 계정은 글 작성과 참여가 거부된다
7. 차단하면 상대 메시지가 접히고, 서로의 글에 참여할 수 없다
8. 카카오톡 공유 → 앱이 있으면 상세가 열리고, 없으면 폴백 페이지로 간다
9. 계정 삭제 → 다시 로그인할 수 없다. 메시지는 "탈퇴한 사용자"로 표시된다

## 5. 협업 규칙
- **스탠드업:** 매일 10:00에 15분. 어제 한 일, 오늘 할 일, 막힌 것.
- **브랜치:** `main`(보호, staging 자동 배포) ← `feat/fe-*`, `feat/cl-*`, `feat/sv-*`. PR은 1명 이상 리뷰, CI 통과가 필수다.
- **계약 변경:** RPC나 스키마를 바꾸면 SV가 PR을 올리고 `types/database.ts`를 다시 생성해 커밋한다. CL은 훅을 갱신하고 FE에게 알린다.
- **목 훅 우선:** FE는 서버가 준비되기 전에도 목 훅으로 개발한다. 실제 훅으로 바꿀 때는 import만 교체한다.
- **막혔을 때:** 30분 넘게 막히면 바로 공유한다. 일정에 영향이 있으면 그날 스탠드업에서 범위를 다시 조정한다.

## 6. 일정 리스크와 대응
| 리스크 | 영향 | 대응 |
|---|---|---|
| POSTECH 메일 서버가 인증 메일을 스팸으로 분류하거나 차단 | 가입 불가 | D1에 DNS를 설정하고 D3에 실측한다. 문제가 있으면 학교 전산팀에 화이트리스트를 문의하고, 발신 도메인 평판이 쌓일 때까지 발송량을 낮게 유지한다 |
| Realtime Authorization 설정 지연 | 채팅 E2E 지연 | D6 오전에 SV가 최소 예제를 먼저 검증한다. 실패하면 public 채널과 RPC 권한 검사로 임시 운영한다(D8 전에 반드시 복귀) |
| 카카오 SDK와 Expo 빌드 충돌 | 공유 불가 | 공유는 D8 이후 작업이고, 실패하면 OS 기본 공유 시트(`Share.share`)로 대체해 출시한다 |
| FE 작업량 과다(화면 15개 이상) | D8 동결 실패 | CL이 D9에 설정 계열 화면(비밀번호 변경, 계정 삭제)을 넘겨받는다 |
| iOS 빌드와 서명 문제 | 베타 지연 | D1에 Apple 개발자 계정과 번들 ID를 준비하고, D3에 첫 dev 빌드를 실기기에 설치한다 |

## 7. 사전 준비 (D1 전, 담당자)
- [ ] Apple Developer와 Google Play 개발자 계정 (CL)
- [ ] 도메인 구매(임시 `example.kr` → 실제 도메인) (SV)
- [ ] Supabase 조직, Resend, Sentry, PostHog, Slack 웹훅, 카카오 개발자 앱 (SV, CL)
- [ ] 테스트용 POSTECH 메일 계정 3개 이상(팀원 본인 계정 + 심사용) (공동)
- [ ] 실제 구역과 픽업 장소 목록 초안 (FE, 운영)
