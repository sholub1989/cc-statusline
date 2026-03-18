#!/bin/bash
# Installs Claude Code statusline: registers Chrome native messaging host,
# configures Claude Code settings, and verifies the setup.
#
# Two install modes:
#   LOCAL  — run from a cloned repo:  ./install.sh
#   REMOTE — via curl one-liner:      curl -fsSL <url>/install.sh | bash

set -euo pipefail

# ── Flag parsing ──────────────────────────────────────────────────────────────
INSTALL_CHROME_EXTENSION=true
for arg in "$@"; do
    case "$arg" in
        --no-chrome-extension) INSTALL_CHROME_EXTENSION=false ;;
    esac
done

# ── Constants ─────────────────────────────────────────────────────────────────
# Deterministic extension ID derived from the "key" in manifest.json
EXT_ID="onppaomicbkdjhmkmheojgkifbmhehpc"
GITHUB_RAW="https://raw.githubusercontent.com/sholub1989/cc-statusline/master"
INSTALL_DIR="$HOME/.claude/extensions/cc-statusline"

# ── Detect install mode ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || echo "")"

if [ -n "$SCRIPT_DIR" ] && [ -f "$SCRIPT_DIR/extension/manifest.json" ]; then
    MODE="local"
    REPO_DIR="$SCRIPT_DIR"
    echo "Detected local repo at $REPO_DIR"
else
    MODE="remote"
    echo "Remote install — downloading files to $INSTALL_DIR"
fi

# ── Pre-flight checks ────────────────────────────────────────────────────────
ERRORS=0

if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
    # python3
    if ! command -v python3 &>/dev/null; then
        echo "✗ python3 not found"
        echo "  Install: brew install python3  (or visit https://python.org)"
        ERRORS=$((ERRORS + 1))
    else
        echo "✓ python3 found"
    fi

    # Chrome
    CHROME_APP="/Applications/Google Chrome.app"
    CHROME_APP_USER="$HOME/Applications/Google Chrome.app"
    CHROME_SUPPORT="$HOME/Library/Application Support/Google/Chrome"
    if [ -d "$CHROME_APP" ] || [ -d "$CHROME_APP_USER" ] || [ -d "$CHROME_SUPPORT" ]; then
        echo "✓ Chrome found"
    else
        echo "✗ Chrome not found"
        echo "  Checked: $CHROME_APP, $CHROME_APP_USER, $CHROME_SUPPORT"
        echo "  Install Chrome from https://google.com/chrome"
        ERRORS=$((ERRORS + 1))
    fi
fi

# jq
if ! command -v jq &>/dev/null; then
    if command -v brew &>/dev/null; then
        echo "⚠ jq not found — installing via Homebrew..."
        brew install jq
        echo "✓ jq installed"
    else
        echo "✗ jq not found and Homebrew not available"
        echo "  Install: brew install jq  (or visit https://jqlang.github.io/jq/)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "✓ jq found"
fi

if [ "$ERRORS" -gt 0 ]; then
    echo ""
    echo "Fix the above issues and re-run the installer."
    exit 1
fi

# ── Remote mode: download files flat into INSTALL_DIR ────────────────────────
if [ "$MODE" = "remote" ]; then
    echo ""
    echo "Downloading files..."
    # source path in repo → destination filename (flat)
    if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
        FILES=(
            "statusline.sh:statusline.sh"
            "extension/manifest.json:manifest.json"
            "extension/background.js:background.js"
            "extension/host.py:host.py"
            "extension/icon16.png:icon16.png"
            "extension/icon48.png:icon48.png"
            "extension/icon128.png:icon128.png"
        )
    else
        FILES=(
            "statusline.sh:statusline.sh"
        )
    fi

    for entry in "${FILES[@]}"; do
        SRC="${entry%%:*}"
        DST="${entry##*:}"
        if curl -fsSL "$GITHUB_RAW/$SRC" -o "$INSTALL_DIR/$DST"; then
            echo "  ✓ $DST"
        else
            echo "  ✗ Failed to download $SRC"
            exit 1
        fi
    done
fi

# ── Install ──────────────────────────────────────────────────────────────────
echo ""

mkdir -p "$INSTALL_DIR"

if [ "$MODE" = "local" ]; then
    if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
        # Copy extension files flat into INSTALL_DIR
        cp "$REPO_DIR/extension/manifest.json" "$INSTALL_DIR/"
        cp "$REPO_DIR/extension/background.js" "$INSTALL_DIR/"
        cp "$REPO_DIR/extension/host.py" "$INSTALL_DIR/"
        cp "$REPO_DIR/extension/icon"*.png "$INSTALL_DIR/"
    fi
    cp "$REPO_DIR/statusline.sh" "$INSTALL_DIR/"
    echo "✓ Copied files to $INSTALL_DIR"
fi

# Make scripts executable
chmod +x "$INSTALL_DIR/statusline.sh"
[ "$INSTALL_CHROME_EXTENSION" = true ] && chmod +x "$INSTALL_DIR/host.py"
echo "✓ Made scripts executable"

if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
    # Write native messaging host manifest
    INSTALLED_HOST="$INSTALL_DIR/host.py"
    CHROME_NMH_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
    mkdir -p "$CHROME_NMH_DIR"
    cat > "$CHROME_NMH_DIR/com.claude.usage.json" <<MANIFEST
{
  "name": "com.claude.usage",
  "description": "Fetches Claude usage data for statusline",
  "path": "$INSTALLED_HOST",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://${EXT_ID}/"]
}
MANIFEST
    echo "✓ Registered native messaging host"
fi

# Symlink statusline.sh into ~/.claude/
ln -sf "$INSTALL_DIR/statusline.sh" "$HOME/.claude/statusline.sh"
echo "✓ Symlinked statusline.sh → ~/.claude/statusline.sh"

# Marker file for no-chrome-extension mode
if [ "$INSTALL_CHROME_EXTENSION" = false ]; then
    touch "$INSTALL_DIR/.no-chrome-extension"
else
    rm -f "$INSTALL_DIR/.no-chrome-extension"
fi

# Configure Claude Code settings
SETTINGS="$HOME/.claude/settings.json"
if [ -f "$SETTINGS" ]; then
    TMP=$(mktemp)
    jq '.statusLine = {"type":"command","command":"~/.claude/statusline.sh","padding":0}' "$SETTINGS" > "$TMP" && mv "$TMP" "$SETTINGS"
    echo "✓ Updated Claude Code settings"
else
    mkdir -p "$HOME/.claude"
    cat > "$SETTINGS" <<'SETTINGS_JSON'
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
SETTINGS_JSON
    echo "✓ Created Claude Code settings"
fi

# ── Post-install verification ────────────────────────────────────────────────
echo ""
echo "Verification:"
PASS=0
FAIL=0

if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
    # host.py is executable at installed path
    if [ -x "$INSTALLED_HOST" ]; then
        echo "  ✓ host.py is executable"
        PASS=$((PASS + 1))
    else
        echo "  ✗ host.py is not executable at $INSTALLED_HOST"
        FAIL=$((FAIL + 1))
    fi

    # Native host manifest is valid JSON
    NMH_FILE="$CHROME_NMH_DIR/com.claude.usage.json"
    if jq empty "$NMH_FILE" 2>/dev/null; then
        echo "  ✓ Native host manifest is valid JSON"
        PASS=$((PASS + 1))
    else
        echo "  ✗ Native host manifest is invalid"
        FAIL=$((FAIL + 1))
    fi
fi

# settings.json contains statusLine
if jq -e '.statusLine' "$SETTINGS" >/dev/null 2>&1; then
    echo "  ✓ settings.json contains statusLine config"
    PASS=$((PASS + 1))
else
    echo "  ✗ settings.json missing statusLine config"
    FAIL=$((FAIL + 1))
fi

if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
    # manifest.json exists in install dir
    if [ -f "$INSTALL_DIR/manifest.json" ]; then
        echo "  ✓ manifest.json present in extension folder"
        PASS=$((PASS + 1))
    else
        echo "  ✗ manifest.json missing from $INSTALL_DIR"
        FAIL=$((FAIL + 1))
    fi
fi

echo ""
echo "$PASS passed, $FAIL failed"

if [ "$FAIL" -gt 0 ]; then
    echo "Some checks failed — review the output above."
    exit 1
fi

# ── Next steps ───────────────────────────────────────────────────────────────
echo ""
if [ "$INSTALL_CHROME_EXTENSION" = true ]; then
    echo "Done! Now load the Chrome extension:"
    echo ""
    echo "  1. Open chrome://extensions and enable Developer mode (top-right toggle)"
    echo "  2. Open the extension folder in Finder:"
    echo ""
    echo "     open $INSTALL_DIR"
    echo ""
    echo "  3. Drag the 'cc-statusline' folder onto the chrome://extensions page"
    echo "  4. Open a Claude Code session — you should see the statusline"
else
    echo "Done! Statusline installed (single-line mode, without Chrome extension)."
    echo "Open a Claude Code session — you should see the statusline."
fi
