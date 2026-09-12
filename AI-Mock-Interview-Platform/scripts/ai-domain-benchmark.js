import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import { domainRules, validateQuestionDomain } from '../ai/domain-guard.js';

const COUNT = Number(process.env.BENCHMARK_COUNT || 1000);
const CONCURRENCY = Math.max(1, Number(process.env.BENCHMARK_CONCURRENCY || 5));
const MODEL = process.env.OPENAI_MODEL || 'gpt-4.1';

const fixtures = {
  software_engineering: ['Backend Engineer', 'Frontend Engineer', 'DevOps Engineer', 'Cloud Engineer', 'Full Stack Developer'],
  marketing: ['Growth Marketing Manager', 'Digital Marketing Specialist', 'Product Marketing Manager', 'SEO Manager', 'Brand Strategist'],
  finance: ['Financial Analyst', 'FP&A Analyst', 'Investment Analyst', 'Risk Analyst', 'Accountant'],
  hr: ['HR Business Partner', 'Talent Acquisition Specialist', 'People Operations Manager', 'Learning Manager', 'Employee Relations Specialist']
};
const skills = {
  software_engineering: ['Node.js, REST APIs, PostgreSQL', 'React, TypeScript, testing', 'AWS, Docker, Kubernetes', 'Java, Spring Boot, SQL', 'Python, FastAPI, Redis'],
  marketing: ['SEO, Google Analytics, content', 'paid acquisition, CRO, lifecycle', 'positioning, messaging, launches', 'technical SEO, search console, content', 'brand strategy, research, campaigns'],
  finance: ['budgeting, forecasting, Excel', 'variance analysis, financial modeling', 'valuation, portfolio analysis, markets', 'credit risk, controls, stress testing', 'GAAP, reconciliations, reporting'],
  hr: ['performance management, employee relations', 'sourcing, interviewing, onboarding', 'HRIS, workforce planning, engagement', 'learning programs, career development', 'policy, investigations, workplace culture']
};

function buildPersonas(count) {
  const domains = Object.keys(fixtures);
  return Array.from({ length: count }, (_, index) => {
    const domain = domains[index % domains.length];
    const role = fixtures[domain][Math.floor(index / domains.length) % fixtures[domain].length];
    const skill = skills[domain][Math.floor(index / (domains.length * fixtures[domain].length)) % skills[domain].length];
    const level = ['junior', 'mid', 'senior'][Math.floor(index / 20) % 3];
    const context = ['startup', 'enterprise', 'consulting', 'regulated', 'global'][Math.floor(index / 60) % 5];
    return {
      id: `P-${String(index + 1).padStart(4, '0')}`,
      domain,
      role,
      level,
      skills: skill,
      jobDescription: `A ${level} ${role} in a ${context} environment. Own measurable ${domain.replace('_', ' ')} outcomes, collaborate with stakeholders, solve role-specific problems, and communicate decisions clearly.`
    };
  });
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array', minItems: 6, maxItems: 6,
      items: {
        type: 'object', additionalProperties: false,
        required: ['prompt', 'category', 'rubric'],
        properties: {
          prompt: { type: 'string', minLength: 10, maxLength: 1200 },
          category: { type: 'string', minLength: 2, maxLength: 40 },
          rubric: { type: 'string', minLength: 10, maxLength: 1600 }
        }
      }
    }
  }
};

function instructions(domain) {
  const rules = domainRules(domain);
  return `Generate exactly six sequential interview questions for the supplied candidate. The domain is ${domain} and is a hard constraint. Stay aligned to the candidate role, level, skills and job description. Include relevant technical or functional questions, problem solving, communication and leadership only where appropriate. Use domain concepts such as ${rules.required.slice(0, 6).join(', ')}. Never center a question on unrelated domains such as ${rules.foreign.slice(0, 4).join(', ')}. Do not request protected characteristics or infer them.`;
}

async function runOne(client, persona) {
  const started = Date.now();
  try {
    const response = await client.responses.create({
      model: MODEL,
      instructions: instructions(persona.domain),
      input: JSON.stringify(persona),
      text: { format: { type: 'json_schema', name: 'benchmark_questions', strict: true, schema } }
    });
    const output = JSON.parse(response.output_text);
    const alignment = validateQuestionDomain(persona.domain, output.questions);
    return { id: persona.id, domain: persona.domain, ok: alignment.ok, alignment, latencyMs: Date.now() - started };
  } catch (error) {
    return { id: persona.id, domain: persona.domain, ok: false, error: error.message, latencyMs: Date.now() - started };
  }
}

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is required for the live AI benchmark. No model calls were made.');
  process.exit(2);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 2 });
const personas = buildPersonas(COUNT);
const results = [];
let cursor = 0;
async function worker() {
  while (true) {
    const index = cursor++;
    if (index >= personas.length) return;
    results[index] = await runOne(client, personas[index]);
    if ((index + 1) % 25 === 0) console.log(`benchmark ${index + 1}/${personas.length}`);
  }
}
await Promise.all(Array.from({ length: Math.min(CONCURRENCY, personas.length) }, () => worker()));

const passed = results.filter(result => result.ok).length;
const failed = results.length - passed;
const byDomain = Object.fromEntries(Object.keys(fixtures).map(domain => {
  const rows = results.filter(result => result.domain === domain);
  return [domain, { total: rows.length, passed: rows.filter(row => row.ok).length, failed: rows.filter(row => !row.ok).length }];
}));
const report = {
  generatedAt: new Date().toISOString(),
  model: MODEL,
  count: results.length,
  passed,
  failed,
  accuracy: results.length ? passed / results.length : 0,
  byDomain,
  failures: results.filter(result => !result.ok).slice(0, 100),
  results
};
const outputDir = path.resolve('test-results');
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'ai-domain-benchmark.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ model: MODEL, count: report.count, passed, failed, accuracy: report.accuracy, byDomain }, null, 2));
if (failed > 0) process.exit(1);
