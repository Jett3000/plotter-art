var noiseDelta = 0.0008;
var noiseDT = 0.0007;
var particleVelocityMag = 2;
var particleCount = 2400;
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
}

function draw() {
  background(0, 80)

  particles.forEach(p => {
    p.show();
    p.step();
  })
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
    this.breadCrumbs = [this.pos.copy()];
    this.maxCrumbs = random(8, 16);
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
    if (this.breadCrumbs.length > this.maxCrumbs) {
      this.breadCrumbs.shift();
    }
  }

  show() {
    beginShape();
    this.breadCrumbs.forEach(v => vertex(v.x, v.y));
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