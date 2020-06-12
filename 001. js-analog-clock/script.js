const id = id => document.getElementById(id);
const setCSS = (name, value) => document.documentElement.style.setProperty(`--${name}`, value);

class Clock {
  reqId = null;

  constructor(containerRef, size = 200) {
    if (!containerRef) {
      throw new Error('Reference container is not defined');
    }
    this.containerRef = containerRef;
    this.size = size;

    this.init();
    this.setTime(new Date());
  }

  // Tick every second
  start(time = performance.now()) {
    const now = performance.now();

    if (now - time >= 1000) {
      this.setTime(new Date());
      time = now;
    }
    this.reqId = requestAnimationFrame(() => this.start(time));
  }

  stop() {
    if (this.reqId) {
      cancelAnimationFrame(this.reqId);
    }
  }

  init() {
    this.emptyContainer();
    this.buildScale(12, this.size / 2 - 10, 'hours');
    this.buildScale(60, this.size / 2 - 20, 'minutes');
    this.setHourDeg = this.initHand('hour');
    this.setMinuteDeg = this.initHand('minute');
    this.setSecondDeg = this.initHand('second');
  }

  setTime(datetime) {
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const seconds = datetime.getSeconds();

    this.setHourDeg((360 / 12) * (hours + minutes / 60));
    this.setMinuteDeg((360 / 60) * (minutes + seconds / 60));
    this.setSecondDeg((360 / 60) * seconds);
  }

  initHand(className) {
    const elementRef = document.createElement('span');

    elementRef.className = `${className} hand`;
    this.containerRef.appendChild(elementRef);

    return degree => (elementRef.style.transform = `translateY(-50%) rotate(${degree}deg)`);
  }

  buildScale(segments, radius, className = '') {
    const scaleFragmentRef = document.createDocumentFragment();

    for (let degree = 0; degree < 360; degree += 360 / segments) {
      const radians = this.deg2rad(degree);
      const X = Math.cos(radians) * radius;
      const Y = Math.sin(radians) * radius;
      const segmentRef = document.createElement('span');

      segmentRef.className = `scale-segment ${className}`;
      segmentRef.style.transform = `
        translateX(${X}px)
        translateY(${Y}px)
        rotate(${degree}deg)
      `;
      scaleFragmentRef.appendChild(segmentRef);
    }
    this.containerRef.appendChild(scaleFragmentRef);
  }

  emptyContainer() {
    while (this.containerRef.firstChild) {
      this.containerRef.removeChild(this.containerRef.lastChild);
    }
  }

  deg2rad(degree) {
    return (degree * Math.PI) / 180;
  }
}

const clock = new Clock(id('clock'), 400);

setCSS('clock-size', `${clock.size}px`);
clock.start();
