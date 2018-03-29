import events from './SynchroEvents.js';

class SynchroMap extends Map {
  constructor() {
    super();
  }
  
  set(key, value) {
    super.set(key, value);
    document.dispatchEvent(events.nodeAdded);
  }
}

export default SynchroMap;
