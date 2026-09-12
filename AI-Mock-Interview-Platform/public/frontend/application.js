import { startMedia } from './media-monitor.js';
import { monitorIntegrity } from './integrity-monitor.js';

const $ = id => document.getElementById(id);
let interview = null, position = 0, media = null, stopIntegrity = null;
let recognition = null, startedAt = 0, transcript = '', timer = null, demoMode = false;

const showApp = () => { document.querySelector('.page-shell').hidden = true; $('app-shell').hidden = false; window.scrollTo({ top: 0, behavior: 'instant' }); };
const showLanding = () => { document.querySelector('.page-shell').hidden = false; $('app-shell').hidden = true; };
const showAuth = () => { $('auth-overlay').hidden = false; setTimeout(() => $('email').focus(), 50); };
const hideAuth = () => { $('auth-overlay').hidden = true; };

async function api(path, options = {}) {
  const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json', ...(options.headers || {}) };
  let response;
  try {
    response = await fetch('/api' + path, { credentials: 'include', headers, ...options });
  } catch {
    throw new Error('Cannot reach the API. Check the Vercel deployment and try again.');
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const data = await response.json(); message = data.error || data.message || message; } catch {}
    throw new Error(message);
  }
  return response.status === 204 ? null : response.json();
}

function initials(email) { return (email || 'AM').split('@')[0].slice(0, 2).toUpperCase(); }
function startTimer() { clearInterval(timer); startedAt = Date.now(); timer = setInterval(() => { const s = Math.floor((Date.now() - startedAt) / 1000); $('answer-time').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }, 500); }
function stopTimer() { clearInterval(timer); $('answer-time').textContent = '00:00'; }
function metrics() { const seconds = Math.max(1, (Date.now() - startedAt) / 1000), words = (transcript.match(/\b[\w'-]+\b/g) || []).length, fillers = (transcript.match(/\b(um|uh|like|actually|basically)\b/gi) || []).length; return { pace: Math.round(words / seconds * 60), fillerCount: fillers, silenceSeconds: 0, hesitationCount: fillers, confidence: Math.max(0, 85 - fillers * 4), fluency: Math.max(0, 90 - fillers * 5) }; }

function renderQuestion() {
  const q = interview.questions[position];
  $('progress').textContent = `QUESTION ${position + 1} / ${interview.questions.length}`;
  $('progress-fill').style.width = `${((position + 1) / interview.questions.length) * 100}%`;
  $('question-category').textContent = `QUESTION ${String(position + 1).padStart(2, '0')} · ${(q.category || 'INTERVIEW').toUpperCase()}`;
  $('question').textContent = q.prompt;
  $('timeline').innerHTML = interview.questions.map((x, i) => `<li class="${i === position ? 'active' : ''}">${String(i + 1).padStart(2, '0')} &nbsp; ${x.category}</li>`).join('');
  $('transcript').textContent = 'Your spoken answer will appear here.';
  $('feedback').hidden = true;
  transcript = '';
  recognition = null;
  $('answer').textContent = 'Start answer';
  $('answer').disabled = false;
}

function startRecognition() {
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Speech) { $('transcript').textContent = 'Speech recognition is not available in this browser. Please use the latest Chrome or Edge.'; return; }
  recognition = new Speech();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.onresult = event => { transcript = Array.from(event.results).map(result => result[0].transcript).join(' '); $('transcript').textContent = transcript || 'Listening…'; };
  recognition.onerror = event => { if (event.error !== 'no-speech') $('transcript').textContent = 'Microphone input paused. Please try again.'; };
  recognition.onend = () => { if ($('answer').textContent === 'Finish and evaluate') $('answer').disabled = false; };
  recognition.start();
  startTimer();
  $('answer').textContent = 'Finish and evaluate';
}

async function evaluate() {
  recognition?.stop();
  stopTimer();
  if (!transcript.trim()) { $('transcript').textContent = 'Please give an answer before evaluating.'; return; }
  $('answer').disabled = true;
  try {
    const evaluation = demoMode
      ? { overall: 84, technical: 88, communication: 86, grammar: 91, confidence: 80, feedback: 'Strong structured answer. Add a measurable result to make the answer more convincing.', followUp: 'What metric would you use to prove that your fix improved the system?' }
      : await api(`/interviews/${interview.id}/answers`, { method: 'POST', body: JSON.stringify({ position, transcript, voiceMetrics: metrics() }) });
    $('overall').textContent = `Overall score: ${evaluation.overall}/100`;
    $('score-badge').textContent = evaluation.overall;
    $('scores').innerHTML = [['Technical', evaluation.technical], ['Communication', evaluation.communication], ['Confidence', evaluation.confidence], ['Grammar', evaluation.grammar]].map(([name, value]) => `<div>${name}<b>${value}</b></div>`).join('');
    $('feedback-text').textContent = evaluation.feedback;
    $('follow-up').textContent = evaluation.followUp;
    $('feedback').hidden = false;
    $('answer').disabled = false;
    $('answer').textContent = 'Answer recorded';
  } catch (error) {
    $('transcript').textContent = error.message;
    $('answer').disabled = false;
  }
}

async function beginInterview(form) {
  const data = new FormData(form);
  $('setup-error').textContent = '';
  $('start-form button[type=submit]').disabled = true;
  try {
    const result = await api('/interviews', { method: 'POST', body: data });
    interview = result;
    position = 0;
    showView('room');
    $('interview-title').textContent = `${data.get('role') || 'Technical'} · ${data.get('level') || 'mid'}-level`;
    renderQuestion();
    try {
      media = await startMedia($('camera'), event => api(`/interviews/${interview.id}/integrity-events`, { method: 'POST', body: JSON.stringify(event) }).catch(() => {}), state => {
        $('mic-status').textContent = `Microphone: ${state.mic ? 'active' : 'muted'}`;
        $('camera-status').textContent = `Camera: ${state.camera ? 'active' : 'disabled'}`;
        $('media-fallback').style.display = state.camera ? 'none' : 'grid';
      });
    } catch { $('mic-status').textContent = 'Microphone: unavailable'; $('camera-status').textContent = 'Camera: unavailable'; }
    stopIntegrity = monitorIntegrity(event => api(`/interviews/${interview.id}/integrity-events`, { method: 'POST', body: JSON.stringify(event) }).catch(() => {}));
  } catch (error) {
    $('setup-error').textContent = error.message || 'Could not start the interview.';
  } finally { $('start-form button[type=submit]').disabled = false; }
}

function showView(view) { document.querySelectorAll('.app-view').forEach(element => element.hidden = true); $(`${view}-view`).hidden = false; document.querySelectorAll('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.view === view)); window.scrollTo({ top: 0, behavior: 'smooth' }); }

async function loadHistory() {
  try {
    const rows = await api('/interviews');
    $('history-list').innerHTML = rows.length ? rows.map(item => { const profile = typeof item.profile === 'string' ? JSON.parse(item.profile) : item.profile; return `<div class="history-row"><strong>${profile.role || 'Interview'} · ${profile.level || ''}</strong><span>${new Date(item.created_at).toLocaleDateString()}</span><span class="score-mini">${item.overall_score ?? '—'}/100</span><span>${item.status}</span></div>`; }).join('') : '<div class="empty-history">No sessions yet. Start your first practice interview.</div>';
  } catch { $('history-list').innerHTML = '<div class="empty-history">Unable to load your history. Please sign in again.</div>'; }
}

async function authenticate(create) {
  $('auth-error').textContent = '';
  try {
    await api(`/auth/${create ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify({ email: $('email').value, password: $('password').value }) });
    demoMode = false;
    $('user-avatar').textContent = initials($('email').value);
    hideAuth(); showApp(); showView('setup');
  } catch (error) { $('auth-error').textContent = error.message; }
}

$('header-start').onclick = showAuth;
$('hero-start').onclick = showAuth;
$('results-start').onclick = showAuth;
$('close-auth').onclick = hideAuth;
$('auth-backdrop').onclick = hideAuth;
$('auth-form').onsubmit = async event => { event.preventDefault(); await authenticate(false); };
$('register').onclick = () => authenticate(true);
$('demo-login').onclick = () => { demoMode = true; hideAuth(); showApp(); $('user-avatar').textContent = 'DE'; showView('setup'); };
$('start-form').onsubmit = event => { event.preventDefault(); beginInterview(event.target); };
$('listen').onclick = () => { const q = interview?.questions?.[position]; if (q) speechSynthesis.speak(new SpeechSynthesisUtterance(q.prompt)); };
$('answer').onclick = () => recognition ? evaluate() : startRecognition();
$('next').onclick = () => { position++; recognition = null; if (position < interview.questions.length) renderQuestion(); else { media?.stop(); stopIntegrity?.(); showView('finish'); $('report').href = demoMode ? '#' : `/api/interviews/${interview.id}/report.pdf`; } };
$('new-session').onclick = () => { demoMode = false; $('start-form').reset(); showView('setup'); };
$('history-button').onclick = () => { showView('history'); loadHistory(); };
$('logout').onclick = async () => { try { await api('/auth/logout', { method: 'POST' }); } catch {} demoMode = false; showLanding(); };
document.querySelectorAll('.nav-button').forEach(button => button.onclick = () => button.dataset.view === 'history' ? (showView('history'), loadHistory()) : showView('setup'));
if (new URLSearchParams(location.search).has('demo')) { demoMode = true; showApp(); showView('setup'); }