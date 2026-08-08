# UnseenPath

> **Discover what you didn't know to ask.**

**Live demo:** [https://linannyu.github.io/UnseenPath/](https://linannyu.github.io/UnseenPath/)

UnseenPath is a discovery-first roadmap for newcomer high school students in the United States. Its core idea is simple: **You can't search for something you don't know exists.**

## Inspiration

Search engines and AI assistants work well when a student already knows what to ask. Newcomer students often face a harder problem: they may not know the names of important school concepts, opportunities, preparation steps, or deadlines. An invisible option cannot become a search query.

UnseenPath was inspired by these “unknown unknowns.” It begins before the question, helping students discover what may matter and turn that awareness into manageable action.

## The Problem

Newcomer students may not know that important opportunities, resources, requirements, and pathways exist. Credits, counselors, course planning, competitions, summer programs, portfolios, and financial-aid preparation can all involve unfamiliar language or timing.

Missing one conversation or deadline can make a new school system much harder to navigate. General guidance also varies by school, district, state, and individual circumstances, so students need both an accessible starting point and a clear reminder to confirm important details with official sources or a counselor.

## What It Does

UnseenPath turns the student journey into:

**Discovery → Awareness → Planning → Action**

- A short onboarding flow collects grade, time studying in the U.S., academic interests, college plans, and discovery interests.
- A rule-based Discovery feed prioritizes useful concepts for the student's grade and interests.
- “I know this” and “I didn't know this” feedback lets students track familiarity and change their response later.
- An Opportunities explorer presents 25 verified resources and clearly labeled examples across five interest areas.
- Spacious Opportunity Details explain eligibility, format, timing, value, and why an item was recommended.
- Saved topics and opportunities become roadmap steps with planned, in-progress, and completed states.
- Each roadmap item includes an editable “Why I'm doing this” goal.
- Completed steps appear in My Journey and can be exported as a printable activity summary.
- A one-click Demo Mode gives hackathon judges a complete Grade 10 Computer Science newcomer profile.

All personalization is deterministic and rule-based. The MVP does not use an AI API, authentication, a backend, or a database.

## How We Built It

The project is a static single-page web app with hash-based navigation. Content lives in JavaScript data files, while a client-side recommendation engine scores concepts and opportunities using grade, newcomer status, interests, college plans, and selected discovery needs.

Application state is stored in `localStorage`, including the student profile, discovery feedback, saved roadmap items, personal goals, and completion history. The interface uses accessible native controls and dialogs, responsive CSS, relative asset paths, and no build step.

Opportunity records are intentionally separated into:

- **Verified resource:** links to a real official organization, but availability and dates are not checked in real time.
- **Example:** an illustrative opportunity category, not an actual opening.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Static JavaScript data modules
- `localStorage`
- Native `<dialog>` elements
- GitHub Pages

## Challenges

- Designing for students who do not yet know the vocabulary needed to search for help.
- Making personalization useful without a backend or AI API.
- Keeping sample opportunity categories visually distinct from verified official resources.
- Preserving a clear recommendation hierarchy while keeping the interface calm and readable.
- Making the full Discovery → Roadmap story understandable to judges in under 30 seconds.
- Maintaining reliable state across reloads, filters, modal interactions, and activity-status changes.

## Accomplishments

- Built a complete no-login student journey from discovery through activity history.
- Created 25 opportunity records across Computer Science, Engineering, Biology / Medicine, Business, and Art / Design.
- Added rule-based, plain-language explanations for personalized recommendations.
- Built a focused Demo Mode with personalized concepts, an opportunity match, timing guidance, and a pre-saved roadmap step.
- Implemented persistent familiarity feedback, editable roadmap goals, and a printable activity summary.
- Delivered a responsive, accessible experience that works from a GitHub Pages repository subpath.

## What We Learned

- Personalization can feel meaningful when a small set of transparent rules is tied closely to a user's context.
- Explaining why something was recommended builds more trust than ranking alone.
- For newcomer students, revealing vocabulary and possibilities can be as important as answering questions.
- A strong demo should show the whole product loop immediately, not require judges to construct a profile first.
- Clear labels and disclaimers are essential when static examples and real resources appear together.

## What's Next

- Multilingual explanations
- State-specific guidance
- District- and school-specific resources
- Automatically updated verified opportunities
- Deadline notifications
- Optional AI-powered explanations
- Counselor partnerships

## Judge Demo

The complete flow takes under 30 seconds:

1. Open the [live demo](https://linannyu.github.io/UnseenPath/).
2. Select **Try Demo**.
3. Point out the personalized Discovery feed, unfamiliar concept, and upcoming timing guidance.
4. Open **Opportunities** and show the recommendation reason on a relevant card.
5. Open **Details**, then save the opportunity to the roadmap.
6. Open **My Roadmap** and change an item from **Planned** to **In progress**, then **Completed**.
7. Show the completed item in **My Journey** and select **Export Activity Summary**.
8. Use **Reset** to return the browser to a clean state.

## Run Locally

The app can be opened directly from `index.html`. For the most consistent behavior, run a static server from the project directory:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Project Structure

```text
.
├── index.html
├── assets/
│   └── styles.css
├── data/
│   ├── topics.js
│   ├── opportunities.js
│   └── rules.js
└── js/
    └── app.js
```

## Deployment

The app uses relative asset paths and hash-based navigation, so it works at the existing repository URL without renaming paths or adding server rewrites:

[https://linannyu.github.io/UnseenPath/](https://linannyu.github.io/UnseenPath/)

## Important Note

Educational requirements and opportunities can vary by school, district, state, and student circumstances. Students should confirm important requirements with their school counselor or official sources. “Verified resource” listings link to real official organizations but are not checked in real time; “Example” listings are illustrative categories rather than actual openings. No opportunity guarantees college admission.
