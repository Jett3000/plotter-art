
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
  save();
}

function setup() {
  // create the canvas for the sketch
  let w = window.innerWidth;
  let h = w / 1.41;  // a4 proportions
  if (h > window.innerHeight) {
    h = window.innerHeight * 0.9;
    w = h * 1.41;  // a4 proportions
  }

  createCanvas(w, w, SVG);
  noFill();
  stroke(0);
  strokeWeight(1);

  // allow user input
  // setupSliders();
}

function draw() {
  // reset
  clear()
  translate(width / 2, height / 2);

  let vecCount = 32;
  let dX = width / (2.2 * vecCount);
  for (let i = 0; i < vecCount; i++) {
    let y = pow(1.2, i);
    line(width / 2 - dX * vecCount, 0, width / 2 - dX * i, y);
  }

  // dont waste computer resources 😎
  noLoop();
}
