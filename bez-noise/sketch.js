var nd = {x: 0.001, y: 0.001};
var curves = [];

function keyPressed() {
  if (key == 's') {
    clear();
    curves.forEach(c => c.show());
    save();
    loop();
  }
}

function setup() {
  createCanvas(window.innerWidth, window.innerWidth * 4 / 3, SVG);
  noFill();
  strokeWeight(1);

  let cols = 60;
  let rows = 22;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      let pos = createVector(
          lerp(0, width, (0.5 + col) / cols),
          lerp(0, height, (0.5 + row) / rows));
      let c = new BCurve(pos);
      curves.push(c);
    }
  }
}

function draw() {
  clear();
  curves.forEach(c => c.show());
  noLoop();
}

class BCurve {
  constructor(pos) {
    this.pos = pos;
    this.angle = noise(this.pos.x * nd.x, this.pos.y * nd.y) * TAU * 2;
    this.size = 40;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y)
    rotate(this.angle);
    bezier(
        -this.size, this.size / 2, 0, this.size, 0, -this.size, this.size,
        -this.size / 2);
    pop();
  }
}