# Pathfinder

> **Discover what you didn't know to ask.**

Pathfinder is a discovery-first roadmap for newcomer high-school students in the United States. It is a polished hackathon MVP built as a fully local, no-login web app.

## Problem

Search engines and AI assistants are powerful when students know what to ask. Newcomer students may not know which school systems, requirements, opportunities, or preparation steps even exist—so they cannot easily search for them. A missed conversation or invisible deadline can make a new school system feel much harder to navigate.

## Target users

Newcomer high-school students in the U.S., especially students who are still learning their school system and the opportunities available around them.

## Solution

Pathfinder changes the model from **Question → Answer** to:

**Unknown → Discovery → Awareness → Action**

Instead of behaving like a generic chatbot, it proactively surfaces concepts and opportunities a student may not know to look for, explains why they matter, and turns useful discoveries into a personal roadmap.

## Key features

- A clear landing page that communicates the “unknown unknowns” problem immediately.
- Fast onboarding for grade, time in the U.S., interests, college plans, and discovery needs.
- Rule-based personal discovery feed organized into “Important for you now,” “You may not know this exists,” and “Coming soon.”
- Meaningful ranking based on grade, time in the U.S., academic interests, college plans, and the kinds of help a student selected.
- Plain-language recommendation reasons on discovery and opportunity cards—no AI API required.
- Detail views explaining what each school concept is, why it matters, who it is for, timing, and one practical next step.
- Opportunity explorer with 25 static examples across Computer Science, Engineering, Biology / Medicine, Business, and Art / Design.
- Examples cover hackathons, competitions, research, programs, robotics, internships, clubs, and projects.
- The default opportunity view always shows the full catalog, with personal matches ranked first; filters narrow results only when a student chooses them.
- Clear sample-listing labels separate discovery examples from real-time verified openings.
- Filters for interest, grade, format, type, and beginner friendliness.
- A timeline-based roadmap with planned, in-progress, and completed states.
- “My Journey” activity history and a printable activity-summary export.
- Local persistence for profile choices, known concepts, saved items, and completion status.
- One-click demo mode for judges: a grade-10 Computer Science newcomer path with an unknown school concept, a relevant opportunity match, an upcoming timing alert, and a pre-saved roadmap item.
- Reset control for repeatable demos.

## How it works

1. A student completes the short onboarding flow, or a judge selects **Try Demo**.
2. Simple client-side rules prioritize relevant discovery topics based on grade and interests.
3. The student reads details, marks concepts as known, and saves useful topics or opportunities.
4. Saved ideas become timeline items the student can plan, begin, complete, and later export as an activity summary.

## Judge demo (under 30 seconds)

1. Open the landing page and select **Try Demo**.
2. The demo loads Maya: Grade 10, less than one year in the U.S., interested in Computer Science, and considering college.
3. Point out the school concept, hidden discovery, timing alert, and personalized opportunity match on the dashboard.
4. Open **Opportunities** to show all 25 examples ranked for Maya. Try a filter and save one item.
5. Open **My Roadmap**, change an item from **Planned** to **In progress**, then **Completed** to show it appear in **My Journey**.
6. Select **Export Activity Summary** to open the clean printable summary.
7. Use **Reset** to return the app to a clean state for the next judge.

## Technologies used

- HTML5
- CSS3 (responsive layout, animation, accessibility-focused focus states)
- Vanilla JavaScript
- Static JavaScript data modules (JSON-style data)
- `localStorage`

There is no backend, login system, paid API, framework, or build step.

## Project structure

```text
.
├── index.html             # Application shells and accessible view markup
├── assets/
│   └── styles.css          # Responsive visual system
├── data/
│   ├── topics.js           # Discovery-topic data
│   ├── opportunities.js    # Opportunity data
│   └── rules.js            # Personalization rules
└── js/
    └── app.js              # Routing, rendering, interactions, localStorage
```

## Why it is different

Most tools wait for a student to formulate a question. Pathfinder starts one step earlier: it makes important possibilities visible before a student knows their name. The main experience is deliberately **Discovery → Awareness → Planning → Action**, not a blank chatbot prompt.

## Future improvements

- AI explanations in the student's native language
- Automatically updated opportunities
- Counselor and school-specific resources
- Deadline notifications
- More academic fields
- Verified regional education information
- Multilingual interface
- Personalized AI guidance
- Account synchronization

## Run locally

The project works by opening `index.html` directly in a modern browser. For the most consistent browser behavior, start a simple static server from this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### GitHub Pages

The app uses relative asset paths and hash-based client navigation, so it works from a repository subpath without a build step.

1. Push the project files to the root of a GitHub repository.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select the branch and the root (`/`) folder.
4. Open the Pages URL after deployment completes.

No environment variables, server rewrites, API keys, or backend are required.

## Important note

Educational requirements and opportunities can vary by school, district, state, and student circumstances. Students should confirm important requirements with their school counselor or official sources. Opportunity records in this MVP are examples for discovery, not real-time verified openings.
