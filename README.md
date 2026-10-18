# SemPlan (repo: cram-buddy-helper)

A study planner for college students whose semester has Cycle Test 1, Cycle Test 2, Mid-Sem and End-Sem.

**Live app:** https://cram-buddy-helper.lovable.app

## What it does
- Add subjects with credits, difficulty and type (problem-solving, memorising or mixed).
- Enter how many hours you think you need, or tap "Suggest for me". A warning appears if you enter much less than suggested.
- Pick your next exam and date to get a daily study target.
- Run a separate stopwatch for each subject.
- Add subtopics with time estimates and tick them off to earn points.
- Free study mode and weekly goals, both earning points.
- Free plan: 1 exam plan, 3 subjects. Pro (Rs 49 per semester): more subjects and multiple exam plans.

## Who it's for
College students, starting with first-years at NIT Trichy, whose exams follow the cycle test, mid-sem and end-sem pattern.

## How it earns
Free tier to try the planner, then Rs 49 per semester for Pro. The price is a guess and has not been validated. I asked 24 students whether they would pay, and 18 said they would consider it. This is interest, not sales.

## Tech stack
Built with Lovable (React and TypeScript), hosted on Lovable. Data is stored in the browser.

## How I used AI
I have no coding background. I used Lovable's AI builder to create the app by describing features and testing each change, and I used Claude to plan the product and write prompts.

## Render Workflows
Not used.

## How to run it
Open the live link. To run locally, install Node.js, then run `npm i` and `npm run dev`.

## Known limitations
- No accounts. Data lives in one browser, so clearing it or changing phones loses everything.
- The hour suggestion is a simple formula, not proven to improve grades.
- Study time can be faked, so points can be gamed.
- Payment is a demo checkout in test mode. No real money is taken and Pro is not verified by a server.
- Points cannot be redeemed yet. Themes, badges and discounts are planned but not built.
- It's a website, not a native app.
- Tested with few users and only one college's exam pattern.
