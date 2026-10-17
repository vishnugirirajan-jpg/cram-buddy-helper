# Cram Buddy Helper

Build a simple mobile-friendly web app called "SemPlan" for college students who have 4 exams per semester: Cycle Test 1, Cycle Test 2, Mid-Sem, End-Sem.

Page 1: The student adds their subjects (name, credits 1-4, difficulty: easy/medium/hard) and picks the date of their next exam.

Page 2: Show for each subject the total study hours needed (use a simple formula: credits x difficulty weight, where easy=2, medium=3, hard=4 hours per credit), divide it evenly across the days left, and show a "today's target" in hours.

Include an hour counter with Start / Stop buttons that adds time studied to today's total and shows progress toward today's target.

Keep the design clean and simple, dark theme, big buttons. Explain in plain English what you built after each step.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cram-buddy-helper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/73ae3dd7-1999-4d1c-8f86-a902b2d077e2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
