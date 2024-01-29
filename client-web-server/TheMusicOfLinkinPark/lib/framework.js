
utilShortNumberTo2DigitHex = (number) => {
    return Math.min(Math.max(number, 0), 255).toString(16);
}

class StaticDrawing {
    constructor(drawCallBack) {
        this.enabled = false;
        this.drawCallBack = drawCallBack;
    }
    drawAndUpdate(ctx) {
        if(this.drawCallBack && this.enabled) {
            this.drawCallBack(ctx, this);
        }
    }
}

class AnimatedDrawing {
    constructor(durationInMS, drawCallBack, initalizer = undefined) {
        this.enabled = false;
        this.timeSinceResetInMS = 0;
        this.durationInMS = durationInMS;
        this.lastUpdateUnixTime = 0;
        this.drawCallBack = drawCallBack;
        if(initalizer) initalizer(this);
    }
    getCurrentAnimationPos() {
        return (this.timeSinceResetInMS * 1.0) / this.durationInMS;
    }
    drawAndUpdate(ctx, currentUnixTimeInMS) {
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

class AnimationManager {
    constructor(animationCues, allAnimations) {
        this.allAnimations = allAnimations;
        this.animationCues = animationCues;
        this.currentCueIndex = 0;
    }
    
    drawAndUpdate(ctx, currentUnixTimeInMS) {
        for(let animName in this.allAnimations) {
            this.allAnimations[animName].drawAndUpdate(ctx, currentUnixTimeInMS);
        }
    }

    start() {
        let manager = this;

        let applyCurrentCue = () => {
            let cueApplicationStartTime = Date.now();
            let cueToApply = manager.animationCues[manager.currentCueIndex];
            let changes = cueToApply.getChange();

            for(let animatonName of Object.keys(changes)) {
                let applyChangesFunction = changes[animatonName];
                if(animatonName in manager.allAnimations) {
                    applyChangesFunction(manager.allAnimations[animatonName]);
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