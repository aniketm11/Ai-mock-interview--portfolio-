const QUESTION_BANK={
  "Cloud / AWS":[
    "Explain how you would design a highly available web application on AWS.",
    "What is the difference between an Application Load Balancer and a Network Load Balancer?",
    "How would you secure an EC2-based application using IAM, security groups and least privilege?",
    "Explain VPC public and private subnets and how traffic moves between them.",
    "How would you design a backup and disaster-recovery strategy for an AWS application?",
    "A production EC2 server is running out of disk space. How would you investigate and fix it?"
  ],
  "DevOps":[
    "What problem does CI/CD solve and how would you design a basic pipeline?",
    "Explain Docker images, containers and volumes with a practical example.",
    "How would you monitor an application running in production?",
    "What is Infrastructure as Code and why is it useful?",
    "How would you perform a zero-downtime deployment?",
    "A deployment succeeded but the application is returning 500 errors. What do you check first?"
  ],
  "Software Engineering":[
    "Explain the difference between authentication and authorization.",
    "How would you design a REST API for a simple interview application?",
    "What is the purpose of database indexing and what are its trade-offs?",
    "Explain one software design pattern you have used or studied.",
    "How do you debug a slow API request?",
    "How would you make a web application reliable and maintainable as usage grows?"
  ],
  "Data / AI":[
    "Explain the difference between supervised and unsupervised learning.",
    "How would you evaluate a classification model?",
    "What is overfitting and how can you reduce it?",
    "Explain precision, recall and F1 score with an example.",
    "How would you deploy a machine-learning model for inference?",
    "What challenges can occur when building an AI system that evaluates text answers?"
  ],
  "HR / General":[
    "Tell me about yourself and your technical background.",
    "Describe a project you are proud of and the problem it solved.",
    "Tell me about a difficult technical problem you faced and how you solved it.",
    "How do you learn a technology you have never used before?",
    "Describe a situation where you received critical feedback.",
    "Why are you interested in this role?"
  ]
};

const state={questions:[],index:0,answers:[],startedAt:0,answerStartedAt:0,answerTimer:null,media:null,recognition:null,profile:null,mode:"Text"};
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);

function scrollToSetup(){ $("#setup").scrollIntoView({behavior:"smooth"}); }
$$('[data-start]').forEach(b=>b.addEventListener('click',scrollToSetup));

function wordCount(text){return text.trim()?text.trim().split(/\s+/).length:0;}
function formatTime(seconds){const m=String(Math.floor(seconds/60)).padStart(2,'0');const s=String(seconds%60).padStart(2,'0');return `${m}:${s}`;}
function setAnswerTimer(){clearInterval(state.answerTimer);state.answerStartedAt=Date.now();state.answerTimer=setInterval(()=>{$('#answer-time').textContent=formatTime(Math.floor((Date.now()-state.answerStartedAt)/1000));},1000);}
function stopAnswerTimer(){clearInterval(state.answerTimer);state.answerTimer=null;}
function updateWordCount(){$('#word-count').textContent=wordCount($('#answer-input').value);}
$('#answer-input').addEventListener('input',updateWordCount);

function renderQuestionList(){
  $('#question-list').innerHTML=state.questions.map((_,i)=>`<li class="${i===state.index?'active':''}" data-q="${i}">Question ${i+1}${state.answers[i]?' · '+state.answers[i].score:''}</li>`).join('');
}
function renderQuestion(){
  const q=state.questions[state.index];
  $('#question-count').textContent=`QUESTION ${state.index+1} / ${state.questions.length}`;
  $('#progress-bar').style.width=`${(state.index/state.questions.length)*100}%`;
  $('#question-tag').textContent=`${state.profile.domain.toUpperCase()} · ${state.profile.level.toUpperCase()}`;
  $('#question-text').textContent=q;
  $('#answer-input').value='';
  $('#word-count').textContent='0';
  $('#answer-time').textContent='00:00';
  $('#answer-mode').textContent='Text';
  $('#voice-state').textContent='Voice idle';
  $('#feedback').hidden=true;
  $('#submit-answer').hidden=false;
  $('#next-question').textContent=state.index===state.questions.length-1?'Finish Interview →':'Next Question →';
  renderQuestionList();
  setAnswerTimer();
}

function startInterview(data){
  state.profile=data;
  state.questions=[...QUESTION_BANK[data.domain]].sort(()=>Math.random()-.5);
  state.index=0;state.answers=[];state.startedAt=Date.now();
  $('#session-title').textContent=`${data.role} · ${data.level}`;
  $('#interview').hidden=false;
  $('#setup').hidden=true;
  renderQuestion();
  $('#interview').scrollIntoView({behavior:'smooth'});
}

$('#setup-form').addEventListener('submit',e=>{e.preventDefault();startInterview(Object.fromEntries(new FormData(e.currentTarget)));});

function calculateScore(answer,q){
  const words=wordCount(answer);
  const lower=answer.toLowerCase();
  const keywords=q.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>4);
  const hits=keywords.filter(k=>lower.includes(k)).length;
  const relevance=Math.min(100,45+hits*8+(words>35?15:words>15?8:0));
  const structure=Math.min(100,40+(answer.includes('.')?10:0)+(answer.includes(',')?5:0)+(words>60?20:words>30?12:0));
  const detail=Math.min(100,35+(words>80?35:words>45?25:words>20?15:0)+Math.min(20,hits*3));
  const clarity=Math.min(100,55+(words>20?15:0)+(lower.includes('because')?8:0)+(lower.includes('for example')?8:0));
  const completeness=Math.min(100,40+(words>90?35:words>55?25:words>25?15:0));
  const overall=Math.round((relevance+structure+detail+clarity+completeness)/5);
  return {overall,relevance,structure,detail,clarity,completeness,words};
}

function showFeedback(score){
  $('#feedback').hidden=false;$('#submit-answer').hidden=true;$('#progress-bar').style.width=`${((state.index+1)/state.questions.length)*100}%`;
  $('#session-score').textContent=score.overall;
  $('#feedback-score').textContent=score.overall;
  $('#feedback-title').textContent=score.overall>=80?'Strong practice answer':score.overall>=60?'Good foundation':'Needs more detail';
  $('#score-grid').innerHTML=[['Relevance',score.relevance],['Structure',score.structure],['Detail',score.detail],['Clarity',score.clarity],['Completeness',score.completeness]].map(([n,v])=>`<div><small>${n}</small><b>${v}/100</b></div>`).join('');
  const tip=score.words<25?'Try a longer answer with a clear situation, approach and result.':score.detail<65?'Add concrete technical details, examples and trade-offs.':score.structure<65?'Use a simple structure: problem → approach → implementation → result.':'Good structure. Add one concrete example to make the answer stronger.';
  $('#feedback-text').textContent=tip;
  stopAnswerTimer();
}

$('#submit-answer').addEventListener('click',()=>{
  const answer=$('#answer-input').value.trim();
  if(answer.length<3){$('#answer-input').focus();return;}
  const score=calculateScore(answer,state.questions[state.index]);
  state.answers[state.index]={answer,score};
  renderQuestionList();showFeedback(score);
});

$('#next-question').addEventListener('click',()=>{
  if(state.index===state.questions.length-1){finishInterview();return;}
  state.index++;renderQuestion();
});

function finishInterview(){
  stopAnswerTimer();
  const total=state.answers.reduce((a,x)=>a+(x?.score?.overall||0),0);
  const overall=Math.round(total/state.questions.length);
  const session={name:state.profile.name,role:state.profile.role,domain:state.profile.domain,level:state.profile.level,score:overall,questions:state.questions.length,date:new Date().toLocaleString()};
  const history=JSON.parse(localStorage.getItem('mockInterviewHistory')||'[]');
  history.unshift(session);localStorage.setItem('mockInterviewHistory',JSON.stringify(history.slice(0,20)));
  if(state.media){state.media.getTracks().forEach(t=>t.stop());state.media=null;}
  $('#interview').hidden=true;$('#setup').hidden=false;renderHistory();
  $('#history').scrollIntoView({behavior:'smooth'});
}

$('#end-session').addEventListener('click',()=>{if(confirm('End this practice session? Your current answers will not be saved.')){stopAnswerTimer();if(state.media){state.media.getTracks().forEach(t=>t.stop());state.media=null;}$('#interview').hidden=true;$('#setup').hidden=false;scrollToSetup();}});

$('#camera-button').addEventListener('click',async()=>{
  if(!navigator.mediaDevices?.getUserMedia){alert('Camera access is not supported by this browser.');return;}
  try{state.media=await navigator.mediaDevices.getUserMedia({video:true,audio:true});$('#camera').srcObject=state.media;$('#camera').style.display='block';$('#camera-placeholder').style.display='none';$('#camera-state').textContent='Camera + mic active';$('#camera-button').textContent='Camera Enabled';}catch(err){$('#camera-state').textContent='Permission denied';alert('Camera/microphone permission was not granted. You can continue with text practice.');}
});

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SpeechRecognition){
  state.recognition=new SpeechRecognition();state.recognition.continuous=false;state.recognition.interimResults=true;state.recognition.lang='en-US';
  state.recognition.onstart=()=>{$('#voice-state').textContent='Listening…';$('#mic-button').textContent='⏹ Stop Voice Answer';state.mode='Voice';$('#answer-mode').textContent='Voice';};
  state.recognition.onresult=e=>{$('#answer-input').value=Array.from(e.results).map(r=>r[0].transcript).join(' ');updateWordCount();};
  state.recognition.onend=()=>{$('#voice-state').textContent='Voice idle';$('#mic-button').textContent='🎙 Start Voice Answer';setAnswerTimer();};
  state.recognition.onerror=()=>{$('#voice-state').textContent='Voice unavailable';$('#mic-button').textContent='🎙 Start Voice Answer';};
  $('#mic-button').addEventListener('click',()=>{try{if($('#voice-state').textContent==='Listening…')state.recognition.stop();else{state.recognition.start();setAnswerTimer();}}catch(e){}});
}else{$('#mic-button').disabled=true;$('#voice-state').textContent='Speech recognition not supported';}

function renderHistory(){
  const history=JSON.parse(localStorage.getItem('mockInterviewHistory')||'[]');
  $('#history-list').innerHTML=history.length?history.map(h=>`<div class="history-item"><div><strong>${escapeHtml(h.role)} · ${escapeHtml(h.level)}</strong><small>${escapeHtml(h.name)} · ${escapeHtml(h.domain)} · ${escapeHtml(h.date)}</small></div><strong class="history-score">${h.score}/100</strong></div>`).join(''):'<div class="empty">No completed sessions yet.</div>';
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
$('#clear-history').addEventListener('click',()=>{localStorage.removeItem('mockInterviewHistory');renderHistory();});
renderHistory();
