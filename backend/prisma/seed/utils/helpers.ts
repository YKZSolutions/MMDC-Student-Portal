/**
 * Picks a random element from an array.
 * @param arr The array to pick from.
 * @returns A random element from the array.
 */
export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Picks a random value from a TypeScript enum or an array of enum values.
 * @param source The enum object or array of enum values to pick from.
 * @returns A random value from the enum.
 */
export function pickRandomEnum<T>(source: Record<string, T> | ReadonlyArray<T>): T {
  const values = Array.isArray(source) 
    ? source 
    : Object.values(source).filter((value): value is T => 
        typeof value === 'string' || typeof value === 'number'
      );
  return pickRandom(values);
}

/**
 * Creates a simple console log for seeding progress.
 * @param message The message to display.
 */
export function log(message: string) {
  console.log(`  > ${message}`);
}
