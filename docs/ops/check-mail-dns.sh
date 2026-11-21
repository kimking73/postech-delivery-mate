#!/usr/bin/env bash
# 메일 발송 도메인 DNS 전파 확인 (SV2). 사용법: docs/ops/check-mail-dns.sh example.kr
set -u
ROOT="${1:?루트 도메인을 넣어주세요. 예: example.kr}"
SUB="mail.${ROOT}"
fail=0

check() { # 이름, 타입, 호스트, 찾을 문자열
  local out
  out="$(dig +short "$2" "$3" 2>/dev/null)"
  if [[ -n "$out" && "$out" == *"$4"* ]]; then
    printf 'OK    %-6s %-4s %s\n' "$1" "$2" "$3"
  else
    printf 'FAIL  %-6s %-4s %s  (결과: %s)\n' "$1" "$2" "$3" "${out:-없음}"
    fail=1
  fi
}

check SPF   MX  "send.${SUB}"              "amazonses.com"
check SPF   TXT "send.${SUB}"              "v=spf1"
check DKIM  TXT "resend._domainkey.${SUB}" "p="
check DMARC TXT "_dmarc.${ROOT}"           "v=DMARC1"

if [[ $fail -eq 0 ]]; then
  echo "모두 전파됨. Resend에서 Verify DNS Records를 누르세요."
else
  echo "아직 전파되지 않은 레코드가 있습니다. 호스트 이름과 값을 확인하세요."
fi
exit $fail
