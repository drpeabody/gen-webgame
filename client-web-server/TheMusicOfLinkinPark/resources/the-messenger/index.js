

const songTheMessenger = new Song(
    './resources/the-messenger/15-TheMessenger.mp3', 

    // Animation Manager - All the animated drawings + animation cues for this song

    new AnimationManager([

        // All animation cues
    ], 
    
    // All animated Drawings
    {
        
    })
    , 
    // All Static Drawings
    { 
        "logo":  new StaticDrawing((ctx, drawing) => {
            ctx.drawImage(drawing.image, drawing.X, drawing.Y, drawing.width, drawing.height);
        }, (logo) => {
            let bannerDimension = Math.min(WIDTH/2, HEIGHT/2);
            logo.image = new Image();
            logo.X = WIDTH/2 - bannerDimension/2 - 140;
            logo.Y = HEIGHT/2 - bannerDimension/2;
            logo.width = bannerDimension+140;
            logo.height = bannerDimension;
            logo.image.onload = () => { logo.enabled = true; }
            logo.image.src = "./resources/common/linkin-park-logo.svg";
        })
    
    }
);

// Register this song
allSongs.push(songTheMessenger);

// Load the song audio into memory
songTheMessenger.load();
