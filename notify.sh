#!/bin/bash
# Claude Code notification hook
# Usage: echo '{"cwd":"/path/to/project",...}' | notify.sh

NOTIFY="$HOME/Applications/ClaudeNotify.app/Contents/MacOS/ClaudeNotify"
LOCKFILE="/tmp/claude-notify.lock"

# Debounce: skip if notified in the last 5 seconds
if [ -f "$LOCKFILE" ]; then
    last=$(stat -f %m "$LOCKFILE" 2>/dev/null || echo 0)
    now=$(date +%s)
    if [ $((now - last)) -lt 5 ]; then
        exit 0
    fi
fi
touch "$LOCKFILE"

# Read stdin JSON — single jq call for all fields
INPUT=$(cat)
read -r PROJECT EVENT <<< "$(jq -r '[(.cwd // "" | split("/") | .[-1] // ""), (.hook_event_name // "Stop")] | @tsv' <<< "$INPUT" 2>/dev/null)"
PROJECT="${PROJECT:-unknown}"

case "$EVENT" in
    PermissionRequest) TITLE="Claude Code 🔄" ;;
    Elicitation)       TITLE="Claude Code 💬" ;;
    *)                 TITLE="Claude Code ✅" ;;
esac

"$NOTIFY" "$TITLE" "$PROJECT" --sound
