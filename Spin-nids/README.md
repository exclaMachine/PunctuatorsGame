# Ambigram Word Game

A word game where tiles contain 4 letters in quadrants. Rotating a tile transforms letters into their ambigram equivalents. Type words using letters from the grid.

## Files

```
ambigram-game/
├── index.html   ← the entire game
└── words.txt    ← 41,000-word dictionary (2 of 12 word list)
```

## Deploy to GitHub Pages

### 1. Create a new GitHub repository

Go to https://github.com/new and create a repo (e.g. `ambigram-game`). 
You can make it public or private — Pages works with both on a free account (public only for free tier).

### 2. Upload the files

**Option A — via the GitHub website (easiest):**
1. Open your new repo on GitHub
2. Click **Add file → Upload files**
3. Drag both `index.html` and `words.txt` into the upload area
4. Click **Commit changes**

**Option B — via Git CLI:**
```bash
cd ambigram-game
git init
git add index.html words.txt
git commit -m "initial game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ambigram-game.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. In your repo, go to **Settings → Pages** (left sidebar)
2. Under **Source**, select **Deploy from a branch**
3. Set branch to `main`, folder to `/ (root)`
4. Click **Save**

### 4. Visit your game

After ~60 seconds, your game will be live at:
```
https://YOUR_USERNAME.github.io/ambigram-game/
```

GitHub shows the URL in **Settings → Pages** once it's ready.

---

## Local development

Just open `index.html` in a browser — but note: `words.txt` loads via `fetch()` which requires
a local server (browsers block file:// fetches for security). Use any of:

```bash
# Python (built-in)
python3 -m http.server 8080
# then open http://localhost:8080

# Node (npx)
npx serve .

# VS Code
# Install the "Live Server" extension, right-click index.html → Open with Live Server
```

---

## Adding your own tiles

In `index.html`, find `const TILE_DEFS` and add entries:
```js
{ l: ['A', 'B', 'C', 'D'], c: '#B5D4F4' },
//         TL   TR   BL   BR    ^ tile colour
```
Letters are positioned: top-left, top-right, bottom-left, bottom-right.

## Updating the ambigram map

Find `const AM` in `index.html`. Each entry is:
```js
'letter': [at_0deg, at_90deg_CW, at_180deg, at_270deg_CW]
// null = invalid/unreadable at that rotation
```
