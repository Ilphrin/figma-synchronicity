import events from './SynchroEvents.js';
import SynchroMap from './SynchroMap.js';

export default class Synchronicity {
  constructor(fileName, configFile) {
    this._doc = null;
    this.domSynchro = new SynchroMap();
    this.stylesheet = document.createElement('style');
    this.width = 0;
    this.height = 0;
    document.body.appendChild(this.stylesheet);

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
      this.width = figmaElement.absoluteBoundingBox.width;
      this.height = figmaElement.absoluteBoundingBox.height;
      if (figmaElement !== null) {
        this.syncBackgroundColor(figmaElement, key);
      }
      this.generateContent(figmaElement, key);
    }
  }

  generateContent(parentElement, domParent) {
    for (let elem of parentElement.children) {
      let child = document.createElement('div');
      child.id = elem.name;
      child.style.position = 'absolute';
      child.style.left = Math.abs(elem.absoluteBoundingBox.x - parentElement.absoluteBoundingBox.x) + 'px';
      child.style.top = Math.abs(elem.absoluteBoundingBox.y - parentElement.absoluteBoundingBox.y) + 'px';
      child.style.width = elem.absoluteBoundingBox.width + 'px';
      if (elem.type === "TEXT") {
        Object.assign(child.style, elem.style);
      }
      child.style.height = elem.absoluteBoundingBox.height / window.innerHeight * 100 + 'vh';
      if (elem.type === "GROUP" || elem.type === "RECTANGLE") {
        if (elem.type === "RECTANGLE") {
          // child.style.marginBottom = '-' + child.style.height;
        }
      }
      if (elem.type === "TEXT") {
        this.syncText(elem, child);
      }
      this.syncBackgroundColor(elem, child);
      domParent.appendChild(child);
      if (elem.children && elem.children.length !== 0) {
        this.generateContent(elem, child);
      }
    }
  }

  viewportPos(coord) {
    return coord;
  }

  syncBackgroundColor(figmaElement, domElem) {
    let color;
    if (figmaElement.fills && figmaElement.fills.length !== 0 && figmaElement.fills[0].color) {
      color = Synchronicity.FigmaRGBAToHex(figmaElement.fills[0].color);
    }
    else if (figmaElement.backgroundColor) {
      color = Synchronicity.FigmaRGBAToHex(figmaElement.backgroundColor);
    }
    else { return; }
    this.stylesheet.innerHTML += `#${domElem.id} { background-color: ${color}; }`;
  }

  syncText(figmaElement, domElem) {
    domElem.innerHTML = figmaElement.name;
    domElem.style.color = Synchronicity.FigmaRGBAToHex(figmaElement.fills[0].color);
  }

  static FigmaRGBAToHex(rgba) {
    var {r, g, b, a} = rgba;
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
  }
}
