(function () {
  'use strict';

  const STORAGE_KEY = 'pathfinder-mvp-v1';
  const DEFAULT_STATE = { profile: null, knownTopics: [], saved: [] };
  let state = loadState();
  let onboardingChoices = emptyChoices();
  let hasInitializedFilters = false;

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const topicById = (id) => window.TOPICS.find((topic) => topic.id === id);
  const opportunityById = (id) => window.OPPORTUNITIES.find((opportunity) => opportunity.id === id);

  function emptyChoices() {
    return { grade: '', usStudy: '', interests: [], collegePlans: '', helpDiscovering: [] };
  }

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (parsed?.profile && ['Less than 6 months', '6–12 months'].includes(parsed.profile.usStudy)) {
        parsed.profile.usStudy = 'Less than 1 year';
      }
      return parsed ? { ...DEFAULT_STATE, ...parsed } : { ...DEFAULT_STATE };
    } catch (error) {
      return { ...DEFAULT_STATE };
    }
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function currentProfile() {
    return state.profile || { grade: '10', usStudy: '', interests: ['Not sure yet'], collegePlans: 'Maybe', helpDiscovering: [] };
  }

  function isDemoProfile() {
    return state.profile && state.profile.isDemo;
  }

  function navigate(route) {
    const validRoutes = ['home', 'onboarding', 'dashboard', 'opportunities', 'roadmap'];
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
    if (selectedRoute === 'roadmap') renderRoadmap();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function gradeNumber() {
    return Number(currentProfile().grade) || 10;
  }

  function profileInterests() {
    return currentProfile().interests.filter((interest) => interest !== 'Not sure yet');
  }

  function isNewcomerProfile() {
    return ['Less than 1 year', '1–2 years'].includes(currentProfile().usStudy);
  }

  function topicMatchesDiscoveryHelp(topic) {
    const help = currentProfile().helpDiscovering;
    const mapping = {
      'School system': ['School system', 'Support', 'Academics'],
      'College preparation': ['College prep'],
      Competitions: ['Opportunity'],
      Internships: ['Career exploration', 'Opportunity'],
      Extracurriculars: ['Community', 'Skill-building', 'Opportunity'],
      'Financial aid': ['College prep'],
      'Career opportunities': ['Career exploration', 'Skill-building']
    };
    return help.some((choice) => (mapping[choice] || []).includes(topic.category));
  }

  function topicScore(topic) {
    const profile = currentProfile();
    const grade = gradeNumber();
    const priorities = window.RECOMMENDATION_RULES.gradePriorities[grade] || [];
    const priorityIndex = priorities.indexOf(topic.id);
    const interestRuleMatch = profile.interests.some((interest) => (window.RECOMMENDATION_RULES.interestTopics[interest] || []).includes(topic.id));
    let score = priorityIndex === -1 ? 5 : 150 - priorityIndex * 11;
    if (topic.interests.some((interest) => profile.interests.includes(interest))) score += 58;
    if (interestRuleMatch) score += 32;
    if (topicMatchesDiscoveryHelp(topic)) score += 28;
    if (isNewcomerProfile() && ['School system', 'Support'].includes(topic.category)) score += 34;
    if (profile.collegePlans === 'Yes' && topic.category === 'College prep') score += 18;
    if (profile.collegePlans !== 'Yes' && ['Skill-building', 'Community', 'Career exploration'].includes(topic.category)) score += 10;
    if (topic.grades.includes(grade)) score += 12;
    if (state.knownTopics.includes(topic.id)) score -= 80;
    return score;
  }

  function topicRecommendationReason(topic) {
    if (!state.profile) return 'Suggested as a useful high-school concept to explore.';
    const profile = currentProfile();
    const interest = profileInterests().find((item) => topic.interests.includes(item));
    if (interest) return `Recommended because you’re a Grade ${profile.grade} student interested in ${interest}.`;
    if (isNewcomerProfile() && ['School system', 'Support'].includes(topic.category)) {
      return `Recommended because you’re in Grade ${profile.grade} and still getting familiar with the U.S. school system.`;
    }
    if (profile.collegePlans === 'Yes' && topic.category === 'College prep') {
      return `Recommended because you’re in Grade ${profile.grade} and considering college.`;
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
    if (profile.collegePlans === 'Yes' && ['Research', 'Internship', 'Project', 'Program'].includes(opportunity.type)) score += 8;
    if (isSaved('opportunity', opportunity.id)) score += 4;
    return score;
  }

  function rankedOpportunities() {
    return [...window.OPPORTUNITIES].sort((a, b) => opportunityScore(b) - opportunityScore(a) || a.name.localeCompare(b.name));
  }

  function opportunityRecommendationReason(opportunity) {
    if (!state.profile) return 'Suggested as an example of what may be available to high-school students.';
    const profile = currentProfile();
    const interestMatch = profileInterests().includes(opportunity.area);
    const gradeMatch = opportunity.grades.includes(Number(profile.grade));
    if (interestMatch && gradeMatch) return `Recommended because you’re a Grade ${profile.grade} student interested in ${opportunity.area}.`;
    if (interestMatch) return `Ranked higher because you selected ${opportunity.area} as an interest.`;
    if (gradeMatch) return `Recommended because this example includes Grade ${profile.grade} students.`;
    return 'A nearby field to explore if you want to try something new.';
  }

  function renderDashboard() {
    const profile = currentProfile();
    const grade = gradeNumber();
    const topics = recommendedTopics();
    const now = topics.slice(0, 3);
    const unused = topics.filter((topic) => !now.includes(topic));
    // Always lead the hidden-opportunity section with an unfamiliar school-system
    // concept, then add interest-led discoveries. This keeps the product's core
    // promise visible even for students with a very specific interest.
    const hiddenSystem = unused.filter((topic) => topic.lane === 'unknown' && ['School system', 'Support', 'Academics'].includes(topic.category));
    const interestDiscoveries = unused.filter((topic) => !hiddenSystem.includes(topic) && (topic.lane === 'unknown' || topic.interests.some((interest) => profile.interests.includes(interest))));
    const unknown = [...hiddenSystem, ...interestDiscoveries].slice(0, 3);
    const afterUnknown = unused.filter((topic) => !unknown.includes(topic));
    const soon = afterUnknown.filter((topic) => ['soon', 'future'].includes(topic.lane)).slice(0, 3);

    $('#profile-grade').textContent = `Grade ${profile.grade}`;
    $('#profile-interests').textContent = profile.interests.filter((item) => item !== 'Not sure yet').slice(0, 2).join(' · ') || 'Exploring your interests';
    $('.title-name').textContent = isDemoProfile() ? ', Maya' : '';
    $('#dashboard-subtitle').textContent = window.RECOMMENDATION_RULES.gradeMessages[grade];
    $('#insight-banner').innerHTML = `<span aria-hidden="true">✦</span><div><strong>${isDemoProfile() ? 'Upcoming timing alert:' : 'Your path is taking shape.'}</strong> ${grade === 10 ? 'Course planning and many summer programs can have early deadlines—start exploring before winter and spring application windows.' : 'Save anything that feels relevant; you can turn it into a small, manageable next step later.'}</div>`;
    const featuredOpportunity = rankedOpportunities().find((opportunity) => opportunity.grades.includes(grade)) || rankedOpportunities()[0];
    $('#dashboard-opportunity-match').innerHTML = featuredOpportunity ? `<span class="quick-opportunity-icon" style="--accent:${areaColor(featuredOpportunity.area)}" aria-hidden="true">${featuredOpportunity.icon}</span><div><span class="micro-label">YOUR OPPORTUNITY MATCH · SAMPLE</span><h2>${escapeHtml(featuredOpportunity.name)}</h2><p>${escapeHtml(opportunityRecommendationReason(featuredOpportunity))}</p></div><button class="button button-secondary button-small" type="button" data-action="detail-opportunity" data-id="${featuredOpportunity.id}">Explore match →</button>` : '';
    $('#now-topics').innerHTML = now.map(topicCard).join('');
    $('#unknown-topics').innerHTML = (unknown.length ? unknown : topics.slice(3, 6)).map(topicCard).join('');
    $('#soon-topics').innerHTML = (soon.length ? soon : topics.slice(6, 9)).map(topicCard).join('');
  }

  function topicCard(topic) {
    const known = state.knownTopics.includes(topic.id);
    const saved = isSaved('topic', topic.id);
    return `<article class="topic-card ${known ? 'known' : ''}">
      <div class="topic-card-top"><span class="topic-icon ${topic.color}" aria-hidden="true">${topic.icon}</span><span class="topic-meta">${escapeHtml(topic.category)}</span></div>
      <h3>${escapeHtml(topic.title)}</h3>
      <p>${escapeHtml(topic.description)}</p>
      <span class="timing-badge">${escapeHtml(topic.timing)}</span>
      <p class="recommendation-note"><span aria-hidden="true">✦</span> ${escapeHtml(topicRecommendationReason(topic))}</p>
      <div class="topic-why"><strong>Why it matters:</strong> ${escapeHtml(topic.why)}</div>
      <div class="topic-footer"><button class="mini-button" type="button" data-action="known" data-id="${topic.id}">${known ? 'Mark as new' : 'I know this'}</button><button class="mini-button" type="button" data-action="detail-topic" data-id="${topic.id}">Learn more</button><button class="save-button ${saved ? 'saved' : ''}" type="button" data-action="save-topic" data-id="${topic.id}">${saved ? 'Saved ✓' : 'Save +'}</button></div>
    </article>`;
  }

  function renderOnboarding() {
    onboardingChoices = state.profile ? {
      grade: String(state.profile.grade || ''), usStudy: state.profile.usStudy || '', interests: state.profile.interests || [], collegePlans: state.profile.collegePlans || '', helpDiscovering: state.profile.helpDiscovering || []
    } : emptyChoices();
    syncChoiceButtons();
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

  function selectChoice(button) {
    const group = button.closest('[data-name]');
    const name = group.dataset.name;
    const value = button.dataset.value;
    if (group.dataset.multiple === 'true') {
      const active = new Set(onboardingChoices[name]);
      if (active.has(value)) active.delete(value); else active.add(value);
      if (name === 'interests' && value === 'Not sure yet' && active.has(value)) {
        onboardingChoices[name] = ['Not sure yet'];
      } else {
        active.delete('Not sure yet');
        onboardingChoices[name] = [...active];
      }
    } else {
      onboardingChoices[name] = value;
    }
    syncChoiceButtons();
  }

  function submitOnboarding(event) {
    event.preventDefault();
    const missing = ['grade', 'usStudy', 'collegePlans'].filter((key) => !onboardingChoices[key]);
    if (missing.length || !onboardingChoices.interests.length) {
      const intro = $('.form-intro');
      const note = $('#form-validation') || document.createElement('p');
      note.id = 'form-validation';
      note.className = 'validation-message';
      note.textContent = 'Choose your grade, time in the U.S., an interest, and your college plans to continue.';
      intro.append(note);
      return;
    }
    $('#form-validation')?.remove();
    state.profile = { ...onboardingChoices, isDemo: false };
    persist();
    navigate('dashboard');
  }

  function startDemo() {
    state = {
      profile: { grade: '10', usStudy: 'Less than 1 year', interests: ['Computer Science'], collegePlans: 'Yes', helpDiscovering: ['School system', 'Competitions', 'College preparation'], isDemo: true },
      knownTopics: [],
      saved: [{ id: 'opportunity-hack-club', sourceId: 'hack-club', kind: 'opportunity', title: 'Explore Hack Club', category: 'Club · Computer Science', timing: 'Start a club any time', status: 'planned', savedAt: new Date().toISOString(), note: 'A saved Computer Science opportunity from your demo path.' }]
    };
    persist();
    navigate('dashboard');
  }

  function isSaved(kind, sourceId) {
    return state.saved.some((item) => item.kind === kind && item.sourceId === sourceId);
  }

  function saveItem(kind, sourceId) {
    if (isSaved(kind, sourceId)) return;
    const source = kind === 'topic' ? topicById(sourceId) : opportunityById(sourceId);
    if (!source) return;
    state.saved.push({
      id: `${kind}-${sourceId}`,
      sourceId,
      kind,
      title: kind === 'topic' ? source.title : source.name,
      category: kind === 'topic' ? source.category : `${source.type} · ${source.area}`,
      timing: kind === 'topic' ? source.timing : source.timing,
      status: 'planned',
      savedAt: new Date().toISOString(),
      note: kind === 'topic' ? source.description : source.description
    });
    persist();
    renderDashboard();
    if (location.hash === '#opportunities') renderOpportunities();
    if (location.hash === '#roadmap') renderRoadmap();
  }

  function toggleKnown(id) {
    if (state.knownTopics.includes(id)) {
      state.knownTopics = state.knownTopics.filter((topicId) => topicId !== id);
    } else {
      state.knownTopics.push(id);
    }
    persist();
    renderDashboard();
  }

  function showTopicDetail(id) {
    const topic = topicById(id);
    if (!topic) return;
    const saved = isSaved('topic', id);
    $('#modal-content').innerHTML = `<span class="topic-icon ${topic.color}" aria-hidden="true">${topic.icon}</span><p class="eyebrow">${escapeHtml(topic.category)}</p><h2>${escapeHtml(topic.title)}</h2><p class="modal-summary">${escapeHtml(topic.description)}</p><div class="detail-grid"><div><strong>What it is</strong><p>${escapeHtml(topic.what)}</p></div><div><strong>Why it matters</strong><p>${escapeHtml(topic.why)}</p></div><div><strong>Who it’s for</strong><p>${escapeHtml(topic.who)}</p></div><div><strong>When to think about it</strong><p>${escapeHtml(topic.when)}</p></div></div><div class="detail-next"><strong>A practical next step</strong><br />${escapeHtml(topic.next)}</div><div class="modal-actions"><button class="button button-primary detail-save" type="button" data-action="save-topic" data-id="${topic.id}">${saved ? 'Saved to roadmap ✓' : 'Save to roadmap +'}</button><button class="button button-secondary modal-close" type="button">Keep discovering</button></div>`;
    $('#detail-modal').showModal();
  }

  function showOpportunityDetail(id) {
    const opportunity = opportunityById(id);
    if (!opportunity) return;
    const saved = isSaved('opportunity', id);
    const sourceAction = opportunity.url
      ? `<a class="button button-secondary" href="${escapeHtml(opportunity.url)}" target="_blank" rel="noopener noreferrer">Visit official resource ↗</a>`
      : '<span class="sample-only-note">Sample category — ask a counselor or search trusted local sources.</span>';
    $('#modal-content').innerHTML = `<span class="opp-icon" style="--accent:${areaColor(opportunity.area)}" aria-hidden="true">${opportunity.icon}</span><p class="eyebrow">SAMPLE · ${escapeHtml(opportunity.type)} · ${escapeHtml(opportunity.area)}</p><h2>${escapeHtml(opportunity.name)}</h2><p class="modal-summary">${escapeHtml(opportunity.description)}</p><p class="recommendation-note modal-recommendation"><span aria-hidden="true">✦</span> ${escapeHtml(opportunityRecommendationReason(opportunity))}</p><div class="detail-grid"><div><strong>Who can explore it</strong><p>Grades ${opportunity.grades.join('–')} · ${opportunity.beginner ? 'Beginner friendly' : 'Some experience may help'}</p></div><div><strong>Format & timing</strong><p>${escapeHtml(opportunity.format)} · ${escapeHtml(opportunity.timing)}</p></div></div><div class="detail-next"><strong>Why this may be useful</strong><br />${escapeHtml(opportunity.useful)}</div><div class="modal-actions"><button class="button button-primary detail-save" type="button" data-action="save-opportunity" data-id="${opportunity.id}">${saved ? 'Saved to roadmap ✓' : 'Save to roadmap +'}</button>${sourceAction}</div>`;
    $('#detail-modal').showModal();
  }

  function populateInterestFilter() {
    const select = $('#interest-filter');
    const areas = [...new Set(window.OPPORTUNITIES.map((opportunity) => opportunity.area))];
    select.innerHTML = `<option value="All">All interests</option>${areas.map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`).join('')}`;
  }

  function renderOpportunities() {
    if (!hasInitializedFilters) {
      populateInterestFilter();
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
      ? `Showing ${matching.length} sample ${matching.length === 1 ? 'match' : 'matches'} for your selected filters.`
      : state.profile
        ? `Showing all ${matching.length} sample opportunities, ranked for Grade ${currentProfile().grade} and your interests.`
        : `Showing all ${matching.length} sample opportunities. Use filters to narrow your path.`;
    $('#opportunity-list').innerHTML = matching.map(opportunityCard).join('');
    $('#opportunity-empty').hidden = matching.length > 0;
  }

  function areaColor(area) {
    return ({ 'Computer Science': '#4266dc', Engineering: '#5a4c9c', 'Biology / Medicine': '#509475', Business: '#d76c58', 'Art / Design': '#bd5d84' })[area] || '#4266dc';
  }

  function opportunityCard(opportunity) {
    const saved = isSaved('opportunity', opportunity.id);
    return `<article class="opportunity-card" style="--accent:${areaColor(opportunity.area)}"><div class="opp-top"><span class="opp-icon" aria-hidden="true">${opportunity.icon}</span><div><h3>${escapeHtml(opportunity.name)}</h3><span class="opp-type">${escapeHtml(opportunity.type)} · ${escapeHtml(opportunity.area)}</span></div>${opportunity.beginner ? '<span class="beginner-tag">BEGINNER OK</span>' : ''}</div><div class="opp-tags"><span>EXAMPLE LISTING</span><span>Grades ${opportunity.grades.join('–')}</span><span>${escapeHtml(opportunity.format)}</span></div><p>${escapeHtml(opportunity.description)}</p><p class="recommendation-note"><span aria-hidden="true">✦</span> ${escapeHtml(opportunityRecommendationReason(opportunity))}</p><div class="opp-useful"><strong>Why it may be useful:</strong> ${escapeHtml(opportunity.useful)}</div><div class="opp-bottom"><span class="opp-timing">${escapeHtml(opportunity.timing)}</span><span><button class="mini-button" type="button" data-action="detail-opportunity" data-id="${opportunity.id}">Details</button><button class="opp-save ${saved ? 'saved' : ''}" type="button" data-action="save-opportunity" data-id="${opportunity.id}">${saved ? 'Saved ✓' : 'Save +'}</button></span></div></article>`;
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
    return `<article class="roadmap-item"><span class="roadmap-status ${item.status === 'completed' ? 'completed' : ''}" aria-hidden="true">${item.status === 'completed' ? '✓' : '○'}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.category)} · ${escapeHtml(item.timing)}</p></div><div class="roadmap-meta"><select class="status-select" data-action="status" data-id="${item.id}" aria-label="Status for ${escapeHtml(item.title)}"><option value="planned" ${item.status === 'planned' ? 'selected' : ''}>Planned</option><option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>In progress</option><option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Completed</option></select><button class="remove-item" data-action="remove" data-id="${item.id}" type="button" aria-label="Remove ${escapeHtml(item.title)}">×</button></div></article>`;
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

  function removeItem(id) {
    state.saved = state.saved.filter((item) => item.id !== id);
    persist();
    renderRoadmap();
  }

  function exportSummary() {
    const completed = state.saved.filter((item) => item.status === 'completed');
    const planned = state.saved.filter((item) => item.status !== 'completed');
    const profile = currentProfile();
    const rows = (items, empty) => items.length ? items.map((item) => `<li><strong>${escapeHtml(item.title)}</strong><br><span>${escapeHtml(item.category)} · ${escapeHtml(item.timing)}</span><p>${escapeHtml(item.note || 'Roadmap activity')}</p></li>`).join('') : `<li>${empty}</li>`;
    const popup = window.open('', '_blank');
    if (!popup) return;
    popup.opener = null;
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>My Pathfinder Activity Summary</title><style>body{font-family:Arial,sans-serif;max-width:750px;margin:54px auto;color:#182b38;line-height:1.55;padding:0 24px}h1{font-size:36px;margin-bottom:4px}h2{font-size:20px;border-bottom:2px solid #4266dc;padding-bottom:7px;margin-top:38px}p,span{color:#52636b}li{margin:16px 0}footer{font-size:12px;margin-top:48px;color:#758087}@media print{body{margin:0}}</style></head><body><h1>My Activity Summary</h1><p>Pathfinder personal record · Grade ${escapeHtml(profile.grade)} · Generated ${new Date().toLocaleDateString()}</p><h2>Completed activities</h2><ul>${rows(completed, 'No completed activities yet.')}</ul><h2>Planned next steps</h2><ul>${rows(planned, 'No planned next steps yet.')}</ul><footer>This is a personal organization summary. Verify details and use your own voice in applications.</footer><script>window.onload=()=>window.print()<\/script></body></html>`);
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
    state = { ...DEFAULT_STATE };
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
    if (action === 'known') toggleKnown(id);
    if (action === 'save-topic') { saveItem('topic', id); }
    if (action === 'save-opportunity') { saveItem('opportunity', id); }
    if (action === 'detail-topic') showTopicDetail(id);
    if (action === 'detail-opportunity') showOpportunityDetail(id);
    if (action === 'remove') removeItem(id);
    if (target.classList.contains('demo-trigger')) startDemo();
    if (target.classList.contains('reset-trigger')) $('#reset-modal').showModal();
    if (target.classList.contains('export-trigger')) exportSummary();
    if (target.id === 'clear-filters') clearFilters();
    if (target.id === 'confirm-reset') resetData();
    if (target.classList.contains('modal-close')) target.closest('dialog')?.close();
  });

  document.addEventListener('change', (event) => {
    if (event.target.matches('.filters select, #beginner-filter')) renderOpportunities();
    if (event.target.matches('.status-select')) updateStatus(event.target.dataset.id, event.target.value);
  });

  $('#onboarding-form').addEventListener('submit', submitOnboarding);
  window.addEventListener('hashchange', () => renderRoute(location.hash.slice(1)));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') $$('.detail-modal[open], .confirm-modal[open]').forEach((dialog) => dialog.close());
  });

  if (!location.hash) location.hash = 'home';
  renderRoute(location.hash.slice(1));
}());
