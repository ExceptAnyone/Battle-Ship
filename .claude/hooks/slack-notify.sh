#!/bin/bash

# 프로젝트 루트의 .env 파일에서 환경변수 로드
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  source "$PROJECT_ROOT/.env"
fi

# Slack Webhook URL이 설정되지 않으면 조용히 종료
if [ -z "$SLACK_WEBHOOK_URL" ]; then
  exit 0
fi

# stdin에서 JSON 데이터 읽기
INPUT=$(cat)

# hook_event_name과 session_id 추출
HOOK_EVENT=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('hook_event_name',''))" 2>/dev/null)
SESSION_ID=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('session_id','unknown'))" 2>/dev/null)

# 한국 현재 시간 (KST, UTC+9)
KST_TIME=$(TZ="Asia/Seoul" date "+%Y-%m-%d %H:%M:%S")

# 이벤트에 따라 메시지 구성
case "$HOOK_EVENT" in
  "Notification")
    MESSAGE="🔔 *권한 요청*\n\n📁 프로젝트: Battle-Ship\n🤖 상태: 승인 대기 중\n🕐 시간: ${KST_TIME} (KST)"
    ;;
  "Stop")
    MESSAGE="✅ *작업 완료*\n\n📁 프로젝트: Battle-Ship\n🤖 상태: 작업 종료\n🕐 시간: ${KST_TIME} (KST)"
    ;;
  *)
    exit 0
    ;;
esac

# Slack으로 메시지 전송
curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"${MESSAGE}\"}" \
  > /dev/null 2>&1

exit 0
