import { Hierarchy } from "./hierarchyCrawler";

/**
 * Handler for a hierarchy containing test files.
 *
 * @param hierarchy   The testable hierarchy.
 * @returns A Promise for running the test.
 */
export type IOnTest = (hierarchy: Hierarchy) => Promise<void>;

/**
 * Recursively describes nested test cases in a hierarchy.
 *
 * @param hierarchy   Nested hierarchy of test case files.
 * @param onTest   Action to call on each `it` test.
 */
export const describeTests = (
  hierarchy: Hierarchy,
  onTest: IOnTest,
  includes: RegExp[] | undefined,
  pathToTest = ""
): void => {
  const subPathToTest = joinPathToTest(pathToTest, hierarchy.groupName);
  if (!hierarchy.containsTest) {
    describe(hierarchy.groupName, (): void => {
      for (const child of hierarchy.children) {
        describeTests(child, onTest, includes, subPathToTest);
      }
    });

    return;
  }

  const definer = isTestSkipped(includes, subPathToTest) ? it.skip : it;

  definer(hierarchy.groupName, async (): Promise<void> => {
    await onTest(hierarchy);
  });
};

const joinPathToTest = (a: string, b: string) => [a, b].join("/");

const isTestSkipped = (
  includes: RegExp[] | undefined,
  pathToTest: string
): boolean =>
  includes === undefined || includes.length === 0
    ? false
    : !includes.some((include) => pathToTest.match(include) !== null);
