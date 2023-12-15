
function saveUserData() {
  let userData = {
    lineCount: lineCountSlider.value(),
    segmentCount: segmentCountSlider.value(),
    ndx: noiseDxSlider.value(),
    ndy: noiseDySlider.value(),
    nmag: noiseMagSlider.value(),
    nseed: noiseSeedSlider.value(),
    breaking: breakingCheckbox.checked()
  };
  storeItem('userData', userData);
}

function setupSliders() {
  let userData = getItem('userData');
  if (userData) {
    lineCountSlider = createSlider(1, 300, userData.lineCount, 1);
    lineCountLabel = createElement('p');
    segmentCountSlider = createSlider(1, 300, userData.segmentCount, 1);
    segmentCountLabel = createElement('p');
    noiseDxSlider = createSlider(0, 0.01, userData.ndx, 0.0001);
    noiseDxLabel = createElement('p');
    noiseDySlider = createSlider(0, 0.01, userData.ndy, 0.0001);
    noiseDyLabel = createElement('p');
    noiseMagSlider = createSlider(0, height, userData.nmag, 0.1);
    noiseMagLabel = createElement('p');
    noiseSeedSlider = createSlider(0, 99999, userData.nseed, 1);
    noiseSeedLabel = createElement('p');
    breakingCheckbox = createCheckbox('breaking', userData.breaking)
  } else {
    lineCountSlider = createSlider(1, 300, 20, 1);
    lineCountLabel = createElement('p');
    segmentCountSlider = createSlider(1, 300, 20, 1);
    segmentCountLabel = createElement('p');
    noiseDxSlider = createSlider(0, 0.01, 0.005, 0.0001);
    noiseDxLabel = createElement('p');
    noiseDySlider = createSlider(0, 0.01, 0.005, 0.0001);
    noiseDyLabel = createElement('p');
    noiseMagSlider = createSlider(0, height, 100, 0.1);
    noiseMagLabel = createElement('p');
    noiseSeedSlider = createSlider(0, 99999, floor(random(99999)), 1);
    noiseSeedLabel = createElement('p');
    breakingCheckbox = createCheckbox('breaking', true)
  }

  mouseClicked();
}

function keyPressed() {
  if (keyCode == UP_ARROW) {
    noiseDySlider.value(noiseDySlider.value() + 0.0001)
  } else if (keyCode == DOWN_ARROW) {
    noiseDySlider.value(noiseDySlider.value() - 0.0001)
  } else if (keyCode == RIGHT_ARROW) {
    noiseDxSlider.value(noiseDxSlider.value() + 0.0001)
  } else if (keyCode == LEFT_ARROW) {
    noiseDxSlider.value(noiseDxSlider.value() - 0.0001)
  }

  switch (key) {
    case 's':
      save();
      return;
    case 'r':
      noiseSeedSlider.value(random(99999))
      break;
    case 'm':
      noiseMagSlider.value(noiseMagSlider.value() + 20);
      break;
    case 'n':
      noiseMagSlider.value(noiseMagSlider.value() - 20);
      break;
  }
  mouseClicked();
  return false;
}

function mouseClicked() {
  lineCountLabel.html('line count: ' + (lineCountSlider.value() + 1));
  segmentCountLabel.html('segment count: ' + segmentCountSlider.value());
  noiseDxLabel.html('noise ∆x: ' + noiseDxSlider.value());
  noiseDyLabel.html('noise ∆y: ' + noiseDySlider.value());
  noiseMagLabel.html('noise magnitude: ' + noiseMagSlider.value());
  noiseSeedLabel.html('noise seed: ' + noiseSeedSlider.value());
  saveUserData();
  loop();
}

function setup() {
  // create the canvas for the sketch
  let ratio = 4 * 12 / 9;
  let h = window.innerHeight * 0.5;
  let w = h * ratio;

  createCanvas(w, h);
  noFill();
  stroke(0);
  strokeWeight(1);

  // allow user input
  setupSliders();
}

function draw() {
  // reset
  clear()

  // read user parameters
  let nd = {
    x: noiseDxSlider.value(),
    y: noiseDySlider.value(),
    mag: noiseMagSlider.value()
  };
  let lineCount = lineCountSlider.value();
  let segmentCount = segmentCountSlider.value();
  noiseSeed(noiseSeedSlider.value());
  let breaking = breakingCheckbox.checked();


  // precalculate spacings and star position
  let designHeight = height * 0.8;
  let designWidth = width * 0.9;
  let segmentSpacing = designWidth / segmentCount;
  let lineSpacing = designHeight / lineCount;
  let y = (height - designHeight) / 2;
  let x = (width - designWidth) / 2;

  let animationValue = sin(frameCount / 100) + 1.01
  nd.mag *= (animationValue);


  // draw the figure
  beginShape()
  for (let currLine = 0; currLine <= lineCount; currLine++) {
    for (let currSeg = 0; currSeg < segmentCount; currSeg++) {
      vertex(x, y + (noise(x * nd.x, y * nd.y) - 0.5) * nd.mag);
      x += segmentSpacing * (currLine % 2 == 0 ? 1 : -1);
    }
    vertex(x, y + (noise(x * nd.x, y * nd.y) - 0.5) * nd.mag);

    if (breaking) {
      endShape();
      beginShape();
    }

    y += lineSpacing;
  }
  endShape();

  // dont waste computer resources 😎
  noLoop();
}
