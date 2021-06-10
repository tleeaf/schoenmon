export const triads = [
  { name: "major", tones: [0, 4, 7] },
  { name: "maj1Inv", tones: [0, 3, 8] },
  { name: "maj2Inv", tones: [0, 5, 9] },
  { name: "min", tones: [0, 3, 7] },
  { name: "min1Inv", tones: [0, 4, 9] },
  { name: "min2Inv", tones: [0, 5, 8] },
  { name: "dim", tones: [0, 3, 6] },
  { name: "aug", tones: [0, 4, 8] },
];

export function majorDesc(startingNote) {
  return [startingNote, startingNote - 3, startingNote - 7];
}

//Ab,Eb,C
//8,3,0
export function maj1Inv(startingNote) {
  return [startingNote, startingNote - 5, startingNote - 8];
}

//Input: 10 (A#)
//Output:
//Maj2Inv: [0,5,9]
//Max([0,5,9]) - [0,5,9] ---> Reverse 
// [0,-4,-9]
//A#,F#,C#
//10,6,1
export function maj2Inv(startingNote) {
  return [startingNote, startingNote - 4, startingNote - 9];
}

export function minorDesc(startingNote) {
  return [startingNote, startingNote - 4, startingNote - 7];
}

//G#,E,C
//8,4,0
export function augDesc(startingNote) {
  return [startingNote, startingNote - 4, startingNote - 8];
}
