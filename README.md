# OSS AI Pulse

Live open source AI intelligence dashboard tracking GitHub, Hacker News, Reddit, and Product Hunt — with Claude synthesis.

**Live feeds:** GitHub trending repos · Hacker News AI stories · Reddit (r/LocalLLaMA, r/MachineLearning) · Product Hunt AI launches  
**Claude synthesis:** Reads all four feeds and surfaces what's moving, what's being debated, what to watch.

---

## Deploy to Netlify in under 30 minutes

### 1. Clone or create the repo

Upload this folder to a new GitHub repo. You can do it via the GitHub web UI (drag and drop the folder) or via CLI:

```bash
git init
git add .
git commit -m "initial commit"
gh repo create oss-ai-pulse --public --push --source=.
```

### 2. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** and select your `oss-ai-pulse` repo
4. Build settings: leave everything blank (no build command, no publish directory — Netlify auto-detects the root `index.html`)
5. Click **Deploy site**

### 3. Add your Anthropic API key

1. In Netlify dashboard → **Site configuration → Environment variables**
2. Click **Add a variable**
3. Key: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))
5. Click **Save** — then **Trigger redeploy** from the Deploys tab

### 4. Add your Product Hunt token (optional)

Product Hunt token is stored in the user's browser localStorage — no server config needed. Users paste their own token, or you can hardcode yours in `index.html` by replacing the `localStorage.getItem('ph_token')` call with your token string directly. Not recommended for public deploys — use localStorage as-is.

### 5. Verify

Once deployed, open your Netlify URL. GitHub and HN load immediately. Reddit loads if CORS allows. Claude synthesis button calls `/.netlify/functions/synthesize` — your key never leaves the server.

---

## How it works

| Feed | Auth needed | How |
|------|-------------|-----|
| GitHub | None | Public search API |
| Hacker News | None | Public Firebase API |
| Reddit | None | Public .json endpoints |
| Product Hunt | Free dev token | User pastes in browser |
| Claude synthesis | Anthropic API key | Netlify Function proxy |

---

## Local development

To test the Netlify function locally, install the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

This runs the function locally at `http://localhost:8888/.netlify/functions/synthesize` and serves `index.html` at the root.

---

## Customisation

- **Add more Reddit subs:** edit the `subs` array in `loadReddit()` in `index.html`
- **Change GitHub search queries:** edit the fetch URLs in `loadGitHub()`
- **Add more quick-filter tags:** add `<button class="ftag">` entries in the tag-row section
- **Change synthesis prompt:** edit the `prompt` string in `runSynthesis()`

---

Built with plain HTML/CSS/JS · Powered by Claude · No framework, no build step
