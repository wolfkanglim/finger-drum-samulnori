const audioCtx = new AudioContext();
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
}
drawImages();


////pads  pad sound//////
const pads = document.querySelectorAll('.pad');
pads.forEach((pad) => {
    pad.addEventListener('mousedown', () => playSound(pad));
})

function playSound(pad){
    let padSound = document.getElementById(pad.dataset.sound);
    padSound.crossOrigin = "anonymous";
    padSound.currentTime = 0;
    padSound.volume = 0.5;
    padSound.play();
    pad.classList.add('playing');
    pad.addEventListener('mouseup', () => {
        pad.classList.remove('playing');
    })
    if(audioSourceNode){
        audioSourceNode.disconnect();
      }          
    audioSource = audioCtx.createMediaElementSource(padSound);
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

