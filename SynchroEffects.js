import { FigmaRGBAToHex } from './utils.js';

export default class SynchroEffects {
  static boxShadow(figmaElem, domElem, effect) {
    let color = FigmaRGBAToHex(effect.color);
    let offset = effect.offset;
    let radius = effect.radius;
    let boxShadow = `${offset.x}px ${offset.y}px ${radius}px ${color}`;
    domElem.style.boxShadow = boxShadow;
  }

  static layerBlur(figmaElem, domElem, effect) {
    let radius = effect.radius;
    domElem.style.filter += `blur(${radius}px)`;
  }
}
