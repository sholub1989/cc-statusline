#!/bin/bash
# Uninstalls Claude Code statusline: removes native messaging host,
# installed files, and Claude Code settings.

set -euo pipefail

echo "Uninstalling cc-statusline..."

# Remove native messaging host manifest
NMH="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.claude.usage.json"
if [ -f "$NMH" ]; then
    rm "$NMH"
    echo "✓ Removed native messaging host manifest"
else
    echo "- Native messaging host manifest already removed"
fi

# Remove installed files
if [ -d "$HOME/.claude/extensions/cc-statusline" ]; then
    rm -rf "$HOME/.claude/extensions/cc-statusline"
    echo "✓ Removed ~/.claude/extensions/cc-statusline/"
else
    echo "- ~/.claude/extensions/cc-statusline/ already removed"
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

# Remove Unix socket if present
if [ -e "/tmp/claude-usage.sock" ]; then
    rm "/tmp/claude-usage.sock"
    echo "✓ Removed /tmp/claude-usage.sock"
fi

echo ""
echo "Done! Now remove the extension from chrome://extensions."
