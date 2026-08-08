window.RECOMMENDATION_RULES = {
  gradePriorities: {
    9: ['gpa', 'credits', 'graduation-requirements', 'counselor', 'clubs', 'electives', 'projects', 'career-not-final'],
    10: ['gpa', 'ap', 'honors', 'electives', 'summer-programs', 'competitions', 'projects', 'early-deadlines'],
    11: ['sat', 'college', 'recommendations', 'essays', 'internships', 'research', 'cost-attendance', 'portfolio'],
    12: ['applications', 'recommendations', 'fafsa', 'fee-waivers', 'scholarships', 'net-price', 'credits', 'transcript']
  },
  interestTopics: {
    'Computer Science & Technology': ['coding-projects', 'cybersecurity', 'projects', 'competitions'],
    Engineering: ['engineering-design', 'robotics', 'projects', 'competitions'],
    'Biology & Health': ['health-careers', 'biomedical-research', 'research', 'volunteering'],
    'Physical Sciences': ['lab-investigation', 'astronomy', 'research', 'competitions'],
    'Mathematics & Statistics': ['data-literacy', 'applied-math', 'competitions', 'projects'],
    'Business & Entrepreneurship': ['entrepreneurship', 'business-analytics', 'projects', 'clubs'],
    'Art & Design': ['creative-portfolio', 'design-critique', 'projects', 'competitions'],
    Humanities: ['writing-publication', 'history-project', 'clubs', 'projects'],
    'Social Sciences': ['psychology-exploration', 'community-research', 'research', 'volunteering'],
    'Law, Government & Public Service': ['mock-trial', 'civic-engagement', 'clubs', 'community-value'],
    'Media & Communication': ['student-journalism', 'media-project', 'projects', 'writing-publication'],
    'Environment & Sustainability': ['citizen-science', 'sustainability-project', 'research', 'volunteering'],
    Education: ['tutoring-mentoring', 'lesson-design', 'tutoring', 'volunteering'],
    'Skilled Trades & Technical Careers': ['cte-pathways', 'apprenticeship-awareness', 'trade-school', 'certificate-programs'],
    'Undecided / Exploring': ['career-not-final', 'multiple-interests', 'electives', 'job-shadowing']
  },
  gradeMessages: {
    9: 'Grade 9 is a powerful time to learn how your school works and try several directions.',
    10: 'Grade 10 is a great moment to deepen interests while keeping room to explore.',
    11: 'Grade 11 brings more choices—steady planning now can ease your next steps.',
    12: 'Grade 12 has important decisions. Let’s make the next steps clear and manageable.'
  },
  gradeFocusLabels: {
    9: 'school basics, clubs, and early exploration',
    10: 'course planning, deeper activities, and summer options',
    11: 'postsecondary research, testing, work exploration, and portfolio growth',
    12: 'applications, financial planning, deadlines, and activity organization'
  },
  opportunityTypeBoosts: {
    9: ['Club', 'Project', 'Program', 'Volunteering', 'Competition'],
    10: ['Competition', 'Program', 'Project', 'Club', 'Volunteering'],
    11: ['Research', 'Internship', 'Competition', 'Project', 'Program'],
    12: ['Internship', 'Research', 'Project', 'Program', 'Volunteering']
  },
  discoveryTypeMap: {
    Competitions: ['Competition', 'Hackathon', 'Robotics', 'Debate'],
    Internships: ['Internship', 'Research', 'Job shadowing'],
    Extracurriculars: ['Club', 'Robotics', 'Project', 'Volunteering', 'Publication', 'Exhibition'],
    'Career opportunities': ['Internship', 'Program', 'Research', 'Job shadowing'],
    'College preparation': ['Research', 'Program', 'Project'],
    'Financial aid': ['Program']
  }
};
