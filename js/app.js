(function () {
  'use strict';

  const STORAGE_KEY = 'unseenpath-mvp-v2';
  const LEGACY_STORAGE_KEY = 'pathfinder-mvp-v1';
  const DEFAULT_STATE = { profile: null, knownTopics: [], discoveryResponses: {}, saved: [] };
  let state = loadState();
  let onboardingChoices = emptyChoices();
  let onboardingStep = 1;
  let hasInitializedFilters = false;
  let careerDisplayLimit = 12;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const topicById = (id) => window.TOPICS.find((topic) => topic.id === id);
  const opportunityById = (id) => window.OPPORTUNITIES.find((opportunity) => opportunity.id === id);
  const careerById = (id) => window.CAREERS.find((career) => career.id === id);
  const interestByName = (name) => window.INTEREST_AREAS.find((interest) => interest.name === name);
  const careerFamilyById = (id) => window.CAREER_FAMILIES.find((family) => family.id === id);
  const ONBOARDING_STEPS = {
    1: { phase: 'YOUR STARTING POINT', question: 'What grade are you in?', support: 'This helps us show what may be most useful right now.', aside: 'Let’s find your<br /><em>starting point.</em>', asideSupport: 'There is no perfect answer. Start with where you are today.', note: 'Starting point' },
    2: { phase: 'YOUR EXPERIENCE', question: 'How long have you studied in the U.S.?', support: 'Your experience helps us prioritize useful school-system guidance.', aside: 'Your experience shapes<br /><em>what may help now.</em>', asideSupport: 'We’ll highlight terms and resources that may still feel unfamiliar.', note: 'Your experience' },
    3: { phase: 'YOUR INTERESTS', question: 'What are you interested in?', support: 'Select all that apply. You can change these choices later.', aside: 'Your interests can open<br /><em>unseen paths.</em>', asideSupport: 'Choose what makes you curious—or ask us to help you explore.', note: 'Interests' },
    4: { phase: 'AFTER HIGH SCHOOL', question: 'What are you thinking about after high school?', support: 'There is more than one good path, and your answer can change.', aside: 'There is more than<br /><em>one good path.</em>', asideSupport: 'College, technical education, and work can all be thoughtful next steps.', note: 'Next-step plans' },
    5: { phase: 'WHAT YOU WANT TO FIND', question: 'What would you like help discovering?', support: 'Select every area where you would like more visibility.', aside: 'Tell us what you want<br /><em>help discovering.</em>', asideSupport: 'We’ll use these choices to make useful topics easier to find.', note: 'Discovery goals' },
    6: { phase: 'READY TO EXPLORE', question: 'Your path is ready.', support: 'We’ll use your answers to highlight things you may not know about yet.', aside: 'Your path<br /><em>starts here.</em>', asideSupport: 'Explore with curiosity. Nothing here locks you into one future.', note: 'Path ready' }
  };

  function emptyChoices() {
    return { grade: '', usStudy: '', interests: [], explorationSignals: [], collegePlans: '', helpDiscovering: [] };
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.profile && ['Less than 6 months', '6–12 months'].includes(parsed.profile.usStudy)) {
        parsed.profile.usStudy = 'Less than 1 year';
      }
      if (parsed?.profile) delete parsed.profile.studyState;
      if (parsed?.profile) {
        const interestMigrations = {
          'Computer Science': 'Computer Science & Technology',
          'Biology / Medicine': 'Biology & Health',
          Business: 'Business & Entrepreneurship',
          'Not sure yet': 'Undecided / Exploring'
        };
        parsed.profile.interests = (parsed.profile.interests || []).map((interest) => interestMigrations[interest] || interest);
        parsed.profile.explorationSignals = parsed.profile.explorationSignals || [];
        const planMigrations = {
          Yes: 'Four-year college',
          Maybe: 'Not sure yet',
          'Not sure': 'Not sure yet',
          'No / another path': 'Not sure yet'
        };
        parsed.profile.collegePlans = planMigrations[parsed.profile.collegePlans] || parsed.profile.collegePlans || 'Not sure yet';
      }
      if (!parsed) return { profile: null, knownTopics: [], discoveryResponses: {}, saved: [] };
      parsed.discoveryResponses = { ...(parsed.discoveryResponses || {}) };
      (parsed.knownTopics || []).forEach((id) => { if (!parsed.discoveryResponses[id]) parsed.discoveryResponses[id] = 'known'; });
      parsed.knownTopics = Object.keys(parsed.discoveryResponses).filter((id) => parsed.discoveryResponses[id] === 'known');
      parsed.saved = (parsed.saved || []).map((item) => ({ ...item, purpose: Object.prototype.hasOwnProperty.call(item, 'purpose') ? item.purpose : legacyPurpose(item) }));
      return { ...DEFAULT_STATE, ...parsed };
    } catch (error) {
      return { profile: null, knownTopics: [], discoveryResponses: {}, saved: [] };
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function legacyPurpose(item) {
    if (item.kind === 'opportunity') {
      const area = String(item.category || '').split(' · ')[1];
      return area ? `Explore your interest in ${area}` : 'Build experience in an area you’re curious about';
    }
    return `Understand why ${item.title} matters for your path`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function currentProfile() {
    return state.profile || { grade: '10', usStudy: '', interests: ['Undecided / Exploring'], explorationSignals: [], collegePlans: 'Not sure yet', helpDiscovering: [] };
  }

  function isDemoProfile() {
    return state.profile && state.profile.isDemo;
  }

  function navigate(route) {
    const validRoutes = ['home', 'onboarding', 'dashboard', 'opportunities', 'careers', 'roadmap'];
    const target = validRoutes.includes(route) ? route : 'home';
    if (location.hash.slice(1) !== target) {
      location.hash = target;
      return;
    }
    renderRoute(target);
  }

  function renderRoute(route) {
    const selectedRoute = route || location.hash.slice(1) || 'home';
    $$('.view').forEach((view) => view.classList.toggle('is-active', view.id === selectedRoute));
    document.body.classList.toggle('is-in-app', selectedRoute !== 'home' && selectedRoute !== 'onboarding');
    if (selectedRoute === 'onboarding') renderOnboarding();
    if (selectedRoute === 'dashboard') renderDashboard();
    if (selectedRoute === 'opportunities') renderOpportunities();
    if (selectedRoute === 'careers') renderCareers();
    if (selectedRoute === 'roadmap') renderRoadmap();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function gradeNumber() {
    return Number(currentProfile().grade) || 10;
  }

  function selectedInterests() {
    return currentProfile().interests.filter((interest) => interest !== 'Undecided / Exploring');
  }

  function suggestedInterests() {
    const counts = new Map();
    (currentProfile().explorationSignals || []).forEach((signal) => {
      (window.EXPLORATION_SIGNALS[signal] || []).forEach((interest, index) => {
        counts.set(interest, (counts.get(interest) || 0) + (3 - index));
      });
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([interest]) => interest).slice(0, 4);
  }

  function profileInterests() {
    const selected = selectedInterests();
    return selected.length ? selected : suggestedInterests();
  }

  function isExploringProfile() {
    return currentProfile().interests.includes('Undecided / Exploring');
  }

  function suggestionSignalForArea(area) {
    return (currentProfile().explorationSignals || []).find((signal) => (window.EXPLORATION_SIGNALS[signal] || []).includes(area));
  }

  function isNewcomerProfile() {
    return ['Less than 1 year', '1–2 years'].includes(currentProfile().usStudy);
  }

  function consideringCollegePath() {
    return ['Four-year college', 'Community college'].includes(currentProfile().collegePlans);
  }

  function topicMatchesDiscoveryHelp(topic) {
    const help = currentProfile().helpDiscovering;
    const mapping = {
      'School system': ['School system', 'Support', 'Academics'],
      'College preparation': ['College prep', 'Postsecondary options', 'Financial aid'],
      Competitions: ['Opportunity'],
      Internships: ['Career exploration', 'Opportunity'],
      Extracurriculars: ['Community', 'Skill-building', 'Opportunity'],
      'Financial aid': ['Financial aid'],
      'Career opportunities': ['Career exploration', 'Skill-building', 'Field discovery'],
      'Summer programs': ['Opportunity', 'Career exploration', 'Field discovery'],
      'Community opportunities': ['Community', 'Support', 'Unwritten knowledge']
    };
    return help.some((choice) => (mapping[choice] || []).includes(topic.category));
  }

  function topicScore(topic) {
    const profile = currentProfile();
    const grade = gradeNumber();
    const interests = profileInterests();
    const priorities = window.RECOMMENDATION_RULES.gradePriorities[grade] || [];
    const priorityIndex = priorities.indexOf(topic.id);
    const interestRuleMatch = interests.some((interest) => (window.RECOMMENDATION_RULES.interestTopics[interest] || []).includes(topic.id));
    let score = priorityIndex === -1 ? 5 : 150 - priorityIndex * 11;
    if (topic.interests.some((interest) => interests.includes(interest))) score += 88;
    if (interestRuleMatch) score += 32;
    if (topicMatchesDiscoveryHelp(topic)) score += 28;
    if (isNewcomerProfile() && ['School system', 'Support'].includes(topic.category)) score += 34;
    if (consideringCollegePath() && ['College prep', 'Postsecondary options', 'Financial aid'].includes(topic.category)) score += 18;
    if (!consideringCollegePath() && ['Skill-building', 'Community', 'Career exploration'].includes(topic.category)) score += 10;
    if (profile.collegePlans === 'Community college' && ['community-college', 'dual-enrollment', 'certificate-programs'].includes(topic.id)) score += 38;
    if (profile.collegePlans === 'Trade / technical program' && ['trade-school', 'certificate-programs', 'cte-pathways', 'apprenticeship-awareness'].includes(topic.id)) score += 48;
    if (profile.collegePlans === 'Work' && ['internships', 'job-shadowing', 'portfolio', 'projects'].includes(topic.id)) score += 38;
    if (topic.grades.includes(grade)) score += 12;
    if (state.discoveryResponses[topic.id] === 'known') score -= 80;
    if (state.discoveryResponses[topic.id] === 'new') score += 6;
    return score;
  }

  function topicRecommendationReason(topic) {
    if (!state.profile) return 'Suggested as a useful high-school concept to explore.';
    const profile = currentProfile();
    const interest = profileInterests().find((item) => topic.interests.includes(item));
    const signal = interest && suggestionSignalForArea(interest);
    if (signal && isExploringProfile()) return `You might enjoy exploring this because “${signal.toLowerCase()}” sounded interesting to you.`;
    if (interest) return `Recommended because you’re a Grade ${profile.grade} student interested in ${interest}.`;
    if (isNewcomerProfile() && ['School system', 'Support'].includes(topic.category)) {
      return `Recommended because you’re in Grade ${profile.grade} and still getting familiar with the U.S. school system.`;
    }
    if (consideringCollegePath() && ['College prep', 'Postsecondary options', 'Financial aid'].includes(topic.category)) {
      return `Recommended because you’re in Grade ${profile.grade} and exploring ${profile.collegePlans.toLowerCase()}.`;
    }
    return `Recommended for Grade ${profile.grade}: this supports ${window.RECOMMENDATION_RULES.gradeFocusLabels[profile.grade]}.`;
  }

  function recommendedTopics() {
    const grade = gradeNumber();
    return window.TOPICS
      .filter((topic) => topic.grades.includes(grade))
      .sort((a, b) => topicScore(b) - topicScore(a));
  }

  function opportunityScore(opportunity) {
    const profile = currentProfile();
    const grade = gradeNumber();
    const typePriorities = window.RECOMMENDATION_RULES.opportunityTypeBoosts[grade] || [];
    const typeIndex = typePriorities.indexOf(opportunity.type);
    const discoveryTypes = profile.helpDiscovering.flatMap((choice) => window.RECOMMENDATION_RULES.discoveryTypeMap[choice] || []);
    let score = opportunity.grades.includes(grade) ? 42 : 0;
    if (profileInterests().includes(opportunity.area)) score += 95;
    if (typeIndex !== -1) score += 38 - typeIndex * 5;
    if (discoveryTypes.includes(opportunity.type)) score += 34;
    if (isNewcomerProfile() && opportunity.beginner) score += 18;
    if (consideringCollegePath() && ['Research', 'Internship', 'Project', 'Program'].includes(opportunity.type)) score += 8;
    if (profile.collegePlans === 'Trade / technical program' && opportunity.area === 'Skilled Trades & Technical Careers') score += 45;
    if (profile.collegePlans === 'Work' && ['Internship', 'Job shadowing', 'Volunteering', 'Project'].includes(opportunity.type)) score += 20;
    if (isSaved('opportunity', opportunity.id)) score += 4;
    return score;
  }

  function rankedOpportunities() {
    return [...window.OPPORTUNITIES].sort((a, b) => opportunityScore(b) - opportunityScore(a) || a.name.localeCompare(b.name));
  }

  function opportunityRecommendationReason(opportunity) {
    if (!state.profile) return 'Suggested as one kind of opportunity high-school students can explore.';
    const profile = currentProfile();
    const interestMatch = profileInterests().includes(opportunity.area);
    const gradeMatch = opportunity.grades.includes(Number(profile.grade));
    const signal = suggestionSignalForArea(opportunity.area);
    if (interestMatch && signal && isExploringProfile()) return `You might enjoy exploring ${opportunity.area} because “${signal.toLowerCase()}” sounded interesting to you.`;
    if (interestMatch && gradeMatch) return `Recommended because you’re a Grade ${profile.grade} student interested in ${opportunity.area}.`;
    if (interestMatch) return `Ranked higher because you selected ${opportunity.area} as an interest.`;
    if (gradeMatch) return `Recommended because it is designed for students in Grade ${profile.grade}.`;
    return 'A nearby field to explore if you want to try something new.';
  }

  function careerScore(career) {
    const family = careerFamilyById(career.familyId);
    if (!family) return 0;
    const interests = profileInterests();
    let score = family.interests.reduce((total, interest) => total + (interests.includes(interest) ? 90 : 0), 0);
    if (isExploringProfile() && family.interests.some((interest) => suggestedInterests().includes(interest))) score += 25;
    if (currentProfile().helpDiscovering.includes('Career opportunities')) score += 14;
    if (state.saved.some((item) => item.kind === 'career' && item.sourceId === career.id)) score += 3;
    return score;
  }

  function rankedCareers() {
    return [...window.CAREERS].sort((a, b) => careerScore(b) - careerScore(a) || a.title.localeCompare(b.title));
  }

  function careerRecommendationReason(career) {
    const family = careerFamilyById(career.familyId);
    if (!state.profile || !family) return 'Suggested as one possible career to learn about—not a decision you need to make.';
    const interest = family.interests.find((item) => profileInterests().includes(item));
    const signal = interest && suggestionSignalForArea(interest);
    if (interest && signal && isExploringProfile()) return `You might enjoy exploring this because “${signal.toLowerCase()}” sounded interesting to you.`;
    if (interest) return `Recommended because it connects with your interest in ${interest}.`;
    return 'A different kind of work to explore if you want to widen your view.';
  }

  function renderDashboard() {
    const profile = currentProfile();
    const grade = gradeNumber();
    const interests = profileInterests();
    const topics = recommendedTopics();
    const interestLead = topics.find((topic) => topic.interests.some((interest) => interests.includes(interest)));
    const now = [...new Set([topics[0], topics[1], interestLead || topics[2]])].slice(0, 3);
    const unused = topics.filter((topic) => !now.includes(topic));
    // Always lead the hidden-opportunity section with an unfamiliar school-system
    // concept, then add interest-led discoveries. This keeps the product's core
    // promise visible even for students with a very specific interest.
    const hiddenSystem = unused.filter((topic) => topic.lane === 'unknown' && ['School system', 'Support', 'Academics'].includes(topic.category));
    const interestDiscoveries = unused.filter((topic) => topic.interests.some((interest) => interests.includes(interest)));
    const otherUnknown = unused.filter((topic) => topic.lane === 'unknown' && !hiddenSystem.includes(topic) && !interestDiscoveries.includes(topic));
    const unknown = [...new Set([hiddenSystem[0], ...interestDiscoveries.slice(0, 2), ...otherUnknown])].filter(Boolean).slice(0, 3);
    const afterUnknown = unused.filter((topic) => !unknown.includes(topic));
    const soon = afterUnknown.filter((topic) => ['soon', 'future'].includes(topic.lane)).slice(0, 3);

    $('#profile-grade').textContent = `Grade ${profile.grade}`;
    $('#profile-interests').textContent = selectedInterests().slice(0, 2).join(' · ') || 'Exploring your interests';
    $('.title-name').textContent = isDemoProfile() ? ', Maya' : '';
    $('#dashboard-subtitle').textContent = window.RECOMMENDATION_RULES.gradeMessages[grade];
    $('#insight-banner').innerHTML = `<span aria-hidden="true">✦</span><div><strong>${isDemoProfile() ? 'Upcoming timing alert:' : 'Your path is taking shape.'}</strong> ${grade === 10 ? 'Course planning and many summer programs can have early deadlines—start exploring before winter and spring application windows.' : 'Save anything that feels relevant; you can turn it into a small, manageable next step later.'}</div>`;
    const featuredOpportunity = rankedOpportunities().find((opportunity) => opportunity.grades.includes(grade)) || rankedOpportunities()[0];
    const featuredStatus = featuredOpportunity && opportunityIsVerified(featuredOpportunity) ? 'VERIFIED RESOURCE' : 'EXAMPLE';
    $('#dashboard-opportunity-match').innerHTML = featuredOpportunity ? `<span class="quick-opportunity-icon" style="--accent:${areaColor(featuredOpportunity.area)}" aria-hidden="true">${featuredOpportunity.icon}</span><div><span class="micro-label">YOUR OPPORTUNITY MATCH · ${featuredStatus}</span><h2>${escapeHtml(featuredOpportunity.name)}</h2><p>${escapeHtml(opportunityRecommendationReason(featuredOpportunity))}</p></div><button class="button button-secondary button-small" type="button" data-action="detail-opportunity" data-id="${featuredOpportunity.id}">Explore match →</button>` : '';
    const featuredCareer = rankedCareers()[0];
    const featuredCareerFamily = featuredCareer && careerFamilyById(featuredCareer.familyId);
    $('#dashboard-career-match').innerHTML = featuredCareer ? `<span class="quick-opportunity-icon" style="--accent:${areaColor(featuredCareerFamily.interests[0])}" aria-hidden="true">${featuredCareerFamily.icon}</span><div><span class="micro-label">CAREER TO EXPLORE · ${escapeHtml(featuredCareerFamily.name.toUpperCase())}</span><h2>${escapeHtml(featuredCareer.title)}</h2><p>${escapeHtml(careerRecommendationReason(featuredCareer))}</p></div><button class="button button-secondary button-small" type="button" data-action="detail-career" data-id="${featuredCareer.id}">View profile →</button>` : '';
    const explorationBanner = $('#exploration-banner');
    if (isExploringProfile()) {
      const suggestions = interests.length ? interests.slice(0, 3) : ['Art & Design', 'Biology & Health', 'Skilled Trades & Technical Careers'];
      explorationBanner.hidden = false;
      explorationBanner.innerHTML = `<span aria-hidden="true">?</span><div><strong>You might enjoy exploring…</strong><p>${suggestions.map(escapeHtml).join(' · ')}</p><small>These are starting points based on what sounded interesting—not career predictions.</small></div>`;
    } else {
      explorationBanner.hidden = true;
      explorationBanner.innerHTML = '';
    }
    $('#now-topics').innerHTML = now.map(topicCard).join('');
    $('#unknown-topics').innerHTML = (unknown.length ? unknown : topics.slice(3, 6)).map(topicCard).join('');
    $('#soon-topics').innerHTML = (soon.length ? soon : topics.slice(6, 9)).map(topicCard).join('');
    renderPathways();
  }

  function renderPathways() {
    const preferred = state.exploringInterest ? [state.exploringInterest, ...profileInterests()] : profileInterests();
    const names = [...new Set(preferred)].slice(0, 3);
    const fallback = isExploringProfile() ? ['Undecided / Exploring'] : ['Computer Science & Technology'];
    const pathways = (names.length ? names : fallback).map(interestByName).filter(Boolean);
    $('#pathway-list').innerHTML = pathways.map((interest) => `<article class="pathway-card" style="--accent:${interest.color}"><header><span aria-hidden="true">${interest.icon}</span><div><p>ONE POSSIBLE PATH</p><h3>${escapeHtml(interest.name)}</h3></div></header><div class="subfield-list" aria-label="Related subfields">${interest.subfields.slice(0, 7).map((subfield) => `<span>${escapeHtml(subfield)}</span>`).join('')}</div><ol>${interest.path.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol><p class="pathway-note">Try this if you’re curious. This is not an admission requirement.</p></article>`).join('');
  }

  function topicCard(topic) {
    const response = state.discoveryResponses[topic.id] || '';
    const known = response === 'known';
    const newlyDiscovered = response === 'new';
    const saved = isSaved('topic', topic.id);
    return `<article class="topic-card ${known ? 'known' : ''} ${newlyDiscovered ? 'newly-discovered' : ''}">
      <div class="topic-card-top"><span class="topic-icon ${topic.color}" aria-hidden="true">${topic.icon}</span><span class="topic-meta">${escapeHtml(topic.category)}</span></div>
      ${response ? `<span class="topic-feedback ${response}">${known ? 'Known' : 'New discovery'}</span>` : ''}
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.description)}</p>
      <span class="timing-badge">${escapeHtml(topic.timing)}</span>
      <p class="recommendation-note"><span aria-hidden="true">✦</span> ${escapeHtml(topicRecommendationReason(topic))}</p>
      <div class="topic-why"><strong>Why it matters:</strong> ${escapeHtml(topic.why)}</div>
      <div class="awareness-actions" aria-label="Your familiarity with ${escapeHtml(topic.title)}"><button class="awareness-button ${known ? 'is-selected' : ''}" type="button" data-action="topic-response" data-value="known" data-id="${topic.id}" aria-pressed="${known}">I know this</button><button class="awareness-button ${newlyDiscovered ? 'is-selected new' : ''}" type="button" data-action="topic-response" data-value="new" data-id="${topic.id}" aria-pressed="${newlyDiscovered}">I didn't know this</button></div><div class="topic-footer"><button class="mini-button" type="button" data-action="detail-topic" data-id="${topic.id}">Learn more</button><button class="save-button ${saved ? 'saved' : ''}" type="button" data-action="save-topic" data-id="${topic.id}">${saved ? 'Saved ✓' : 'Save +'}</button></div>
    </article>`;
  }

  function renderOnboarding() {
    const source = state.onboardingDraft || state.profile || emptyChoices();
    onboardingChoices = {
      grade: String(source.grade || ''),
      usStudy: source.usStudy || '',
      interests: [...(source.interests || [])],
      explorationSignals: [...(source.explorationSignals || [])],
      collegePlans: source.collegePlans || '',
      helpDiscovering: [...(source.helpDiscovering || [])]
    };
    onboardingStep = Math.min(6, Math.max(1, Number(state.onboardingStep) || 1));
    if (!state.onboardingDraft) persistOnboardingDraft();
    renderOnboardingStep(false);
  }

  function syncChoiceButtons() {
    $$('.choice-row, .choice-wrap').forEach((group) => {
      const name = group.dataset.name;
      const selected = onboardingChoices[name];
      $$('button', group).forEach((button) => {
        const selectedValue = Array.isArray(selected) ? selected.includes(button.dataset.value) : selected === button.dataset.value;
        button.classList.toggle('selected', selectedValue);
        button.setAttribute('aria-pressed', String(selectedValue));
      });
    });
  }

  function persistOnboardingDraft() {
    state.onboardingDraft = {
      grade: onboardingChoices.grade,
      usStudy: onboardingChoices.usStudy,
      interests: [...onboardingChoices.interests],
      explorationSignals: [...onboardingChoices.explorationSignals],
      collegePlans: onboardingChoices.collegePlans,
      helpDiscovering: [...onboardingChoices.helpDiscovering]
    };
    state.onboardingStep = onboardingStep;
    persist();
  }

  function onboardingStepIsValid(step = onboardingStep) {
    if (step === 1) return Boolean(onboardingChoices.grade);
    if (step === 2) return Boolean(onboardingChoices.usStudy);
    if (step === 3) return onboardingChoices.interests.length > 0;
    if (step === 4) return Boolean(onboardingChoices.collegePlans);
    if (step === 5) return onboardingChoices.helpDiscovering.length > 0;
    return true;
  }

  function renderOnboardingStep(moveFocus = true) {
    const copy = ONBOARDING_STEPS[onboardingStep];
    $$('[data-onboarding-step]').forEach((step) => { step.hidden = Number(step.dataset.onboardingStep) !== onboardingStep; });
    $('#onboarding-step-label').textContent = `STEP ${onboardingStep} OF 6`;
    $('#onboarding-progress').setAttribute('aria-valuenow', String(onboardingStep));
    $('#onboarding-progress span').style.width = `${(onboardingStep / 6) * 100}%`;
    $('#onboarding-phase').textContent = copy.phase;
    $('#onboarding-title').textContent = copy.question;
    $('#onboarding-support').textContent = copy.support;
    $('#onboarding-aside-title').innerHTML = copy.aside;
    $('#onboarding-aside-support').textContent = copy.asideSupport;
    $('#aside-progress-note').textContent = `${onboardingStep} of 6 · ${copy.note}`;
    $('#onboarding-navigation').hidden = onboardingStep === 6;
    $('#onboarding-next').disabled = !onboardingStepIsValid();
    syncChoiceButtons();
    if (moveFocus) $('#onboarding-title').focus({ preventScroll: true });
  }

  function goToOnboardingStep(step) {
    onboardingStep = Math.min(6, Math.max(1, step));
    persistOnboardingDraft();
    renderOnboardingStep();
  }

  function selectChoice(button) {
    const group = button.closest('[data-name]');
    const name = group.dataset.name;
    const value = button.dataset.value;
    if (group.dataset.multiple === 'true') {
      const active = new Set(onboardingChoices[name]);
      if (active.has(value)) active.delete(value); else active.add(value);
      if (name === 'interests' && value === 'Undecided / Exploring' && active.has(value)) {
        onboardingChoices[name] = ['Undecided / Exploring'];
        onboardingChoices.explorationSignals = [];
      } else {
        active.delete('Undecided / Exploring');
        onboardingChoices[name] = [...active];
      }
    } else {
      onboardingChoices[name] = value;
    }
    persistOnboardingDraft();
    renderOnboardingStep(false);
  }

  function submitOnboarding(event) {
    event.preventDefault();
    if (onboardingStep >= 6 || !onboardingStepIsValid()) return;
    if (onboardingStep < 5) {
      goToOnboardingStep(onboardingStep + 1);
      return;
    }
    completeOnboarding();
  }

  function completeOnboarding() {
    state.profile = { ...onboardingChoices, isDemo: false };
    delete state.exploringInterest;
    onboardingStep = 6;
    state.onboardingStep = 6;
    state.onboardingDraft = { ...onboardingChoices, interests: [...onboardingChoices.interests], explorationSignals: [...onboardingChoices.explorationSignals], helpDiscovering: [...onboardingChoices.helpDiscovering] };
    persist();
    renderOnboardingStep();
  }

  function exploreOnboarding() {
    delete state.onboardingDraft;
    delete state.onboardingStep;
    persist();
    navigate('dashboard');
  }

  function reviewOnboarding() {
    goToOnboardingStep(1);
  }

  function backOnboarding() {
    if (onboardingStep === 1) {
      persistOnboardingDraft();
      navigate('home');
      return;
    }
    goToOnboardingStep(onboardingStep - 1);
  }

  function startDemo() {
    state = {
      profile: { grade: '10', usStudy: 'Less than 1 year', interests: ['Computer Science & Technology'], explorationSignals: [], collegePlans: 'Four-year college', helpDiscovering: ['School system', 'Competitions', 'College preparation', 'Career opportunities'], isDemo: true },
      knownTopics: [],
      discoveryResponses: {},
      saved: [{ id: 'opportunity-hack-club', sourceId: 'hack-club', kind: 'opportunity', title: 'Hack Club', category: 'Club · Computer Science & Technology', timing: 'Start or join any time', status: 'planned', purpose: 'Explore your interest in Computer Science & Technology', savedAt: new Date().toISOString(), note: 'A saved technology opportunity from your demo path.' }]
    };
    persist();
    navigate('dashboard');
  }

  function isSaved(kind, sourceId) {
    return state.saved.some((item) => item.kind === kind && item.sourceId === sourceId);
  }

  function purposeForSource(kind, source) {
    if (kind === 'opportunity') {
      return profileInterests().includes(source.area)
        ? `Explore your interest in ${source.area}`
        : `Build experience in ${source.area}`;
    }
    if (kind === 'career') {
      const family = careerFamilyById(source.familyId);
      const matchingInterest = family?.interests.find((interest) => profileInterests().includes(interest));
      return matchingInterest ? `Explore how ${source.title} connects to ${matchingInterest}` : `Learn what working as a ${source.title} can involve`;
    }
    const matchingInterest = profileInterests().find((interest) => source.interests.includes(interest));
    if (matchingInterest) return `Connect ${source.title} to your interest in ${matchingInterest}`;
    if (source.category === 'College prep') return `Prepare early for your possible college path`;
    return `Understand how ${source.title} can support your path`;
  }

  function saveItem(kind, sourceId) {
    if (isSaved(kind, sourceId)) return;
    const source = kind === 'topic' ? topicById(sourceId) : kind === 'career' ? careerById(sourceId) : opportunityById(sourceId);
    if (!source) return;
    const careerFamily = kind === 'career' ? careerFamilyById(source.familyId) : null;
    state.saved.push({
      id: `${kind}-${sourceId}`,
      sourceId,
      kind,
      title: kind === 'topic' ? source.title : kind === 'career' ? `Explore ${source.title}` : source.name,
      category: kind === 'topic' ? source.category : kind === 'career' ? `Career exploration · ${careerFamily.name}` : `${source.type} · ${source.area}`,
      timing: kind === 'career' ? 'Explore this school year' : source.timing,
      status: 'planned',
      purpose: purposeForSource(kind, source),
      savedAt: new Date().toISOString(),
      note: kind === 'career' ? source.summary : source.description
    });
    persist();
    renderDashboard();
    if (location.hash === '#opportunities') renderOpportunities();
    if (location.hash === '#careers') renderCareers();
    if (location.hash === '#roadmap') renderRoadmap();
  }

  function setTopicResponse(id, response) {
    if (state.discoveryResponses[id] === response) delete state.discoveryResponses[id];
    else state.discoveryResponses[id] = response;
    state.knownTopics = Object.keys(state.discoveryResponses).filter((topicId) => state.discoveryResponses[topicId] === 'known');
    persist();
    renderDashboard();
  }

  function showTopicDetail(id) {
    const topic = topicById(id);
    if (!topic) return;
    const saved = isSaved('topic', id);
    $('#detail-modal').classList.remove('opportunity-detail');
    $('#detail-modal').classList.remove('career-detail');
    $('#modal-content').innerHTML = `<span class="topic-icon ${topic.color}" aria-hidden="true">${topic.icon}</span><p class="eyebrow">${escapeHtml(topic.category)}</p><h2 id="detail-title">${escapeHtml(topic.title)}</h2><p class="modal-summary">${escapeHtml(topic.description)}</p><div class="detail-grid"><div><strong>What it is</strong><p>${escapeHtml(topic.what)}</p></div><div><strong>Why it matters</strong><p>${escapeHtml(topic.why)}</p></div><div><strong>Who it’s for</strong><p>${escapeHtml(topic.who)}</p></div><div><strong>When to think about it</strong><p>${escapeHtml(topic.when)}</p></div></div><div class="detail-next"><strong>A practical next step</strong><br />${escapeHtml(topic.next)}</div><div class="modal-actions"><button class="button button-primary detail-save" type="button" data-action="save-topic" data-id="${topic.id}" ${saved ? 'disabled aria-disabled="true"' : ''}>${saved ? 'Saved to roadmap ✓' : 'Save to roadmap +'}</button></div>`;
    openDetailModal();
  }

  function showOpportunityDetail(id) {
    const opportunity = opportunityById(id);
    if (!opportunity) return;
    const saved = isSaved('opportunity', id);
    const verified = opportunityIsVerified(opportunity);
    const recommendation = opportunityRecommendationReason(opportunity).replace(/^Recommended because /, 'Because ');
    const benefits = opportunityBenefits(opportunity);
    const sourceAction = opportunity.url
      ? `<a class="button button-secondary" href="${escapeHtml(opportunity.url)}" target="_blank" rel="noopener noreferrer">Visit official resource ↗</a>`
      : '<span class="sample-only-note">Sample category — ask a counselor or search trusted local sources.</span>';
    $('#detail-modal').classList.add('opportunity-detail');
    $('#detail-modal').classList.remove('career-detail');
    $('#modal-content').innerHTML = `<article class="opportunity-profile" style="--accent:${areaColor(opportunity.area)}"><header class="opportunity-profile-header"><div class="opportunity-profile-kicker"><span class="opportunity-profile-icon" aria-hidden="true">${opportunity.icon}</span><span>${escapeHtml(opportunity.type)} · ${escapeHtml(opportunity.area)}</span><span class="resource-badge ${verified ? 'verified' : 'example'}">${verified ? 'Verified resource' : 'Example'}</span></div><h2 id="detail-title">${escapeHtml(opportunity.name)}</h2><p class="opportunity-profile-summary">${escapeHtml(opportunity.description)}</p><div class="profile-recommendation"><span aria-hidden="true">✦</span><div><strong>Recommended for you</strong><p>${escapeHtml(recommendation)}</p></div></div></header><dl class="opportunity-profile-meta"><div><dt>Eligibility</dt><dd>Grades ${opportunity.grades.join('–')}</dd><small>${opportunity.beginner ? 'Beginner friendly' : 'Some experience may help'}</small></div><div><dt>Format</dt><dd>${escapeHtml(opportunity.format)}</dd></div><div><dt>Timing</dt><dd>${escapeHtml(opportunity.timing)}</dd></div></dl><section class="why-explore"><span class="section-kicker">WHY EXPLORE THIS?</span><p>${escapeHtml(opportunity.useful)}</p><ul>${benefits.map((benefit) => `<li>${escapeHtml(benefit)}</li>`).join('')}</ul></section><footer class="opportunity-profile-actions"><button class="button button-primary detail-save" type="button" data-action="save-opportunity" data-id="${opportunity.id}" ${saved ? 'disabled aria-disabled="true"' : ''}>${saved ? 'Saved to roadmap ✓' : 'Save to roadmap'}</button>${sourceAction}</footer></article>`;
    openDetailModal();
  }

  function openDetailModal() {
    const modal = $('#detail-modal');
    if (!modal.open) modal.showModal();
  }

  function showCareerDetail(id) {
    const career = careerById(id);
    const family = career && careerFamilyById(career.familyId);
    if (!career || !family) return;
    const saved = isSaved('career', id);
    const relatedCareers = family.careers.filter((item) => item.id !== career.id).slice(0, 4);
    const relatedOpportunities = rankedOpportunities().filter((item) => family.interests.includes(item.area)).slice(0, 3);
    $('#detail-modal').classList.remove('opportunity-detail');
    $('#detail-modal').classList.add('career-detail');
    $('#modal-content').innerHTML = `<article class="career-profile" style="--accent:${areaColor(family.interests[0])}"><header class="career-profile-header"><div class="career-profile-kicker"><span aria-hidden="true">${family.icon}</span><span>${escapeHtml(family.name)} career family</span></div><h2 id="detail-title">${escapeHtml(career.title)}</h2><p>${escapeHtml(career.summary)}</p><div class="profile-recommendation"><span aria-hidden="true">✦</span><div><strong>Why this is here</strong><p>${escapeHtml(careerRecommendationReason(career))}</p></div></div></header><section class="career-profile-section"><span class="section-kicker">RELATED INTERESTS</span><div class="career-interest-tags">${family.interests.map((interest) => `<span>${escapeHtml(interest)}</span>`).join('')}</div></section><section class="career-profile-section"><span class="section-kicker">EXPLORE IN HIGH SCHOOL</span><ul class="career-explore-list">${family.explore.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section><section class="career-profile-section"><span class="section-kicker">POSSIBLE OPPORTUNITIES</span><div class="career-related-opportunities">${relatedOpportunities.map((item) => `<button type="button" data-action="detail-opportunity" data-id="${item.id}"><span>${item.icon}</span><b>${escapeHtml(item.name)}</b><small>${escapeHtml(item.type)} · ${opportunityIsVerified(item) ? 'Verified resource' : 'Example'}</small></button>`).join('')}</div></section><section class="career-profile-section"><span class="section-kicker">RELATED CAREERS</span><p class="related-career-links">${relatedCareers.map((item) => `<button type="button" data-action="detail-career" data-id="${item.id}">${escapeHtml(item.title)}</button>`).join('')}</p></section><footer class="opportunity-profile-actions"><button class="button button-secondary" type="button" data-action="explore-career-path" data-id="${career.id}">Explore this path</button><button class="button button-primary detail-save" type="button" data-action="save-career" data-id="${career.id}" ${saved ? 'disabled aria-disabled="true"' : ''}>${saved ? 'Saved to roadmap ✓' : 'Save to roadmap'}</button></footer><p class="career-caution">This profile is a starting point, not a guaranteed outcome or complete training checklist.</p></article>`;
    openDetailModal();
  }

  function exploreCareerPath(id) {
    const career = careerById(id);
    const family = career && careerFamilyById(career.familyId);
    if (!family) return;
    const selectedMatch = family.interests.find((interest) => interestByName(interest));
    state.exploringInterest = selectedMatch || family.interests[0];
    persist();
    $('#detail-modal').close();
    navigate('dashboard');
    window.setTimeout(() => $('#interest-pathways')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function opportunityIsVerified(opportunity) {
    return Boolean(opportunity.url);
  }

  function opportunityBenefits(opportunity) {
    const benefits = [`Explore ${opportunity.area} through a concrete experience`];
    if (['Hackathon', 'Project', 'Competition', 'Robotics'].includes(opportunity.type)) benefits.push('Build or practice something you can explain and reflect on');
    if (['Club', 'Hackathon', 'Robotics'].includes(opportunity.type)) benefits.push('Practice collaboration with other students');
    if (opportunity.type === 'Research') benefits.push('Practice asking questions and communicating findings');
    if (opportunity.type === 'Internship') benefits.push('Observe real roles and strengthen workplace skills');
    if (opportunity.type === 'Program') benefits.push('Learn new skills in a guided setting');
    return benefits.slice(0, 3);
  }

  function populateOpportunityFilters() {
    const areasWithOpportunities = new Set(window.OPPORTUNITIES.map((opportunity) => opportunity.area));
    const areas = window.INTEREST_AREAS.map((interest) => interest.name).filter((area) => areasWithOpportunities.has(area));
    const types = [...new Set(window.OPPORTUNITIES.map((opportunity) => opportunity.type))].sort();
    $('#interest-filter').innerHTML = `<option value="All">All interests</option>${areas.map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`).join('')}`;
    $('#type-filter').innerHTML = `<option value="All">All types</option>${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join('')}`;
  }

  function renderOpportunities() {
    if (!hasInitializedFilters) {
      populateOpportunityFilters();
      $('#interest-filter').value = 'All';
      $('#grade-filter').value = 'All';
      $('#format-filter').value = 'All';
      $('#type-filter').value = 'All';
      $('#beginner-filter').checked = false;
      hasInitializedFilters = true;
    }
    const interest = $('#interest-filter').value;
    const grade = $('#grade-filter').value;
    const format = $('#format-filter').value;
    const type = $('#type-filter').value;
    const beginner = $('#beginner-filter').checked;
    const filtersActive = interest !== 'All' || grade !== 'All' || format !== 'All' || type !== 'All' || beginner;
    const matching = rankedOpportunities().filter((opportunity) => (
      (interest === 'All' || opportunity.area === interest) &&
      (grade === 'All' || opportunity.grades.includes(Number(grade))) &&
      (format === 'All' || opportunity.format === format) &&
      (type === 'All' || opportunity.type === type) &&
      (!beginner || opportunity.beginner)
    ));
    $('#opportunity-count').textContent = matching.length;
    $('#opportunity-count-label').innerHTML = filtersActive ? 'matching<br />opportunities' : 'opportunities<br />to explore';
    $('#opportunities-context').textContent = filtersActive
      ? `Showing ${matching.length} ${matching.length === 1 ? 'match' : 'matches'} for your selected filters.`
      : state.profile
        ? `Showing all ${matching.length} resources and examples, ranked for Grade ${currentProfile().grade} and your interests.`
        : `Showing all ${matching.length} resources and examples. Use filters to narrow your path.`;
    $('#opportunity-list').innerHTML = matching.map(opportunityCard).join('');
    $('#opportunity-empty').hidden = matching.length > 0;
  }

  function areaColor(area) {
    return interestByName(area)?.color || '#4266dc';
  }

  function opportunityCard(opportunity) {
    const saved = isSaved('opportunity', opportunity.id);
    const verified = opportunityIsVerified(opportunity);
    return `<article class="opportunity-card" style="--accent:${areaColor(opportunity.area)}"><div class="opp-top"><span class="opp-icon" aria-hidden="true">${opportunity.icon}</span><div><h3>${escapeHtml(opportunity.name)}</h3><span class="opp-type">${escapeHtml(opportunity.type)} · ${escapeHtml(opportunity.area)}</span></div>${opportunity.beginner ? '<span class="beginner-tag">BEGINNER OK</span>' : ''}</div><div class="opp-tags"><span class="resource-badge ${verified ? 'verified' : 'example'}">${verified ? 'Verified resource' : 'Example'}</span><span>Grades ${opportunity.grades.join('–')}</span><span>${escapeHtml(opportunity.format)}</span></div><p>${escapeHtml(opportunity.description)}</p><p class="recommendation-note"><span aria-hidden="true">✦</span> ${escapeHtml(opportunityRecommendationReason(opportunity))}</p><div class="opp-useful"><strong>Why it may be useful:</strong> ${escapeHtml(opportunity.useful)}</div><div class="opp-bottom"><span class="opp-timing">${escapeHtml(opportunity.timing)}</span><span><button class="mini-button" type="button" data-action="detail-opportunity" data-id="${opportunity.id}">Details</button><button class="opp-save ${saved ? 'saved' : ''}" type="button" data-action="save-opportunity" data-id="${opportunity.id}">${saved ? 'Saved ✓' : 'Save +'}</button></span></div></article>`;
  }

  function populateCareerFilter() {
    $('#career-family-filter').innerHTML = `<option value="All">All career families</option>${window.CAREER_FAMILIES.map((family) => `<option value="${family.id}">${escapeHtml(family.name)}</option>`).join('')}`;
  }

  function renderCareers() {
    if ($('#career-family-filter').options.length <= 1) populateCareerFilter();
    const query = $('#career-search').value.trim().toLowerCase();
    const familyId = $('#career-family-filter').value;
    const matches = rankedCareers().filter((career) => {
      const family = careerFamilyById(career.familyId);
      const haystack = `${career.title} ${career.summary} ${family.name} ${family.interests.join(' ')}`.toLowerCase();
      return (familyId === 'All' || career.familyId === familyId) && (!query || haystack.includes(query));
    });
    const visible = matches.slice(0, careerDisplayLimit);
    $('#career-count').textContent = matches.length;
    $('#career-context').textContent = state.profile && familyId === 'All' && !query
      ? `Career profiles are ranked for your interests. Showing ${visible.length} of ${matches.length}; search or choose a family to explore further.`
      : `Showing ${visible.length} of ${matches.length} matching career profiles.`;
    $('#career-list').innerHTML = visible.map(careerCard).join('');
    $('#career-empty').hidden = matches.length > 0;
    $('#show-more-careers').hidden = visible.length >= matches.length;
    $('.career-more-wrap').hidden = matches.length === 0 || visible.length >= matches.length;
  }

  function careerCard(career) {
    const family = careerFamilyById(career.familyId);
    const saved = isSaved('career', career.id);
    return `<article class="career-card" style="--accent:${areaColor(family.interests[0])}"><header><span class="career-icon" aria-hidden="true">${family.icon}</span><span>${escapeHtml(family.name)}</span></header><h2>${escapeHtml(career.title)}</h2><p>${escapeHtml(career.summary)}</p><div class="career-card-tags">${family.interests.slice(0, 2).map((interest) => `<span>${escapeHtml(interest)}</span>`).join('')}</div><p class="recommendation-note"><span aria-hidden="true">✦</span> ${escapeHtml(careerRecommendationReason(career))}</p><footer><button class="mini-button" type="button" data-action="detail-career" data-id="${career.id}">Career profile</button><button class="save-button ${saved ? 'saved' : ''}" type="button" data-action="save-career" data-id="${career.id}">${saved ? 'Saved ✓' : 'Save +'}</button></footer></article>`;
  }

  function clearCareerFilters() {
    $('#career-search').value = '';
    $('#career-family-filter').value = 'All';
    careerDisplayLimit = 12;
    renderCareers();
  }

  function roadmapBucket(item) {
    const words = `${item.timing} ${item.title}`.toLowerCase();
    if (/(today|this month|this semester|now|start small|meet)/.test(words)) return 'Now';
    if (/(spring|fall deadline|winter deadline|next year|course selection|summer)/.test(words)) return 'Next 3 Months';
    if (/(school year|this year|year-round|semester)/.test(words)) return 'This School Year';
    return 'Later';
  }

  function renderRoadmap() {
    const saved = state.saved;
    const complete = saved.filter((item) => item.status === 'completed');
    const percent = saved.length ? Math.round((complete.length / saved.length) * 100) : 0;
    $('#saved-count').textContent = saved.length;
    $('#completed-count').textContent = complete.length;
    $('#progress-percent').textContent = `${percent}%`;
    $('#progress-ring').style.setProperty('--progress', percent);
    $('#progress-message').textContent = saved.length ? (complete.length ? 'You are building a record of the things you have tried.' : 'Choose one small planned step to begin.') : 'Every saved step is a little more clarity.';
    $('#roadmap-empty').hidden = saved.length > 0;
    const order = ['Now', 'Next 3 Months', 'This School Year', 'Later'];
    $('#timeline').innerHTML = saved.length ? order.map((label) => {
      const items = saved.filter((item) => roadmapBucket(item) === label);
      if (!items.length) return '';
      return `<section class="roadmap-group"><div class="roadmap-group-label"><span class="section-kicker">${label === 'Now' ? 'START HERE' : 'LOOK AHEAD'}</span><h2>${label}</h2></div><div class="roadmap-items">${items.map(roadmapItem).join('')}</div></section>`;
    }).join('') : '';
    $('#journey-list').innerHTML = complete.length ? complete.map(journeyEntry).join('') : '<p class="journey-blank">Completed steps will become a growing activity history here.</p>';
  }

  function roadmapItem(item) {
    return `<article class="roadmap-item"><span class="roadmap-status ${item.status === 'completed' ? 'completed' : ''}" aria-hidden="true">${item.status === 'completed' ? '✓' : '○'}</span><div class="roadmap-copy"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.category)} · ${escapeHtml(item.timing)}</p><label class="purpose-field"><span>Why I'm doing this</span><input type="text" data-action="purpose" data-id="${item.id}" value="${escapeHtml(item.purpose || '')}" placeholder="Add a personal goal" aria-label="Why I'm doing ${escapeHtml(item.title)}" /></label></div><div class="roadmap-meta"><select class="status-select" data-action="status" data-id="${item.id}" aria-label="Status for ${escapeHtml(item.title)}"><option value="planned" ${item.status === 'planned' ? 'selected' : ''}>Planned</option><option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In progress</option><option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option></select><button class="remove-item" data-action="remove" data-id="${item.id}" type="button" aria-label="Remove ${escapeHtml(item.title)}">×</button></div></article>`;
  }

  function journeyEntry(item) {
    const completed = item.completedAt ? new Date(item.completedAt) : new Date();
    return `<article class="journey-entry"><span>COMPLETED · ${completed.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }).toUpperCase()}</span><h3>${escapeHtml(item.title)}</h3><p><strong>Role:</strong> Self-directed student<br />${escapeHtml(item.note || 'Completed a roadmap step and added it to my personal activity history.')}</p></article>`;
  }

  function updateStatus(id, status) {
    const item = state.saved.find((savedItem) => savedItem.id === id);
    if (!item) return;
    item.status = status;
    if (status === 'completed' && !item.completedAt) item.completedAt = new Date().toISOString();
    if (status !== 'completed') delete item.completedAt;
    persist();
    renderRoadmap();
  }

  function updatePurpose(id, purpose) {
    const item = state.saved.find((savedItem) => savedItem.id === id);
    if (!item) return;
    item.purpose = purpose.trim();
    persist();
  }

  function removeItem(id) {
    state.saved = state.saved.filter((item) => item.id !== id);
    persist();
    renderRoadmap();
  }

  function exportSummary() {
    const completed = state.saved.filter((item) => item.status === 'completed');
    const planned = state.saved.filter((item) => item.status !== 'completed');
    const profile = currentProfile();
    const rows = (items, empty) => items.length ? items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.category)} · ${escapeHtml(item.timing)}</span>${item.purpose ? `<p><b>Goal:</b> ${escapeHtml(item.purpose)}</p>` : ''}<p>${escapeHtml(item.note || 'Roadmap activity')}</p></li>`).join('') : `<li>${empty}</li>`;
    const popup = window.open('', '_blank');
    if (!popup) return;
    popup.opener = null;
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>My UnseenPath Activity Summary</title><style>body{font-family:Arial,sans-serif;max-width:750px;margin:54px auto;color:#182b38;line-height:1.55;padding:0 24px}h1{font-size:36px;margin-bottom:4px}h2{font-size:20px;border-bottom:2px solid #4266dc;padding-bottom:7px;margin-top:38px}p,span{color:#52636b}li{margin:16px 0}footer{font-size:12px;margin-top:48px;color:#758087}@media print{body{margin:0}}</style></head><body><h1>My Activity Summary</h1><p>UnseenPath personal record · Grade ${escapeHtml(profile.grade)} · Generated ${new Date().toLocaleDateString()}</p><h2>Completed activities</h2><ul>${rows(completed, 'No completed activities yet.')}</ul><h2>Planned next steps</h2><ul>${rows(planned, 'No planned next steps yet.')}</ul><footer>This is a personal organization summary. Verify details and use your own voice in applications.</footer><script>window.onload=()=>window.print()<\/script></body></html>`);
    popup.document.close();
  }

  function clearFilters() {
    $('#interest-filter').value = 'All';
    $('#grade-filter').value = 'All';
    $('#format-filter').value = 'All';
    $('#type-filter').value = 'All';
    $('#beginner-filter').checked = false;
    renderOpportunities();
  }

  function resetData() {
    state = { profile: null, knownTopics: [], discoveryResponses: {}, saved: [] };
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    persist();
    hasInitializedFilters = false;
    $('#reset-modal').close();
    navigate('home');
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, [data-route]');
    if (!target) return;
    if (target.closest('[data-name]')) { selectChoice(target); return; }
    if (target.dataset.route) { navigate(target.dataset.route); return; }
    const action = target.dataset.action;
    const id = target.dataset.id;
    if (action === 'topic-response') setTopicResponse(id, target.dataset.value);
    if (action === 'save-topic') {
      saveItem('topic', id);
      if (target.closest('#detail-modal')) {
        target.textContent = 'Saved to roadmap ✓';
        target.classList.add('saved');
        target.disabled = true;
        target.setAttribute('aria-disabled', 'true');
      }
    }
    if (action === 'save-opportunity') {
      saveItem('opportunity', id);
      if (target.closest('#detail-modal')) {
        target.textContent = 'Saved to roadmap ✓';
        target.classList.add('saved');
        target.disabled = true;
        target.setAttribute('aria-disabled', 'true');
      }
    }
    if (action === 'save-career') {
      saveItem('career', id);
      if (target.closest('#detail-modal')) {
        target.textContent = 'Saved to roadmap ✓';
        target.classList.add('saved');
        target.disabled = true;
        target.setAttribute('aria-disabled', 'true');
      }
    }
    if (action === 'detail-topic') showTopicDetail(id);
    if (action === 'detail-opportunity') showOpportunityDetail(id);
    if (action === 'detail-career') showCareerDetail(id);
    if (action === 'explore-career-path') exploreCareerPath(id);
    if (action === 'explore-onboarding') exploreOnboarding();
    if (action === 'review-onboarding') reviewOnboarding();
    if (action === 'remove') removeItem(id);
    if (target.classList.contains('demo-trigger')) startDemo();
    if (target.classList.contains('reset-trigger')) $('#reset-modal').showModal();
    if (target.classList.contains('export-trigger')) exportSummary();
    if (target.id === 'clear-filters') clearFilters();
    if (target.id === 'clear-career-filters' || target.id === 'clear-career-empty') clearCareerFilters();
    if (target.id === 'show-more-careers') { careerDisplayLimit += 12; renderCareers(); }
    if (target.id === 'onboarding-back') backOnboarding();
    if (target.id === 'confirm-reset') resetData();
    if (target.classList.contains('modal-close')) target.closest('dialog')?.close();
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('.filters select, #beginner-filter')) renderOpportunities();
    if (event.target.matches('#career-family-filter')) { careerDisplayLimit = 12; renderCareers(); }
    if (event.target.matches('.status-select')) updateStatus(event.target.dataset.id, event.target.value);
  });

  document.addEventListener('input', (event) => {
    if (event.target.matches('[data-action="purpose"]')) updatePurpose(event.target.dataset.id, event.target.value);
    if (event.target.matches('#career-search')) { careerDisplayLimit = 12; renderCareers(); }
  });

  $('#onboarding-form').addEventListener('submit', submitOnboarding);
  window.addEventListener('hashchange', () => renderRoute(location.hash.slice(1)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') $$('.detail-modal[open], .confirm-modal[open]').forEach((dialog) => dialog.close());
  });

  if (!location.hash) location.hash = 'home';
  renderRoute(location.hash.slice(1));
}());
