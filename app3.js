let gameSeq = [];
let userSeq = [];

let btns = ["yellow", "red", "purple", "green"];

let started = false;
let level = 0;

let status = document.getElementById("status") || document.querySelector("h2");
let levelEl = document.getElementById("level");

// --- WebAudio for tones ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function ensureAudio() {
    if (!audioCtx) audioCtx = new AudioContext();
}

const freqMap = {
    red: 261.63, // C4
    yellow: 329.63, // E4
    green: 392.0, // G4
    purple: 523.25 // C5
};

function playTone(color, duration = 180) {
    try {
        ensureAudio();
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = 'sine';
        o.frequency.value = freqMap[color] || 300;
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        setTimeout(() => {
            g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02);
            setTimeout(() => o.stop(), 40);
        }, duration);
    } catch (e) {
        // Audio may be blocked by browser autoplay policies
        // ignore gracefully
    }
}

// Start button overlay
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('start-btn');
if (startBtn) startBtn.addEventListener('click', startGame);

document.addEventListener('keypress', function(event){
    const key = event.key.toLowerCase();
    if (!started){
        startGame();
    } else {
        // Handle button presses during game
        if(key === 'a') document.querySelector('#red').click();
        if(key === 's') document.querySelector('#yellow').click();
        if(key === 'd') document.querySelector('#green').click();
        if(key === 'f') document.querySelector('#purple').click();
    }
});

function gameFlash(color){
    // color is a string like 'red'
    const btn = document.querySelector(`.${color}`) || document.getElementById(color);
    if (!btn) return;
    btn.classList.add("flash");
    playTone(color);
    setTimeout(function(){
        btn.classList.remove("flash");
    },  250);
}

function userFlash(color){
    // color can be an element or string id/class
    let btn = null;
    if (typeof color === 'string') {
        btn = document.getElementById(color) || document.querySelector(`.${color}`);
    } else {
        btn = color;
    }
    if (!btn) return;
    btn.classList.add("userflash");
    playTone(btn.id || color);
    setTimeout(function(){
        btn.classList.remove("userflash");
    },  250);
}

function leveUp(){
    userSeq = [];
    level++;
    if (levelEl) levelEl.innerText = level;
    if (status) status.innerText = `Level ${level}`;

    let randIdx = Math.floor(Math.random()*4);
    let randColor = btns[randIdx];
    gameSeq.push(randColor);
    console.log(gameSeq);
    // flash the new color
    gameFlash(randColor);
}


function  checkAns(idx){
   if (userSeq[idx]===gameSeq[idx]){
     if(userSeq.length==gameSeq.length){
        setTimeout(leveUp,1000);
    }
   } else{
       const msg = `Game Over! Your score was ${level}.`;
       if (status) status.innerHTML = msg;
       // flash body color briefly
       document.body.style.backgroundColor = "#ff6b6b";
       setTimeout(function(){
           document.body.style.backgroundColor = "";
       },150);
       // show overlay with restart
       if (overlay){
           const overlayMsg = document.getElementById('overlay-message');
           if (overlayMsg) overlayMsg.innerText = `${msg} Press Restart or any key to play again.`;
           const startText = document.getElementById('start-btn');
           if (startText) startText.innerText = 'Restart';
           overlay.style.display = 'flex';
       }
       reset();
   }
}


function btnPress(){
    //console.log(this);
    let btn=this;
    const userColor = btn.getAttribute("id");
    userFlash(userColor);
    userSeq.push(userColor);
    checkAns(userSeq.length-1);
}

let allBtns=document.querySelectorAll(".btn");
for(btn of allBtns){
    btn.addEventListener("click", btnPress);
}

function startGame(){
    // resume audio context on user gesture
    try { ensureAudio(); if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch(e){}
    if (overlay) overlay.style.display = 'none';
    if (!started) {
        started = true;
        leveUp();
    }
    if (status) status.innerText = `Level ${level}`;
}

function reset(){
    started=false;
    gameSeq=[];
    userSeq=[];
    level=0;
}
