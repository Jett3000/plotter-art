var sampler;
var birds = [];
var saving = false;

function keyPressed() {
  if (key == 's') {
    saving = true;
    loop();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, SVG)
  sampler = new PoissonHash(createVector(width, height), 2, 30);

  while (!sampler.samplesFull) {
    sampler.growSamples();
  }

  sampler.samples.forEach(sample => {birds.push(new Bird(sample.pos))})
}

function draw() {
  noFill();
  clear();
  birds.forEach(bird => bird.show())

  if (saving) {
    save();
    saving = false;
  }
  noLoop();
}

class Bird {
  constructor(pos) {
    // setup
    let wingStepSize = 13  // random(10, 13);
    let stepDegrees = random(20, 30);
    let steps = 10;
    let heightMulitplier = 1 - pow(random(1), 2.4);
    let topMargin = height * 0.2;
    this.pos = pos;
    // make left wing's points
    let leftPoint = this.pos.copy();
    let leftPoints = [];
    let stepVec = createVector(0, -wingStepSize);
    for (let i = 0; i < steps; i++) {
      stepVec.rotate(radians(random(-stepDegrees, 0)));
      leftPoint.add(stepVec);
      leftPoints.push(leftPoint.copy())
    }
    // make right wing's points
    let rightPoint = this.pos.copy();
    let rightPoints = [];
    stepVec = createVector(0, -wingStepSize);
    for (let i = 0; i < steps; i++) {
      stepVec.rotate(radians(random(0, stepDegrees)));
      rightPoint.add(stepVec);
      rightPoints.push(rightPoint.copy())
    }

    // stitch into bird
    leftPoints.reverse();
    leftPoints.push(this.pos.copy());
    this.points = leftPoints.concat(rightPoints);
  }

  show() {
    beginShape();
    this.points.forEach(p => vertex(p.x, p.y));
    endShape(OPEN);
  }
}

function initSampler() {
  clear();
  sampler = new PoissonHash(
      createVector(succpic.width, succpic.height),
      parseFloat(radiusSlider.value()), parseInt(attemptSlider.value()));
  loop()
}

class Node {
  constructor(pos, spawnRadius) {
    this.pos = pos;
    this.spawnRadius = spawnRadius;
    this.active = true;
  }
}

class PoissonHash {
  constructor(domainVec, sampleRadius, attemptCount) {
    this.domainVec = domainVec;
    this.sampleRadius = sampleRadius;
    this.attemptCount = attemptCount;
    this.cellSize = sampleRadius / Math.sqrt(2);
    this.hashCols = ceil(domainVec.x / this.cellSize);
    this.hashRows = ceil(domainVec.y / this.cellSize);
    this.hashArray = Array(this.hashCols * this.hashRows).fill(-1);
    this.samples = [];
    this.samplesFull = false;

    // initial sample
    this.addSample(domainVec.x / 2, domainVec.y / 2);

    console.log('constructed sampler');
  }

  index2coords(index) {
    let x = index % this.hashCols;
    let y = floor(index / this.hashCols);
    return createVector(x, y);
  }

  coords2index(row, col) {
    let index = row * this.hashCols + col;
    return index;
  }

  addSample(sampleX, sampleY, parent) {
    debugger;
    // reject samples outside of the domain
    if (sampleX < 0 || sampleY < this.domainVec.y * 0.05 ||
        sampleX > this.domainVec.x || sampleY > this.domainVec.y)
      return false;


    // test neighboring squares in the spatial hash
    let sampleCol = floor(sampleX / this.cellSize);
    let sampleRow = floor(sampleY / this.cellSize);
    let densityScale = 55;
    let radiusPadding =
        densityScale * this.sampleRadius * (1 - sampleY / height);

    for (let xOff = -(1 + densityScale); xOff <= (1 + densityScale); xOff++) {
      for (let yOff = -(1 + densityScale); yOff <= (1 + densityScale); yOff++) {
        let searchCol = sampleCol + xOff;
        let searchRow = sampleRow + yOff;
        if (searchCol < 0 || searchRow < 0 || searchCol > this.hashCols ||
            searchRow > this.hashRows)
          continue;

        let collidingSampleIndex =
            this.hashArray[this.coords2index(searchRow, searchCol)];
        if (collidingSampleIndex > -1) {
          let collidingSample = this.samples[collidingSampleIndex];
          let distance = Math.sqrt(
              Math.pow(sampleX - collidingSample.pos.x, 2) +
              Math.pow(sampleY - collidingSample.pos.y, 2));
          if (distance < this.sampleRadius + radiusPadding) return false;
        }
      }
    }

    // on success, add to the sample list and hashmap
    this.hashArray[this.coords2index(sampleRow, sampleCol)] =
        this.samples.length;
    let newSample = new Node(
        createVector(sampleX, sampleY), this.sampleRadius + radiusPadding,
        parent);
    this.samples.push(newSample);

    circle(sampleX, sampleY, this.sampleRadius);
    return true;
  }

  sampleNeighbors(sample) {
    let sampleCol = floor(potentialSample.x / this.cellSize);
    let sampleRow = floor(potentialSample.y / this.cellSize);
    let neighbors = [];

    // pull samples from neighboring squares in the spatial hash
    for (let xOff = -1; xOff <= 1; xOff++) {
      for (let yOff = -1; yOff <= 1; yOff++) {
        let searchCol = sampleCol + xOff;
        let searchRow = sampleRow + yOff;
        if (searchCol < 0 || searchRow < 0 || searchCol > this.hashCols ||
            searchRow > this.hashRows)
          continue;

        let collidingSampleIndex =
            this.hashArray[this.coords2index(searchRow, searchCol)];
        if (collidingSampleIndex > -1) {
          neighbors.push(this.samples[collidingSampleIndex]);
        }
      }
    }
  }

  growSamples() {
    debugger;
    if (this.samplesFull) return;

    // pull the active samples from the main list
    let currentSamples = this.samples.filter(s => s.active);
    if (currentSamples.length == 0) {
      this.samplesFull = true;
      return;
    }

    for (let sample of currentSamples) {
      // boolean to track success
      let sampleAdded = false;


      // attempt to add new sample from the current one
      for (let i = 0; i < this.attemptCount; i++) {
        let theta = random(TWO_PI);
        let r = random(sample.spawnRadius, 2 * sample.spawnRadius)

        // test the new sample for validity
        let potentialX = sample.pos.x + cos(theta) * r;
        let potentialY = sample.pos.y + sin(theta) * r;
        if (this.addSample(potentialX, potentialY, sample)) {
          // if it's accepted, record and break
          sampleAdded = true;
          break;
        }
      }
      // flag the sample as inactive if no samples are placed after max
      // attempts
      if (!sampleAdded) {
        sample.active = false;
      }
    }
  }
}
