

const songNewDivide = new Song(
    './resources/new-divide/02NewDivide(Live).mp3', 

    // Animation Manager - All the animated drawings + animation cues for this song

    new AnimationManager([

        // All animation cues
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
            "drums": (anim) => { anime({ targets: anim, transparency: 0, round: 1 }); },  // stop rotate, hide the rotation
            "guitar": (anim) => anime({ targets: anim, transparency: 51, round: 1 }) , 
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
    ], 
    
    // All animated Drawings
    {
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
    
            const audioArray = getTimeDataArray();
            let height = 0.0;
            for(let i = 0.0; i < 1.0; i += (1/anim.N)) {
                let index = Math.round(i * audioArray.length / anim.N);
                height += 150 * Math.abs(audioArray[index]);
                ctx.beginPath();
                ctx.ellipse(anim.X, anim.Y - height, anim.size * (1.0 - i), anim.flatHeight * (1.0 - i), 0, 0, 2*Math.PI);
                ctx.closePath();
                ctx.stroke();
            }
        }, (bassDrumsAnim) => {
            bassDrumsAnim.N = 10.0;
            bassDrumsAnim.X = WIDTH * 0.5; bassDrumsAnim.Y = HEIGHT * 0.9;
            bassDrumsAnim.frequency = 2;
            bassDrumsAnim.transparency = 75;
            bassDrumsAnim.size = Math.min(WIDTH, HEIGHT) / 4;
            bassDrumsAnim.flatHeight = bassDrumsAnim.size / 15;
            bassDrumsAnim.enabled = false;
        })
    })
    , 
    // All Static Drawings
    { 
        "spectrogram": new StaticDrawing((ctx, drawing) => {
            const audioArray = getTimeDataArray();
            for (let i = 0, x = drawing.barWidth; i < drawing.bufferLength; i++, x += drawing.barWidth) {
        
                let barHeight = 2000 * audioArray[i]; // 0 - 255
        
                ctx.fillStyle = `rgb(${barHeight}, 10, ${128 - barHeight/2})`;
                ctx.fillRect(WIDTH - x, HEIGHT - barHeight/2, drawing.barWidth, barHeight);
            }
        }, (sgm) => {
            sgm.bufferLength = getTimeDataArray().length;
            sgm.enabled = true;
            sgm.barWidth = (WIDTH / sgm.bufferLength) * 2.0;
        }),
        
        "logo":  new StaticDrawing((ctx, drawing) => {
            ctx.drawImage(drawing.image, drawing.X, drawing.Y, drawing.width, drawing.height);
        }, (logo) => {
            let bannerDimension = Math.min(WIDTH/2, HEIGHT/2);
            logo.image = new Image();
            logo.X = WIDTH/2 - bannerDimension/2 - 140;
            logo.Y = HEIGHT/2 - bannerDimension/2;
            logo.width = bannerDimension+140;
            logo.height = bannerDimension;
            logo.image.src = "./resources/new-divide/linkin-park-logo.svg";
            logo.image.onload = () => { logo.enabled = true; }
        }),
    
        "chester":  new StaticDrawing((ctx, drawing) => {
            ctx.drawImage(drawing.image, drawing.X, drawing.Y);
        }, (chester) => {
            chester.image = new Image();
            chester.X = 0;
            chester.Y = 0;
            chester.image.src = "./resources/new-divide/chester-bennington.png";
            chester.image.onload = () => { chester.enabled = true; }
        })
    
    }
);

// Register this song
allSongs.push(songNewDivide);

// Load the song audio into memory
songNewDivide.load();
