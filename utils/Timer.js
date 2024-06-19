// utils/Timer.js
class Timer {
  constructor(callback) {
    this.callback = callback;
    this.timer = null;
  }

  start(time) {
    const currentTime = Date.now();
    const eventTime = new Date(time).getTime();
    const delay = eventTime - currentTime;

    console.log(`Starting timer for event time: ${new Date(time)} (current time: ${new Date(currentTime)}, delay: ${delay}ms)`);

    if (delay <= 0) {
      console.error('Invalid event time:', new Date(time));
      return;
    }

    this.timer = setTimeout(this.callback, delay);
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

module.exports = Timer;
