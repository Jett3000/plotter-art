var seeds = [];
var saving = false;

function setup() {
  createCanvas(window.innerWidth, window.innerWidth, SVG);
  noFill();
  strokeWeight(1);
}

function draw() {
  clear();
  translate(width / 2, height / 2);

  let arcCount = 20;
  let arcSpacing = (width - 40) / arcCount;
  let nd = 0.0008;
  let nm = TWO_PI * 4;

  background(0);
  seeds = [];
  seeds.push(random(99999))
  seeds.push(random(99999))
  seeds.push(random(99999))

  let stamp = millis();


  for (let arcGroup = 0; arcGroup < 3; arcGroup++) {
    switch (arcGroup) {
      case 0:
        stroke('red');
        break;
      case 1:
        stroke('blue');
        break;
      case 2:
        stroke('green');
        break;
    }

    if (saving) {
      clear();
      rect(-width / 2, -height / 2, width, height);
    }

    let armCount = 4;
    for (let arm = 0; arm < armCount; arm++) {
      let randomOffset = TWO_PI * arm / armCount;
      for (let i = 0; i < arcCount; i++) {
        let rad = arcSpacing * (i + arcGroup / 3);
        let arcLength = (QUARTER_PI) * pow(i / arcCount, 0.5);
        let arcOffset =
            nm * sin(TWO_PI * i * nd) + TWO_PI * arcGroup / 3 + randomOffset;
        arc(0, 0, rad, rad, arcOffset - arcLength / 2,
            arcOffset + arcLength / 2, OPEN);
      }
    }


    if (saving) {
      console.log('saving ' + arcGroup);
      save();
    }
  }

  noLoop();
  if (saving) {
    saving = false;
    loop();
  }
}

function keyPressed() {
  if (key == 's') {
    saving = true;
    loop();
  }
}