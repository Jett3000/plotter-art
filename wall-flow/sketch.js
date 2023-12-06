var particles = [];
var particleCount = 200;

// noise simulation
var noiseDelta = 0.003;
var noiseSpeed = 0.01;
var noiseAngleRangeFactor = 0.1;

// performance
var stepsPerFrame = 10;
var displaySegmentInterval = 8;
var particleVelocityMag = 2;

function keyPressed() {
  if (key == 's') {
    push();
    stroke(0);
    strokeWeight(0.5);
    clear()
    particles.forEach(p => {
      p.show();
    });
    save();
    pop();
  }
}


function setup() {
  let ratio = 36 / 9;
  createCanvas(window.innerWidth * ratio, window.innerHeight, SVG);
  noFill();
  strokeWeight(1);
  stroke(255);

  for (let i = 0; i < particleCount; i++) {
    let y = lerp(0, height, (i + 0.5) / particleCount);
    let particle = new FlowParticle(createVector(0, y));
    particles.push(particle);
  }
}

function draw() {
  clear();
  background(0);
  particles.forEach(p => {
    let counter = stepsPerFrame;
    while (counter-- && !p.done) {
      p.step();
    }
    p.show(displaySegmentInterval);
  });

  // noLoop();
}

class FlowParticle {
  constructor(pos) {
    this.done = false;
    this.pos = pos;
    this.vel = createVector(0, 0);
    this.breadCrumbs = [this.pos.copy()];
  }

  step() {
    // debugger;
    this.breadCrumbs.push(this.pos.copy());

    let nval = noise(
        this.pos.x * noiseDelta, this.pos.y * noiseDelta,
        frameCount * noiseSpeed)
    let vel = createVector(particleVelocityMag, 0);
    vel.rotate(TWO_PI * noiseAngleRangeFactor * (nval - 0.5));
    this.pos.add(vel);


    this.done = this.pos.x > width;
    // console.log('done');
  }


  show(everyNFrame = 1) {
    beginShape();
    this.breadCrumbs.forEach((v, i) => {
      if (i % everyNFrame == 0 || i == this.breadCrumbs.length - 1) {
        vertex(v.x, v.y)
      }
    });
    endShape();
  }
}