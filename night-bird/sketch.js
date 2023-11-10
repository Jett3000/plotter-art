function setup() {
  createCanvas(windowWidth, windowHeight)
}

function draw() {
  noFill();
  let birdCount = 1000;
  let birds = [];
  while (birdCount--) {
    birds.push(new Bird())
  }

  birds.forEach(bird => bird.show())
  noLoop();
}

class Bird {
  constructor() {
    // setup
    let wingStepSize = random(10, 13);
    let stepDegrees = random(20, 45);
    let steps = 10;
    this.pos = createVector(random(width), random(height));
    // make left wing's points
    let leftPoint = this.pos.copy();
    let leftPoints = [];
    let stepVec = createVector(0, -wingStepSize);
    for (let i = 0; i < steps; i++) {
      stepVec.rotate(radians(random(-stepDegrees, 0)));
      leftPoint.add(stepVec);
      leftPoints.push(leftPoint.copy())
    }
    // make right wing's points
    let rightPoint = this.pos.copy();
    let rightPoints = [];
    stepVec = createVector(0, -wingStepSize);
    for (let i = 0; i < steps; i++) {
      stepVec.rotate(radians(random(0, stepDegrees)));
      rightPoint.add(stepVec);
      rightPoints.push(rightPoint.copy())
    }

    // stitch into bird
    leftPoints.reverse();
    leftPoints.push(this.pos.copy());
    this.points = leftPoints.concat(rightPoints);
  }

  show() {
    beginShape();
    this.points.forEach(p => vertex(p.x, p.y));
    endShape(OPEN);
  }
}
