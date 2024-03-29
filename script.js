const audioCtx = new AudioContext();
unlockAudioContext(audioCtx);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const volume = document.getElementById('volume');
const bass = document.getElementById('bass');
const mid = document.getElementById('mid');
const treb = document.getElementById('treb');

let audioSource;
let analyser;
const gainNode = new GainNode(audioCtx, {gain:volume.value});
const bassEQ = new BiquadFilterNode(audioCtx, {
    type: "lowshelf",
    frequency: 1000,
    gain: bass.value
})
const midEQ = new BiquadFilterNode(audioCtx, {
    type: "peaking",
    Q: Math.SQRT1_2,
    frequency: 1500,
    gain: mid.value
})
const trebEQ = new BiquadFilterNode(audioCtx, {
    type: "highshelf",
    frequency: 3000,
    gain: treb.value
})

///to fix unlock
function unlockAudioContext(audioCtx) {
  if (audioCtx.state !== 'suspended') return;
  const b = document.body;
  const events = ['touchstart','touchend', 'mousedown','keydown'];
  events.forEach(e => b.addEventListener(e, unlock, false));
  function unlock() { audioCtx.resume().then(clean); }
  function clean() { events.forEach(e => b.removeEventListener(e, unlock)); }
}

/////Images and Texts/////
function drawImages(){
    const imgSamulnori = document.getElementById('img-samulnori');
    ctx.drawImage(imgSamulnori, canvas.width - 85, 21, 84, canvas.height - 12);
    const img3taeguk = document.getElementById('img-3taeguk');
    ctx.drawImage(img3taeguk, canvas.width /2 -10, canvas.height /2 -15, 20, 30);
    ctx.fillStyle = 'white';
    ctx.font = '26px Arial';
    ctx.fillText('사물놀이', 8, 70);
    ctx.font = '14px Arial';
    ctx.fillText('Korean Traditional Percussion Instruments', 5, 12);
      ctx.font = '10px Arial';
    ctx.fillText('WONDROUS EAST  2022  WolfkangLim', 15, canvas.height -2);
}
drawImages();


/////set viewport height//////
function setViewportHeight() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}
setViewportHeight();
window.addEventListener('resize', setViewportHeight)

window.addEventListener('orientationchange', setViewportHeight);
    


////pads  pad sound//////
const pads = document.querySelectorAll('.pad');
pads.forEach((pad) => {
    pad.addEventListener('mousedown', function(e){
       e.preventDefault();
       e.stopPropagation();
        playSound(pad);
    })
    pad.addEventListener('touchstart', function(e){
        e.preventDefault();
        e.stopPropagation();
        playSound(pad);
    })
})

var MEDIA_ELEMENT_NODES = new WeakMap();
function playSound(pad){
     if (audioCtx.state === "suspended") {
            audioCtx.resume();
            audioCtx.state = "running";
          }
    let padSound = document.getElementById(pad.dataset.sound);
    //padSound.preload = "auto";
    padSound.currentTime = 0;
    padSound.volume = 0.8;
    padSound.play();
    pad.classList.add('playing');
    padSound.onended = function(){
        pad.classList.remove('playing');
    }
//     pad.addEventListener('mouseup', () => {
//         pad.classList.remove('playing');
//     })
    if (MEDIA_ELEMENT_NODES.has(padSound)) {
        audioSource = MEDIA_ELEMENT_NODES.get(padSound);
      } else {
        audioSource = audioCtx.createMediaElementSource(padSound);
        MEDIA_ELEMENT_NODES.set(padSound, audioSource);
      }   
     //audioSource = audioCtx.createMediaElementSource(padSound);
    //audioSource.crossOrigin = "anonymous";
    if(analyser){
        analyser.disconnect();
      }     
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    audioSource.connect(bassEQ);
    bassEQ.connect(midEQ);
    midEQ.connect(trebEQ);
    trebEQ.connect(gainNode);
    gainNode.connect(analyser);    
    analyser.connect(audioCtx.destination);    

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);    

    const barWidth = canvas.width / bufferLength;
    let x;
    let barHeight;

    function setupEvents(e){
        
            volume.addEventListener('input', e => {
            const value = parseFloat(e.target.value);
            gainNode.gain.setTargetAtTime(value, audioCtx.currentTime, .01);
        })

        bass.addEventListener('input', e => {
            const value = parseInt(e.target.value);
            bassEQ.gain.setTargetAtTime(value, audioCtx.currentTime, .01);
        })

        mid.addEventListener('input', e => {
            const value = parseInt(e.target.value);
            midEQ.gain.setTargetAtTime(value, audioCtx.currentTime, .01);
        })
        
        treb.addEventListener('input', e => {
            const value = parseInt(e.target.value);
            trebEQ.gain.setTargetAtTime(value, audioCtx.currentTime, .01);
        })       
    }
/* 
    function drawVisualizer(){
        x = 0;
        ctx.clearRect(0,0,canvas.width,canvas.height);
       drawImages();
        analyser.getByteFrequencyData(dataArray);
        for(let i = 0; i < bufferLength; i++){
            barHeight = dataArray[i] / 2;

            //draw visualizer
            const h = i * barHeight / 5;
            const s = 90;
            const l = 50;
            ctx.fillStyle = 'white';
             ctx.fillRect(x + 10, canvas.height - barHeight - 5, barWidth, 5);
            ctx.fillStyle = 'hsl('+ h +' , '+ s +'%, '+ l +'%)';
            ctx.fillRect(x + 10, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth;
        }
        requestAnimationFrame(drawVisualizer); 
    }
    drawVisualizer(); */

/////circle visualizer/////
    function drawVisualizerCircle(){
        x = 0;
        ctx.clearRect(0,0,canvas.width,canvas.height);
       drawImages();
        analyser.getByteFrequencyData(dataArray);
        for(let i = 0; i < bufferLength; i++){
            barHeight = dataArray[i] / 3;

            //draw visualizer
            ctx.save();
            ctx.translate(canvas.width /2, canvas.height /2);
            ctx.rotate(i * Math.PI * 4 / bufferLength);
            const h = i * barHeight / 5;
            const s = 90;
            const l = 50;            
            ctx.fillStyle = 'hsl('+ h +' , '+ s +'%, '+ l +'%)';
            ctx.fillRect(0, 0, barWidth, barHeight);
            x += barWidth;
            ctx.restore();
        }
        requestAnimationFrame(drawVisualizerCircle); 
    }
    drawVisualizerCircle();
    setupEvents();
}
