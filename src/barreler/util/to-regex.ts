/**
 * Converts to simple regex, allowed wildcard token: *
 * * converts to .*
 *
 * @param path file path
 */
export const filePathToRegex = (path: string) => {
  let regex = path.replace(/\./g, "\\.");
  regex = regex.replace(/\*\*/g, "*");
  regex = regex.replace(/\*/g, ".*");
  regex = regex.replace(/\//g, "\\/");

  return regex;
};
