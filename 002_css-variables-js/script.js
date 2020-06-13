const id = id => document.getElementById(id);

// Set style variable
const setStyleVar = (name, value) => document.documentElement.style.setProperty(`--${name}`, value);

// Control pipes
const pixelPipe = value => value + 'px';
const percentPipe = value => value + '%';
const degPipe = value => value + 'deg';

// Create DOM element
const createElement = (tagName, attrs = {}, ...children) => {
  const elementRef = document.createElement(tagName);

  for (const attr in attrs) {
    elementRef.setAttribute(attr, attrs[attr]);
  }

  for (const child of children) {
    if (typeof child === 'string') {
      elementRef.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      elementRef.appendChild(child);
    }
  }

  return elementRef;
};

class Control {
  // On change listeners
  listeners = [];

  constructor(name, label, inputAttrs, pipe = value => value) {
    // Control name
    this.name = name;

    // Display label
    this.label = label;

    // Value output formatter
    this.pipe = pipe;

    this.inputRef = this.createInput(inputAttrs);
  }

  set value(value) {
    this.inputRef.value = value;
  }

  get value() {
    return this.pipe(this.inputRef.value);
  }

  dom() {
    if (!this.domRef) {
      this.domRef = createElement('label', {class: this.name}, this.label, this.inputRef);
    }
    return this.domRef;
  }

  createInput(attrs) {
    const inputRef = createElement('input', {
      id: this.name,
      ...attrs
    });

    return inputRef;
  }

  // Allows to get notification if value changes
  listen(callback) {
    const listener = () => callback(this.value);

    this.listeners.push(listener);
    this.inputRef.addEventListener('input', listener);
  }

  destroy() {
    for (const listener of this.listeners) {
      this.inputRef.removeEventListener('input', listener);
    }
  }
}

class ControlPanel {
  // Allows to get control by name
  controlsMap = new Map();

  constructor(elementRef, controls = []) {
    if (!elementRef) {
      throw new Error('Element reference is undefined.');
    }
    this.elementRef = elementRef;
    this.controls = controls;

    for (const control of this.controls) {
      this.addControl(control);
    }
  }

  get value() {
    const result = {};

    for (const control of this.controls) {
      result[control.name] = control.value;
    }

    return result;
  }

  // Allows to get notification if value changes
  listen(callback) {
    const listener = () => callback(this.value);

    for (const control of this.controls) {
      control.listen(listener);
    }
  }

  getControl(name) {
    return this.controlsMap.get(name);
  }

  addControl(control) {
    this.controlsMap.set(control.name, control);
    this.elementRef.appendChild(control.dom());
  }

  removeControl(control) {
    this.controlsMap.delete(control.name);
    this.elementRef.removeChild(control.dom());
    control.destroy();
  }
}

const cp = new ControlPanel(id('controlPanel'), [
  new Control('borderColor', 'Border Color', {type: 'color', value: '#ffffff'}),
  new Control('spacing', 'Spacing', {type: 'range', max: 30, value: 15}, pixelPipe),
  new Control('corners', 'Corners', {type: 'range', max: 200, value: 100}, pixelPipe),
  new Control('brightness', 'Brightness', {type: 'range', max: 200, value: 100}, percentPipe),
  new Control('contrast', 'Contrast', {type: 'range', max: 200, value: 100}, percentPipe),
  new Control('saturate', 'Saturate', {type: 'range', max: 200, value: 100}, percentPipe),
  new Control('hueRotate', 'Hue', {type: 'range', max: 360, value: 0}, degPipe),
  new Control('invert', 'Invert', {type: 'range', max: 100, value: 0}, percentPipe),
  new Control('blur', 'Blur', {type: 'range', max: 10, value: 0}, pixelPipe),
  new Control('grayscale', 'Grayscale', {type: 'range', max: 100, value: 0}, percentPipe),
  new Control('sepia', 'Sepia', {type: 'range', max: 100, value: 0}, percentPipe),
  new Control('opacity', 'Opacity', {type: 'range', max: 100, value: 100}, percentPipe)
]);

// Init style variables
setStyle(cp.value);

cp.listen(data => setStyle(data));

function setStyle(data) {
  for (const name in data) {
    setStyleVar(name, data[name]);
  }
}
