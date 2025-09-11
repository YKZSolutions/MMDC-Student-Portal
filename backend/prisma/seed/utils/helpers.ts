/**
 * Picks a random element from an array.
 * @param arr The array to pick from.
 * @returns A random element from the array.
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Picks a random value from a TypeScript enum.
 * @param anEnum The enum to pick from.
 * @returns A random value from the enum.
 */
export function pickRandomEnum<T>(anEnum: T): T[keyof T] {
  const enumValues = Object.values(anEnum as any) as T[keyof T][];
  return pickRandom(enumValues);
}

/**
 * Creates a simple console log for seeding progress.
 * @param message The message to display.
 */
export function log(message: string) {
  console.log(`  > ${message}`);
}
