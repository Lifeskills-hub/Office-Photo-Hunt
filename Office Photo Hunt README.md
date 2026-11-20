# Office Photo Hunt

A multiplayer photo scavenger hunt for office team bonding. Teams photograph spots around the office, then race to find and re-photograph each other's spots — scored by how closely the photos match.

## Play the game

**[Play Office Photo Hunt](https://lifeskills-hub.github.io/Office-Photo-Hunt/)**

Open the link on your phone browser — no install or account needed. One person creates a game, everyone else joins with the Game Code or QR code.

Source code: [github.com/lifeskills-hub/Office-Photo-Hunt](https://github.com/lifeskills-hub/Office-Photo-Hunt)

## What it is

- A team game played together in the same office, on different phones
- Each team submits 5 photos of office spots
- Teams then hunt for the other teams' spots and try to recreate their photos
- All teams in the same game see each other on a shared leaderboard
- Highest score wins, out of a maximum of 500 points

Good for team bonding, onboarding, and office parties — all you need is phones and an office to explore.

## How to play

### 1. Create or join a game

- The host opens the game link, enters a nickname, and taps **Create game**
- The host gets a 6-letter Game Code and a QR code
- Everyone else enters the Game Code and their nickname and taps **Join**, or scans the QR code / opens the shared link

### 2. Wait in the lobby

- Joined players appear live in the lobby as they arrive
- Share the Game Code or QR code until everyone is in
- Only the host can tap **Close joining & randomly assign teams**

### 3. Find your team and submit 5 photos

- Find your teammates in person
- Together, photograph 5 spots around the office and upload them in the app (the counter shows 0/5, then 1/5, and so on)
- All members of a team share the same five photo slots, and uploaded previews update for the whole team
- Tap **Our 5 photos are ready** when done
- At least 2 teams must be ready before the hunt can start

### 4. Hunt — match the photos

- A countdown timer runs at the top of the screen during the hunt
- Open a target photo, go to that exact spot, take a matching photo, and tap **Compare**
- You have unlimited attempts — only your best score for each target is kept
- Work through all 5 targets before time runs out

### 5. Finish — winner and leaderboard

- The hunt ends when time is up, or when all active teams have completed all 5 targets
- The finish screen shows the champion team, your team's place, and the final leaderboard
- Teams eliminated before the hunt show as **OUT**

## Scoring

- 5 targets × 100 points each = **500 points maximum**
- Matching runs on your phone. Both photos are shrunk to 96×96 and centre-cropped, then compared:
  - 70% — structure and angle
  - 30% — colour
- A strictness curve is applied, so a near-identical photo scores far more than a roughly similar one
- In practice: standing in the same spot, at the same angle, matters much more than just matching the colours in the scene

Tip: when you submit your 5 photos, pick spots that are recognisable but not too easy — a distinctive angle makes for a better hunt.

## Timer

- The header shows **LOBBY** before the game starts
- Once the hunt begins, it switches to a countdown in MM:SS, based on the hunt end time sent by the server
- The timer length is set server-side, so there is no timer setting in the app itself

## What you need

- A phone with a camera and a web browser for each player
- Everyone playing in the same game, in the same office
- A host to create the game and assign teams

## Tech notes

- Frontend: plain HTML, CSS, and JavaScript — no build step
- `index.html` — the game screens
- `app.js` — game flow, lobby, teams, hunt, and timer
- `imageMatcher.js` — on-device photo matching and scoring
- `styles.css`, `ui-enhancements.css`, `winner.css` — styling
- `manifest.json` and `sw.js` — installable web app support
- Multiplayer state — game codes, teams, photos, scores, and the shared leaderboard — is handled by a backend Google Apps Script endpoint that the app talks to. That backend code is not in this repository, so the timer length, team sizes, and elimination rules live server-side

## Repository

[https://github.com/lifeskills-hub/Office-Photo-Hunt](https://github.com/lifeskills-hub/Office-Photo-Hunt)
