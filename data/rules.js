window.RECOMMENDATION_RULES = {
  gradePriorities: {
    9: ['gpa', 'credits', 'counselor', 'clubs', 'projects', 'competitions', 'portfolio'],
    10: ['ap', 'clubs', 'summer-programs', 'competitions', 'projects', 'college-fairs', 'gpa'],
    11: ['sat', 'college-fairs', 'recommendations', 'internships', 'portfolio', 'research', 'summer-programs', 'common-app'],
    12: ['applications', 'recommendations', 'fafsa', 'portfolio', 'common-app', 'credits', 'counselor']
  },
  interestTopics: {
    'Computer Science': ['hackathons', 'projects', 'competitions', 'research'],
    'Engineering': ['hackathons', 'science-fair', 'competitions', 'research'],
    'Biology / Medicine': ['science-fair', 'research', 'competitions', 'volunteering'],
    'Business': ['projects', 'competitions', 'clubs'],
    'Art / Design': ['hackathons', 'projects', 'competitions', 'portfolio'],
    'Humanities': ['clubs', 'portfolio', 'college-fairs']
  },
  gradeMessages: {
    9: 'Grade 9 is a powerful time to learn how your school works and try a few things.',
    10: 'Grade 10 is a great moment to go deeper on interests and look one year ahead.',
    11: 'Grade 11 brings more choices—steady planning now can ease your next steps.',
    12: 'Grade 12 has important decisions. Let’s make the next steps clear and manageable.'
  },
  gradeFocusLabels: {
    9: 'school basics, clubs, and early exploration',
    10: 'course planning, deeper activities, and summer options',
    11: 'college research, testing, internships, and portfolio growth',
    12: 'applications, financial aid, deadlines, and activity organization'
  },
  opportunityTypeBoosts: {
    9: ['Club', 'Project', 'Program', 'Robotics', 'Hackathon'],
    10: ['Competition', 'Program', 'Hackathon', 'Robotics', 'Project'],
    11: ['Internship', 'Research', 'Competition', 'Project', 'Program'],
    12: ['Internship', 'Research', 'Project', 'Program', 'Competition']
  },
  discoveryTypeMap: {
    Competitions: ['Competition', 'Hackathon', 'Robotics'],
    Internships: ['Internship', 'Research'],
    Extracurriculars: ['Club', 'Robotics', 'Project'],
    'Career opportunities': ['Internship', 'Program', 'Research'],
    'College preparation': ['Research', 'Program', 'Project']
  }
};
