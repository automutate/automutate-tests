import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";

/**
 * Nested hierarchy of test cases.
 */
export interface Hierarchy {
  /**
   * Child test hierarchies.
   */
  children: Hierarchy[];

  /**
   * Whether this contains its own test files.
   */
  containsTest: boolean;

  /**
   * Path to the hierarchy.
   */
  directoryPath: string;

  /**
   * Friendly name of the hierarchy.
   */
  groupName: string;
}

/**
 * Crawls a directory to generate a test hierarchy.
 *
 * @param indicatingFileName   File name that must exist in a test case.
 * @param topGroupName   Friendly name of the directory.
 * @param topDirectoryPath   Full path to the directory.
 * @returns The directory's generated test hierarchy.
 */
export const crawlHierarchy = (
  indicatingFileName: string,
  topGroupName: string,
  topDirectoryPath: string
): Hierarchy => {
  const crawl = (groupName: string, directoryPath: string): Hierarchy => {
    const childDirectories = fs
      .readdirSync(directoryPath)
      .filter((fileName) =>
        fs.statSync(path.join(directoryPath, fileName)).isDirectory()
      );

    const matched = glob.sync(path.join(directoryPath, indicatingFileName));

    return {
      children: childDirectories.map((childDirectory) =>
        crawl(childDirectory, path.join(directoryPath, childDirectory))
      ),
      containsTest: matched.length > 0,
      directoryPath,
      groupName,
    };
  };

  return crawl(topGroupName, topDirectoryPath);
};
