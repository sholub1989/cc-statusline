#!/bin/bash
# Dismiss Claude Code notification for the current project

NOTIFY="$HOME/Applications/ClaudeNotify.app/Contents/MacOS/ClaudeNotify"
MARKER="/tmp/claude-notify-active"

[ -f "$MARKER" ] || exit 0

PROJECT=$(cat "$MARKER")
rm -f "$MARKER"
"$NOTIFY" --dismiss "${PROJECT:-unknown}"
touch "/tmp/claude-notify/${PROJECT:-unknown}.lock"
exit 0
