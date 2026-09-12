const DOMAIN_RULES = {
  software_engineering: {
    aliases: ['software engineering', 'software engineer', 'developer', 'devops', 'backend', 'frontend', 'full stack', 'cloud', 'sre', 'data engineer'],
    required: ['software', 'code', 'system', 'api', 'database', 'testing', 'architecture', 'deployment'],
    foreign: ['campaign', 'brand awareness', 'employee relations', 'payroll', 'journal entry', 'balance sheet', 'valuation', 'accounts receivable']
  },
  marketing: {
    aliases: ['marketing', 'digital marketing', 'growth marketing', 'product marketing', 'brand', 'seo', 'content marketing', 'social media'],
    required: ['marketing', 'campaign', 'customer', 'brand', 'conversion', 'audience', 'acquisition', 'retention', 'seo', 'analytics'],
    foreign: ['python programming', 'java programming', 'api endpoint', 'database schema', 'employee relations', 'payroll', 'journal entry', 'balance sheet', 'valuation']
  },
  finance: {
    aliases: ['finance', 'financial analyst', 'investment', 'accounting', 'banking', 'fp&a', 'risk analyst', 'treasury'],
    required: ['finance', 'financial', 'accounting', 'budget', 'forecast', 'cash flow', 'valuation', 'risk', 'revenue', 'profit'],
    foreign: ['python programming', 'java programming', 'api endpoint', 'database schema', 'campaign ctr', 'brand awareness', 'employee relations', 'payroll administration']
  },
  hr: {
    aliases: ['human resources', 'hr', 'people operations', 'talent', 'recruiter', 'recruiting', 'people partner'],
    required: ['employee', 'people', 'talent', 'recruiting', 'performance', 'onboarding', 'retention', 'culture', 'workforce', 'hr'],
    foreign: ['python programming', 'java programming', 'api endpoint', 'database schema', 'journal entry', 'balance sheet', 'valuation', 'campaign ctr']
  }
};

export function normalizeDomain(value = '') {
  const text = String(value).toLowerCase();
  for (const [domain, rules] of Object.entries(DOMAIN_RULES)) {
    if (rules.aliases.some(alias => text.includes(alias))) return domain;
  }
  return null;
}

export function domainRules(domain) {
  return DOMAIN_RULES[domain] || null;
}

export function validateQuestionDomain(domain, questions) {
  const rules = domainRules(domain);
  if (!rules || !Array.isArray(questions) || questions.length !== 6) return { ok: false, reason: 'Domain or question set is invalid' };
  const text = questions.map(question => `${question.prompt} ${question.category} ${question.rubric}`).join(' ').toLowerCase();
  const foreignHits = rules.foreign.filter(term => text.includes(term));
  const requiredHits = rules.required.filter(term => text.includes(term));
  if (foreignHits.length > 0) return { ok: false, reason: `Cross-domain leakage detected: ${foreignHits.join(', ')}`, foreignHits, requiredHits };
  if (requiredHits.length < 2) return { ok: false, reason: `Insufficient ${domain} domain signals`, foreignHits, requiredHits };
  return { ok: true, foreignHits, requiredHits };
}

export { DOMAIN_RULES };
