import { randomInt } from "crypto";

/** No I or O, so a number like 4821K is not read as 48210. */
const LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

/** Four digits and one letter, for example 4821K. */
export function makeOrderNumber(): string {
  const digits = randomInt(0, 10000).toString().padStart(4, "0");
  const letter = LETTERS[randomInt(0, LETTERS.length)];
  return `${digits}${letter}`;
}

export function displayOrderNumber(publicNumber: string) {
  return `#${publicNumber}`;
}
