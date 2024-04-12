var noiseParams = {dx: 0.001, dy: 0.004, mag: 1};
var curves = [];
var curveNum = 360;
var noiseSlider;

function keyPressed() {
  if (key == 's') {
    clear();
    rect(0, 0, width, height);
    curves.forEach(c => c.show(1));
    save();
    clear();
    rect(0, 0, width, height);
    curves.forEach(c => c.show(2));
    save();
    loop();
  }
}

function setup() {
  noiseSlider = createSlider(0, 0.01, 0.0014, 0);

  createCanvas(windowHeight * 11 / 14, windowHeight, SVG);
  noFill();
  strokeWeight(0.8);

  // // linear placement
  // let cols = 14 * 40;
  // let rows = 1;
  // for (let col = 0; col < cols; col++) {
  //   for (let row = 0; row < rows; row++) {
  //     let progress = col / cols;

  //     let pos = createVector(
  //         lerp(0, width, (0.5 + col) / cols),
  //         lerp(0, height, (0.5 + row) / rows) + 5 * sin(8 * TWO_PI *
  //         progress));
  //     let c = new BCurve(pos, progress);
  //     curves.push(c);
  //   }
  // }


  for (let i = 0; i < curveNum; i++) {
    let progress = (i + 0.5) / curveNum;
    let pos = p5.Vector.fromAngle(TAU * progress)
                  .mult(width / 4)
                  .add(width / 2, height / 2);
    ;
    // pos = createVector(width / 2, height * progress)

    let c = new BCurve(pos, 1);
    curves.push(c);
  }
}

function draw() {
  clear();
  curves.forEach(c => c.show());
  // noLoop();
}

class BCurve {
  constructor(pos, progress = 1) {
    this.pos = pos;
    this.progress = progress;
    this.size = height / 6;
  }

  show(whichCurve = 'all') {
    push();
    // translate(width / 2, height / 2);
    translate(this.pos.x, this.pos.y)
    let angle = noise(
                    this.pos.x * noiseSlider.value(),
                    this.pos.y * noiseSlider.value()) *
        TAU * noiseParams.mag * this.progress;

    // angle = TAU * 1 * this.progress;
    rotate(angle + HALF_PI);

    // let sides = 3;
    // beginShape();
    // for (let i = 0; i < sides; i++) {
    //   let p = p5.Vector.fromAngle(TAU * i / sides).mult(this.size);
    //   vertex(p.x, p.y);
    // }
    // endShape(CLOSE);

    // arc(0 + this.size / 2, 0, this.size, this.size, 0, PI);
    // arc(0 - this.size / 2, 0, this.size, this.size, PI, 0);
    if (whichCurve === 'all') {
      bezier(
          -this.size, this.size / 10, 0, this.size, 0, -this.size, this.size,
          -this.size / 10);

      rotate(PI / 2);
      bezier(
          -this.size, this.size / 10, 0, this.size, 0, -this.size, this.size,
          -this.size / 10);
    } else if (whichCurve == 1) {
      bezier(
          -this.size, this.size / 10, 0, this.size, 0, -this.size, this.size,
          -this.size / 10);
    } else {
      rotate(PI / 2);
      bezier(
          -this.size, this.size / 10, 0, this.size, 0, -this.size, this.size,
          -this.size / 10);
    }

    pop();
  }
}