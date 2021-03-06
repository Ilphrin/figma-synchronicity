import events from './SynchroEvents.js';
import SynchroMap from './SynchroMap.js';
import SynchroEffects from './SynchroEffects.js';
import { FigmaRGBAToHex } from './utils.js';
import SynchroOverride from './SynchroOverride.js';

export default class Synchronicity {
  constructor(fileName, config) {
    this._doc = null;
    this.domSynchro = new SynchroMap();
    this.overrides = new SynchroOverride(config.overrides);
    this.stylesheet = document.createElement('style');
    this.width = 0;
    this.height = 0;
    this.ratioW = 1;
    this.ratioH = 1;
    this.ratioF = 12;
    document.body.appendChild(this.stylesheet);

    let req = new Request('https://api.figma.com/v1/files/' + fileName);
    fetch(req, {
      headers: {
        'X-Figma-Token': config.token
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
      this.ratioW = this.width / window.innerWidth;
      this.ratioH = this.height / window.innerHeight;
      if (figmaElement !== null) {
        this.syncBackgroundColor(figmaElement, key);
        this.syncPosAndSize(figmaElement, key);
      }
      this.generateContent(figmaElement, key);
    }
  }

  generateContent(parentElement, domParent) {
    for (let elem of parentElement.children) {
      if (elem.visible === false) {
        continue;
      }
      let child = this.generateElement(elem, parentElement);
      if (elem.children && elem.children.length !== 0) {
        this.generateContent(elem, child);
      }
      domParent.appendChild(child); 
    }
  }

  generateElement(figmaElement, parentElement) {
    let child = document.createElement('div');
    child.id = figmaElement.name;
    child.style.position = 'absolute';
    if (figmaElement.type === "TEXT") {
      this.syncText(figmaElement, child);
    }
    this.syncPosAndSize(figmaElement, child, parentElement);
    this.syncBackgroundColor(figmaElement, child);
    this.syncEffect(figmaElement, child);
    let overrideStyle = this.overrides.styleOverridesForKey(figmaElement.name);
    if (overrideStyle !== null) {
      Object.assign(child.style, overrideStyle);
    }
    return child;
  }

  viewportPos(coord) {
    return coord;
  }

  syncBackgroundColor(figmaElement, domElem) {
    let color;
    if (figmaElement.type === "TEXT") { return; }
    if (figmaElement.fills && figmaElement.fills.length !== 0 && figmaElement.fills[0].color) {
      color = FigmaRGBAToHex(figmaElement.fills[0].color);
    }
    else if (figmaElement.backgroundColor) {
      color = FigmaRGBAToHex(figmaElement.backgroundColor);
    }
    else { return; }
    this.stylesheet.innerHTML += `#${domElem.id} { background-color: ${color}; }`;
  }

  syncText(figmaElement, domElem) {
    let text = document.createTextNode(figmaElement.characters);
    let size = figmaElement.style.fontSize;
    size = size / this.ratioF;
    Object.assign(domElem.style, figmaElement.style);
    domElem.style.color = FigmaRGBAToHex(figmaElement.fills[0].color);
    domElem.style.fontSize = `${size}em`;
    domElem.appendChild(text);
  }

  syncPosAndSize(figmaElement, domElem, parentElement = null) {
    if (parentElement !== null) {
      let left = Math.abs(figmaElement.absoluteBoundingBox.x - parentElement.absoluteBoundingBox.x) / this.width * 100;
      domElem.style.left = left * this.ratioW + 'vw';
      let top = Math.abs(figmaElement.absoluteBoundingBox.y - parentElement.absoluteBoundingBox.y) / this.height * 100;
      domElem.style.top = top * this.ratioH + 'vh';
    }
    domElem.style.width = figmaElement.absoluteBoundingBox.width / this.width * 100 * this.ratioW + 'vw';
    domElem.style.height = figmaElement.absoluteBoundingBox.height / this.height * 100 * this.ratioH + 'vh';
  }

  syncEffect(figmaElement, domElem) {
    if (figmaElement.effects.length === 0 ) { return; }
    let effect = figmaElement.effects[0];
    switch(effect.type) {
      case "DROP_SHADOW":
        SynchroEffects.boxShadow(figmaElement, domElem, effect);
        break;
      case "LAYER_BLUR":
        SynchroEffects.layerBlur(figmaElement, domElem, effect);
        break;
    }
  }
}
