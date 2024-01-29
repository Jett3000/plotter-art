var saving = false;

function setup() {
  createCanvas(window.innerHeight / 2, window.innerHeight / 2, SVG);
  noFill();
  strokeWeight(1);
}

function draw() {
  clear();
  let origin = createVector(0, 0);
  let bl = createVector(0, height);
  let tr = createVector(width, 0);

  let lineCount = 120;
  for (let i = 0; i <= lineCount; i++) {
    let progress = i / lineCount;
    let p0 = p5.Vector.lerp(bl, origin, progress);
    let p1 = p5.Vector.lerp(tr, origin, 1 - progress);
    if (i % 2 == 0) {
      line(p0.x, p0.y, p1.x, p1.y);
    } else {
      line(p1.x, p1.y, p0.x, p0.y);
    }
  }
  if (saving) {
    save();
    saving = false;
  }
  noLoop()
}

function keyPressed() {
  if (key === 's') {
    saving = true;
    loop();
  }
}