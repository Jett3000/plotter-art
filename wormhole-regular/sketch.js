// p5.disableFriendlyErrors = true;
var saving = false;
var lerpAmtSlider;
var turnsSlider;

function setup() {
  // environment
  createCanvas(window.innerWidth, window.innerHeight, SVG);
  frameRate(30);
  lerpAmtSlider = createSlider(0.8, 0.99, 0.81, 0);
  turnsSlider = createSlider(1, 12, 1, 1);
}

function draw() {
  clear();
  noFill();
  strokeWeight(2);

  if (saving) {
    stroke(0);
  } else {
    background(0);
    stroke(255);
  }


  translate(width / 2, height / 2);

  let sideCount = 12;
  let rad = height * 0.4;
  ;
  let lerpAmt = lerpAmtSlider.value();

  let points = [];
  for (let i = 0; i < sideCount; i++) {
    points.push(p5.Vector.fromAngle(TWO_PI * i / sideCount).mult(rad));
  }

  let currRad = points[0].mag();
  let count = 0;
  let rotationCount = 0;
  let rotationSteps = 0;
  while (rotationCount < turnsSlider.value()) {
    beginShape();
    points.forEach(p => vertex(p.x, p.y));
    vertex(points[0].x, points[0].y);
    endShape();

    let newPoints = [];
    for (let i = 0; i < points.length; i++) {
      let p1 = points[i];
      let p0 = points[(i + 1) % points.length];

      // let nval = 0
      newPoints.push(p5.Vector.lerp(p0, p1, lerpAmt));
    }
    debugger;

    points = newPoints;
    currRad = points[0].mag();

    if (rotationSteps == 0) {
      if (abs(points[0].heading() >= TWO_PI / sideCount)) {
        rotationSteps = count;
        rotationCount++
      }
    } else if (count % rotationSteps == 0) {
      rotationCount++
    }

    count++;
  }
  // text('' + count, 0, 0);
  if (saving) {
    save();
    saving = false;
    // } else if (!mouseIsPressed) {
    //   noLoop();
    // }
  }
}

function keyPressed() {
  if (key == 's') {
    saving = true;
    loop();
  }
}

function mousePressed() {
  loop();
}