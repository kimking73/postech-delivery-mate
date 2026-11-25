# 개발 환경 세팅 (CL1)

목표: 각자 휴대폰에서 dev client를 실행해 첫 화면("dev client 실행 성공")을 확인한다.

## 공통 (10분)
1. `git pull` 후 `npm install`
2. `cp .env.example .env.local` (값이 비어 있어도 목 모드로 실행된다)
3. `npm start` → 휴대폰과 맥이 같은 와이파이여야 한다. 캠퍼스 와이파이에서 연결이 안 되면 `npx expo start --tunnel`

## Android
1. 설치 링크(dev client): https://expo.dev/accounts/kimking075s-team/projects/postech-delivery-mate/builds/ee5de3fa-6344-4ce8-8660-465455826985
2. 앱을 열고 `npm start`가 보여주는 QR을 찍거나 서버 목록에서 고른다.

## iOS (무료 Apple 계정, 맥 필요)
유료 Apple Developer 가입 전까지는 각자 자기 맥에서 빌드한다. 앱은 **7일 뒤 만료**되고, 만료되면 다시 빌드한다.

1. Xcode 설치 → Settings → Accounts → **+** → Apple ID 로그인 (Personal Team 생성)
2. `.env.local`에 `DEV_BUNDLE_SUFFIX=<본인 영문 이니셜>` 추가 (번들 ID가 사람마다 달라야 한다)
3. **폴더 경로에 한글이 있으면 `pod install`이 실패한다.** 저장소를 영문 경로(예: `~/dev/postech-delivery-mate`)에 두거나, 빌드 전용 worktree를 만든다.
   ```bash
   git worktree add --detach ~/dev/deliverymate-ios HEAD
   cp .env.local ~/dev/deliverymate-ios/ && cd ~/dev/deliverymate-ios && npm ci
   ```
4. 아이폰을 USB로 연결(잠금 해제, "이 컴퓨터 신뢰"), 아이폰 설정 → 개인정보 보호 및 보안 → **개발자 모드** 켜기
5. `npx expo run:ios --device`
6. 처음 실행이 막히면 아이폰 설정 → 일반 → VPN 및 기기 관리 → 본인 Apple ID → **신뢰**
7. 앱에서 개발 서버(`npm start`가 띄운 주소)를 고른다.

푸시 알림과 유니버설 링크는 무료 계정으로 테스트할 수 없다(유료 가입 후 preview 빌드에서 확인).

## Supabase CLI (DB 작업하는 사람)
`npm install`을 하면 CLI도 함께 설치된다. 항상 `npx supabase ...`로 실행한다(전역 `supabase` 금지). 버전 규칙, 원격 `db push` 권한, 문제 해결 방법은 [supabase-cli.md](supabase-cli.md)에 있다.
