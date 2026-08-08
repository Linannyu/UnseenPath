(function () {
  'use strict';

  const family = (id, name, icon, description, interests, explore, opportunities, careers) => ({
    id, name, icon, description, interests, explore, opportunities,
    careers: careers.map(([careerId, title, summary]) => ({ id: careerId, title, summary }))
  });

  window.CAREER_FAMILIES = [
    family('technology', 'Technology', '⌘', 'Create, protect, organize, and improve digital tools and systems.', ['Computer Science & Technology'], ['Programming fundamentals', 'Logic and problem solving', 'A small app, website, game, or network project', 'A coding club, CTF, or technology event'], ['Coding projects', 'Hackathons', 'Cybersecurity challenges', 'Technology clubs'], [
      ['software-engineer', 'Software Engineer', 'Designs and builds software that helps people complete tasks or solve problems.'],
      ['cybersecurity-analyst', 'Cybersecurity Analyst', 'Helps protect computers, networks, and information from digital threats.'],
      ['data-scientist', 'Data Scientist', 'Uses data, statistics, and code to investigate questions and communicate patterns.'],
      ['it-specialist', 'IT Specialist', 'Sets up, maintains, and troubleshoots technology used by an organization.'],
      ['web-developer', 'Web Developer', 'Builds and improves websites and web-based tools.'],
      ['game-developer', 'Game Developer', 'Combines code, art, sound, and storytelling to create interactive experiences.']
    ]),
    family('engineering', 'Engineering', '⚙', 'Use science, mathematics, and design to improve structures, machines, and systems.', ['Engineering', 'Mathematics & Statistics', 'Physical Sciences'], ['Algebra, geometry, and physics', 'CAD or 3D modeling', 'A build-test-improve design project', 'Robotics, maker, or engineering teams'], ['Robotics teams', 'Design challenges', 'Maker projects', 'Engineering programs'], [
      ['mechanical-engineer', 'Mechanical Engineer', 'Designs and tests machines, devices, and systems with moving or thermal parts.'],
      ['electrical-engineer', 'Electrical Engineer', 'Works with circuits, power, electronics, and communication systems.'],
      ['civil-engineer', 'Civil Engineer', 'Plans and improves infrastructure such as roads, bridges, and water systems.'],
      ['aerospace-engineer', 'Aerospace Engineer', 'Develops aircraft, spacecraft, and the systems that help them operate.'],
      ['biomedical-engineer', 'Biomedical Engineer', 'Applies engineering design to health tools, devices, and biological questions.'],
      ['robotics-engineer', 'Robotics Engineer', 'Combines mechanics, electronics, and software to build automated machines.']
    ]),
    family('healthcare', 'Healthcare', '✚', 'Support health through patient care, therapy, testing, medication, and prevention.', ['Biology & Health'], ['Biology and health science', 'Communication and careful observation', 'Health clubs or service with approved supervision', 'First aid or health-career exploration'], ['Health clubs', 'Science programs', 'Supervised volunteering', 'Health career exploration'], [
      ['physician', 'Physician', 'Diagnoses health concerns and works with patients on treatment and prevention.'],
      ['nurse', 'Nurse', 'Provides and coordinates patient care, education, and support in many settings.'],
      ['pharmacist', 'Pharmacist', 'Helps people use medications safely and works with health-care teams.'],
      ['physical-therapist', 'Physical Therapist', 'Helps people improve movement, strength, and physical function.'],
      ['occupational-therapist', 'Occupational Therapist', 'Helps people participate more independently in daily activities.'],
      ['medical-lab-scientist', 'Medical Laboratory Scientist', 'Tests samples and produces information used in health decisions.'],
      ['public-health-professional', 'Public Health Professional', 'Works to improve health across communities through education, data, and programs.']
    ]),
    family('science-research', 'Science & Research', '⌁', 'Ask testable questions, gather evidence, and build careful explanations.', ['Biology & Health', 'Physical Sciences', 'Mathematics & Statistics'], ['Lab safety and scientific writing', 'Biology, chemistry, physics, or statistics', 'A small investigation or data analysis', 'Science fairs and research programs'], ['Science fairs', 'Research programs', 'Laboratory or field projects', 'Science clubs'], [
      ['biologist', 'Biologist', 'Studies living organisms and the systems that connect them.'],
      ['chemist', 'Chemist', 'Studies substances, reactions, and materials at the molecular level.'],
      ['physicist', 'Physicist', 'Investigates matter, energy, motion, and the rules of the physical world.'],
      ['research-scientist', 'Research Scientist', 'Plans studies, analyzes evidence, and shares findings in a specialized field.'],
      ['statistician', 'Statistician', 'Uses data and probability to answer questions and measure uncertainty.'],
      ['laboratory-technician', 'Laboratory Technician', 'Prepares equipment and samples and performs careful laboratory procedures.']
    ]),
    family('business-finance', 'Business & Finance', '↗', 'Help organizations plan, understand money and customers, and deliver useful work.', ['Business & Entrepreneurship', 'Mathematics & Statistics', 'Social Sciences'], ['Financial literacy and spreadsheets', 'Clear presentations and teamwork', 'A small sales, service, or budgeting project', 'Business clubs and pitch challenges'], ['Business clubs', 'Pitch competitions', 'Financial literacy programs', 'Entrepreneurship projects'], [
      ['accountant', 'Accountant', 'Organizes and explains financial records so people can make informed decisions.'],
      ['financial-analyst', 'Financial Analyst', 'Studies financial information to help organizations evaluate plans and risks.'],
      ['marketing-specialist', 'Marketing Specialist', 'Researches audiences and communicates why a product, service, or idea matters.'],
      ['business-analyst', 'Business Analyst', 'Examines processes and data to suggest practical improvements.'],
      ['entrepreneur', 'Entrepreneur', 'Develops and tests an idea for a product, service, or organization.'],
      ['operations-manager', 'Operations Manager', 'Coordinates people, schedules, resources, and systems so work runs smoothly.']
    ]),
    family('art-design', 'Art & Design', '✦', 'Communicate ideas and shape experiences through visual, spatial, and physical design.', ['Art & Design'], ['Drawing and visual communication', 'Design tools and critique', 'Personal work in several media', 'A portfolio with process notes'], ['Portfolio programs', 'Art competitions', 'Exhibitions', 'Design challenges'], [
      ['graphic-designer', 'Graphic Designer', 'Uses typography, images, and layout to communicate visually.'],
      ['architect', 'Architect', 'Designs and plans buildings and spaces with attention to people, structure, and place.'],
      ['ux-ui-designer', 'UX/UI Designer', 'Designs how people understand and interact with digital products.'],
      ['animator', 'Animator', 'Creates movement and performance through drawn, digital, or three-dimensional images.'],
      ['fashion-designer', 'Fashion Designer', 'Develops clothing and accessories through research, sketching, materials, and construction.'],
      ['industrial-designer', 'Industrial Designer', 'Designs useful physical products by balancing function, appearance, and manufacturing.']
    ]),
    family('media-communication', 'Media & Communication', '◫', 'Research stories and communicate them through writing, images, sound, and video.', ['Media & Communication', 'Humanities', 'Art & Design'], ['Interviewing and source checking', 'Writing, photography, audio, or video', 'A small publication or channel', 'School media and feedback from an audience'], ['Student journalism', 'Film competitions', 'School publications', 'Media projects'], [
      ['journalist', 'Journalist', 'Reports verified information and stories for a public audience.'],
      ['writer', 'Writer', 'Develops ideas and stories for print, digital, educational, or creative work.'],
      ['film-producer', 'Film Producer', 'Coordinates the people, schedule, budget, and creative direction of a film project.'],
      ['video-editor', 'Video Editor', 'Shapes recorded images and sound into a clear story or message.'],
      ['communications-specialist', 'Communications Specialist', 'Plans messages and materials that help an organization reach its audiences.'],
      ['broadcaster', 'Broadcaster', 'Presents or produces news, information, or entertainment for audio and video audiences.']
    ]),
    family('law-government', 'Law & Government', '⚖', 'Understand rules, represent people, analyze policy, and support public institutions.', ['Law, Government & Public Service', 'Social Sciences', 'Humanities'], ['Civics, history, and current issues', 'Evidence-based writing and speaking', 'Debate, Model UN, or student government', 'A policy or community research project'], ['Mock trial', 'Debate', 'Model UN', 'Civic engagement'], [
      ['lawyer', 'Lawyer', 'Advises or represents people and organizations using law and evidence.'],
      ['policy-analyst', 'Policy Analyst', 'Studies public problems and evaluates possible policy responses.'],
      ['urban-planner', 'Urban Planner', 'Helps communities plan land, transportation, housing, and public spaces.'],
      ['government-administrator', 'Government Administrator', 'Coordinates programs and services within public agencies.'],
      ['international-affairs-specialist', 'International Affairs Specialist', 'Studies and supports relationships among countries, institutions, and communities.']
    ]),
    family('education', 'Education', '▤', 'Help people learn, grow skills, and access supportive learning environments.', ['Education', 'Social Sciences'], ['Tutoring and clear explanations', 'Child development or learning science', 'A lesson, workshop, or educational resource', 'Mentoring or supervised classroom exploration'], ['Tutoring programs', 'Teaching clubs', 'Mentoring', 'Educational projects'], [
      ['teacher', 'Teacher', 'Plans learning experiences and supports students in developing knowledge and skills.'],
      ['school-counselor', 'School Counselor', 'Supports students with academic planning, wellbeing, and future decisions.'],
      ['education-specialist', 'Education Specialist', 'Designs or delivers specialized support for particular learners or subjects.'],
      ['instructional-designer', 'Instructional Designer', 'Creates lessons, training, and learning materials for schools or organizations.']
    ]),
    family('community-services', 'Community & Social Services', '◎', 'Connect people with support and organize efforts that strengthen communities.', ['Social Sciences', 'Education', 'Law, Government & Public Service'], ['Listening and communication', 'Psychology, sociology, or civics', 'Supervised service with a trusted organization', 'A community needs or awareness project'], ['Community service', 'Youth leadership', 'Peer support programs', 'Civic projects'], [
      ['social-worker', 'Social Worker', 'Helps people navigate challenges, services, and systems that affect their wellbeing.'],
      ['nonprofit-coordinator', 'Nonprofit Program Coordinator', 'Organizes programs, volunteers, and resources around a community mission.'],
      ['community-organizer', 'Community Organizer', 'Builds relationships and coordinates people working on a shared local concern.']
    ]),
    family('environment', 'Environment', '♧', 'Study and improve relationships among natural systems, communities, and resources.', ['Environment & Sustainability', 'Biology & Health', 'Engineering'], ['Environmental science and local observation', 'Mapping, data, or field notes', 'A conservation or sustainability project', 'Community partnerships and science communication'], ['Environmental clubs', 'Conservation projects', 'Citizen science', 'Sustainability challenges'], [
      ['environmental-scientist', 'Environmental Scientist', 'Studies environmental conditions and helps evaluate risks or solutions.'],
      ['sustainability-specialist', 'Sustainability Specialist', 'Helps organizations reduce waste and use energy and materials more responsibly.'],
      ['conservation-professional', 'Conservation Professional', 'Protects habitats, species, and natural resources through science and stewardship.'],
      ['renewable-energy-specialist', 'Renewable Energy Specialist', 'Works on energy systems that use sources such as sunlight, wind, or water.']
    ]),
    family('skilled-trades', 'Skilled Trades', '◆', 'Build, install, repair, and operate the systems people rely on every day.', ['Skilled Trades & Technical Careers', 'Engineering'], ['CTE and shop safety', 'Measurement, diagrams, and dependable work habits', 'Hands-on projects with trained supervision', 'Certificates, apprenticeships, and technical programs'], ['CTE programs', 'Technical competitions', 'Apprenticeship exploration', 'Hands-on school programs'], [
      ['electrician', 'Electrician', 'Installs and maintains electrical wiring and systems using safety codes and technical plans.'],
      ['automotive-technician', 'Automotive Technician', 'Diagnoses, maintains, and repairs vehicle systems.'],
      ['hvac-technician', 'HVAC Technician', 'Installs and services heating, ventilation, and air-conditioning systems.'],
      ['manufacturing-technician', 'Advanced Manufacturing Technician', 'Operates and improves modern production equipment and processes.'],
      ['construction-professional', 'Construction Professional', 'Builds and renovates structures through coordinated technical trades.'],
      ['culinary-professional', 'Culinary Professional', 'Prepares food and manages kitchen work with creativity, consistency, and safety.']
    ]),
    family('exploring', 'Other / Exploring', '?', 'Try broad experiences and notice which problems, people, and settings interest you.', ['Undecided / Exploring'], ['A short interest survey', 'One conversation with a trusted adult', 'Two very different clubs or activities', 'A reflection on what you liked and disliked'], ['Career talks', 'Job shadowing', 'Exploration programs', 'Community projects'], [
      ['project-coordinator', 'Project Coordinator', 'Keeps tasks, people, information, and timelines organized across many kinds of work.'],
      ['research-assistant', 'Research Assistant', 'Supports careful information gathering and analysis in many possible fields.'],
      ['community-entrepreneur', 'Community Entrepreneur', 'Tests practical ideas that respond to a need in a local community.']
    ])
  ];

  window.CAREERS = window.CAREER_FAMILIES.flatMap((careerFamily) => careerFamily.careers.map((career) => ({ ...career, familyId: careerFamily.id })));
}());
