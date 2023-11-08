// p5.disableFriendlyErrors = true;

var saving = false;
var bubbles = [];


function keyPressed() {
  if (key == 's') {
    // return;
    saving = true;
  }
  loop();
}

function setup() {
  // environment
  createCanvas(window.innerWidth, window.innerHeight, SVG);
  stroke(255);
  strokeWeight(2);
  noFill();
  frameRate(30);

  bubbles.push(new Bubble(createVector(width / 2, height), width / 6));
}

function draw() {
  for (let simframes = 0; simframes < 100 && !saving; simframes++) {
    bubbles.forEach(b => b.step());
    if (simframes % 50 == 0) {
      bubbles.push(new Bubble(
          createVector(width / 2 * random(0.5, 1.5), height), width / 6));
    }
  }
  console.log('done simulating');

  clear();
  if (!saving) {
    background(0);
    stroke(255);
  } else {
    stroke(0);
  }

  let minY = height;
  let maxY = 0;
  bubbles.forEach(b => {
    minY = b.pos.y < minY ? b.pos.y : minY;
    maxY = b.pos.y > maxY ? b.pos.y : maxY;
  });
  if (maxY - minY > height) {
    let vDist = maxY - minY;
    let percentChange = height / vDist;
    scale(percentChange, percentChange)
    translate(abs(minY) / 2, abs(minY));
  }

  if (frameCount % 60 == 0) {
    bubbles.push(new Bubble(
        createVector(width / 2 * random(0.5, 1.5), height), width / 10));
  }

  bubbles.forEach(b => {
    b.step();
    b.show()
  });

  if (saving) {
    save();
    saving = false;
  }
  noLoop();
}

class Bubble {
  constructor(pos, rad, subbleCount = 200) {
    this.pos = pos;
    this.rad = rad;
    this.vel =
        p5.Vector.fromAngle((-PI / 2) * random(0.3, 1.7)).mult(random(1.3, 2));
    this.acc = createVector(0, -0.02);

    this.subbleCount = subbleCount;
  }
  step() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    if (random() < 0.015 && this.subbleCount > 50) {
      let retention = 0.85;
      let childBub = new Bubble(
          this.pos.copy(), this.rad * retention,
          this.subbleCount * retention * 0.5);
      bubbles.push(childBub);
      this.rad *= retention;
      this.subbleCount *= retention;
    }
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    this.subbles = [];  // sub bubbles... haha
    let subbleCounter = this.subbleCount;
    // debugger;
    while (subbleCounter > 0) {
      let subble = createVector(
          TWO_PI * random(), lerp(this.rad * 0.4, this.rad, pow(random(), 0.2)),
          random(this.rad / 20, this.rad / 10));
      this.subbles.push(subble)
      subbleCounter--;
    }
    this.subbles.forEach(s => {circle(s.y * cos(s.x), s.y * sin(s.x), s.z)});
    pop();
  }
}