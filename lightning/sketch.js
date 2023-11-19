p5.disableFriendlyErrors = true;

var bolts = [];
var boltCount = 6;
var detailDepth = 8;
var forkChanceSlider;

function setup() {
  // environment

  createCanvas(windowWidth, windowHeight, SVG);
  stroke(188, 158, 202, 210);
  fill(255);
  frameRate(30);

  forkChanceSlider = createSlider(0, 1, 0.6, 0);
  detailDepthSlider = createSlider(1, 12, 9, 1);

  // bolt initialization
  for (let i = 0; i < boltCount; i++) {
    bolts.push(new Bolt());
  }
}

function keyPressed() {
  if (key == 's') {
    clear();
    push();
    stroke(0);
    bolts.forEach(bolt => bolt.show());
    save()
    pop();
    loop();
  }
}


function mouseClicked() {
  bolts = [];
  for (let i = 0; i < boltCount; i++) {
    bolts.push(new Bolt());
  }
  loop();
}


function draw() {
  clear();
  background(28);

  bolts.forEach(bolt => bolt.show());
  // bolts.forEach(bolt => bolt.regenerate());
  noLoop();
}

class Bolt {
  constructor() {
    this.regenerate();
  }

  regenerate() {
    this.root = createVector((bolts.length + 0.5) * width / boltCount, 0);
    this.dest = createVector(
        this.root.x + random(-width * 0.05, width * 0.05), height * 0.8);
    this.rootSeg = new Segment(this.root, this.dest, 16);
    this.segments = this.rootSeg.subdivide();
    this.currentDepth = 0;

    this.detailBolt(detailDepthSlider.value());
  }

  detailBolt(depth = 1) {
    this.currentDepth += depth;
    // let st = millis();
    for (let i = 0; i < depth; i++) {
      let newSegs = [];

      while (this.segments.length > 0) {
        let curSeg = this.segments.pop();
        // subdivide
        let divisions = curSeg.subdivide();
        newSegs.push(divisions[0]);
        newSegs.push(divisions[1]);
        let mp = divisions[0].endPos.copy();

        // chance to add fork
        // let forkChance = curSeg.width >= 5 ? 1 : 0.6;
        if (curSeg.width >= 5 ||
            (random() < forkChanceSlider.value() && curSeg.width > 0.4)) {
          let direction = p5.Vector.sub(curSeg.endPos, curSeg.startPos);
          direction.rotate(random(HALF_PI) - QUARTER_PI).mult(0.9);

          direction.y = abs(direction.y);
          let newEndPos = mp.copy().add(direction);
          // while (newEndPos.x >= width) {
          //   newEndPos.x -= 3;
          // }
          // while (newEndPos.x <= 0) {
          //   newEndPos.x += 3;
          // }

          let forkSeg = new Segment(mp, newEndPos, curSeg.width * 0.3);
          newSegs.push(forkSeg);
        }
      }
      this.segments = newSegs;
    }
    // print("bolt generation took " + Math.round(millis() - st) + "ms");
  }

  show() {
    this.segments.forEach((seg) => seg.show());
  }

  resetTiming() {
    this.segments.forEach((seg) => seg.calcDisplayFrame());
  }
}

class Segment {
  constructor(startPos, endPos, width) {
    this.startPos = startPos;
    this.endPos = endPos;
    this.width = width;
    this.calcDisplayFrame();
  }

  calcDisplayFrame() {
    this.displayOnFrame = frameCount + floor(this.startPos.y / 40);
  }

  midpoint() {
    return p5.Vector.add(this.startPos, this.endPos).mult(0.5);
  }

  show() {
    strokeWeight(1);
    line(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
  }

  subdivide(offsetFac = 0.2) {
    let midpoint = this.midpoint();
    let offset = p5.Vector.sub(this.endPos, this.startPos).mag() * offsetFac;
    midpoint.x += random(-offset, offset);
    midpoint.y += random(-offset, offset);
    let segA = new Segment(this.startPos, midpoint, this.width);
    let segB = new Segment(midpoint, this.endPos, this.width);

    return [segA, segB];
  }
}
