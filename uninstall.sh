#!/bin/bash
# Uninstalls Claude Code statusline: removes installed files and Claude Code settings.

set -euo pipefail

echo "Uninstalling cc-setup..."

# Remove installed files
if [ -d "$HOME/.claude/extensions/cc-setup" ]; then
    rm -rf "$HOME/.claude/extensions/cc-setup"
    echo "✓ Removed ~/.claude/extensions/cc-setup/"
else
    echo "- ~/.claude/extensions/cc-setup/ already removed"
fi

if [ -L "$HOME/.claude/statusline.sh" ] || [ -f "$HOME/.claude/statusline.sh" ]; then
    rm "$HOME/.claude/statusline.sh"
    echo "✓ Removed ~/.claude/statusline.sh"
else
    echo "- ~/.claude/statusline.sh already removed"
fi

# Remove statusLine config from settings.json
SETTINGS="$HOME/.claude/settings.json"
if [ -f "$SETTINGS" ] && command -v jq &>/dev/null; then
    if jq -e '.statusLine' "$SETTINGS" >/dev/null 2>&1; then
        TMP=$(mktemp)
        jq 'del(.statusLine)' "$SETTINGS" > "$TMP" && mv "$TMP" "$SETTINGS"
        echo "✓ Removed statusLine from settings.json"
    else
        echo "- settings.json has no statusLine config"
    fi
else
    echo "- Skipped settings.json (file missing or jq not found)"
fi

echo ""
echo "Done!"
