var sampler;
var succpic;


var radiusSlider;
var radiusSliderLabel;
var attemptSlider;
var attemptSliderLabel;
var densitySlider;
var densitySliderLabel;
var contrastSlider;
var contrastSliderLabel;
var circleCountLabel;

function saveUserData() {
  let userData = {
    radius: radiusSlider.value(),
    attempts: attemptSlider.value(),
    contrast: contrastSlider.value(),
    density: densitySlider.value()
  };
  storeItem('userData', userData);
}

function setupSliders() {
  let userData = getItem('userData');
  let initialRadiusSliderValue = 5;
  let initialAttemptSliderValue = 12;
  let initialContrastSliderValue = 1;
  let initialDensitySliderValue = 6;
  if (userData) {
    initialRadiusSliderValue = userData.radius;
    initialAttemptSliderValue = userData.attempts;
    initialContrastSliderValue = userData.contrast;
    initialDensitySliderValue = userData.density;
  }

  let sliderRow = createDiv();
  sliderRow.addClass('slider-row');

  let sliderContainer = createDiv().addClass('slider-container');
  radiusSlider = createSlider(1, 5, userData.radius, 0.001);
  radiusSliderLabel = createElement('p');
  radiusSlider.parent(sliderContainer);
  radiusSliderLabel.parent(sliderContainer);
  sliderContainer.parent(sliderRow);

  sliderContainer = createDiv().addClass('slider-container');
  attemptSlider = createSlider(2, 40, userData.attempts, 1);
  attemptSliderLabel = createElement('p');
  attemptSlider.parent(sliderContainer);
  attemptSliderLabel.parent(sliderContainer);
  sliderContainer.parent(sliderRow);

  sliderContainer = createDiv().addClass('slider-container');
  contrastSlider = createSlider(0, 12, userData.contrast, 0.1);
  contrastSliderLabel = createElement('p');
  contrastSlider.parent(sliderContainer);
  contrastSliderLabel.parent(sliderContainer);
  sliderContainer.parent(sliderRow);

  sliderContainer = createDiv().addClass('slider-container');
  densitySlider = createSlider(1, 32, userData.density, 1);
  densitySliderLabel = createElement('p');
  densitySlider.parent(sliderContainer);
  densitySliderLabel.parent(sliderContainer);
  sliderContainer.parent(sliderRow);

  circleCountLabel = createElement('p');

  mouseClicked();
}



function keyPressed() {
  switch (key) {
    case 'r':
      initSampler();
      break;
    case 's':
      clear();

      sampler.samples.forEach(s => {
        let lumVal = luminanceSample(s.pos.x, s.pos.y);
        if (lumVal == 0) {
          return
        }
        circle(s.pos.x, s.pos.y, radiusSlider.value() * (1 + 3 * lumVal))
      })
      save();
      // loop();
  }
}

function mouseClicked() {
  radiusSliderLabel.html('radius: ' + radiusSlider.value());
  attemptSliderLabel.html('attemps: ' + attemptSlider.value());
  contrastSliderLabel.html('contrast: ' + contrastSlider.value());
  densitySliderLabel.html('density: ' + densitySlider.value());
  saveUserData();
  initSampler();
}

function preload() {
  succpic = loadImage('density-poisson/jett-haircut.png');
}

function setup() {
  // create the canvas for the sketch
  createCanvas(window.innerWidth, window.innerHeight * 0.95, SVG);
  noFill();
  strokeWeight(1);

  // size the density map correctly
  succpic.resize(width, 0);
  if (succpic.height > height) {
    succpic.resize(0, height);
  }

  // create ui
  setupSliders();

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

    let rad = radiusSlider.value();
    sampler.samples.forEach(s => {
      let lumVal = luminanceSample(s.pos.x, s.pos.y);
      if (lumVal == 0) {
        return
      }
      circle(s.pos.x, s.pos.y, rad * (1 + 3 * lumVal))
    })
  }
}

function luminanceSample(x, y) {
  // return succpic.get(x, y).g;

  let succpixel = succpic.get(x, y);
  return Math.pow(
      (red(succpixel) + blue(succpixel) + green(succpixel)) / (255 * 3),
      contrastSlider.value());
}

function initSampler() {
  // background('#fefaee');
  // image(succpic, 0, 0);
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
    this.active = luminanceSample(this.pos.x, this.pos.y) != 0;
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
    if (sampleX < 0 || sampleY < 0 || sampleX > this.domainVec.x ||
        sampleY > this.domainVec.y)
      return false;
    // // or a circular subset of the domain
    // let centDist = Math.sqrt(
    //     Math.pow(abs(sampleX - (this.domainVec.x / 2)), 2) +
    //     Math.pow(abs(sampleY - (this.domainVec.y / 2)), 2));
    // if (centDist > this.domainVec.x * 0.5) return false;
    // or in a transparent/black part of the image
    let lumVal = luminanceSample(sampleX, sampleY);
    if (lumVal == 0) return false;

    // test neighboring squares in the spatial hash
    let sampleCol = floor(sampleX / this.cellSize);
    let sampleRow = floor(sampleY / this.cellSize);
    let densityScale = densitySlider.value();
    let radiusPadding = densityScale * this.sampleRadius * lumVal;

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

    // then draw it and return
    circle(sampleX, sampleY, this.sampleRadius * (1 + 3 * lumVal))
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
      // flag the sample as inactive if no samples are placed after max attempts
      if (!sampleAdded) {
        sample.active = false;
      }
    }
  }
}
