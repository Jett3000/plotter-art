var thetaSteps = 8 * 23;
var depth = 23;
var saving = false;

function keyPressed() {
  if (key === 's') saving = true;
  loop();
}

function setup() {
  createCanvas(windowWidth, windowHeight, SVG);
  stroke(0)
  noFill()
}

function draw() {
  // heart points
  let hpoints = [];
  let stepSize = TAU / thetaSteps;
  for (let i = 0; i < thetaSteps; i++) {
    let theta = stepSize * -i;
    let coord = createVector();
    coord.x = 16 * Math.pow(sin(theta), 3);
    coord.y = 13 * cos(theta) - 5 * cos(2 * theta) - 2 * cos(3 * theta) -
        cos(4 * theta);

    coord.mult(16)
    hpoints.push(coord);
  }

  // squaure points
  let spoints = [];
  for (let i = 0; i < thetaSteps; i++) {
    let theta = stepSize * i + HALF_PI;
    let phi = degrees(theta);
    phi = ((phi + 45) % 90 - 45) / 180 * Math.PI;
    let r = 1 / cos(phi);

    let coord = createVector();
    coord.x = r * cos(theta);
    coord.y = r * sin(theta);

    coord.mult(380)
    spoints.push(coord);
  }

  rect(0, 0, width, height);

  push();
  translate(width / 2, height / 2)
  scale(1, -1)


  beginShape();
  hpoints.forEach(hp => vertex(hp.x, hp.y))
  endShape(CLOSE);

  beginShape();
  spoints.forEach(sp => vertex(sp.x, sp.y))
  endShape(CLOSE);


  let currDepth = depth;
  while (currDepth--) {
    let progress = (currDepth + 0.5) / depth;
    beginShape();
    for (let i = 0; i < thetaSteps; i++) {
      let intervalPoint =
          p5.Vector.lerp(spoints[i], hpoints[i], pow(progress, 0.6))
      vertex(intervalPoint.x, intervalPoint.y);
    }
    endShape(CLOSE);
  }

  //   currDepth = depth * 3;
  //   while (currDepth--) {
  //     let progress = (currDepth + 0.5) / depth;
  //     beginShape();
  //     for (let i = 0; i < thetaSteps; i++) {
  //       let hp0 = hpoints[i];
  //       let hp1 = hpoints[(i + 1) % hpoints.length].copy();
  //       hp1.mult(0.97);

  //       line(hp0.x, hp0.y, hp1.x, hp1.y);

  //       hpoints[i] = hp1;
  //     }
  //     endShape(CLOSE);
  //   }



  if (saving) {
    save();
    saving = false;
  }

  noLoop();
}
