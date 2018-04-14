import DATA from './override.js';

export default class SynchroOverride {
  constructor() {
    this.data = DATA;
    this.lastCalled = null;
  }

  isInData(name) {
    for (const key of Object.keys(this.data)) {
      if (key === name) {
        this.lastCalled = key;
        return true;
      }
    }
    return false;
  }

  overridesForKey(key) {
    if (this.lastCalled === key) {
      return this.data[key];
    }
    else {
      if (this.isInData(key)) {
        return this.data[key];
      }
    }
    return null;
  }

  styleOverridesForKey(key) {
    let data = this.overridesForKey(key);
    if (data !== null) {
      return data.style;
    }
    return null;
  }
}
