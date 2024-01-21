
source = null;
audioCtx = new AudioContext();
analyser = audioCtx.createAnalyser();

canvas = document.getElementById("canvas");
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;
canvasCtx = canvas.getContext("2d");
WIDTH = canvas.width;
HEIGHT = canvas.height;

isLPImageLoaded = false;
const image = new Image();
image.onload = () => { isLPImageLoaded = true; }
image.src = "./resources/LPLogo-black.png";

isCBImageLoaded = false;
const chesterImage = new Image();
CBBlendMode = 'color-dodge';
chesterImage.onload = () => { isCBImageLoaded = true; }
chesterImage.src = "./resources/chester-bennington.png";

bufferLength = 256;
dataArray = null;

window.onload = () => {
    // if(window.isConcertRunningFromHostSide) {
        audioCtx = new AudioContext();
        analyser = audioCtx.createAnalyser();
        analyser.connect(audioCtx.destination);
        analyser.fftSize = bufferLength;
    // }
};


function draw() {

    analyser.getByteFrequencyData(dataArray);
    canvasCtx.fillStyle = "#110418";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    
    const barWidth = (WIDTH / bufferLength) * 2.0;
    let barHeight;
    let x = barWidth;
    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i]; // 0 - 255
      
        let redColor = (barHeight);

        canvasCtx.fillStyle = `rgb(${redColor}, 10, ${128 - redColor/2})`;
        canvasCtx.fillRect(WIDTH - x, HEIGHT - barHeight/2, barWidth, barHeight);
      
        x += barWidth;
    }

    let bannerDimension = Math.min(WIDTH/2, HEIGHT/2);

    let temp = canvasCtx.globalCompositeOperation;
    canvasCtx.globalCompositeOperation = 'destination-out';
    canvasCtx.drawImage(image, WIDTH/2 - bannerDimension/2, HEIGHT/2 - bannerDimension/2, bannerDimension, bannerDimension);
    canvasCtx.globalCompositeOperation = temp;

    temp = canvasCtx.globalCompositeOperation;
    canvasCtx.globalCompositeOperation = CBBlendMode;
    canvasCtx.drawImage(chesterImage, 0, 0);
    canvasCtx.globalCompositeOperation = temp;

    requestAnimationFrame(draw);
};

document.onclick = () => {

    if(source != null) {
        console.log("Source is already loaded, returning");
        return;
    }
    
    //set the audio file's URL
    var audioURL = './resources/02NewDivide(Live).mp3';

    //creating a new request
    var request = new XMLHttpRequest();
    request.open('GET', audioURL, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        //take the audio from http request and decode it in an audio buffer
        audioCtx.decodeAudioData(request.response, function (buffer) {
            source = audioCtx.createBufferSource();
            //passing in data
            source.buffer = buffer;
            //giving the source which sound to play
            source.connect(analyser);
            //start playing
            source.start(0);
            // bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength)
            analyser.getByteTimeDomainData(dataArray);
            draw();
        });
    };
    request.send();
}