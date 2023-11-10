function setup() {
  createCanvas(windowWidth, windowHeight)
}

function draw() {
  let commonPoint = createVector(width / 2, height / 2)
  let stepVec = createVector(0, -20);
  let steps = 3;
  let points = [];
  for (let i = 0; i <= steps; i++) {
    points.push(commonPoint.copy());
    stepVec.rotate(radians(random(-90, 0)));
    commonPoint.add(stepVec);
  }

  beginShape();
  points.forEach(p => vertex(p.x, p.y))
  endShape();

  noLoop();
}
