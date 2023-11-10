function setup() {
  createCanvas(windowWidth, windowHeight)
}

function draw() {
  let wingStepSize = 12;
  let stepDegrees = 45;
  let commonPoint = createVector(width / 2, height / 2)
  let leftWingPoints = [];
  let rightWingPoints = [];
  let stepVec = createVector(0, -wingStepSize);
  let steps = 6;

  let leftPoint = commonPoint.copy();
  for (let i = 0; i <= steps; i++) {
    leftWingPoints.push(leftPoint.copy());
    stepVec.rotate(radians(random(-stepDegrees, 0)));
    leftPoint.add(stepVec);
  }
  let rightPoint = commonPoint.copy();
  stepVec = createVector(0, -wingStepSize);
  for (let i = 0; i <= steps; i++) {
    rightWingPoints.push(rightPoint.copy());
    stepVec.rotate(radians(random(0, stepDegrees)));
    rightPoint.add(stepVec);
  }

  beginShape();
  leftWingPoints.forEach(p => vertex(p.x, p.y))
  endShape();
  beginShape();
  rightWingPoints.forEach(p => vertex(p.x, p.y))
  endShape();

  noLoop();
}
