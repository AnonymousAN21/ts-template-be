# ts-template-be

A TypeScript + Express backend starter template with a pluggable database layer (Postgres, MySQL, SQLite via Drizzle ORM, or MongoDB via Mongoose), baseline security middleware, and a standardized API response format.

## Stack

- **Runtime**: Node.js, TypeScript (ESM / `NodeNext`)
- **Framework**: Express 5
- **Database**: choose one at runtime via `DATABASE_TYPE` — Postgres, MySQL, or SQLite (all via [Drizzle ORM](https://orm.drizzle.team/)), or MongoDB (via [Mongoose](https://mongoosejs.com/))
- **Security**: `helmet`, `cors`, `express-rate-limit`
- **Planned but not yet wired up**: `zod` (validation), `jsonwebtoken` + `bcrypt` (auth) — these are installed as dependencies for you to build on, but no routes/middleware use them yet

## Getting started

```bash
git clone <this-repo-url>
cd ts-template-be
npm install
cp .env.example .env
```

Edit `.env` and set:

| Variable       | Description                                                              |
|----------------|---------------------------------------------------------------------------|
| `DATABASE_TYPE`| One of: `postgre`, `mysql`, `sqlite`, `mongodb` (note: `postgre`, not `postgres`) |
| `DATABASE_URL` | Connection string/URI for the chosen database                            |
| `ENVIRONMENT`  | `DEV` or `PROD` — controls whether internal logs are printed (see [Logging](#logging)) |

### Development

```bash
npm run compile-dev   # tsc --watch, in one terminal
npm run dev            # pm2-dev dist/server.js, in another terminal
```

### Production build

```bash
npm run build   # compiles src/ -> dist/
npm start       # runs dist/server.js
```

### Linting

```bash
npm run lint       # check
npm run lint:fix    # auto-fix what it can
```

## Project structure

```
src/
├── server.ts                     # app entry point, middleware wiring
├── config/
│   ├── database/
│   │   ├── connect.db.ts         # picks a DB driver based on DATABASE_TYPE
│   │   ├── postgres/              # Drizzle + pg
│   │   ├── mysql/                 # Drizzle + mysql2
│   │   ├── sqlite/                # Drizzle + better-sqlite3
│   │   └── mongodb/                # Mongoose
│   └── routes/
│       └── main.v1.routes.ts     # /v1 router (empty — add your routes here)
├── middlewares/
│   └── ratelimit.middleware.ts   # configurable express-rate-limit factory
└── utils/
    ├── error.handler.ts          # Show() — conditional console logger
    └── response.handler.ts       # ApiResponse — standardized JSON envelope
```

### Picking a database

This template ships all four database adapters so you can try before committing. **For a real project, delete the three folders under `src/config/database/` that you won't use** (and their corresponding dependencies in `package.json`) to keep install size and surface area down. Each SQL adapter has a placeholder `users` schema (see `schema/schema.ts` in each folder) marked `// Dummy Schema Delete if needed!` — replace it with your actual tables.

### Logging

`Show()` in `src/utils/error.handler.ts` only prints when `ENVIRONMENT !== "PROD"`, unless a call explicitly passes `ignore_env: true`. This keeps production logs quiet by default; pass `ignore_env: true` for anything you always want logged (startup/shutdown, fatal errors) regardless of environment.

### Responses

Use `ApiResponse` (`src/utils/response.handler.ts`) instead of calling `res.json()` directly, so every endpoint returns a consistent shape:

```ts
import ApiResponse from "./utils/response.handler.js";

app.get("/users", (req, res) => {
  const r = new ApiResponse(res);
  r.success(users, "Users fetched successfully");
  // or: r.error("Not found", 404);
  // or: r.successPagination(users, { page, limit, totalItems });
});
```

## Known gaps / roadmap

This is a starter template, not a finished backend. Things worth adding before shipping a real project on top of it:

- [ ] Validation middleware using `zod`
- [ ] Auth middleware/routes using `jsonwebtoken` + `bcrypt`
- [ ] A global Express error-handling middleware + async-handler wrapper
- [ ] Fail-fast behavior on database connection failure (currently logs and continues)
- [ ] Tests (none configured yet)
- [ ] CI (GitHub Actions or similar) running `lint` + `build` on PRs
- [ ] `CORS` origin driven by an env var instead of hardcoded `localhost:3000`

## License

ISC