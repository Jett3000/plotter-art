var moons = [];

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

  let circles = packCircles();
  debugger;
  moons = circles.map(c => {return new FlowMoon(c)})
}

function draw() {
  clear();
  moons.forEach(m => {
    let stepsPerFrame = 20;
    while (stepsPerFrame--) {
      m.step();
    }
    m.show(4);
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
    // grow circles
    circles.forEach(c => c.step());
    // check for collisions
    let circlePool = circles.slice();
    let curr = circlePool.pop();
    while (circlePool.length > 0) {
      // with other circles
      for (let other of circlePool) {
        if (curr.colidesWith(other)) {
          curr.rate = 0;
          other.rate = 0;
        }
      }
      // with the walls
      if (curr.againstWall()) curr.rate = 0;

      // check for completion
      allCirclesDone = true;
      circles.forEach(c => {
        if (c.rate > 0) allCirclesDone = false;
      });

      curr = circlePool.pop();
    }
  }
  // create breathing room
  circles.forEach(c => c.rad *= 0.9)
  return circles.map(c => c.toVec())
}

class PackableCircle {
  constructor() {
    let margin = 0.1;
    this.pos = createVector(
        random(width * margin, width * (1 - margin)),
        random(height * margin, height * (1 - margin)));
    this.rad = 1;
    this.rate = random(1, 3);
  }

  step() {
    this.rad += this.rate;
  }

  colidesWith(other) {
    return this.pos.dist(other.pos) < this.rad + other.rad;
  }

  againstWall() {
    return this.pos.x < this.rad || this.pos.y < this.rad ||
        width - this.pos.x < this.rad || height - this.pos.y < this.rad;
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
    this.particleCount = 120;
    for (let i = 0; i < this.particleCount; i++) {
      let particleRad = random() < 0.2 ? this.rad * 1.2 : this.rad;
      let particlePos = p5.Vector.fromAngle(TWO_PI * i / this.particleCount)
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
    ellipse(this.pos.x, this.pos.y, this.rad);
    // ellipse(this.pos.x, this.pos.y, this.rad * 1.2);
  }

  cleanUp() {
    this.particles = this.particles.filter(p => p.breadCrumbs.length > 5);
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


    let nd = 0.001;
    let nval = noise(this.pos.x * nd, this.pos.y * nd)
    let vel = p5.Vector.fromAngle(4 * TWO_PI * nval).mult(0.2);
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