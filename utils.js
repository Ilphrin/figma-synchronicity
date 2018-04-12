function FigmaRGBAToHex(rgba) {
    var {r, g, b, a} = rgba;
    return `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
}

export {
  FigmaRGBAToHex,
};
