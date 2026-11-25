# Supabase CLI 사용 규칙

팀 전체가 **같은 버전의 CLI**를 쓴다. 버전이 다르면 `config.toml`을 읽는 방식과 `gen types` 출력이 달라서 CI가 실패한다(PR #12 참고).

## 버전
- 기준은 `package.json`의 devDependencies에 있는 `supabase`(현재 **2.58.5**, 정확한 버전으로 고정)다.
- CI(`.github/workflows/db.yml`)도 `package-lock.json`에서 이 버전을 읽어 쓴다. 버전을 적는 곳은 이 한 곳뿐이다.
- 확인: `npx supabase --version` → `2.58.5`가 나와야 한다.

## 사용법
```bash
npm ci                                  # 처음 한 번. CLI 바이너리도 같이 설치된다
npx supabase start                      # 로컬 Supabase (Docker 필요)
npx supabase db reset                   # 마이그레이션 0001~부터 다시 적용 + seed
npx supabase test db                    # pgTAP
npx supabase gen types typescript --local --schema public > src/types/database.ts && npx prettier --write src/types/database.ts
```

하지 말 것:
- `supabase ...`(앞에 `npx` 없이): brew나 전역으로 설치한 CLI가 실행된다. 대개 v3다.
- 프로젝트 폴더 밖에서 `npx supabase ...`: 로컬 설치가 없으면 npm `latest`(지금은 v3)를 받는다.
- `config.toml`에 `[inbucket]`이나 `[local_smtp]` 섹션 추가: v2와 v3가 서로 다른 이름만 받는다. 섹션이 없으면 두 버전 모두 기본값(메일 테스트 서버 켜짐, 포트 54324)을 쓴다.

## 원격 DB에 반영하기 (`db push`)
- 계획(아키텍처 §11): main에 머지되면 CI가 staging에 `db push`하고, `v*` 태그가 달리면 production에 `db push`한다(수동 승인 필요).
- **production에는 아무도 로컬에서 `db push`하지 않는다.**
- staging 자동 배포 워크플로가 생기기 전까지는 **P4만** staging에 `db push`한다. 이때도 main을 최신으로 받은 뒤, 고정 버전으로 실행한다.
  ```bash
  git switch main && git pull && npm ci
  npx supabase --version            # 2.58.5인지 확인
  npx supabase db push --dry-run    # 적용될 마이그레이션 목록 확인
  npx supabase db push
  ```
- 다른 사람은 원격 DB에 `db push`, `db reset --linked`, `migration repair`를 실행하지 않는다. 필요하면 P4에게 요청한다.

## 문제가 생기면
| 증상 | 원인 | 해결 |
|---|---|---|
| `inbucket in supabase/config.toml is no longer supported` | v3 CLI가 실행됐다 | `npx supabase --version` 확인 → `npm ci` 후 `npx supabase ...`로 다시 실행 |
| `npx supabase@2.58.5`를 썼는데도 v3가 실행되는 것 같다 | `npx` 없이 `supabase`를 실행했거나 다른 폴더에서 실행했다. 버전을 붙인 `npx supabase@2.58.5`는 전역에 v3가 있어도 2.58.5를 실행한다(2026-11-25에 확인) | `which supabase`, `npx supabase --version`, `pwd`를 확인한다 |
| CI의 "database.ts가 최신인지 확인" 단계 실패 | 다른 CLI 버전으로 타입을 생성했거나 prettier를 빠뜨렸다 | 위의 `gen types` 명령을 고정 버전으로 다시 실행 |
| `npm ci` 후 `npx supabase`가 바이너리를 못 찾는다 | npm 11은 install script를 기본으로 막는다 | `package.json`의 `allowScripts`에 `supabase@<버전>`이 있는지 확인 |

## v3로 올릴 때 확인할 것 (지금은 올리지 않는다)
팀 전체가 같은 날 한 PR에서 올린다. 담당은 P5이고 P4가 함께 검증한다.
1. `package.json`의 `supabase` 버전과 `allowScripts` 키를 함께 바꾸고 `npm install`을 실행한다. CI는 lock 파일을 따라간다.
2. `config.toml`: 메일 테스트 서버 섹션 이름이 `[local_smtp]`로 바뀌었다. 기본값을 쓸 거라면 지금처럼 섹션 없이 둔다.
3. 곧 없어질 설정을 바꾼다(v3에서 경고, v4에서 삭제): `auth.email.enable_signup` → `auth.email.enabled`, `auth.sms.enable_signup` → `auth.sms.enabled`.
4. v3에서 `supabase init`을 하면 `config.jsonc`가 생긴다. 지금 쓰는 `config.toml`은 계속 읽히므로 바꿀 필요는 없다. 두 파일을 같이 두지 않는다.
5. `api.auto_expose_new_tables` 기본값(설정 안 하면 `true`)을 확인한다. 테이블 GRANT 동작이 RLS 테스트 결과와 맞는지 pgTAP으로 본다.
6. `npx supabase db reset && npx supabase test db`가 통과하는지, `gen types` 결과의 diff가 없는지 확인한다. diff가 있으면 같은 PR에서 `src/types/database.ts`를 다시 생성한다.
7. `db.yml`의 `supabase start -x ...` 제외 목록에 있는 서비스 이름이 그대로인지 확인한다.
