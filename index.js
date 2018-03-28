import config from  './config.js';

class SynchronicityEvents {
  constructor() {
    this.enable = new Event('FigmaSynchronicityEnabled');
    this.nodeAdded = new Event('FigmaSynchronicityNodeAdded');
  }
}
const events = new SynchronicityEvents();

class SynchroMap extends Map {
  constructor() {
    super();
  }
  
  set(key, value) {
    super.set(key, value);
    document.dispatchEvent(events.nodeAdded);
  }
}

class Synchronicity {
  constructor(fileName, configFile) {
    this.json = null;
    this.domSynchro = new SynchroMap();

    let req = new Request('https://api.figma.com/v1/files/' + fileName);
    fetch(req, {
      headers: {
        'X-Figma-Token': configFile.token
      }
    }).then((res) => {
      return res.json();
    }).then(json => {
      this.json = json.document.children;
      document.dispatchEvent(events.enable);
    }).catch(e => console.error(e));
    document.addEventListener('FigmaSynchronicityNodeAdded', this.update.bind(this));
  }

  get doc() {
    return this.json;
  }

  startWith(domElement, figmaElementName) {
    console.log(this.doc);
    if (this.json === null) {
      return undefined;
    }
    this.domSynchro.set(domElement, figmaElementName);
    this.domDocument = domElement;
  }

  update(e) {
    for (const [key, value] of this.domSynchro.entries()) {
      // TODO
      // Replace this block content with actual code to get each
      // Figma `key` element and styling the backgroundColor of the 
      // DOM `value` element
      key.style.backgroundColor = 
        Synchronicity.FigmaRGBAToHex(this.doc[0].backgroundColor);
      key.style.width = "100vw";
      key.style.height = "100vh";
    }
  }

  static FigmaRGBAToHex(rgba) {
    var {r, g, b, a} = rgba;
    return `#${r * 255}${g * 255}${b * 255}${a * 255}`;
  }
}

export default function newSynchronicity(fileName, configFile = config) {
  return new Synchronicity(fileName, configFile);
}
