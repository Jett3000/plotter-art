var moons = [];
// moon visuals
var moonCount = 1;
var moonSizeFactor = 0.9;
var particlesPerMoon = 360;
var particleMinSegments = 10;
var specialParticleChance = 0.25;
var specialParticleRadiusFactor = 1.1;
// noise simulation
var noiseDelta = 0.008;
var noiseSpeed = 0.004;
var noiseAngleRangeFactor = 1;
// circle packing
var circleMaxRateFactor = 1;
var circleSpawnMarginFactor = 0.2;
// performance
var stepsPerFrame = 10;
var displaySegmentInterval = 4;
var particleVelocityMag = 0.8;


function keyPressed() {
  if (key == 's') {
    clear()
    moons.forEach(m => {
      m.cleanUp();
      m.show();
    });
    save();
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, SVG);
  noFill();
  strokeWeight(1);
  ellipseMode(RADIUS);

  debugger;
  let circles = [];
  if (moonCount > 1) {
    circles = packCircles(moonCount);
  } else {
    circles = [createVector(width / 2, height / 2, min(width, height) * 0.4)];
  }


  moons = circles.map(c => {return new FlowMoon(c)})
}

function draw() {
  clear();
  moons.forEach(m => {
    let counter = stepsPerFrame;
    while (counter--) {
      m.step();
    }
    m.show(displaySegmentInterval);
  });
}

// returns a number of packed circles as vectors
// with x & y mapping to the coordinates of the centers
// and z being the radius
function packCircles(n = 5) {
  // initialize circles
  let circles = [];
  for (let i = 0; i < n; i++) {
    circles.push(new PackableCircle());
  }

  // simulate
  debugger;
  let allCirclesDone = false;
  while (!allCirclesDone) {
    // grow circles & check for collisions with walls
    circles.forEach(c => {
      c.step();
      c.rate = c.againstWall() ? 0 : c.rate;
    });

    // then check for collisions between circles
    let circlePool = circles.slice();
    let curr = circlePool.pop();
    while (circlePool.length > 0) {
      for (let other of circlePool) {
        if (curr.colidesWith(other)) {
          curr.rate = 0;
          other.rate = 0;
        }
      }
      // setup next iteration
      curr = circlePool.pop();
    }

    // check for completion
    allCirclesDone = true;
    circles.forEach(c => {
      if (c.rate > 0) allCirclesDone = false;
    });
  }

  // create breathing room
  debugger;
  circles.forEach(c => c.rad *= moonSizeFactor)
  return circles.map(c => c.toVec())
}

class PackableCircle {
  constructor() {
    this.pos = createVector(
        random(
            width * circleSpawnMarginFactor,
            width * (1 - circleSpawnMarginFactor)),
        random(
            height * circleSpawnMarginFactor,
            height * (1 - circleSpawnMarginFactor)),
    );
    this.rad = 1;
    this.rate = random(1, circleMaxRateFactor);
  }

  step() {
    this.rad += this.rate;
  }

  colidesWith(other) {
    return this.pos.dist(other.pos) < this.rad + other.rad;
  }

  againstWall() {
    return (
        this.pos.x < this.rad || this.pos.y < this.rad ||
        this.pos.x + this.rad > width || this.pos.y + this.rad > height);
  }

  toVec() {
    let vecRep = this.pos.copy();
    vecRep.z = this.rad;
    return vecRep;
  }
}

class FlowMoon {
  constructor(circleVec) {
    this.pos = createVector(circleVec.x, circleVec.y);
    this.rad = circleVec.z;
    this.particles = [];
    for (let i = 0; i < particlesPerMoon; i++) {
      let particleRad = random() < specialParticleChance ?
          this.rad * specialParticleRadiusFactor :
          this.rad;
      let particlePos = p5.Vector.fromAngle(TWO_PI * i / particlesPerMoon)
                            .mult(particleRad)
                            .add(this.pos);

      this.particles.push(new FlowParticle(particlePos, this.pos, particleRad));
    }

    this.done = false;
  }

  step() {
    this.done = true;

    this.particles.forEach(p => {
      if (!p.done) {
        p.step();
        this.done = false;
      }
    });
  }

  show(everyNFrame = 1) {
    this.particles.forEach(p => {
      beginShape();
      p.breadCrumbs.forEach((v, i) => {
        if (i % everyNFrame == 0) {
          vertex(v.x, v.y)
        }
      });
      endShape();
    })
    // ellipse(this.pos.x, this.pos.y, this.rad);
    // ellipse(this.pos.x, this.pos.y, this.rad * 1.2);
  }

  cleanUp() {
    this.particles =
        this.particles.filter(p => p.breadCrumbs.length > particleMinSegments);
  }
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
                  .mult(particleVelocityMag);
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
}