# 🔴⚫🟢 DAA VIVA VAULT 🟢⚫🔴

```
 ██████╗  █████╗  █████╗     ██╗   ██╗██╗██╗   ██╗ █████╗ 
 ██╔══██╗██╔══██╗██╔══██╗    ██║   ██║██║██║   ██║██╔══██╗
 ██║  ██║███████║███████║    ██║   ██║██║██║   ██║███████║
 ██║  ██║██╔══██║██╔══██║    ╚██╗ ██╔╝██║╚██╗ ██╔╝██╔══██║
 ██████╔╝██║  ██║██║  ██║     ╚████╔╝ ██║ ╚████╔╝ ██║  ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝      ╚═══╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝
        VAULT — A Google-Locked Viva Cheat Sheet 🔐
```

> **One HTML file. Zero backend. Zero database. Zero excuses for failing viva.**
> Sign in with Google → vault unlocks → every DAA experiment + Q&A + diagram you need, gatekept like a boss.

![Status](https://img.shields.io/badge/STATUS-LOCKED%20%26%20LOADED-FF0000?style=for-the-badge&labelColor=000000)
![Stack](https://img.shields.io/badge/STACK-HTML%20%2B%20VANILLA%20JS-C8FF00?style=for-the-badge&labelColor=000000)
![Auth](https://img.shields.io/badge/AUTH-GOOGLE%20IDENTITY%20SERVICES-FF0000?style=for-the-badge&labelColor=000000)
![Vibe](https://img.shields.io/badge/DESIGN-BRUTALIST-C8FF00?style=for-the-badge&labelColor=000000)

---

## ⚡ WHAT THIS THING DOES

1. You open the page → 🔒 **LOCKED.** Black screen, red border, one button.
2. Click **Sign in with Google**.
3. Google checks your email against an optional allowlist.
4. ✅ Pass → vault doors blow open → full DAA viva cheat sheet (10 experiments, diagrams, Q&A, general theory table) appears.
5. ❌ Fail → `ACCESS DENIED` flashes in red. No mercy.

No server. No Express. No MongoDB. Just one `.html` file doing all the work like a one-man army.

---

## 🧨 FEATURES

- 🔐 **Real Google OAuth** via Google Identity Services (GIS) — not a fake "click to enter" button, actual account verification.
- 🎯 **Email allowlist** — lock it to only your email, or open it to literally anyone with a Google account.
- 🧠 **Session memory** — refresh the page mid-study-session, it won't make you log in again (until you close the tab).
- 🎨 **Brutalist UI** — red `#FF0000` / black `#000000` / lime `#C8FF00`, Nunito 900-weight, 2px borders, **zero** border-radius. No soft rounded-corner nonsense here.
- 📊 **10 hand-drawn SVG diagrams** — Merge Sort tree, Prim's MST, Dijkstra path, DP tables, N-Queens board, and more — baked directly into the page.
- 🚫 **No build step** — no npm, no webpack, no nothing. Open it, host it, done.

---

## 🚀 QUICK START

### Step 1 — Get your Google Client ID
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → name it whatever (`daa-viva-vault` sounds cool)
3. **APIs & Services → OAuth consent screen** → External → fill app name + your email → Save
4. **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
5. Application type: **Web application**
6. Under **Authorized JavaScript origins**, add the EXACT URL you'll open this page from:

   | Hosting it on... | Add this origin |
   |---|---|
   | Vercel | `https://your-project.vercel.app` |
   | VS Code Live Server | `http://127.0.0.1:5500` (check your actual port) |
   | GitHub Pages | `https://yourusername.github.io` |
   | Just double-clicking the file | ❌ **Will NOT work** — `file://` is blocked by Google. Must be served over http/https. |

7. Copy your shiny new **Client ID** (ends in `.apps.googleusercontent.com`)

### Step 2 — Drop it in the code
Open the HTML file, find:
```js
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";
```
Swap in your real ID. No quotes mismatched, no trailing spaces.

### Step 3 — (Optional) Lock it to YOUR email only
```js
const ALLOWED_EMAILS = ["anooparjun05@gmail.com"];
```
Leave it `[]` to let anyone with a Google account waltz in.

### Step 4 — Ship it
Push to Vercel / GitHub Pages / Netlify — anywhere static hosting works. Open the URL, hit sign in, flex your viva knowledge.

---

## 🩹 TROUBLESHOOTING (a.k.a. "why is Google mad at me")

| Error | What it means | Fix |
|---|---|---|
| `Error 401: invalid_client` / "OAuth client was not found" | Your `CLIENT_ID` is wrong, still the placeholder, or you copied the Client **Secret** instead | Re-copy the Client ID from Cloud Console — top field, not the secret box |
| `Error 400: origin_mismatch` | The URL you're testing from isn't in **Authorized JavaScript origins** | Add the exact origin (protocol + domain + port, no trailing slash) in Cloud Console → Credentials → your OAuth client |
| Login button doesn't even show up | Page opened via `file://` | Google blocks local files — serve via `http(s)://` (Live Server, Vercel, etc.) |
| Changes not taking effect | Google origin updates can take 1–5 mins to propagate | Wait it out, then hard refresh (`Ctrl+Shift+R`) |
| `ACCESS DENIED` shown after valid login | Your email isn't in `ALLOWED_EMAILS` | Add your exact Gmail to the array, or clear the array to allow everyone |

---

## 🎨 DESIGN SYSTEM (for the design nerds)

```
COLORS:    #FF0000 (red)  #000000 (black)  #C8FF00 (lime)
FONT:      Nunito, weight 900 — always
BORDERS:   2px solid #000, ZERO border-radius
VIBE:      Brutalist. No gradients. No shadows. No mercy.
```

---

## 🛠️ TECH STACK

- **Frontend:** Raw HTML + CSS + vanilla JS (no frameworks, no libraries except Google's own script)
- **Auth:** Google Identity Services (`accounts.google.com/gsi/client`)
- **Storage:** `sessionStorage` (clears on tab close — no backend, no DB, no tracking)
- **Diagrams:** Hand-coded inline SVG
- **Hosting:** Any static host (Vercel, GitHub Pages, Netlify)

---

## 📦 WHAT'S INSIDE

```
daa-viva-vault-login.html
│
├── #loginGate         → Google sign-in screen (shown first)
└── #mainContent        → unlocks after successful login
    ├── Exp 1-2  Merge Sort / Quick Sort
    ├── Exp 3    Fractional Knapsack
    ├── Exp 4    Prim's MST
    ├── Exp 5    Topological Sort
    ├── Exp 6    Dijkstra's Algorithm
    ├── Exp 7a/b Floyd-Warshall / Warshall's
    ├── Exp 8    0/1 Knapsack DP
    ├── Exp 9    PCB Drilling (TSP heuristic)
    ├── Exp 10   N-Queens Backtracking
    └── General Theory Table (24 must-know Qs)
```

---
