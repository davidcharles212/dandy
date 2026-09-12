const questions = [
  { kicker:"Start with the feeling", text:"What would make today feel better?", sub:"Choose the experience you want most right now.", answers:[
    {label:"Calm, steady energy",icon:"☀",score:"energy",insightTitle:"Energy does not have to feel loud.",insight:"Dandy offers a plant-powered experience for people looking for a more measured kind of lift. The gummy format makes the serving clear and avoids another coffee or energy drink ritual."},
    {label:"Clearer focus",icon:"◎",score:"focus",insightTitle:"Sometimes you need better signal, not more volume.",insight:"Dandy is designed for moments when you want to feel engaged and dialed in. Its measured gummy format makes it easier to be intentional about the experience."},
    {label:"A brighter mood",icon:"✦",score:"mood",insightTitle:"A small shift can change the tone of a moment.",insight:"Some people explore Dandy when they want to feel more open, social, and present. Think of it as support for the moment, not a promise to manufacture a feeling."},
    {label:"To slow down and unwind",icon:"☾",score:"relax",insightTitle:"Unwinding is not the same as checking out.",insight:"Dandy can fit moments when the goal is to soften the edges of the day while remaining present. Context and serving matter, so always follow the product guidance."}
  ]},
  { kicker:"Your timing", text:"When do you usually need that shift?", sub:"The right experience should fit the moment around it.", answers:[
    {label:"At the start of the day",icon:"↗",score:"energy",insightTitle:"Set the tone without overcomplicating the ritual.",insight:"A measured gummy is portable and consistent, making it easier to understand what you are taking before a busy day begins."},
    {label:"During the afternoon dip",icon:"2:47",score:"focus",insightTitle:"The afternoon does not always need another coffee.",insight:"If caffeine feels too blunt for the moment, Dandy offers a different botanical format for approaching energy, focus, and mood."},
    {label:"Before something social",icon:"◌",score:"mood",insightTitle:"The goal can be presence, not intensity.",insight:"For social moments, many people are looking to feel engaged without making the experience the center of the occasion. A simple gummy keeps the ritual discreet."},
    {label:"When the day needs to quiet down",icon:"↓",score:"relax",insightTitle:"Your evening deserves a clear boundary.",insight:"A deliberate wind-down moment can help separate the pace of the day from what comes next. Dandy is one option to consider within a responsible routine."}
  ]},
  { kicker:"Your current routine", text:"What are you usually reaching for instead?", sub:"This helps us understand what you want to change.", answers:[
    {label:"Coffee, then more coffee",icon:"☕",score:"energy",insightTitle:"More caffeine is not always the same as better energy.",insight:"Mitragyna speciosa belongs to the same botanical family as coffee, but it is a different plant with a tradition and experience of its own."},
    {label:"Energy drinks",icon:"⚡",score:"focus",insightTitle:"The biggest jolt is not always the best fit.",insight:"Dandy is built around a measured serving and a simple gummy format, offering an alternative to oversized cans and complicated ingredient panels."},
    {label:"A drink to take the edge off",icon:"◇",score:"relax",insightTitle:"There are more ways to mark the end of a day.",insight:"Dandy gives adults another plant-based option to explore when the desired experience is feeling more relaxed and present."},
    {label:"Nothing consistent",icon:"…",score:"mood",insightTitle:"Clarity makes a routine easier to evaluate.",insight:"Dandy replaces unknown powders and vague scoops with a measured gummy, straightforward product guidance, and third-party testing."}
  ]},
  { kicker:"Your pace", text:"How do you want the experience to feel?", sub:"There is no prize for choosing the strongest answer.", answers:[
    {label:"Subtle and easy to stay present",icon:"1",score:"relax",insightTitle:"Feeling supported should still feel like you.",insight:"The point is not to feel absent or overwhelmed. Start with the product guidance and choose the experience that fits your setting and responsibilities."},
    {label:"Noticeable, but still balanced",icon:"2",score:"mood",insightTitle:"Intentional beats automatic.",insight:"Knowing what you want from the moment can help you approach any botanical more responsibly. Serving, timing, and individual response all matter."},
    {label:"I’m not sure yet",icon:"?",score:"focus",insightTitle:"Curiosity is a good reason to learn, not to rush.",insight:"Read the label, understand the ingredient, and begin only if the product fits your circumstances. A measured gummy makes that decision easier to navigate."}
  ]},
  { kicker:"What matters", text:"What matters most in the product itself?", sub:"Choose the quality that makes you most likely to use it intentionally.", answers:[
    {label:"A clear, measured serving",icon:"✓",score:"focus",insightTitle:"Consistency starts with knowing the serving.",insight:"Each Dandy gummy is made to provide a clearly measured experience, removing the guesswork associated with loose powders."},
    {label:"Convenience and portability",icon:"↝",score:"energy",insightTitle:"A routine works better when it fits real life.",insight:"The mixed berry gummy format travels easily and does not require brewing, mixing, or measuring on the go."},
    {label:"Ingredient transparency",icon:"◫",score:"mood",insightTitle:"Plant-based should never mean question-free.",insight:"Dandy identifies its botanical, provides product guidance, and uses third-party testing so adults can make a more informed decision."}
  ]},
  { kicker:"Picture the moment", text:"Where would Dandy fit most naturally?", sub:"Choose the setting where you want the experience to work for you.", answers:[
    {label:"At my desk or during a work block",icon:"▦",score:"focus",insightTitle:"Your best fit is something that works in the background.",insight:"For work blocks, the goal is not to make the product the event. Dandy’s measured gummy format is designed to fit a routine while you stay focused on the task."},
    {label:"While I’m out getting things done",icon:"↗",score:"energy",insightTitle:"You want momentum that travels with you.",insight:"A portable gummy can fit errands, projects, and active afternoons without brewing, mixing, or carrying another drink."},
    {label:"Around friends or at an event",icon:"◌",score:"mood",insightTitle:"You are looking for a more open, social moment.",insight:"Dandy may fit occasions when you want to feel upbeat and engaged while remaining clear and present with the people around you."},
    {label:"At home when the day is done",icon:"⌂",score:"relax",insightTitle:"Your match should help the day feel finished.",insight:"For evening moments, Dandy is positioned as a soft landing: an easier way to settle in without turning yourself off."}
  ]},
  { kicker:"Last question", text:"What are you most ready to leave behind?", sub:"This tells us what your ideal Dandy moment should replace.", answers:[
    {label:"The jittery, over-caffeinated feeling",icon:"≈",score:"energy",insightTitle:"You want a smooth lift, not more noise.",insight:"Your answers point toward Dandy as an alternative to the cycle of another coffee, then another. The goal is usable energy that fits the rest of your day."},
    {label:"The scattered afternoon slump",icon:"◎",score:"focus",insightTitle:"You want to feel dialed in again.",insight:"Your answers point toward a Dandy moment centered on steady focus and a clearer second wind through the afternoon."},
    {label:"Feeling flat or disconnected",icon:"✦",score:"mood",insightTitle:"You want the moment to feel a little brighter.",insight:"Your answers point toward Dandy’s upbeat side: feeling more engaged, social, and ready for what is in front of you."},
    {label:"Checking out just to unwind",icon:"↓",score:"relax",insightTitle:"You want a softer landing while staying present.",insight:"Your answers point toward Dandy’s unwinding side: easing into the evening without making absence the goal."}
  ]}
];

const results={
  energy:{badge:"THE STEADY LIFT",title:"More momentum, without another coffee ritual.",copy:"Your answers point toward a Dandy moment built around steady energy and forward motion. The measured gummy format may fit best when you want to get moving while staying intentional about the experience.",moment:"Morning or early afternoon",priority:"Calm, usable energy"},
  focus:{badge:"THE CLEAR SIGNAL",title:"Turn down the noise. Stay with what matters.",copy:"Your answers suggest that focus, not sheer stimulation, is the real priority. Dandy may fit the moments when you want to feel more engaged without automatically reaching for another caffeinated drink.",moment:"Work blocks and afternoon resets",priority:"Clear, directed attention"},
  mood:{badge:"THE BRIGHTER MOMENT",title:"A little more open, present, and ready for the moment.",copy:"Your answers point toward the mood side of the Dandy experience. Consider it for moments when you want to feel more engaged with what is happening around you, while keeping expectations grounded and intentional.",moment:"Social plans or a midday reset",priority:"A brighter, more present mood"},
  relax:{badge:"THE SOFTER LANDING",title:"Ease out of the day without checking out of it.",copy:"Your answers suggest that you are looking for a calmer transition. Dandy may fit moments when the goal is to slow the pace and remain present, with serving and setting chosen responsibly.",moment:"After responsibilities are handled",priority:"Relaxation with presence"}
};

let step=0, scores={energy:0,focus:0,mood:0,relax:0}, pendingInsight=null;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');window.scrollTo({top:0,behavior:'smooth'});}
function renderQuestion(){const q=questions[step];$('progressLabel').textContent=`Question ${step+1} of ${questions.length}`;$('progressBar').style.width=`${((step+1)/questions.length)*100}%`;$('questionKicker').textContent=q.kicker;$('questionText').textContent=q.text;$('questionSub').textContent=q.sub;$('answers').innerHTML='';if(pendingInsight){$('insightTitle').textContent=pendingInsight.title;$('insightText').textContent=pendingInsight.text;$('answerInsight').hidden=false}else{$('answerInsight').hidden=true;}q.answers.forEach(a=>{const b=document.createElement('button');b.className='answer';b.innerHTML=`<span class="answer-icon">${a.icon}</span><span>${a.label}</span>`;b.onclick=()=>choose(a);$('answers').appendChild(b);});}
function choose(a){scores[a.score]++;pendingInsight={title:a.insightTitle,text:a.insight};step++;step<questions.length?renderQuestion():finish();}
function finish(){const winner=Object.entries(scores).sort((a,b)=>b[1]-a[1])[0][0],r=results[winner],pdpUrl=`https://foreverdandy.com/products/mixed-berry-kratom-gummies?utm_source=meta&utm_medium=paid_social&utm_campaign=dandy_quiz&utm_content=${winner}_result`;$('resultBadge').textContent=r.badge;$('resultTitle').textContent=r.title;$('resultCopy').textContent=r.copy;$('resultMoment').textContent=r.moment;$('resultPriority').textContent=r.priority;$('solutionReason').textContent=`Based on your answers, Dandy is the best fit for ${r.priority.toLowerCase()} during ${r.moment.toLowerCase()}. It gives you one flexible gummy for the kind of moment you said you want most.`;$('shopBtn').href=pdpUrl;$('productCardLink').href=pdpUrl;show('result');}
$('restartBtn').onclick=()=>{step=0;scores={energy:0,focus:0,mood:0,relax:0};pendingInsight=null;show('quiz');renderQuestion();};
$('ageYes').onclick=()=>{$('ageGate').classList.add('hidden');renderQuestion();};
$('ageNo').onclick=()=>{$('ageMessage').textContent='Dandy is only available to adults 21 and older.';};

renderQuestion();
