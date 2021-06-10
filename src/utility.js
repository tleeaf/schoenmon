export const notes = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
export const octaves = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export function getCycle(arr, i) {
  return arr[i % arr.length];
}

export function getOctave(i) {
  return Math.floor(i / 12 + 4);
}

export function numberToNoteName(i) {
  const proxy = new Proxy(notes, {
    get(target, prop) {
      if (!isNaN(prop)) {
        prop = parseInt(prop, 10);
        if (prop < 0) {
          prop += target.length;
        }
      }
      return target[prop];
    },
  });
  return getCycle(proxy, i) + getOctave(i);
}

export function convertSequence(seq) {
  const result = [];
  seq.forEach((e) => {
    result.push(numberToNoteName(e));
  });
  return result;
}

