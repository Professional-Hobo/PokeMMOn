let widthMultiplier = 1, heightMultiplier = 1;
$(() => {
  $(document).bind('touchmove', false); // Don't allow scrolling on mobile
  let paused = true; // Canvas starts paused to make sure user has right orientation
  let renderLoop;

  let canvas = $("#canvas")[0];
  let ctx    = canvas.getContext('2d');

  // Check to see if application is "installed"
  if (!window.navigator.standalone) {
    // Display plox install message
  }

  // Button settings
  let btn = {
    trasparency: .25,
    a: {
      x: 425,
      y: 150,
      width: 50,
      height: 50
    },
    b: {
      x: 375,
      y: 200,
      width: 50,
      height: 50
    },
    dpad: {
      x: 45,
      y: 145,
      width: 26,
      height: 37
    },
    held: {
      a:     false,
      b:     false,
      up:    false,
      right: false,
      down:  false,
      left:  false
    },
    times: {
      a: {},
      b:     {},
      up:    {},
      right: {},
      down:  {},
      left:  {}
    }
  };

  // Touch detection
  // Tap (movement = change direction; normal button = use)
  canvas.addEventListener("touchstart", e => {
    let mousePos = getTouchPos(canvas, e);
    updateHeld(mousePos);

    let touch = e.touches[0];
    let mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  }, false);

  // Touch stopped, stop highlighting buttons and performing actions
  canvas.addEventListener("touchend", e => {
    let mousePos = getTouchPos(canvas, e);
    updateHeld(mousePos, true);
    let mouseEvent = new MouseEvent("mouseup", {});
  }, false);

  // keep track of the x and y as user moves touch
  canvas.addEventListener("touchmove", e => {
    let mousePos = getTouchPos(canvas, e);
    updateHeld(mousePos);

    let touch = e.touches[0];
    let mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
  }, false);

  // Get the position of a touch relative to the canvas
  function getTouchPos(canvasDom, touchEvent) {
    let rect = canvasDom.getBoundingClientRect();
    if (touchEvent.touches.length !== 0) {
      return {
        x: touchEvent.touches[0].clientX - rect.left,
        y: touchEvent.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: touchEvent.changedTouches[0].clientX - rect.left,
        y: touchEvent.changedTouches[0].clientY - rect.top
      };
    }
  }

  function updateHeld(m, end=false) {
    m.x /= widthMultiplier;
    m.y /= heightMultiplier;
    let affected = [];

    // A
    if (m.x >= btn.a.x && m.x <= btn.a.x + btn.a.width && m.y >= btn.a.y && m.y <= btn.a.y + btn.a.height) {
      affected.push('a');
    }

    if (m.x >= btn.b.x && m.x <= btn.b.x + btn.b.width && m.y >= btn.b.y && m.y <= btn.b.y + btn.b.height) {
      affected.push('b');
    }

    if (m.x >= btn.dpad.x+40 && m.x <= btn.dpad.x+40 + btn.dpad.width && m.y >= btn.dpad.y && m.y <= btn.dpad.y + btn.dpad.height) {
      affected.push('up');
    }

    if (m.x >= btn.dpad.x+70 && m.x <= btn.dpad.x+70 + btn.dpad.width && m.y >= btn.dpad.y+40 && m.y <= btn.dpad.y+40 + btn.dpad.height) {
      affected.push('right');
    }

    if (m.x >= btn.dpad.x+40 && m.x <= btn.dpad.x+40 + btn.dpad.width && m.y >= btn.dpad.y+70 && m.y <= btn.dpad.y+70 + btn.dpad.height) {
      affected.push('down');
    }

    if (m.x >= btn.dpad.x && m.x <= btn.dpad.x + btn.dpad.width && m.y >= btn.dpad.y+40 && m.y <= btn.dpad.y+40 + btn.dpad.height) {
      affected.push('left');
    }

    affected.forEach(button => {
      btn.held[button] = true;
      if (btn.times[button].start === undefined) {
        btn.times[button].start = Date.now();
      } else if (end && Date.now() - btn.times[button].start < 5000000) {
        if (!btn.times[button].held) {
          //console.log('tap');
        }
        btn.times[button] = {};
        btn.held[button] = false;
      } else {
        if (Date.now()-btn.times[button].start > 500) {
          btn.times[button].held = true;
          //console.log(Date.now()-btn.times[button].start, 'held');
        }
      }
    });

    ['a', 'b', 'up', 'left', 'right', 'down'].filter(item => affected.indexOf(item) === -1).forEach(button => {
      btn.held[button] = false;
    });
  }

  resize();

  let images = {};

  async.series([
    cb => {
      images.background = new Image();
      images.background.src = "img/map.png";
      images.background.onload = () => cb();
    },
    cb => {
      images.aButton = new Image();
      images.aButton.src = "img/A.svg";
      images.aButton.onload = () => cb();
    },
    cb => {
      images.bButton = new Image();
      images.bButton.src = "img/B.svg";
      images.bButton.onload = () => cb();
    },
    cb => {
      images.dpadup = new Image();
      images.dpadup.src = "img/dpad_up.svg";
      images.dpadup.onload = () => cb();
    },
    cb => {
      images.dpadright = new Image();
      images.dpadright.src = "img/dpad_right.svg";
      images.dpadright.onload = () => cb();
    },
    cb => {
      images.dpaddown = new Image();
      images.dpaddown.src = "img/dpad_down.svg";
      images.dpaddown.onload = () => cb();
    },
    cb => {
      images.dpadleft = new Image();
      images.dpadleft.src = "img/dpad_left.svg";
      images.dpadleft.onload = () => cb();
    },

  // Start render loop after assets are loaded
  ], () => {
    renderLoop = requestAnimationFrame(render);
  });

  function render() {
    if (paused) return;
    ctx.drawImage(images.background, 0, 0);

    if (mobilecheck()) {
      ctx.globalAlpha = btn.trasparency;

      ctx.globalAlpha = btn.held.a ? 1 : btn.trasparency;
      ctx.drawImage(images.aButton,   btn.a.x,       btn.a.y,       btn.a.width, btn.a.height);

      ctx.globalAlpha = btn.held.b ? 1 : btn.trasparency;
      ctx.drawImage(images.bButton,   btn.b.x,       btn.b.y,       btn.b.width, btn.b.height);

      ctx.globalAlpha = btn.held.up ? 1 : btn.trasparency;
      ctx.drawImage(images.dpadup,    btn.dpad.x+40, btn.dpad.y,    btn.dpad.width, btn.dpad.height);

      ctx.globalAlpha = btn.held.right ? 1 : btn.trasparency;
      ctx.drawImage(images.dpadright, btn.dpad.x+70, btn.dpad.y+40, btn.dpad.height, btn.dpad.width);

      ctx.globalAlpha = btn.held.down ? 1 : btn.trasparency;
      ctx.drawImage(images.dpaddown,  btn.dpad.x+40, btn.dpad.y+70, btn.dpad.width, btn.dpad.height);

      ctx.globalAlpha = btn.held.left ? 1 : btn.trasparency;
      ctx.drawImage(images.dpadleft,  btn.dpad.x,    btn.dpad.y+40, btn.dpad.height, btn.dpad.width);
      ctx.globalAlpha = btn.trasparency;

    } else {

    }

    renderLoop = requestAnimationFrame(render);
  }

  function orientChange() {
    // On mobile in portrait mode
    if (mobilecheck() && window.innerHeight > window.innerWidth) {
      paused = true;
      $('#canvas').hide();
      $('#orientation').show();

    } else {
      paused = false;
      $('#canvas').show();
      $('#orientation').hide();
    }
  }

  window.addEventListener('orientationchange', orientChange);
  window.addEventListener('resize', resize);

  // Initial execution if needed
  orientChange();
});

function resize() {
  if (!mobilecheck()) {
    let width  = Math.max(window.innerWidth/2, 512);
    let height = (width/16)*9;

    if (height > window.innerHeight) {
      height = window.innerHeight;
      width = (height/9)*16;
    }

    width = Math.max(width, 512);
    height = Math.max(height, 288);

    if (window.innerWidth < 512) {
      $('#canvas')
        .css('margin-left', "0px");
    } else if (window.innerWidth < 1024) {
      $('#canvas')
        .css('margin-left', (window.innerWidth-512)/2 + "px");
    } else {
      $('#canvas')
        .css('margin-left', (window.innerWidth-window.innerWidth*.5)/2 + "px");
    }

    if (window.innerHeight < 288) {
      $('#canvas')
        .css('margin-top', "0px");
    } else if (window.innerHeight < 576) {
      $('#canvas')
        .css('margin-top', (window.innerHeight-288)/2 + "px");
    } else {
      $('#canvas')
        .css('margin-top', (window.innerHeight-window.innerHeight*.5)/2 + "px");
    }
    
    $('#canvas')
      .css('width',   width  + "px")
      .css('height',  height + "px");

    widthMultiplier  = 512/width;
    heightMultiplier = 288/height;
  } else {
    $('#canvas')
      .css('margin-top', "0px")
      .css('margin-left', "0px")
      .css('width',   window.innerWidth + "px")
      .css('height',  window.innerHeight + "px");

    widthMultiplier  = window.innerWidth/512;
    heightMultiplier = window.innerHeight/288;
  }

}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function mobilecheck() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

// Animations
function fadeToBlack(duration) {
  let index = 255;
  let tmp = setInterval(() => {
    index -= 11;
    if (index < 0) {
      clearInterval(tmp);
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0,0,300,150);
      return;
    }

    ctx.fillStyle = "rgb(" + index + ", " + index + ", " + index + ")";
    ctx.fillRect(0,0,300,150);
  }, duration/26);
}

function fadeToWhite(duration) {
  let index = 0;
  let tmp = setInterval(() => {
    index += 11;
    if (index > 255) {
      clearInterval(tmp);
      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.fillRect(0,0,300,150);
      return;
    }

    ctx.fillStyle = "rgb(" + index + ", " + index + ", " + index + ")";
    ctx.fillRect(0,0,300,150);
  }, duration/26);
}
