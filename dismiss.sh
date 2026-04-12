#!/bin/bash
# Dismiss Claude Code notification for the current project

NOTIFY="$HOME/Applications/ClaudeNotify.app/Contents/MacOS/ClaudeNotify"
PROJECT=$(jq -r '.cwd // "" | split("/") | .[-1] // ""' 2>/dev/null)
"$NOTIFY" --dismiss "${PROJECT:-unknown}"
exit 0
