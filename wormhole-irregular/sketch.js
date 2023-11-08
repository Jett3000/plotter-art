// p5.disableFriendlyErrors = true;
var saving = false;
var lerpAmtSlider;
var countSlider;
var userPoints = [];

function setup() {
  // environment
  let h = windowHeight;
  let w = h * 12 / 9;
  if (w > windowWidth) {
    w = windowWidth;
    h = w * 9 / 12;
  }

  createCanvas(w, h, SVG);
  frameRate(30);
  lerpAmtSlider = createSlider(0.8, 0.99, 0.81, 0);
  countSlider = createSlider(1, 200, 20, 1);
}

function draw() {
  clear();
  noFill();
  strokeWeight(2);
  translate(width / 2, height / 2);

  if (saving) {
    stroke(0);
  } else {
    background(0);
    stroke(255);
  }

  if (userPoints.length > 2) {
    let points = userPoints;
    let count = 0;
    let lerpAmt = lerpAmtSlider.value();
    while (count < countSlider.value()) {
      beginShape();
      points.forEach(p => vertex(p.x, p.y));
      vertex(points[0].x, points[0].y);
      endShape();

      let newPoints = [];
      for (let i = 0; i < points.length; i++) {
        let p0 = points[(i + 1) % points.length];
        let p1 = points[i];
        newPoints.push(p5.Vector.lerp(p0, p1, lerpAmt));
      }

      points = newPoints;
      count++;
    }
  } else {
    userPoints.forEach(p => circle(p.x, p.y, 1))
  }

  if (saving) {
    save();
    saving = false;
  }


  noLoop();
}

function smoothPoints(amt = 0.1) {
  if (userPoints.length < 3) return;
  debugger;
  let newPoints = [];
  for (let i = 0; i < userPoints.length; i++) {
    let p0 = userPoints[i];
    let p1 = userPoints[(i + 1) % userPoints.length];
    let p2 = userPoints[(i + 2) % userPoints.length];

    let midpoint = p5.Vector.lerp(p0, p2, 0.5);
    let nudgedTo = p5.Vector.lerp(p1, midpoint, amt);
    newPoints.push(nudgedTo);
  }

  userPoints = newPoints;
}


function keyPressed() {
  switch (key) {
    case 's':
      saving = true;
      break;
    case 'd':
      userPoints.pop();
      break;
    case 'a':
      userPoints = userPoints.sort((a, b) => {
        return a.heading() - b.heading();
      })
      break;
    case 'q':
      smoothPoints();
      break;
  }
  loop();
}


function mouseDragged() {
  let minDistIndex = -1;
  let minDist = width * height
  let mouseVec = createVector(mouseX - width / 2, mouseY - height / 2)
  for (let index = 0; index < userPoints.length; index++) {
    const p = userPoints[index];
    if (p.dist(mouseVec) < minDist) {
      minDist = p.dist(mouseVec);
      minDistIndex = index;
    }
  }
  if (minDist < 30) {
    userPoints[minDistIndex] = mouseVec;
    loop();
  }

  if (mouseY > height) {
    loop();
  }
}

function mouseClicked() {
  if (mouseY < height && mouseX < width && mouseY > 0 && mouseX > 0) {
    let pointVec = createVector(mouseX - width / 2, mouseY - height / 2)
    userPoints.push(pointVec);
    loop();
  }
}