var noiseDelta = 0.002;
var noiseDT = 0.00;
var stepsPerFrame = 2;
var particleVelocityMag = 1;
var tailLength = 10;
var particleCount = 9000;
var particles = [];
var nmap;
var gmap;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  noFill();
  strokeWeight(1);
  stroke(255);

  let counter = particleCount;
  while (counter--) {
    particles.push(new FlowParticle());
  }

  // var sampler = new PoissonDiscSampler();
}

function keyPressed() {
  if (key == 's') {
    clear();
    push();
    stroke(0);
    particles.forEach(p => p.show());
    save();
  }
}

function draw() {
  clear();
  background(0)

  particles.forEach(p => {
    let counter = stepsPerFrame;
    while (counter--) {
      p.step();
    };
    p.show();
  })
  // noLoop();
}

function drawVectorField(gmap) {
  stroke(0);
  for (let i = 0; i < gmap.width; i += 5) {
    for (let j = 0; j < gmap.height; j += 5) {
      let dx = gmap.get(i, j)[0] - 128;
      let dy = gmap.get(i, j)[2] - 128;

      let vec = createVector(dx, dy, 0).setMag(4).rotate(HALF_PI);
      line(i, j, i + vec.x, j + vec.y);
    }
  }
}


function makeNoiseMap() {
  let noiseMap = createGraphics(width, height);

  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      let nval = noise(i * nd.x, j * nd.y);
      noiseMap.stroke(255 * nval);
      noiseMap.point(i, j);
    }
  }

  return noiseMap;
}

function makeGradientMap(noiseMap) {
  let gradientMap = createGraphics(noiseMap.width, noiseMap.height);

  for (let i = 1; i < noiseMap.width - 1; i++) {
    for (let j = 1; j < noiseMap.height - 1; j++) {
      let topLeft = noiseMap.get(i - 1, j - 1);
      let top = noiseMap.get(i, j - 1);
      let topRight = noiseMap.get(i + 1, j - 1);

      let left = noiseMap.get(i - 1, j);
      let right = noiseMap.get(i + 1, j);

      let bottomLeft = noiseMap.get(i - 1, j + 1);
      let bottom = noiseMap.get(i, j + 1);
      let bottomRight = noiseMap.get(i + 1, j + 1);

      // sobel filter
      let dx = (extractB(topLeft) + 2 * extractB(left) + extractB(bottomLeft)) -
          (extractB(topRight) + 2 * extractB(right) + extractB(bottomRight));


      let dy = (extractB(topLeft) + 2 * extractB(top) + extractB(topRight)) -
          (extractB(bottomLeft) + 2 * extractB(bottom) + extractB(bottomRight));



      gradientMap.stroke(128 + dx, 0, 128 + dy);
      gradientMap.point(i, j)
    }
  }

  return gradientMap;
}


function extractB(arr) {
  return ((arr[0] + arr[1] + arr[2]) / 3);
}

class FlowParticle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.breadCrumbs = [];
  }

  step() {
    let vel = this.gradientVelocity();
    this.pos.add(vel);

    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 ||
        this.pos.y > height) {
      this.pos.x = random(width);
      this.pos.y = random(height);
      this.breadCrumbs = [];
    };

    this.breadCrumbs.push(this.pos.copy());
  }

  show() {
    beginShape();
    let lastCrumb = this.breadCrumbs[0];
    let lineLeft = tailLength;
    let index = 0;
    while (index <= this.breadCrumbs.length - 1 && lineLeft >= 0) {
      let currCrumb = this.breadCrumbs[index];
      vertex(currCrumb.x, currCrumb.y);
      index++;

      let crumbDist = dist(currCrumb.x, currCrumb.y, lastCrumb.x, lastCrumb.y)
      lineLeft -= crumbDist;
      lastCrumb = currCrumb;
    }

    endShape();
  }


  gradientVelocity() {
    let topLeft = noise(
        (this.pos.x - 1) * noiseDelta, (this.pos.y - 1) * noiseDelta,
        frameCount * noiseDT)
    let top = noise(
        (this.pos.x) * noiseDelta, (this.pos.y - 1) * noiseDelta,
        frameCount * noiseDT)
    let topRight = noise(
        (this.pos.x + 1) * noiseDelta, (this.pos.y - 1) * noiseDelta,
        frameCount * noiseDT)

    let left = noise(
        (this.pos.x - 1) * noiseDelta, (this.pos.y) * noiseDelta,
        frameCount * noiseDT)
    let right = noise(
        (this.pos.x + 1) * noiseDelta, (this.pos.y) * noiseDelta,
        frameCount * noiseDT)

    let bottomLeft = noise(
        (this.pos.x - 1) * noiseDelta, (this.pos.y + 1) * noiseDelta,
        frameCount * noiseDT)
    let bottom = noise(
        (this.pos.x) * noiseDelta, (this.pos.y + 1) * noiseDelta,
        frameCount * noiseDT)
    let bottomRight = noise(
        (this.pos.x + 1) * noiseDelta, (this.pos.y + 1) * noiseDelta,
        frameCount * noiseDT)

    // sobel filter on mouse noise convolution
    let dy = (topLeft + 2 * top + topRight) -
        (bottomLeft + 2 * bottom + bottomRight);
    let dx = (topLeft + 2 * left + bottomLeft) -
        (topRight + 2 * right + bottomRight);

    return createVector(dx, dy).rotate(HALF_PI).setMag(particleVelocityMag);
  }
}