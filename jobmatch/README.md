# JobMatch

A job-search web app where applicants explore quality jobs and filter them by their preferences — role, location, remote/hybrid/onsite, salary range, industry, and experience level — then see a tailored shortlist.

## Live site
https://a5d943566795a0e3f371a008f4c69de2.ctonew.app

## Stack
- TanStack Start (React + Vite + Tailwind)
- TypeScript
- Served on port 3000

## What's included (MVP)
- A curated dataset of 40 realistic job listings across a wide spread of titles, companies, locations, industries, salary bands, work modes, and experience levels (`src/data/jobs.ts`)
- Preference filters that combine with **AND**: keyword search, location, work mode (remote/hybrid/onsite), salary range, industry, and experience level
- A clear, scannable results list with counts and an empty state
- Per-job detail view with description, responsibilities, and requirements
- Polished, responsive design for desktop and mobile

## Run it
```bash
bun install
bun run dev        # local dev
bun run publish    # build + serve on port 3000
```

## Code layout
```
src/
  data/jobs.ts        # curated job dataset
  routes/index.tsx    # the job-search page
  routes/__root.tsx   # HTML shell / layout
```
