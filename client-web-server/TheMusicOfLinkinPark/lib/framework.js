
utilShortNumberTo2DigitHex = (number) => {
    return Math.min(Math.max(number, 0), 255).toString(16);
}

// Off Screen Canvas Cache Feature
let utilOffScreenCanvas = undefined;
utilGetOrCreateOffScreenCanvas = () => {
    if(!utilOffScreenCanvas) {
        utilOffScreenCanvas = document.createElement('canvas');
        if(!canvas) {
            console.log("Warning: base canvas is null, not setting off screen canvas size");
        } else {
            utilOffScreenCanvas.height = canvas.height;
            utilOffScreenCanvas.width = canvas.width;
        }
    }
    return utilOffScreenCanvas;
}

utilLength = (dx, dy) => Math.sqrt(dx*dx + dy*dy);

/*

    interface Static {
        void drawAndUpdate(ctx);
    }

*/
class StaticDrawing {
    constructor(drawCallBack, initializer = undefined) { // implements Static
        this.enabled = false;
        this.drawCallBack = drawCallBack;
        if(initializer) initializer(this);
    }
    drawAndUpdate(ctx) {
        if(this.drawCallBack && this.enabled) {
            this.drawCallBack(ctx, this);
        }
    }
}
/*

    interface Animated {
        float getCurrentAnimationPos(); // Returns a float in interval [0.0, 1.0]
        void drawAndUpdate(ctx, currentUnixTimeInMS); // increment time and draw if need be
    }

*/

class AnimatedDrawing { // Implements Animated
    constructor(durationInMS, drawCallBack, initializer = undefined) {
        this.enabled = false;
        this.timeSinceResetInMS = 0;
        this.durationInMS = durationInMS;
        this.lastUpdateUnixTime = 0;
        this.drawCallBack = drawCallBack;
        if(initializer) initializer(this);
    }
    getCurrentAnimationPos() { // Override
        return (this.timeSinceResetInMS * 1.0) / this.durationInMS;
    }
    drawAndUpdate(ctx, currentUnixTimeInMS) { // Override
        if(!this.enabled) return;
        if(this.timeSinceResetInMS > this.durationInMS) 
            this.timeSinceResetInMS = this.timeSinceResetInMS % this.durationInMS; // Loop this animation 
        
        if(this.drawCallBack) 
            // this.getCurrentAnimationPos() always returns a value in [0, 1]
            this.drawCallBack(ctx, this);
        
        this.timeSinceResetInMS += (currentUnixTimeInMS - this.lastUpdateUnixTime);
        this.lastUpdateUnixTime = currentUnixTimeInMS;
    } 
}

// class AnimatedParticlesDrawing { // Implements Animated
//     constructor(durationInMS, drawCallBack, initializer = undefined) {
//         this.animDrawing = new AnimatedDrawing(durationInMS, drawCallBack, initializer);
//     }

//     getCurrentAnimationPos() { // Override
//         return this.animDrawing.getCurrentAnimationPos();
//     }
//     drawAndUpdate(ctx, currentUnixTimeInMS) { // Override
//         this.animDrawing.drawAndUpdate(ctx, currentUnixTimeInMS);
//     }
// }

class AnimationManager {
    constructor(animationCues, allAnimations) {
        this.allAnimations = allAnimations;
        this.animationCues = animationCues;
        this.currentCueIndex = 0;
    }
    
    drawAndUpdate(ctx, currentUnixTimeInMS) {
        for(let animName in this.allAnimations) {
            this.allAnimations[animName].drawAndUpdate(ctx, currentUnixTimeInMS); // Animated.drawAndUpdate(CanvasRenderingContext2D, DateTime)
        }
    }

    start() {
        let manager = this;

        let applyCurrentCue = () => {
            let cueApplicationStartTime = Date.now();
            let cueToApply = manager.animationCues[manager.currentCueIndex];
            let changes = cueToApply.getChange();

            for(let animationName of Object.keys(changes)) {
                let applyChangesFunction = changes[animationName];
                if(animationName in manager.allAnimations) {
                    applyChangesFunction(manager.allAnimations[animationName]);
                }
            }
            manager.currentCueIndex ++;

            if(manager.currentCueIndex < manager.animationCues.length) {
                // all animations not done, cue next animation after timeout
                let runtime = Date.now() - cueApplicationStartTime;
                let timeBeforeNextCue = manager.animationCues[manager.currentCueIndex].getTime() - cueToApply.getTime() - runtime;
                setTimeout(applyCurrentCue, timeBeforeNextCue);
                console.log("Queued Next cue with timeout of " + timeBeforeNextCue + "ms: " + cueToApply.getTime());
            }
        }

        if(this.animationCues.length > 0) {
            let firstCueWaitTime = this.animationCues[0].getTime();
            setTimeout(applyCurrentCue, firstCueWaitTime);
            console.log("Queued First cue with timeout of " + firstCueWaitTime + "ms");
        }
    }
}

class Cue {
    constructor(time, change) {
        this.time = time;
        this.change = change;
    }
    getTime() { return this.time; }
    getChange() { return this.change; }
}


class Song {
    constructor(songURL, animationManager, allStaticAnimations) {
        this.songURL = songURL;
        this.animationManager = animationManager;
        this.allStaticAnimations = allStaticAnimations;
        this.audioArrayBuffer = null;
    }

    load() {
        let songRef = this;
        let request = new XMLHttpRequest();
        request.open('GET', this.songURL, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            //take the audio from http request and decode it in an audio buffer
            audioCtx.decodeAudioData(request.response, function (buffer) {
                songRef.audioArrayBuffer = buffer;
            });
        };
        request.send();
    }

    isAudioLoaded() {
        return this.audioArrayBuffer != null;
    }
    
    start(source) {
        if(!this.isAudioLoaded()) {
            throw new Error("Cannot start without loading audio");
        }
        source.buffer = this.audioArrayBuffer;
        this.animationManager.start();
    }

    draw(canvasCtx) {

        // Draw background
        canvasCtx.fillStyle = "#110418";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    
        // Draw Animated Elements
        this.animationManager.drawAndUpdate(canvasCtx, Date.now());
        // Draw all static drawings
        for(let drawingName in this.allStaticAnimations) {
            this.allStaticAnimations[drawingName].drawAndUpdate(canvasCtx); // Static.drawAndUpdate(CanvasRenderingContext2D)
        }
    }
}

class RandomNumberBucket {
    constructor(n = 1e6) {
        this.bucket = [];
        this.idx = 0;
        for(let i = 0; i < n; i++) {
            this.bucket.push(Math.random());
        }
    }

    next() {
        if(this.idx >= this.bucket.length) this.idx = 0;
        return this.bucket[this.idx++];
    }
}

/*

  Tools Built upon Framework code

*/



class SharpyLight { // implements Static
    constructor(x, y, angle, length, coneAngle, color) {
        
        // Calculate required area on off screen canvas
        this.points = [
            [x, y], 
            [x + length*Math.cos(angle+coneAngle/2), y - length*Math.sin(angle+coneAngle/2)],
            [x + length*Math.cos(angle-coneAngle/2), y - length*Math.sin(angle-coneAngle/2)]
        ];

        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
        this.coneAngle = coneAngle;
        this.color = color;

        this.offScreenCanvas = undefined;
    }


    fillTriangle(ctx, points) {
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        ctx.lineTo(points[1][0], points[1][1]);
        ctx.lineTo(points[2][0], points[2][1]);
        ctx.closePath();
        ctx.fill();
    }

    drawOffScreen() {
        if(!this.offScreenCanvas) {
            this.offScreenCanvas = utilGetOrCreateOffScreenCanvas();
        }
        const ctx2 = this.offScreenCanvas.getContext('2d');
        
        // clear required area
        ctx2.clearRect(0, 0, this.offScreenCanvas.width, this.offScreenCanvas.height);

        const gradient = ctx2.createConicGradient(-this.angle, this.x, this.y);
        const coneHalfAngleFraction = (this.coneAngle/2)/(Math.PI*2);
        gradient.addColorStop(0, this.color + "ff");
        gradient.addColorStop(coneHalfAngleFraction, this.color + "00");
        gradient.addColorStop(1 - coneHalfAngleFraction, this.color + "00");
        gradient.addColorStop(1, this.color + "ff");
        
        // Draw Cone light onto off-screen canvas
        ctx2.fillStyle = gradient;
        this.fillTriangle(ctx2, this.points);
        
        // Create masking gradient using off-screen canvas context
        const fullGradient = ctx2.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.length);
        fullGradient.addColorStop(0, "#ffff");
        fullGradient.addColorStop(1, "#fff0");
        
        // Draw layer mask
        ctx2.globalCompositeOperation = "destination-in";
        ctx2.fillStyle = fullGradient;
        this.fillTriangle(ctx2, this.points);
    }

    drawAndUpdate(ctx) { // Override
        if(!this.offScreenCanvas) {
            this.drawOffScreen();
        }
        
        // draw required area from offScreenCanvas
        ctx.drawImage(this.offScreenCanvas, 0, 0);
    }
}
