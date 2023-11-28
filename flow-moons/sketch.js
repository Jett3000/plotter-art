function setup() {
  createCanvas(window.innerWidth, window.innerHeight, SVG);
  noFill();
  strokeWeight(1);
  ellipseMode(RADIUS);
}

function draw() {
  let circles = packCircles();
  console.log(circles);
  circles.forEach(c => ellipse(c.x, c.y, c.z, c.z));
  noLoop();
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
      if (curr.pos.x < curr.rad || curr.pos.y < curr.rad ||
          width - curr.pos.x < curr.rad || height - curr.pos.y < curr.rad) {
        curr.rate = 0;
      }

      curr = circlePool.pop();
    }

    // check for completion
    allCirclesDone = true;
    circles.forEach(c => {
      if (c.rate > 0) allCirclesDone = false;
    })
  }

  // create breathing room
  circles.forEach(c => c.rad *= 0.9)

  return circles.map(c => c.toVec());
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

  toVec() {
    let vecRep = this.pos.copy();
    vecRep.z = this.rad;
    return vecRep;
  }
}

class FlowMoon {
  constructor() {}
}