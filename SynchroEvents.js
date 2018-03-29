class SynchroEvents {
  constructor() {
    this.enable = new Event('FigmaSynchronicityEnabled');
    this.nodeAdded = new Event('FigmaSynchronicityNodeAdded');
  }
}
const events = new SynchroEvents();
export default events;
