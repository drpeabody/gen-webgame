
source = null;
analyser = null;

canvas = document.getElementById("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
canvasCtx = canvas.getContext("2d");
WIDTH = canvas.width;
HEIGHT = canvas.height;

window.onload = () => {
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser();
    source = audioCtx.createBufferSource();
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
};

let spectrogram = new StaticDrawing((ctx, drawing) => {

    for (let i = 0, x = drawing.barWidth; i < drawing.bufferLength; i++, x += drawing.barWidth) {
        // Smooth the curve over time
        drawing.firstHeightDerivative[i] += (drawing.dataArray[i] - drawing.firstHeightDerivative[i]) * 0.1;
        drawing.currentHeightArray[i] += (drawing.firstHeightDerivative[i] - drawing.currentHeightArray[i]) * 0.1;

        let barHeight = 2000 * drawing.currentHeightArray[i]; // 0 - 255

        ctx.fillStyle = `rgb(${barHeight}, 10, ${128 - barHeight/2})`;
        ctx.fillRect(WIDTH - x, HEIGHT - barHeight/2, drawing.barWidth, barHeight);
    }
});
spectrogram.bufferLength = 256;
spectrogram.currentHeightArray = new Float32Array(spectrogram.bufferLength);
spectrogram.firstHeightDerivative = new Float32Array(spectrogram.bufferLength);
spectrogram.dataArray = new Float32Array(spectrogram.bufferLength);
spectrogram.enabled = true;
spectrogram.barWidth = (WIDTH / spectrogram.bufferLength) * 2.0;

const ANIMATION_MANAGER = new AnimationManager([
    // map of millesconds to event
    new Cue( 12713, { 
        "bass-drums": (anim) => { anim.enabled = true; anime({ targets: anim, frequency: 10, transparency: 255, round: 1 }) }
    }),
    new Cue( 21090, { "guitar": (anim) => anime({ targets: anim, transparency: 220, round: 1 })  }),
    new Cue( 36600, { 
        "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 }) , 
        "bass-drums": (anim) => {
            anime({ targets: anim, frequency: 2, transparency: 75, round: 1});
        }
    }),
    new Cue( 61475, { 
        "bass-drums": (anim) => anime({ targets: anim, frequency: 10, transparency: 255, round: 1 }) 
    }),
    new Cue( 69450, { // First chorus
         "drums": (anim) => { 
            anim.enabled = true; 
            anime({ targets: anim, transparency: 255, round: 1 } ) 
        }, 
         "guitar": (anim) => anime({ targets: anim, transparency: 220, round: 1 })  
    }),
    new Cue( 110610, { 
        "drums": (anim) => {anime({ targets: anim, transparency: 0, round: 1 } ) }, 
        "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 })  
    }),
    new Cue( 142740, { "guitar": (anim) => anime({ targets: anim, transparency: 220, round: 1 })  }),
    new Cue( 160000, { // guitar solo
        "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 }) , 
        "bass-drums": (anim) => anime({ targets: anim, frequency: 2, transparency: 75, round: 1}), 
        "drums": (anim) => { anime({ targets: anim, transparency: 0, round: 1 } ) } 
    }),
    new Cue( 167100, { 
        "guitar": (anim) => anime({ targets: anim, transparency: 220, round: 1 }) , 
        "bass-drums": (anim) => anime({ targets: anim, frequency: 10, transparency: 255, round: 1 })
    }),
    new Cue( 174000, { "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 })  }),
    new Cue( 175500, { 
        "guitar": (anim) => anime({ targets: anim, transparency: 220, round: 1 }),
        "drums": (anim) => { 
            anime({ targets: anim, transparency: 255, round: 1 });
            anim.rotating = true;
        }  // rotate
    }), 
    new Cue( 199635, { 
        "drums": (anim) => { anime({ targets: anim, transparency: 0, round: 1 }); }, 
        "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 }) ,  // stop rotate
        "bass-drums": (anim) => anime({ targets: anim, frequency: 2, transparency: 75, round: 1}) 
    }),
    new Cue( 215880, { 
        "guitar": (anim) => anime({ targets: anim, transparency: 220, round: 1 }) , 
        "bass-drums": (anim) => anime({ targets: anim, frequency: 10, transparency: 255, round: 1 }),
        "drums": (anim) => { 
            anime({ targets: anim, transparency: 255, round: 1 } ); 
            anim.rotating = false;
            anime({ targets: anim, deltaTheta: Math.PI/75.0, duration: 15000, loop: 2, direction: 'alternate', easing: 'linear' });
        } 
    }),
    new Cue( 248410, { 
        "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 }),
        "bass-drums": (anim) => anime({ targets: anim, frequency: 2, transparency: 75, round: 1}), 
    }),
    new Cue( 252425, { "drums": (anim) => anime({ targets: anim, transparency: 0, round: 1 } ) } )
], {
    "drums": new AnimatedDrawing(1000, (ctx, anim) => {
        let deltaTheta = anim.deltaTheta;
        ctx.fillStyle = "#ff0000" + utilShortNumberTo2DigitHex(anim.transparency);
        let phase = 0;
        if(anim.rotating) phase = 2 * deltaTheta * Math.sin(anim.phase);

        for(let theta = anim.startingAngle; theta < anim.endingAngle; theta += 2 * deltaTheta) {
            let cosTheta = Math.cos(theta + phase);
            let sinTheta = Math.sin(theta + phase);
            let cosNextTheta = Math.cos(theta + deltaTheta + phase);
            let sinNextTheta = Math.sin(theta + deltaTheta + phase);
            ctx.beginPath();
            ctx.moveTo(anim.originCircleCentreX + anim.originCircleRadius * cosTheta, anim.originCircleCentreY - anim.originCircleRadius * sinTheta);
            ctx.lineTo(anim.originCircleCentreX + anim.originCircleCentreY * (cosTheta / sinTheta), 0);
            ctx.lineTo(anim.originCircleCentreX + anim.originCircleCentreY * (cosNextTheta / sinNextTheta), 0);
            ctx.lineTo(anim.originCircleCentreX + anim.originCircleRadius * cosNextTheta, anim.originCircleCentreY - anim.originCircleRadius * sinNextTheta);
            ctx.lineTo(anim.originCircleCentreX + anim.originCircleRadius * cosTheta, anim.originCircleCentreY - anim.originCircleRadius * sinTheta);
            ctx.closePath();
            ctx.fill();
        }
        if(anim.rotating) anim.phase += 0.075 / (Math.PI);

    }, (drumsAnim) => {
        drumsAnim.transparency = 0;
        drumsAnim.startingAngle = Math.PI / 8;
        drumsAnim.endingAngle = Math.PI - Math.PI / 8;
        drumsAnim.originCircleCentreX = WIDTH / 2;
        drumsAnim.originCircleCentreY = HEIGHT / 2;
        drumsAnim.originCircleRadius = Math.min(WIDTH, HEIGHT) / 4;
        drumsAnim.enabled = false;
        drumsAnim.rotating = false;
        drumsAnim.deltaTheta = Math.PI / 20.0;
        drumsAnim.phase = 0;
    }),
    "guitar": new AnimatedDrawing( 1000, (ctx, guitarAnim) => {
        ctx.fillStyle = (guitarAnim.getCurrentAnimationPos() < 0.5) 
            ? `#b100ff${utilShortNumberTo2DigitHex(guitarAnim.transparency)}` 
            : `#2211ff${utilShortNumberTo2DigitHex(guitarAnim.transparency)}`;
        ctx.beginPath();
        ctx.moveTo(WIDTH * 0.85, HEIGHT);
        ctx.lineTo(WIDTH * 0.875, 0);
        ctx.lineTo(WIDTH * 0.8, 0);
        ctx.lineTo(WIDTH * 0.85, HEIGHT);
        ctx.lineTo(WIDTH * 0.775, 0);
        ctx.lineTo(WIDTH * 0.7, 0);
        ctx.lineTo(WIDTH * 0.85, HEIGHT);
        ctx.lineTo(WIDTH * 0.675, 0);
        ctx.lineTo(WIDTH * 0.6, 0);
        ctx.lineTo(WIDTH * 0.85, HEIGHT);

        ctx.moveTo(WIDTH * 0.15, HEIGHT);
        ctx.lineTo(WIDTH * 0.375, 0);
        ctx.lineTo(WIDTH * 0.3, 0);
        ctx.lineTo(WIDTH * 0.15, HEIGHT);
        ctx.lineTo(WIDTH * 0.275, 0);
        ctx.lineTo(WIDTH * 0.2, 0);
        ctx.lineTo(WIDTH * 0.15, HEIGHT);
        ctx.lineTo(WIDTH * 0.175, 0);
        ctx.lineTo(WIDTH * 0.1, 0);
        ctx.lineTo(WIDTH * 0.15, HEIGHT);
        ctx.closePath();
        ctx.fill();
    }, 
    (guitarAnim) => {
        guitarAnim.transparency = 0;
        guitarAnim.enabled = true;
    }),
    "bass-drums": new AnimatedDrawing(2000, (ctx, anim) => {
        ctx.strokeStyle = (Math.floor(anim.getCurrentAnimationPos() * anim.frequency) % 2 === 0) 
            ? "#ff2288" 
            : "#8800ff" ;
        ctx.strokeStyle += utilShortNumberTo2DigitHex(anim.transparency);

        let N = 10.0;
        let height = 0.0;
        for(let i = 0.0; i < 1.0; i += (1.0/N)) {
            let index = Math.round(i * bufferLength / N);
            height += 200 * Math.abs(spectrogram.currentHeightArray[index]);
            ctx.beginPath();
            ctx.ellipse(anim.X, anim.Y - height, anim.size * (1.0 - i), anim.flatHeight * (1.0 - i), 0, 0, 2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }, (bassDrumsAnim) => {
        bassDrumsAnim.X = WIDTH * 0.5; bassDrumsAnim.Y = HEIGHT * 0.9;
        bassDrumsAnim.frequency = 2;
        bassDrumsAnim.transparency = 75;
        bassDrumsAnim.size = Math.min(WIDTH, HEIGHT) / 4;
        bassDrumsAnim.flatHeight = bassDrumsAnim.size / 15;
        bassDrumsAnim.enabled = false;
    })
});


let logo = new StaticDrawing((ctx, drawing) => {
    ctx.drawImage(drawing.image, drawing.X, drawing.Y, drawing.width, drawing.height);
});
let bannerDimension = Math.min(WIDTH/2, HEIGHT/2);
logo.image = new Image();
logo.X = WIDTH/2 - bannerDimension/2 - 140;
logo.Y = HEIGHT/2 - bannerDimension/2;
logo.width = bannerDimension+140;
logo.height = bannerDimension;
logo.image.src = "./resources/linkin-park-logo.svg";
logo.image.onload = () => { logo.enabled = true; }

let chester = new StaticDrawing((ctx, drawing) => {
    ctx.drawImage(drawing.image, drawing.X, drawing.Y);
});
chester.image = new Image();
chester.X = 0;
chester.Y = 0;
chester.image.src = "./resources/chester-bennington.png";
chester.image.onload = () => { chester.enabled = true; }


function draw() {

    // Draw background
    analyser.getFloatTimeDomainData(spectrogram.dataArray);
    canvasCtx.fillStyle = "#110418";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw Musical Animations and Elements
    ANIMATION_MANAGER.drawAndUpdate(canvasCtx, Date.now());

    spectrogram.drawAndUpdate(canvasCtx);
    logo.drawAndUpdate(canvasCtx);
    chester.drawAndUpdate(canvasCtx);

    requestAnimationFrame(draw);
};

loadFirstSong = () => {
    
    //set the audio file's URL
    var audioURL = './resources/02NewDivide(Live).mp3';

    //creating a new request
    var request = new XMLHttpRequest();
    request.open('GET', audioURL, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        //take the audio from http request and decode it in an audio buffer
        audioCtx.decodeAudioData(request.response, function (buffer) {
            analyser.fftSize = spectrogram.bufferLength;
            //passing in data
            source.buffer = buffer;
            //start playing
            source.start(0);
            ANIMATION_MANAGER.start();
            
            draw();
        });
    };
    request.send();
}