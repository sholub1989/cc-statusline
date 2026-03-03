#!/bin/bash
input=$(cat)

# ANSI Colors
CYAN='\033[1;36m'
MAGENTA='\033[1;35m'
GREEN='\033[32m'
RED='\033[31m'
DIM='\033[2m'
R='\033[0m'

# Format number with space as thousands separator
format_num() {
    printf "%d" "$1" | rev | sed 's/.\{3\}/& /g' | rev | sed 's/^ //'
}

# Extract all values from JSON in a single jq call
eval $(echo "$input" | jq -r '
    @sh "SESSION_ID=\(.session_id // "default")",
    @sh "MODEL=\(.model.display_name // "Unknown")",
    @sh "CWD=\(.cwd // "")",
    @sh "CTX_SIZE=\(.context_window.context_window_size // 200000)",
    @sh "COST=\(.cost.total_cost_usd // 0)",
    @sh "INPUT_TOKENS=\(.context_window.current_usage.input_tokens // -1)",
    @sh "CACHE_CREATE=\(.context_window.current_usage.cache_creation_input_tokens // 0)",
    @sh "CACHE_READ=\(.context_window.current_usage.cache_read_input_tokens // 0)"
' | tr '\n' ' ')

# Extract last two path components
if [ -n "$CWD" ]; then
    PROJECT_PATH="/$(echo "$CWD" | rev | cut -d'/' -f1-2 | rev)"
else
    PROJECT_PATH=""
fi

# Cache file for context tokens (per-session)
STATUSLINE_DIR="$HOME/.claude/extensions/cc-statusline"
CACHE_FILE="$STATUSLINE_DIR/ctx-cache-${SESSION_ID}"

# Context tokens — round to nearest 100 to avoid flicker
if [ "$INPUT_TOKENS" -ge 0 ] 2>/dev/null; then
    CTX_RAW=$((INPUT_TOKENS + CACHE_CREATE + CACHE_READ))
    CTX_TOKENS=$(( (CTX_RAW + 50) / 100 * 100 ))
    if [ "$CTX_TOKENS" -gt 0 ]; then
        echo "$CTX_TOKENS" > "$CACHE_FILE"
    fi
else
    if [ -f "$CACHE_FILE" ]; then
        CTX_TOKENS=$(cat "$CACHE_FILE")
    else
        CTX_TOKENS=0
    fi
fi

# Context percentage
if [ "$CTX_SIZE" -gt 0 ] && [ "$CTX_TOKENS" -gt 0 ]; then
    CTX_PERCENT=$(awk "BEGIN {printf \"%.1f\", ($CTX_TOKENS / $CTX_SIZE) * 100}")
else
    CTX_PERCENT="0.0"
fi

COST_FMT=$(printf "%.2f" "$COST")
CTX_FMT=$(format_num $CTX_TOKENS)

# Git branch and shortstat
BRANCH="N/A"
ADDED=0
REMOVED=0
if git rev-parse --git-dir >/dev/null 2>&1; then
    BRANCH=$(git branch --show-current 2>/dev/null || echo "N/A")
    SHORTSTAT=$(git diff --shortstat HEAD 2>/dev/null)
    if [ -n "$SHORTSTAT" ]; then
        ADDED=$(echo "$SHORTSTAT" | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+')
        REMOVED=$(echo "$SHORTSTAT" | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+')
        ADDED=${ADDED:-0}
        REMOVED=${REMOVED:-0}
    fi
fi

# Line 1
echo -e "${CYAN}${MODEL}${R} ${DIM}|${R} ${PROJECT_PATH} ${DIM}|${R} ${MAGENTA}${BRANCH}${R} ${DIM}|${R} ${GREEN}+${ADDED}${R} ${RED}-${REMOVED}${R} ${DIM}|${R} Ctx: ${CYAN}${CTX_PERCENT}%${R} ${DIM}(${CTX_FMT})${R} ${DIM}|${R} Cost: ${CYAN}\$${COST_FMT}${R}"

# Line 2: usage data from socket (requires Chrome extension)
if [ ! -f "$STATUSLINE_DIR/.no-chrome-extension" ]; then
    LINE2=$(python3 -c "
import json, socket, datetime

SOCK = '/tmp/claude-usage.sock'
R = '\033[0m'
CYAN = '\033[1;36m'
DIM = '\033[2m'

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.settimeout(2)
try:
    s.connect(SOCK)
    raw = b''
    while True:
        chunk = s.recv(4096)
        if not chunk:
            break
        raw += chunk
finally:
    s.close()

d = json.loads(raw)

fh = d.get('five_hour', {}) or {}
fh_pct = fh.get('utilization', 0) or 0
fh_reset = fh.get('resets_at', '')
if fh_reset:
    dt = datetime.datetime.fromisoformat(fh_reset)
    now = datetime.datetime.now(datetime.timezone.utc)
    diff = max((dt - now).total_seconds(), 0)
    hrs = int(diff // 3600)
    mins = int((diff % 3600) // 60)
    fh_str = f'{CYAN}{fh_pct}%{R} {hrs}h {mins}m'
else:
    fh_str = f'{CYAN}{fh_pct}%{R}'

sd = d.get('seven_day', {}) or {}
sd_pct = sd.get('utilization', 0) or 0
sd_reset = sd.get('resets_at', '')
if sd_reset:
    dt = datetime.datetime.fromisoformat(sd_reset)
    local_dt = dt.astimezone()
    sd_time = local_dt.strftime('%a %-I:%M %p')
    sd_str = f'{CYAN}{sd_pct}%{R} {sd_time}'
else:
    sd_str = f'{CYAN}{sd_pct}%{R}'

print(f'{fh_str} {DIM}|{R} {sd_str}')
" 2>/dev/null)
    if [ -n "$LINE2" ]; then
        echo -e "$LINE2"
    fi
fi
