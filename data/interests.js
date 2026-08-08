(function () {
  'use strict';

  window.INTEREST_AREAS = [
    {
      id: 'technology', name: 'Computer Science & Technology', shortName: 'Technology', icon: '⌘', color: '#4266dc', common: true,
      subfields: ['Software Development', 'Artificial Intelligence', 'Cybersecurity', 'Data Science', 'Web Development', 'Game Development', 'IT / Networking'],
      path: ['Learn basic programming', 'Build a small project', 'Try a hackathon, coding competition, or CTF', 'Build a larger project', 'Create a portfolio or GitHub']
    },
    {
      id: 'engineering', name: 'Engineering', shortName: 'Engineering', icon: '⚙', color: '#6557a5', common: true,
      subfields: ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Aerospace Engineering', 'Robotics', 'Biomedical Engineering', 'Environmental Engineering'],
      path: ['Notice how everyday systems work', 'Try a hands-on design challenge', 'Learn basic CAD, electronics, or building skills', 'Join a team project or competition', 'Document and improve a design']
    },
    {
      id: 'biology-health', name: 'Biology & Health', shortName: 'Biology & Health', icon: '✚', color: '#509475', common: true,
      subfields: ['Biology', 'Medicine', 'Nursing', 'Public Health', 'Neuroscience', 'Pharmacy', 'Biomedical Research', 'Nutrition / Health Science'],
      path: ['Explore biology and health topics', 'Join a science or health-related activity', 'Try volunteering or a science project', 'Explore science fairs or research programs', 'Reflect on which health and science areas interest you']
    },
    {
      id: 'physical-sciences', name: 'Physical Sciences', shortName: 'Physical Sciences', icon: '◉', color: '#657ba7', common: false,
      subfields: ['Chemistry', 'Physics', 'Astronomy', 'Earth Science', 'Materials Science'],
      path: ['Follow a question about how the physical world works', 'Try a safe experiment or observation', 'Strengthen math and lab habits', 'Join a science activity or investigation', 'Share findings in a report, fair, or presentation']
    },
    {
      id: 'mathematics', name: 'Mathematics & Statistics', shortName: 'Math & Statistics', icon: '∑', color: '#4f7f92', common: false,
      subfields: ['Mathematics', 'Statistics', 'Applied Mathematics', 'Actuarial Science', 'Quantitative Fields'],
      path: ['Explore puzzles, patterns, or real data', 'Strengthen one core math skill', 'Try a math club, contest, or data project', 'Apply math to a question you care about', 'Explain your reasoning or results to others']
    },
    {
      id: 'business', name: 'Business & Entrepreneurship', shortName: 'Business', icon: '↗', color: '#d76c58', common: true,
      subfields: ['Finance', 'Accounting', 'Marketing', 'Management', 'Entrepreneurship', 'Economics', 'Business Analytics'],
      path: ['Learn basic business concepts', 'Try a small entrepreneurship project', 'Join a business or finance activity', 'Try a pitch or entrepreneurship competition', 'Build leadership or project experience']
    },
    {
      id: 'art-design', name: 'Art & Design', shortName: 'Art & Design', icon: '✦', color: '#bd5d84', common: true,
      subfields: ['Fine Arts', 'Graphic Design', 'UX/UI Design', 'Architecture', 'Animation', 'Fashion Design', 'Industrial Design', 'Photography'],
      path: ['Experiment with different media', 'Create personal work', 'Explore design tools', 'Try exhibitions, competitions, or community projects', 'Build a portfolio']
    },
    {
      id: 'humanities', name: 'Humanities', shortName: 'Humanities', icon: '¶', color: '#9b694f', common: false,
      subfields: ['History', 'Literature', 'Philosophy', 'Languages', 'Writing', 'Cultural Studies'],
      path: ['Read or listen across topics and perspectives', 'Keep notes on questions and ideas', 'Try writing, debate, language, or history activities', 'Create a research or storytelling project', 'Share your interpretation with an audience']
    },
    {
      id: 'social-sciences', name: 'Social Sciences', shortName: 'Social Sciences', icon: '◎', color: '#8b6aa8', common: true,
      subfields: ['Psychology', 'Sociology', 'Economics', 'Anthropology', 'Political Science', 'Geography'],
      path: ['Explore a question about people or communities', 'Learn how evidence and surveys are used', 'Join a discussion, service, or research activity', 'Investigate a local issue ethically', 'Present what you learned and what remains uncertain']
    },
    {
      id: 'law-public-service', name: 'Law, Government & Public Service', shortName: 'Law & Public Service', icon: '⚖', color: '#586f9c', common: true,
      subfields: ['Law', 'Government', 'Public Policy', 'Criminal Justice', 'International Relations', 'Public Administration'],
      path: ['Explore current issues', 'Try debate, Model UN, or student government', 'Get involved in your community', 'Create a writing, policy, or civic project', 'Explore public service opportunities']
    },
    {
      id: 'media', name: 'Media & Communication', shortName: 'Media', icon: '◫', color: '#c26f4a', common: true,
      subfields: ['Journalism', 'Film', 'Media Production', 'Communication', 'Photography', 'Broadcasting', 'Digital Media'],
      path: ['Experiment with writing, video, or photography', 'Create a small publication or media project', 'Try a school newspaper or media club', 'Explore journalism or film opportunities', 'Build a portfolio']
    },
    {
      id: 'environment', name: 'Environment & Sustainability', shortName: 'Environment', icon: '♧', color: '#4f8b6c', common: false,
      subfields: ['Environmental Science', 'Climate Science', 'Conservation', 'Sustainability', 'Urban Planning', 'Renewable Energy'],
      path: ['Learn about a local environmental issue', 'Volunteer or collect observations and data', 'Build a sustainability project', 'Try a science or environment competition', 'Create a community impact project']
    },
    {
      id: 'education', name: 'Education', shortName: 'Education', icon: '▤', color: '#4f8790', common: false,
      subfields: ['Teaching', 'Early Childhood Education', 'Special Education', 'Educational Technology', 'Counseling-related exploration'],
      path: ['Notice how different people learn', 'Tutor or help someone practice a skill', 'Try mentoring, teaching, or lesson design', 'Join an education or service activity', 'Reflect on the learners and settings you enjoy supporting']
    },
    {
      id: 'skilled-trades', name: 'Skilled Trades & Technical Careers', shortName: 'Skilled Trades', icon: '◆', color: '#8b714c', common: false,
      subfields: ['Electrical', 'Automotive Technology', 'Construction', 'HVAC', 'Advanced Manufacturing', 'Culinary Arts', 'Technical Design'],
      path: ['Explore how practical systems are built or repaired', 'Try a hands-on class or small project', 'Learn about CTE, certificates, and apprenticeships', 'Practice safely with an instructor or mentor', 'Build evidence of dependable technical skills']
    },
    {
      id: 'exploring', name: 'Undecided / Exploring', shortName: 'Exploring', icon: '?', color: '#69777b', common: true,
      subfields: ['Building things', 'Helping people', 'Solving puzzles', 'Drawing / creating', 'Writing / communicating', 'Understanding people', 'Working with numbers', 'Exploring nature', 'Leading projects', 'Working with technology'],
      path: ['Choose two things that sound interesting', 'Try one small activity in each', 'Notice what gives you energy or curiosity', 'Talk with someone who does related work', 'Keep exploring—your direction can change']
    }
  ];

  window.EXPLORATION_SIGNALS = {
    'Building things': ['Engineering', 'Skilled Trades & Technical Careers', 'Art & Design'],
    'Helping people': ['Biology & Health', 'Education', 'Social Sciences'],
    'Solving puzzles': ['Mathematics & Statistics', 'Computer Science & Technology', 'Physical Sciences'],
    'Drawing / creating': ['Art & Design', 'Media & Communication', 'Engineering'],
    'Writing / communicating': ['Media & Communication', 'Humanities', 'Law, Government & Public Service'],
    'Understanding people': ['Social Sciences', 'Education', 'Biology & Health'],
    'Working with numbers': ['Mathematics & Statistics', 'Business & Entrepreneurship', 'Computer Science & Technology'],
    'Exploring nature': ['Environment & Sustainability', 'Biology & Health', 'Physical Sciences'],
    'Leading projects': ['Business & Entrepreneurship', 'Law, Government & Public Service', 'Education'],
    'Working with technology': ['Computer Science & Technology', 'Engineering', 'Skilled Trades & Technical Careers']
  };
}());
