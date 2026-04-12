#!/bin/bash
# Uninstalls Claude Code notifications: removes the app, scripts, and hooks.

set -euo pipefail

echo "Uninstalling cc-notifications..."

# Remove ClaudeNotify.app
if [ -d "$HOME/Applications/ClaudeNotify.app" ]; then
    rm -rf "$HOME/Applications/ClaudeNotify.app"
    echo "✓ Removed ~/Applications/ClaudeNotify.app"
else
    echo "- ClaudeNotify.app already removed"
fi

# Remove installed files
if [ -d "$HOME/.claude/extensions/cc-notifications" ]; then
    rm -rf "$HOME/.claude/extensions/cc-notifications"
    echo "✓ Removed ~/.claude/extensions/cc-notifications/"
else
    echo "- ~/.claude/extensions/cc-notifications/ already removed"
fi

# Remove symlinks
for script in notify.sh dismiss.sh; do
    if [ -L "$HOME/.claude/scripts/$script" ] || [ -f "$HOME/.claude/scripts/$script" ]; then
        rm "$HOME/.claude/scripts/$script"
        echo "✓ Removed ~/.claude/scripts/$script"
    else
        echo "- ~/.claude/scripts/$script already removed"
    fi
done

# Remove only notification hooks from settings.json (preserve other hooks)
SETTINGS="$HOME/.claude/settings.json"
NOTIFY_CMD="~/.claude/scripts/notify.sh"
DISMISS_CMD="~/.claude/scripts/dismiss.sh"
if [ -f "$SETTINGS" ] && command -v jq &>/dev/null; then
    if jq -e '.hooks' "$SETTINGS" >/dev/null 2>&1; then
        TMP=$(mktemp)
        jq --arg notify "$NOTIFY_CMD" --arg dismiss "$DISMISS_CMD" '
            (.hooks.Stop // []) |= map(select(.hooks | all(.command != $notify))) |
            (.hooks.PermissionRequest // []) |= map(select(.hooks | all(.command != $notify))) |
            (.hooks.Elicitation // []) |= map(select(.hooks | all(.command != $notify))) |
            (.hooks.Notification // []) |= map(select(.hooks | all(.command != $notify))) |
            (.hooks.UserPromptSubmit // []) |= map(select(.hooks | all(.command != $dismiss))) |
            (.hooks.PostToolUse // []) |= map(select(.hooks | all(.command != $dismiss))) |
            if .hooks.Stop == [] then del(.hooks.Stop) else . end |
            if .hooks.PermissionRequest == [] then del(.hooks.PermissionRequest) else . end |
            if .hooks.Elicitation == [] then del(.hooks.Elicitation) else . end |
            if .hooks.Notification == [] then del(.hooks.Notification) else . end |
            if .hooks.UserPromptSubmit == [] then del(.hooks.UserPromptSubmit) else . end |
            if .hooks.PostToolUse == [] then del(.hooks.PostToolUse) else . end |
            if .hooks == {} then del(.hooks) else . end
        ' "$SETTINGS" > "$TMP" && mv "$TMP" "$SETTINGS"
        echo "✓ Removed notification hooks from settings.json"
    else
        echo "- settings.json has no hooks config"
    fi
else
    echo "- Skipped settings.json (file missing or jq not found)"
fi

# Remove temp files
rm -rf /tmp/claude-notify /tmp/claude-notify-active

echo ""
echo "Done!"
