var sampler;


function keyPressed() {
  switch (key) {
    case 'r':
      initSampler();
      break;
    case 's':
      // save nodes
      clear();
      rect(0, 0, width, height);
      sampler.samples.forEach(s => {
        circle(s.pos.x, s.pos.y, s.spawnRadius / 3);
      })
      save();
      // save lines
      clear();
      rect(0, 0, width, height);
      sampler.samples.forEach(s => {
        let neighbors = sampler.sampleNeighbors(s).slice(0, 4);
        neighbors.forEach(n => {
          let lineVec = p5.Vector.sub(n.pos, s.pos);
          let sEdge =
              lineVec.copy().normalize().mult(s.spawnRadius / 6).add(s.pos);
          let nEdge = lineVec.normalize().mult(-n.spawnRadius / 6).add(n.pos);
          line(sEdge.x, sEdge.y, nEdge.x, nEdge.y);
        })
      })
      save();
      loop();
      break;
  }
}

function mouseClicked() {
  initSampler();
}


function setup() {
  // create sliders
  radiusSlider = createSlider(1, 30, 5, 1);
  radiusSlider.style('width', '200px')
  attemptSlider = createSlider(2, 40, 12, 1);
  attemptSlider.style('width', '200px')
  densitySlider = createSlider(1, 32, 6, 1);
  densitySlider.style('width', '200px')
  circleCountLabel = createElement('p');

  // create the canvas for the sketch
  let h = window.innerHeight * 0.95
  let w = h * 1.41;
  createCanvas(w, h, SVG);
  noFill();
  strokeWeight(1);
  strokeCap(SQUARE);

  // begin generations :)
  initSampler();
}

function draw() {
  circleCountLabel.html('' + sampler.samples.length);
  if (!sampler.samplesFull) {
    sampler.growSamples();
    sampler.growSamples();
  } else {
    noLoop();
    clear();
    debugger;
    let rad = radiusSlider.value();
    sampler.samples.forEach(s => {
      circle(s.pos.x, s.pos.y, s.spawnRadius / 3)
      let neighbors = sampler.sampleNeighbors(s).slice(0, 4);
      neighbors.forEach(n => {
        let lineVec = p5.Vector.sub(n.pos, s.pos);
        let sEdge =
            lineVec.copy().normalize().mult(s.spawnRadius / 6).add(s.pos);
        let nEdge = lineVec.normalize().mult(-n.spawnRadius / 6).add(n.pos);
        line(sEdge.x, sEdge.y, nEdge.x, nEdge.y);
      })
    });
  }
}

function initSampler() {
  // background('#fefaee');
  // image(succpic, 0, 0);
  noiseSeed(random(99999))
  clear();
  sampler = new PoissonHash(
      createVector(width, height), parseFloat(radiusSlider.value()),
      parseInt(attemptSlider.value()));
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
    // debugger;
    let lumVal = noise(sampleX * 0.01, sampleY * 0.01);
    let densityScale = densitySlider.value();
    let radiusPadding = densityScale * this.sampleRadius * lumVal;
    let sampleSpawnRadius = radiusPadding + this.sampleRadius;

    // reject samples outside of the domain
    if (sampleX - sampleSpawnRadius < 0 || sampleY - sampleSpawnRadius < 0 ||
        sampleX + sampleSpawnRadius > this.domainVec.x ||
        sampleY + sampleSpawnRadius > this.domainVec.y)
      return false;
    // or a circular subset of the domain
    let centDist = Math.sqrt(
        Math.pow(abs(sampleX - (this.domainVec.x / 2)), 2) +
        Math.pow(abs(sampleY - (this.domainVec.y / 2)), 2));
    if (centDist > this.domainVec.x * 0.5) return false;
    // test neighboring squares in the spatial hash
    let sampleCol = floor(sampleX / this.cellSize);
    let sampleRow = floor(sampleY / this.cellSize);

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
          if (distance < sampleSpawnRadius ||
              distance < collidingSample.spawnRadius)
            return false;
        }
      }
    }

    // on success, add to the sample list and hashmap
    this.hashArray[this.coords2index(sampleRow, sampleCol)] =
        this.samples.length;
    let newSample =
        new Node(createVector(sampleX, sampleY), sampleSpawnRadius, parent);
    this.samples.push(newSample);

    // then draw it and return successfully
    circle(sampleX, sampleY, newSample.spawnRadius / 3)
    return true;
  }

  sampleNeighbors(sample) {
    let sampleCol = floor(sample.pos.x / this.cellSize);
    let sampleRow = floor(sample.pos.y / this.cellSize);
    let neighbors = [];

    // pull samples from neighboring squares in the spatial hash
    let densityScale = densitySlider.value();
    for (let xOff = -(2 + densityScale); xOff <= (2 + densityScale); xOff++) {
      for (let yOff = -(2 + densityScale); yOff <= (2 + densityScale); yOff++) {
        let searchCol = sampleCol + xOff;
        let searchRow = sampleRow + yOff;
        if (searchCol < 0 || searchRow < 0 || searchCol > this.hashCols ||
            searchRow > this.hashRows || (xOff == 0 && yOff == 0))
          continue;

        let collidingSampleIndex =
            this.hashArray[this.coords2index(searchRow, searchCol)];
        if (collidingSampleIndex > -1) {
          neighbors.push(this.samples[collidingSampleIndex]);
        }
      }
    }

    return neighbors;
  }

  growSamples() {
    // debugger;
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
