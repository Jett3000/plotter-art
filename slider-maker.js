class LabelledSlider {
  constructor(min = 0, max = 1, initValue = 0, step = 0, label = '') {
    this.containerElement = createElement('div');
    this.containerElement.style('display', 'flex');
    this.containerElement.style('flex-direction', 'column');
    this.containerElement
        .style('max-width', '200px')

            this.sliderElement = createSlider(min, max, initValue, step);
    this.sliderElement.parent(this.containerElement);

    this.paragraphElement = createElement('p');
    this.paragraphElement.html(label);
    this.paragraphElement.parent(this.containerElement);
  }

  value() {
    return this.sliderElement.value();
  }

  value(valueToSet) {
    this.sliderElement.value(valueToSet);
    return this.sliderElement.value();
  }

  setLabel(newLabel) {
    this.paragraphElement.html(newLabel);
  }
}