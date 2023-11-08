function setup() {
  createCanvas(windowHeight * 12 / 9, windowHeight, SVG);
}

function draw() {
  clear();
  let margin = 80;

  let x = margin;
  let y = margin;
  let spacing = (frameCount % 100) / 100;
  if (spacing == 0) spacing = 0.01;
  spacing = 0.1;
  let lineHeight = 40;

  let fibGen = new FibbonacciGenerator();
  let designWidth = width - margin * 2;

  let lineCount = 0;
  let rowCount = 0;

  while (y < height - margin) {
    let fibNum = fibGen.next();
    // x = fibNum * spacing + margin;
    x += fibNum * spacing;

    if (x > (width - margin)) {
      x = (x % designWidth) + margin;
      y += lineHeight * 0.02;
      rowCount++;
    }

    line(
        x, y, x + (noise(x * 0.005, y * 0.005) - 0.5) * lineHeight,
        y + lineHeight);
    lineCount++;
  }

  save();
  noLoop();

  // text('lines: ' + lineCount + ', rows: ' + rowCount, margin, textSize() *
  // 2); noLoop();
}


class FibbonacciGenerator {
  constructor() {
    this.current = 1;
    this.last = 1;
  }

  next() {
    let next = this.current + this.last;
    this.last = this.current;
    this.current = next;

    return this.current;
  }
}
