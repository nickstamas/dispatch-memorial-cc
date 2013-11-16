var canvas = null;
var img = null;
var ctx = null;
var imageReady = false;
var pi = 3.1415;
var leftMax = 3*pi/4;
var rightMax = pi/4;
var rotationPercent = 0;

function onload() { 
  // canvas = document.getElementById('flameCanvas'); 
  // ctx = canvas.getContext("2d"); 
  // img = new Image(); 
  // img.src = 'img/flame.png';
  // img.width = '80';
  // img.height = '160';
  // img.onload = loaded();
  // resize();
}

function resize() {
  canvas.width = canvas.parentNode.clientWidth;
  canvas.height = canvas.parentNode.clientHeight;
  redraw();
}

function loaded() {
  imageReady = true;
  setTimeout( update, 1000 / 60 );
}

var frame = 0;
var lastUpdateTime = 0;
var acDelta = 0;
var msPerFrame = 100;

function update() { 
  requestAnimFrame(update);
  var delta = Date.now() - lastUpdateTime;
  if (acDelta > msPerFrame) { 
    acDelta = 0;
    redraw(); 
    frame++; 
    if (frame >= 3) frame = 0;
  } else { 
    acDelta += delta; 
  }
  lastUpdateTime = Date.now();
}


function redraw() {
  ctx.fillStyle = 'rgba(255,255,255,1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (imageReady) {
    ctx.save();
    ctx.translate( 100, 200 );
    ctx.rotate( 0.02 );
    ctx.translate( -40, -160 );
    drawImageIOSFix(ctx, img, frame*80, 0, 80, 160, canvas.width/2 - 40, canvas.height - 160, 80, 160);
    ctx.restore();
  }
}

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.oRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    function( callback ) { 
      window.setTimeout(callback, 1000 / 60); 
    }; 
})();

gyro.startTracking(function(o) {
  rotationPercent = o.x/10;
});

/**
 * Detecting vertical squash in loaded image.
 * Fixes a bug which squash image vertically while drawing into canvas for some images.
 * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
 * 
 */
function detectVerticalSquash(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
        var alpha = data[(py - 1) * 4 + 3];
        if (alpha === 0) {
            ey = py;
        } else {
            sy = py;
        }
        py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio===0)?1:ratio;
}

/**
 * A replacement for context.drawImage
 * (args are for source and destination).
 */
function drawImageIOSFix(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio = detectVerticalSquash(img);
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
}