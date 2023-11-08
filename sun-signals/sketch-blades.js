var lineCount = 360;
var step;
var outerPoints = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, SVG);
  step = TWO_PI / lineCount;
  let radius = createVector(0.2 * min(width, height), 0);
  for (let i = 0; i < lineCount; i++) {
    outerPoints.push(radius.copy());
    radius.rotate(step);
  }
  frameRate(1);
}

function draw() {
  clear();
  push();
  translate(width / 2, height / 2);
  let factors =
    [2, 3, 4, 5, 6,
      8, 9, 10, 12, 15,
      18, 20, 24, 30, 36,
      40, 45, 60, 72, 90,
      120, 180, 360];
  let stepsPerPeriod = 45 //random(factors)


  outerPoints.forEach((p, i) => {
    let length = i % stepsPerPeriod;
    let halfPeriod = floor(stepsPerPeriod / 1)

    length = abs(length - halfPeriod) / halfPeriod;
    if (length == 0) return;
    let inverseLength = 1 - length;

    length = ease(length);
    let innerPoint = p5.Vector.mult(p, 1 + length);

    inverseLength = ease(length);
    let outerPoint = p5.Vector.mult(p, 1 - inverseLength);

    line(outerPoint.x, p.y, innerPoint.x, innerPoint.y);
  });

  pop();
  noLoop();
}

function keyPressed() {
  if (key == 's') {
    save();
  }
}

function ease(x) {
  // return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) // quartic
  // return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; // cubic
  // return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; // quadratic
  // return -(Math.cos(Math.PI * x) - 1) / 2; // sin

  return x
}
