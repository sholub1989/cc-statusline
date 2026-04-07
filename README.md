# cc-statusline

A status bar for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) that shows session info and subscription usage limits.

![statusline](assets/statusline.png)

**Line 1** — model, project path, git branch, uncommitted changes, context window usage, session cost

**Line 2** — Claude subscription usage limits (5-hour and 7-day windows) with reset countdowns

## Prerequisites

- macOS
- `jq` on `$PATH`

## Setup

```bash
curl -fsSL https://raw.githubusercontent.com/sholub1989/cc-statusline/master/install.sh | bash
```

### Developer install

```bash
git clone https://github.com/sholub1989/cc-statusline.git
cd cc-statusline
./install.sh
```

## Troubleshooting

**Line 2 doesn't appear**
- Rate limit data is provided by Claude Code itself — ensure you're on a version that includes `rate_limits` in statusline JSON input

## Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/sholub1989/cc-statusline/master/uninstall.sh | bash
```
