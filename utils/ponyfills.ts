// Utility functions for working with arrays and strings

/**
 * Checks if a specific value is included in an array.
 * @param arr - An array of type T[].
 * @param value - The value of type T to check for inclusion in the array.
 * @returns True if the value is found in the array; otherwise, false.
 */
export function arrayIncludes<T>(arr: T[], value: T): boolean {
    return arr.indexOf(value) !== -1; // Return true if index is not -1, indicating the value is present.
  }
  
  
  /**
   * Checks if a specific substring is included in a string.
   * @param str - The string to search within.
   * @param value - The substring to look for in the main string.
   * @returns True if the substring is found; otherwise, false.
   */
  export function strIncludes(str: string, value: string): boolean {
    return str.indexOf(value) !== -1; // Return true if index is not -1, indicating the substring is present.
  }

  
  /**
   * Finds and returns the first element in an array that satisfies a provided testing function (callback).
   * @param array - An array of type T[].
   * @param callback - A function that tests each element. It should return true for the desired element.
   * @returns The first element that satisfies the condition; otherwise, undefined.
   */
  export function arrayFind<T>(
    array: T[],
    callback: (value: T, index: number, array: T[]) => boolean
  ): T | undefined {
    // Check if the 'find' method is available on the array
    if ('find' in array) return array.find(callback); // Use built-in 'find' method if available
  
    // If 'find' is not available, iterate manually through the array
    for (let i = 0; i < (array as Array<T>).length; i++) {
      if (callback(array[i], i, array)) return array[i]; // Return the first element that satisfies the callback
    }
    return undefined; // Return undefined if no such element is found
  }
  