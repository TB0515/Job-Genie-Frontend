# Job Genie — Frontend

Job Genie — a tool that helps you build a shortlist of companies you'd actually want to work at, and surfaces open roles at each of them in one place.
Pick an industry, company size and city. Claude suggests matching UK companies, and Job Genie pulls roles they've posted in the last 7 days from TheirStack.

## Live Demo

https://job-genie-5fqk.onrender.com
(The backend runs on Render's free tier, so the first request can take 30–60 seconds while it wakes up.)

## How it works

The frontend is built with React, Vite and TypeScript. It sends requests to an Express API, which uses Supabase for authentication and data storage. Claude suggests companies, and TheirStack provides job listings.

Backend repo: https://github.com/TB0515/Job-Genie-Backend

- Login uses email/password or Google Sign-in. The backend sets an HTTP-only cookie for the session.
- Generated companies are saved to the user's wishlist in Postgres.

## Getting started

### Prerequisites

- Node.js v26+
- The [Job Genie backend](https://github.com/TB0515/Job-Genie-Backend) running locally

### Setup

```bash
git clone https://github.com/TB0515/Job-Genie-Frontend.git
cd Job-Genie-Frontend
npm install
npm run dev
```

App runs at `http://localhost:5173` by default.

### Tests

The frontend tests use Vitest and React Testing Library. They cover wishlist generation, failure handling and retry.
GitHub Actions runs formatting, tests, type checks and a production build on pull requests and pushes to main.
I also test the full flow manually, locally and on the live site: sign up, email confirmation, login and refresh, wishlist generation, job roles, and Google sign-in.

```bash
npm test
```

## My contribution

This started as a four-person team project at Founders and Coders. I built:

- **Authentication:** email/password and Google sign-in, session handling, and connected Supabase auth users to the app's user table
- **Job roles:** the TheirStack integration, role keyword search, job counts for each company, and the roles modal
- **Deployment:** environment-based API config, the Render setup.

I returned to the project to prepare it for sharing. I fixed build and test failures, added continuous integration, updated the dependencies, and moved the frontend from the Vite dev server to a static site. I also fixed bugs with the production logo, card buttons, sign-in messages and job counts.

## Next phase

### Features and Fixes

- **Job alerts:** a scheduled job checks each user's wishlist companies for new roles and sends an email or SMS alert. This is why signup asks for an optional phone number.
- Save removals to the database (the backend already has `DELETE /api/wishlist`) and load the saved wishlist on login
- Pass each company’s ID with its job search. This would let the frontend match job results by ID.
