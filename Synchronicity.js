import events from './SynchroEvents.js';
import SynchroMap from './SynchroMap.js';

export default class Synchronicity {
  constructor(fileName, configFile) {
    this._doc = null;
    this.domSynchro = new SynchroMap();

    let req = new Request('https://api.figma.com/v1/files/' + fileName);
    fetch(req, {
      headers: {
        'X-Figma-Token': configFile.token
      }
    }).then((res) => {
      return res.json();
    }).then(json => {
      this._doc = json.document.children[0];
      document.dispatchEvent(events.enable);
    }).catch(e => console.error(e));
    document.addEventListener('FigmaSynchronicityNodeAdded', this.update.bind(this));
  }

  get doc() {
    return this._doc;
  }

  set doc(value) {
    this._doc = value;
  }

  startWith(domElement, figmaElementName) {
    if (this._doc === null) {
      return undefined;
    }
    this.domSynchro.set(domElement, figmaElementName);
    this.domDocument = domElement;
  }

  searchFigmaElement(string, parentElement = null) {
    if (parentElement === null) {
      parentElement = this._doc;
    }
    if (parentElement.children === undefined) {
      return null;
    }
    for (let element of parentElement.children) {
      if (element.name === string) {
        return element;
      }
      else {
        let returnValue = this.searchFigmaElement(string, element);
        if (returnValue !== null) {
          return returnValue;
        }
      }
    }
    return null;
  }

  update(e) {
    for (const [key, value] of this.domSynchro.entries()) {
      let figmaElement = this.searchFigmaElement(value);
      if (figmaElement !== null) {
        this.syncBackgroundColor(figmaElement, key);
      }
    }
  }

  syncBackgroundColor(figmaElement, domElem) {
    if (figmaElement.backgroundColor) {
      const color = Synchronicity.FigmaRGBAToHex(figmaElement.backgroundColor);
      domElem.style.backgroundColor = color;
    }
  }

  static FigmaRGBAToHex(rgba) {
    var {r, g, b, a} = rgba;
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
  }
}
