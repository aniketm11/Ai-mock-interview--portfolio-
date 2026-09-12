import OpenAI from 'openai';
import env from '../config/env.js';
import { domainRules } from './domain-guard.js';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 45000,
  maxRetries: 2
});

const questionSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['questions'],
  properties: {
    questions: {
      type: 'array',
      minItems: 6,
      maxItems: 6,
      items: {
        type: 'object',
        additionalProperties: false,
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

const evaluationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['overall','technical','hr','communication','grammar','vocabulary','confidence','completeness','relevance','depth','problemSolving','examples','industryKnowledge','feedback','strengths','weaknesses','suggestions','followUp','hiringSignal'],
  properties: {
    overall: { type: 'integer', minimum: 0, maximum: 100 },
    technical: { type: 'integer', minimum: 0, maximum: 100 },
    hr: { type: 'integer', minimum: 0, maximum: 100 },
    communication: { type: 'integer', minimum: 0, maximum: 100 },
    grammar: { type: 'integer', minimum: 0, maximum: 100 },
    vocabulary: { type: 'integer', minimum: 0, maximum: 100 },
    confidence: { type: 'integer', minimum: 0, maximum: 100 },
    completeness: { type: 'integer', minimum: 0, maximum: 100 },
    relevance: { type: 'integer', minimum: 0, maximum: 100 },
    depth: { type: 'integer', minimum: 0, maximum: 100 },
    problemSolving: { type: 'integer', minimum: 0, maximum: 100 },
    examples: { type: 'integer', minimum: 0, maximum: 100 },
    industryKnowledge: { type: 'integer', minimum: 0, maximum: 100 },
    feedback: { type: 'string', minLength: 10, maxLength: 2500 },
    strengths: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', maxLength: 500 } },
    weaknesses: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', maxLength: 500 } },
    suggestions: { type: 'array', minItems: 1, maxItems: 6, items: { type: 'string', maxLength: 500 } },
    followUp: { type: 'string', minLength: 10, maxLength: 1200 },
    hiringSignal: { type: 'string', minLength: 2, maxLength: 120 }
  }
};

async function structured(instructions, input, name, schema) {
  try {
    const response = await openai.responses.create({
      model: env.OPENAI_MODEL,
      instructions,
      input: JSON.stringify(input),
      text: { format: { type: 'json_schema', name, strict: true, schema } }
    });
    return JSON.parse(response.output_text);
  } catch (error) {
    throw Object.assign(new Error('AI service is temporarily unavailable. Please try again.'), {
      status: 503,
      cause: error
    });
  }
}

export const generateQuestions = profile => {
  const rules = domainRules(profile.domain);
  const domainContract = rules
    ? `The candidate domain is ${profile.domain}. Treat this as a hard constraint. Stay inside this domain and the candidate's role, skills and job description. Use domain concepts such as ${rules.required.slice(0, 6).join(', ')}. Do not ask questions centered on unrelated domains such as ${rules.foreign.slice(0, 4).join(', ')}.`
    : 'Infer the professional domain conservatively from the role, skills and job description. Do not introduce a different professional domain.';
  return structured(
    `You are a structured interview designer. Generate exactly six sequential, role-specific interview questions across technical, HR, problem solving and leadership only when relevant to the candidate's role. ${domainContract} Never request protected characteristics or infer them. Every question must be answerable using the supplied role context, skills, job description and resume. Do not substitute a generic software, marketing, finance or HR interview for a different candidate domain.`,
    profile,
    'interview_questions',
    questionSchema
  );
};

export const evaluate = payload => structured(
  `You are a calibrated interview evaluator. Evaluate only the candidate answer and observable voice metrics against the provided question and role context. Preserve the candidate's professional domain; do not introduce unrelated technical or functional standards. Do not use integrity signals as evidence of misconduct. Give direct, constructive feedback and one useful adaptive follow-up question.`,
  payload,
  'interview_evaluation',
  evaluationSchema
);
