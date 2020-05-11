export const uuid = length =>
  window.crypto
    .getRandomValues(new Uint32Array(10))
    .join('')
    .substring(0, length);
