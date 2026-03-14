# cc-statusline — with real-time subscription usage limits

A status bar for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that shows session info and (optionally) real-time subscription usage.

![statusline](assets/statusline.png)

**Line 1** — model, project path, git branch, uncommitted changes, context window usage, session cost

**Line 2** — Claude subscription usage limits (5-hour and 7-day windows) with reset countdowns

## Prerequisites

- macOS
- `jq` on `$PATH`

**For Line 2 (usage data):**
- Google Chrome logged into claude.ai (same profile where you can view [claude.ai/settings/usage](https://claude.ai/settings/usage))
- `python3` on `$PATH`

## Setup

```bash
# Full install (Line 1 + Line 2 with usage data)
curl -fsSL https://raw.githubusercontent.com/sholub1989/cc-statusline/master/install.sh | bash

# Without Chrome extension (Line 1 only)
curl -fsSL https://raw.githubusercontent.com/sholub1989/cc-statusline/master/install.sh | bash -s -- --no-chrome-extension
```

After the full install, load the Chrome extension:

```bash
open ~/.claude/extensions/cc-statusline
```

1. Open `chrome://extensions` and enable **Developer mode** (top-right toggle)
2. Drag the `cc-statusline` folder onto the `chrome://extensions` page

> Load the extension in the **same Chrome profile** where you're logged into claude.ai.

3. Open a Claude Code session — the statusline should appear

### Developer install

```bash
git clone https://github.com/sholub1989/cc-statusline.git
cd cc-statusline
./install.sh                        # full install
./install.sh --no-chrome-extension  # Line 1 only
```

## Troubleshooting

**Line 2 doesn't appear**
- Check `chrome://extensions` for errors on the extension
- Verify `ls /tmp/claude-usage.sock` exists
- Make sure the extension is in the same Chrome profile as your claude.ai login

**"Native host disconnected"**
- Re-run `./install.sh` and reload the extension in `chrome://extensions`

**Usage data is stale**
- Data is debounced to 5-second intervals — this is intentional

## Uninstall

```bash
./uninstall.sh
```

Then remove the extension from `chrome://extensions`.
