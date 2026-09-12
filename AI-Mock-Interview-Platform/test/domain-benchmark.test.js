import test from 'node:test';
import assert from 'node:assert/strict';
import { inferDomain, validateQuestionDomain } from '../ai/domain-guard.js';

const domains = {
  software_engineering: {
    roles: ['Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'Cloud Engineer', 'Full Stack Developer'],
    skills: ['Node.js, REST APIs, PostgreSQL', 'React, TypeScript, testing', 'AWS, Docker, Kubernetes', 'Java, Spring Boot, SQL', 'Python, FastAPI, Redis']
  },
  marketing: {
    roles: ['Growth Marketing Manager', 'Digital Marketing Specialist', 'Product Marketing Manager', 'SEO Manager', 'Brand Strategist'],
    skills: ['SEO, Google Analytics, content', 'paid acquisition, CRO, lifecycle', 'positioning, messaging, launches', 'technical SEO, search console, content', 'brand strategy, research, campaigns']
  },
  finance: {
    roles: ['Financial Analyst', 'FP&A Analyst', 'Investment Analyst', 'Risk Analyst', 'Accountant'],
    skills: ['budgeting, forecasting, Excel', 'variance analysis, financial modeling', 'valuation, portfolio analysis, markets', 'credit risk, controls, stress testing', 'GAAP, reconciliations, reporting']
  },
  hr: {
    roles: ['HR Business Partner', 'Talent Acquisition Specialist', 'People Operations Manager', 'Learning Manager', 'Employee Relations Specialist'],
    skills: ['performance management, employee relations', 'sourcing, interviewing, onboarding', 'HRIS, workforce planning, engagement', 'learning programs, career development', 'policy, investigations, workplace culture']
  }
};

function personas() {
  const result = [];
  let id = 1;
  for (const [domain, fixture] of Object.entries(domains)) {
    for (let roleIndex = 0; roleIndex < fixture.roles.length; roleIndex += 1) {
      for (let skillIndex = 0; skillIndex < fixture.skills.length; skillIndex += 1) {
        for (const level of ['junior', 'mid', 'senior', 'lead', 'principal']) {
          for (const context of ['startup', 'enterprise']) {
            result.push({
              id: `P-${String(id++).padStart(4, '0')}`,
              domain,
              role: fixture.roles[roleIndex],
              level: level === 'lead' || level === 'principal' ? 'senior' : level,
              skills: fixture.skills[skillIndex],
              jobDescription: `Own ${domain.replace('_', ' ')} outcomes for a ${level} candidate in a ${context} environment. Collaborate cross-functionally, solve role-specific problems, communicate decisions clearly, and improve measurable business results.`
            });
          }
        }
      }
    }
  }
  return result;
}

function fixtureQuestions(domain) {
  const common = [
    { prompt: 'Describe a difficult problem in your role and how you solved it.', category: 'problem solving', rubric: 'Assess reasoning, trade-offs, execution and measurable outcome.' },
    { prompt: 'Tell me about a decision you made with incomplete information.', category: 'leadership', rubric: 'Assess judgment, communication and ownership.' },
    { prompt: 'How do you measure whether your work is successful?', category: 'industry knowledge', rubric: 'Assess domain metrics and practical measurement.' },
    { prompt: 'Describe a disagreement with a stakeholder and how you handled it.', category: 'HR', rubric: 'Assess communication, collaboration and resolution.' },
    { prompt: 'What would you improve in your current workflow?', category: 'problem solving', rubric: 'Assess continuous improvement and prioritization.' },
    { prompt: 'Walk through a recent project and the outcome.', category: 'experience', rubric: 'Assess relevance, depth, examples and results.' }
  ];
  const domainQuestion = {
    software_engineering: 'How would you design and test a reliable API and database-backed service?',
    marketing: 'How would you design a campaign to improve customer acquisition and conversion?',
    finance: 'How would you build a financial forecast and explain variance against budget?',
    hr: 'How would you improve employee onboarding, retention and performance management?'
  };
  return [
    { prompt: domainQuestion[domain], category: 'domain', rubric: 'Assess domain-specific knowledge and practical reasoning.' },
    ...common.slice(0, 5)
  ];
}

test('1,000 distinct synthetic personas resolve to the intended professional domain', () => {
  const cases = personas();
  assert.equal(cases.length, 1000);
  assert.equal(new Set(cases.map(item => item.id)).size, 1000);
  for (const item of cases) assert.equal(inferDomain(item), item.domain, item.id);
});

test('domain guard rejects cross-domain leakage and accepts aligned plans', () => {
  for (const domain of Object.keys(domains)) {
    const aligned = fixtureQuestions(domain);
    assert.equal(validateQuestionDomain(domain, aligned).ok, true, domain);
    const foreign = aligned.map(question => ({ ...question }));
    foreign[0].prompt = domain === 'marketing'
      ? 'Write a Python program for a database API endpoint.'
      : domain === 'finance'
        ? 'Design a marketing campaign to increase brand awareness and campaign CTR.'
        : domain === 'hr'
          ? 'Explain Python programming and database schema design.'
          : 'Explain employee relations, payroll and brand awareness.';
    assert.equal(validateQuestionDomain(domain, foreign).ok, false, domain);
  }
});
