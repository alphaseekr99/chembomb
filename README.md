# CHEMBOMB

A Year 9 SEAL chemistry arcade game for 2–12 players. Play five rounds of multiple-choice and short-answer questions. The round leader bombs a rival for 25% of that rival’s round score. One hosted room can be replayed.

## Run locally

Use Node.js 24 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:5173 in separate tabs or browser profiles. Create a game, enter the six-character code on the second device or tab, ready up and start from the host lobby. On a trusted local network, other devices can use the host computer’s LAN address on port 5173. SQLite creates its schema automatically and stores rooms and question edits under `.data/`. Use the same browser tab after a reload to resume its player session.

```sh
npm test
npm run build
npm start
```

The tests exercise the real server and SQLite storage with concurrent requests and a controlled clock. They cover access, timers, marking, both question types, scoring and all five rounds, including bomb timeouts, ties, unanswered questions, reconnection, late joins and replay.

## Environment

Copy `.env.example` to `.env` for local settings. Put production settings in the host’s secret configuration.

| Variable | Purpose |
| --- | --- |
| `ADMIN_KEY` | Long random access key for `/admin`. The editor supports manual editing, review and approval. |
| `SUPABASE_URL` | Supabase project URL. Set together with the service role key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend-only Supabase secret or service role key. Keep it out of frontend builds. |
| `AI_API_KEY`, `AI_MODEL` | Enable draft generation and automatic difficulty classification. |
| `AI_BASE_URL` | Optional OpenAI-compatible API base, default `https://api.openai.com/v1`. |
| `ROUND_SECONDS` | Server-side round duration, default 60 seconds. Range 15–300. |
| `PORT` | Port for the local or standalone Node server. |
| `LOCAL_DATABASE` | SQLite file location, default `.data/chembomb.sqlite`. |

## Database and deployment

- **Codex Sites.** The build produces an ES module Worker in `dist/server/index.js` with compiled client assets and declares the hosted D1 binding `DB` in `.openai/hosting.json`. The database schema is in `drizzle/0000_game.sql`. The Site’s sharing setting controls who can access the game before entering a room code.
- **Supabase/PostgreSQL.** Apply `supabase/schema.sql` in the project SQL editor. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the backend. The API switches to Supabase PostgREST for storage. RLS and table grants restrict direct reads and writes to the service role. Rooms use optimistic version checks for atomic updates. Browsers subscribe to game state by polling the API approximately every 650 ms.
- **Standalone Node host.** Deploy the project to a persistent Node 24 service with `npm ci && npm run build` as the build command and `npm start` as the start command. Let the host supply `PORT`. Use a persistent volume for SQLite on one instance, or use Supabase for shared storage across instances. Serve the hosted instance over HTTPS.

### Vercel

1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Import the repository into Vercel. Select Node.js 24.x and allow the committed `vercel.json` to configure the build and routes. If you previously overrode the Build Command or Output Directory, clear those overrides or set them to `npm run build:vercel` and `dist-vercel`.
3. In Vercel’s environment settings, add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the environments you deploy. Add `ADMIN_KEY` if you want to enable `/admin`.
4. Deploy, then open `/api/health` on the live domain. It should return JSON containing `"ready":true`. Open the homepage to create a room.

The Vercel function in `api/` serves room and admin requests. Vercel uses Supabase to share game state across function instances.

No external account or API call is needed to run a game locally. Live gameplay never calls the AI provider.

## Default gameplay rules

The supplied brief starts mid-rule, so these settings fill in the missing details.

- Two to twelve players. All players must ready up before the host starts. Each round draws four distinct questions, mixing MCQs and SAQs while both are available. The match uses 20 distinct questions. The default round timer is 60 seconds.
- Correct answers earn the question’s base points multiplied by 1× (easy), 1.5× (medium) or 2× (hard). A full speed bonus adds 30%. It decays linearly over ten seconds after a one-second grace period for MCQs, and over 24 seconds after a five-second grace period for SAQs. Wrong or unanswered questions earn zero. Points round to the nearest integer.
- The round leader takes the bomb. Ties use correct answer count and lower accumulated response time, followed by random selection. Each unanswered question counts as the full round duration for tie-breaking. A missed eight-second target deadline triggers a random eligible selection. The server deducts the nearest whole point to 25% of the victim’s round score.
- The final leaderboard uses cumulative post-bomb score, correct answer count and lower response time. An exact tie is a shared win. A player who disconnects remains in the room and can resume from the same tab.

## Source material and administration

The default course bank contains 74 approved questions over the 16 supplied topic areas and three conflict drafts. It uses the 16 teaching resources from the two attachment batches, 13 worksheet files and 18 revision papers and answer files. Two of the teaching resources are the smaller PDF exports. The separate original demo bank is selectable at room creation.

- `server/materials.mjs` contains extracted teaching, worksheet, revision and answer text with slide, page or paragraph references. The source library includes OCR text where the initial PDF text layer was empty or unusable.
- `server/course.mjs` contains the original authored questions, references, accepted answers, marking criteria, difficulty and points. Available references appear in the editor.
- The editor imports text from PPTX, PDF and DOCX. New image-only or scanned PDFs need OCR before upload. Embedded diagrams, formula formatting from document runs, and automatic extraction results may need manual checking. The initial text library omits original media.
- SAQs are marked against a canonical answer or an accepted alternative. Whitespace and Unicode notation are normalized, and chemical formula case is significant. Open-ended explanations and diagrams are best represented as multiple-choice items or marked by a teacher outside the game.
- Uploaded sources and AI drafts require admin review. Draft generation sends excerpts from the selected source and supporting excerpts to the configured provider. Substantial documents can be split into smaller source files to target different sections.
- Three discrepancies are queued in Content Admin. They concern the wording “down a Period” in the Atomic Structure solution, differing lead iodide formulae in the balancing slides and revision solution, and the missing minus sign on the methane combustion opening slide. These drafts are excluded from matches pending review.

## Project structure

| Path | Responsibility |
| --- | --- |
| `src/` | React screens, document extraction, pixel art, audio and responsive styles |
| `server/` | Game state machine, HTTP API, database adapters, content library and question banks |
| `scripts/` | Local development server and Worker build |
| `drizzle/` | SQLite and D1 schema |
| `supabase/schema.sql` | PostgreSQL schema and access grants |
| `test/` | Server integration tests |
