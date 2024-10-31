import { arrayFind, arrayIncludes } from './ponyfills';

/**
 * Retrieves the names of all properties (both enumerable and non-enumerable) of a given object.
 * @param obj - The object from which to retrieve property names.
 * @returns An array of property names as strings.
 */
export function getObjectProps(obj: Record<string, any>): string[] {
  return Object.getOwnPropertyNames(obj); // Return an array of all property names of the object.
}


/**
 * Checks if any of the specified keys (strings or regular expressions) are included in the provided array.
 * @param arr - The array of strings to search.
 * @param keys - The keys to check for, which can be strings or regular expressions.
 * @returns True if any key is found in the array; otherwise, false.
 */
export function includes(arr: string[], ...keys: (string | RegExp)[]): boolean {
  for (const key of keys) {
    if (typeof key === 'string') {
      // Check if the key is a string and if it exists in the array
      if (arrayIncludes(arr, key)) return true; // Return true if the string is found
    } else {
      // If the key is a regular expression, test each array value against the regex
      const match = arrayFind(arr, (value) => key.test(value)); // Find the first match
      if (match != null) return true; // Return true if a match is found
    }
  }
  return false; // Return false if none of the keys are found in the array
}


/**
 * Counts the number of truthy values in an array.
 * @param values - An array of unknown values.
 * @returns The count of truthy values in the array.
 */
export function countTruthy(values: unknown[]): number {
  return values.reduce<number>((sum, value) => sum + (value ? 1 : 0), 0); // Sum the truthy values by incrementing the count for each truthy value
}
