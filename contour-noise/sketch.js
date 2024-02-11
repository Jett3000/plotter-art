var nd = {
  x: 0.008,
  y: 0.008,
  t: 0,
};

var nmap;
var gmap;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  noFill();
  strokeWeight(1);

  nmap = makeNoiseMap();
  gmap = makeGradientMap(nmap);
}

function draw() {
  image(nmap, 0, 0);
  // drawVectorField(gmap);


  let topLeft = noise((mouseX - 1) * nd.x, (mouseY - 1) * nd.y)
  let top = noise((mouseX) * nd.x, (mouseY - 1) * nd.y)
  let topRight = noise((mouseX + 1) * nd.x, (mouseY - 1) * nd.y)

  let left = noise((mouseX - 1) * nd.x, (mouseY) * nd.y)
  let right = noise((mouseX + 1) * nd.x, (mouseY) * nd.y)

  let bottomLeft = noise((mouseX - 1) * nd.x, (mouseY + 1) * nd.y)
  let bottom = noise((mouseX) * nd.x, (mouseY + 1) * nd.y)
  let bottomRight = noise((mouseX + 1) * nd.x, (mouseY + 1) * nd.y)

  // sobel filter on mouse noise convolution
  let dy =
      (topLeft + 2 * top + topRight) - (bottomLeft + 2 * bottom + bottomRight);
  let dx =
      (topLeft + 2 * left + bottomLeft) - (topRight + 2 * right + bottomRight);

  let mouseVec = createVector(dx, dy).setMag(10).rotate(HALF_PI);
  line(mouseX, mouseY, mouseX + mouseVec.x, mouseY + mouseVec.y);

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
  constructor(pos, moonCenter, moonRadius) {
    this.done = false;
    this.pos = pos;
    this.vel = createVector(0, 0);
    this.moonCenter = moonCenter;
    this.moonRadius = moonRadius;
    this.breadCrumbs = [this.pos.copy()];
  }

  step() {
    this.breadCrumbs.push(this.pos.copy());



    let nval = noise(
        this.pos.x * noiseDelta, this.pos.y * noiseDelta,
        frameCount * noiseSpeed)
    let vel = p5.Vector.fromAngle(noiseAngleRangeFactor * TWO_PI * nval)
                  .setMag(particleVelocityMag);
    vel = this.gradientVelocity();
    this.pos.add(vel);

    if (this.pos.dist(this.moonCenter) > this.moonRadius) {
      this.done = true;
      // snap final vertex to circle's edge
      let posRelativeToCenter = p5.Vector.sub(this.pos, this.moonCenter);
      let rad = posRelativeToCenter.mag();
      let factor = this.moonRadius / rad;
      posRelativeToCenter.mult(factor).add(this.moonCenter);
      this.breadCrumbs.push(posRelativeToCenter);
    }
  }


  gradientVelocity() {
    let topLeft =
        noise((this.pos.x - 1) * noiseDelta, (this.pos.y - 1) * noiseDelta)
    let top = noise((this.pos.x) * noiseDelta, (this.pos.y - 1) * noiseDelta)
    let topRight =
        noise((this.pos.x + 1) * noiseDelta, (this.pos.y - 1) * noiseDelta)

    let left = noise((this.pos.x - 1) * noiseDelta, (this.pos.y) * noiseDelta)
    let right = noise((this.pos.x + 1) * noiseDelta, (this.pos.y) * noiseDelta)

    let bottomLeft =
        noise((this.pos.x - 1) * noiseDelta, (this.pos.y + 1) * noiseDelta)
    let bottom = noise((this.pos.x) * noiseDelta, (this.pos.y + 1) * noiseDelta)
    let bottomRight =
        noise((this.pos.x + 1) * noiseDelta, (this.pos.y + 1) * noiseDelta)

    // sobel filter on mouse noise convolution
    let dy = (topLeft + 2 * top + topRight) -
        (bottomLeft + 2 * bottom + bottomRight);
    let dx = (topLeft + 2 * left + bottomLeft) -
        (topRight + 2 * right + bottomRight);

    return createVector(dx, dy).rotate(HALF_PI).setMag(particleVelocityMag);
  }
}