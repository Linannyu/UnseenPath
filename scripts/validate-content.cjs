/* Development-only content equity check. Not loaded by the website. */
'use strict';

global.window = global;
require('../data/interests.js');
require('../data/topics.js');
require('../data/opportunities.js');
require('../data/careers.js');
require('../data/rules.js');

const fail = (message) => { throw new Error(message); };
const unique = (items) => new Set(items).size === items.length;
const majors = window.INTEREST_AREAS.filter((area) => area.name !== 'Undecided / Exploring');
const interestNames = new Set(window.INTEREST_AREAS.map((area) => area.name));
const topicIds = new Set(window.TOPICS.map((item) => item.id));
const rows = majors.map((area) => {
  const opportunities = window.OPPORTUNITIES.filter((item) => item.area === area.name);
  const topics = window.TOPICS.filter((item) => item.interests.includes(area.name));
  const careers = window.CAREER_FAMILIES
    .filter((family) => family.interests.includes(area.name))
    .reduce((total, family) => total + family.careers.length, 0);
  return {
    field: area.name,
    opportunities: opportunities.length,
    verified: opportunities.filter((item) => item.url).length,
    examples: opportunities.filter((item) => !item.url).length,
    careers,
    topics: topics.length,
    pathSteps: area.path.length,
    subfields: area.subfields.length
  };
});

if (window.INTEREST_AREAS.length < 15) fail('Interest taxonomy must include at least 15 areas including Exploring.');
if (!unique(window.INTEREST_AREAS.map((item) => item.id))) fail('Duplicate interest IDs found.');
if (!unique(window.TOPICS.map((item) => item.id))) fail('Duplicate topic IDs found.');
if (!unique(window.OPPORTUNITIES.map((item) => item.id))) fail('Duplicate opportunity IDs found.');
if (!unique(window.CAREERS.map((item) => item.id))) fail('Duplicate career IDs found.');
if (window.CAREERS.length < 50 || window.CAREERS.length > 70) fail(`Career count ${window.CAREERS.length} is outside the 50–70 target.`);

window.TOPICS.forEach((item) => item.interests.forEach((interest) => {
  if (!interestNames.has(interest)) fail(`${item.id} references an unknown interest: ${interest}`);
}));
window.OPPORTUNITIES.forEach((item) => {
  if (!interestNames.has(item.area)) fail(`${item.id} references an unknown opportunity area: ${item.area}`);
});
window.CAREER_FAMILIES.forEach((family) => family.interests.forEach((interest) => {
  if (!interestNames.has(interest)) fail(`${family.id} references an unknown career interest: ${interest}`);
}));
Object.values(window.RECOMMENDATION_RULES.gradePriorities).flat().forEach((id) => {
  if (!topicIds.has(id)) fail(`Grade priority references an unknown topic: ${id}`);
});
Object.entries(window.RECOMMENDATION_RULES.interestTopics).forEach(([interest, ids]) => {
  if (!interestNames.has(interest)) fail(`Recommendation rules reference an unknown interest: ${interest}`);
  ids.forEach((id) => { if (!topicIds.has(id)) fail(`${interest} rules reference an unknown topic: ${id}`); });
});

rows.forEach((row) => {
  if (row.opportunities < 5 || row.opportunities > 10) fail(`${row.field} has ${row.opportunities} opportunities; expected 5–10.`);
  if (!row.verified || !row.examples) fail(`${row.field} must include both verified resources and example opportunity types.`);
  if (row.topics < 2) fail(`${row.field} needs at least two discovery topics.`);
  if (row.pathSteps < 5) fail(`${row.field} needs a thoughtful multi-step path.`);
  if (row.subfields < 5) fail(`${row.field} needs useful subfields.`);
});

window.OPPORTUNITIES.filter((item) => item.url).forEach((item) => {
  let parsed;
  try { parsed = new URL(item.url); } catch (error) { fail(`${item.id} has an invalid URL.`); }
  if (parsed.protocol !== 'https:') fail(`${item.id} must use an HTTPS official URL.`);
});

['opportunities', 'topics'].forEach((key) => {
  const values = rows.map((row) => row[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max > min * 3) fail(`${key} are dramatically imbalanced (${min}–${max}).`);
});

if (Math.min(...rows.map((row) => row.careers)) < 3) fail('Every major field needs several related career profiles.');
const technologyRow = rows.find((row) => row.field === 'Computer Science & Technology');
const lowestOtherCareerCount = Math.min(...rows.filter((row) => row !== technologyRow).map((row) => row.careers));
if (technologyRow.careers > lowestOtherCareerCount * 3) fail('Computer Science career content dramatically outweighs another major field.');

console.table(rows);
console.log(`PASS: ${window.INTEREST_AREAS.length} interests, ${window.TOPICS.length} discovery topics, ${window.OPPORTUNITIES.length} opportunities, and ${window.CAREERS.length} careers are connected and intentionally balanced.`);
