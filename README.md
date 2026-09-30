# StudySteady Backend

REST API for StudySteady — a learning consistency and recovery companion. Node.js, Express, MongoDB (Mongoose), JWT authentication.

## Tech stack

- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication, bcryptjs for password hashing
- dotenv, cors

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev             # nodemon, auto-restart
# or
npm start                # production
```

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Used to sign auth tokens |
| `PORT` | No | Render provides this automatically; local default is 5000 |
| `CORS_ORIGINS` | Recommended | Comma-separated frontend origins, e.g. `https://study-steady-n.netlify.app` |
| `FRONTEND_URL` | Optional | Single frontend origin; used when `CORS_ORIGINS` is not set |

## Data model

```
User
└── Goal (a course/subject — subject, description, provider, targetDate)
    └── Plan (one active schedule for that Goal)
        ├── activities: [{ title, estimatedMinutes }]   — the template list
        ├── weeklyTime, daysOfWeek, startDate, endDate
        ├── status: active | paused | completed, pausedUntil
        ├── reminderOverride: { enabled, days, time } | null
        └── Event (one per activity × scheduled day, generated when the Plan is created)
            ├── title, scheduledDate, scheduledTime, estimatedMinutes
            ├── status: upcoming | completed | missed | snoozed
            ├── paused, pauseReturnDate                   — independent of the Plan's own pause
            ├── reminderOverride: { enabled, days, time } | null
            └── Activity (created when the user starts an Event — the completion record)
                └── status: in_progress | completed | missed | snoozed | recovered

ReminderPreference — one per user, the account-wide default
```

**Reminders resolve from the most specific level down**: an `Event`'s own `reminderOverride`, else its `Plan`'s `reminderOverride`, else the user's account-wide `ReminderPreference`. The API returns each level's raw value; resolving the cascade is currently the caller's job (fetch all three, apply first non-null).

**Pause works the same way at two independent levels** — a `Plan` (the whole course) or a single `Event` (one activity) can each be paused with its own return date. A pause clears itself automatically once its return date has passed, checked lazily whenever that document is read (no cron job required for correctness).

## API reference

Base URL: `/api`. All routes except `/auth/*` require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Body | Notes |
|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | Does **not** return a token — call `/auth/login` next |
| POST | `/auth/login` | `{ email, password }` | Returns `{ id, name, email, token }` |

### Goals

| Method | Path | Body |
|---|---|---|
| POST | `/goals` | `{ subject, description?, provider?, targetDate? }` |
| GET | `/goals` | — |
| GET | `/goals/:id` | — |
| PUT | `/goals/:id` | any of the above fields |
| DELETE | `/goals/:id` | — |

### Plans

| Method | Path | Body |
|---|---|---|
| POST | `/plans` | `{ goal, activities: [{title, estimatedMinutes}], weeklyTime?, daysOfWeek, startDate, endDate? }` — generates `Event` documents for every activity on every matching day between `startDate` and `endDate` (or +90 days if no `endDate`) |
| GET | `/plans` | — |
| GET | `/plans/:id` | — |
| PUT | `/plans/:id` | `{ activities?, weeklyTime?, daysOfWeek?, startDate?, endDate? }` |
| PUT | `/plans/:id/pause` | `{ returnDate }` — must be in the future and no more than 90 days out |
| PUT | `/plans/:id/resume` | — |
| PUT | `/plans/:id/adjust` | `{ daysOfWeek?, activities?, weeklyTime?, endDate? }` |
| PUT | `/plans/:id/reminders` | `{ enabled, days, time }`, or `{ clear: true }` to remove the override and fall back to the account default |
| DELETE | `/plans/:id` | — |

### Events (single activity occurrences)

| Method | Path | Body |
|---|---|---|
| GET | `/events` | Query: `?date=YYYY-MM-DD`, `?planId=`, `?goalId=` (any combination) |
| GET | `/events/:id` | — |
| PUT | `/events/:id` | `{ title?, scheduledDate?, scheduledTime?, estimatedMinutes? }` |
| PUT | `/events/:id/pause` | `{ returnDate }` — same validation as a Plan pause |
| PUT | `/events/:id/resume` | — |
| PUT | `/events/:id/reminders` | `{ enabled, days, time }`, or `{ clear: true }` |

### Activities (completion records)

| Method | Path | Body |
|---|---|---|
| POST | `/activities/start` | `{ eventId }` |
| PUT | `/activities/:id/complete` | — |
| PUT | `/activities/:id/snooze` | — |
| GET | `/activities` | Query: `?status=`, `?planId=` |

### Progress

| Method | Path |
|---|---|
| GET | `/progress` — optional `?planId=` |
| GET | `/progress/missed-summary` |

### Reminders (account-wide default)

| Method | Path | Body |
|---|---|---|
| GET | `/reminders` | — |
| PUT | `/reminders` | `{ enabled, days, time }` |

### Recovery

| Method | Path |
|---|---|
| GET | `/recovery/task` |
| PUT | `/recovery/:id/snooze` |
| PUT | `/recovery/:id/recover` |

## Response format

```json
{ "success": true, "data": { ... } }
```
```json
{ "success": false, "message": "What went wrong" }
```

## Project structure

```
server.js               Entry point — loads env, connects to MongoDB, starts the server
src/
├── app.js               Express app and route registration
├── config/               DB connection, shared constants (day names, plan statuses)
├── models/                Mongoose schemas
├── controllers/           Request handlers
├── services/              Business logic (validation, date math, the pause/reminder cascade)
├── routes/                 Route definitions
├── middleware/              Auth check, centralized error handler
└── jobs/                     reminderDispatch.js — currently logs due reminders; does not send anything yet
```

## Known limitations

- **Reminder delivery isn't implemented.** `reminderDispatch.js` identifies who's due a reminder and logs it — nothing is actually sent (no push, no email). It also only reads the account-wide `ReminderPreference`, not `Plan`- or `Event`-level overrides; extending it to check the full cascade is still open.
- **No automated tests.** Everything here was checked via schema validation and isolated logic tests during development; there's no test suite committed to the repo.
- **No request-body validation layer.** Controllers check for missing required fields, but there's no schema validator (e.g. Joi) rejecting malformed input before it reaches Mongoose. Mongoose's own schema validation is the only safety net.

## License

Not yet specified.


## Deploying to Render

Create a Render Web Service from this repository:

- Build command: `npm install`
- Start command: `npm start`
- Add `MONGO_URI` and `JWT_SECRET` as secret environment variables.
- Set `CORS_ORIGINS` to your Netlify site URL (without a trailing slash).
- Render provides `PORT` automatically.

After deployment, verify `https://YOUR-RENDER-SERVICE.onrender.com/health` returns `{ "success": true, "data": { "status": "ok" } }`.
