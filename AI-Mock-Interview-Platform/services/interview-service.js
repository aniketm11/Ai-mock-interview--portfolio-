import { generateQuestions, evaluate } from '../ai/openai-interview-engine.js';
import { interviews } from '../models/repositories.js';

export async function startInterview(userId, profile) {
  const plan = await generateQuestions(profile);
  const id = await interviews.create(userId, profile, plan.questions);
  return { id, questions: plan.questions };
}

export async function submitAnswer(interview, position, transcript, voiceMetrics) {
  const question = await interviews.question(interview.id, position);
  if (!question) throw Object.assign(new Error('Question not found'), { status: 404 });
  if (interview.status === 'complete') throw Object.assign(new Error('Interview is already complete'), { status: 409 });

  const context = await interviews.history(interview.id);
  const evaluation = await evaluate({
    profile: JSON.parse(interview.profile),
    question: question.prompt,
    transcript,
    voiceMetrics,
    context
  });

  await interviews.saveAnswer(question.id, transcript, voiceMetrics, evaluation);
  const completion = await interviews.completeIfFinished(interview.id);
  return { ...evaluation, sessionComplete: completion.complete, sessionScore: completion.score };
}

export async function logIntegrity(interviewId, event) {
  const severity = {
    tab_hidden: 12,
    window_blur: 8,
    copy: 15,
    paste: 20,
    context_menu: 3,
    camera_unavailable: 15,
    microphone_muted: 10,
    face_missing: 8,
    multiple_faces: 20,
    looking_away: 4,
    long_inactivity: 8,
    camera_obstructed: 12
  }[event.type] ?? 2;
  await interviews.event(interviewId, event.type, severity, event.metadata || {});
  return severity;
}
