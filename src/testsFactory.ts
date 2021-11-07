import { WavesSettings } from "automutate";
import chalk from "chalk";
import * as glob from "glob";
import * as path from "path";

import { describeTests } from "./describeTests";
import { crawlHierarchy, Hierarchy } from "./hierarchyCrawler";
import { MutationsProviderFactory } from "./mutationsProviderFactory";
import { TestCaseSettings, runTestCase } from "./testCase";

/**
 * Settings to describe test cases, namely file names and CLI flag equivalents.
 */
export interface TestDescriptionSettings {
  /**
   * Whether to override the expected file content's with the actual results, instead of checking equality.
   */
  accept?: boolean;

  /**
   * File name or file name generator for the mutation result.
   */
  actual: string | ((original: string) => string);

  /**
   * File name or file name generator for what the mutation result should be.
   */
  expected: string | ((original: string) => string);

  /**
   * Wildcard(s) of tests to run.
   */
  includes?: RegExp[];

  /**
   * Endlines to normalize \r\n|\n to, if anything.
   */
  normalizeEndlines?: string;

  /**
   * File name for the original file contents.
   */
  original: string;

  /**
   * File name for the settings file.
   */
  settings: string;

  /**
   * Settings controlling how many waves to run.
   */
  waves?: WavesSettings;
}

/**
 * Creates settings for a test case.
 *
 * @param settings   Settings for test cases.
 * @param casePath   Path to a test case.
 * @returns Settings for the test case.
 */
const createTestCaseSettings = (
  settings: TestDescriptionSettings,
  casePath: string
): TestCaseSettings | undefined => {
  const matches = glob.sync(path.join(casePath, settings.original));
  if (matches.length === 0) {
    return undefined;
  }

  const original = matches[0];
  const actual = path.join(
    casePath,
    getSettingsFile(settings.actual, original)
  );
  const expected = path.join(
    casePath,
    getSettingsFile(settings.expected, original)
  );

  return {
    accept: settings.accept,
    actual,
    expected,
    normalizeEndlines: settings.normalizeEndlines,
    original,
    settings: path.join(casePath, settings.settings),
    waves: settings.waves,
  };
};

const getSettingsFile = (
  filePath: string | ((original: string) => string),
  original: string
): string => (typeof filePath === "string" ? filePath : filePath(original));

/**
 * @param casesPath   Path to the test cases.
 * @param mutationsProviderFactory   Creates test cases from test case settings.
 * @param settings   Settings to describe test cases, namely file names and CLI flag equivalents.
 */
export const describeMutationTestCases = (
  casesPath: string,
  mutationsProviderFactory: MutationsProviderFactory,
  settings: TestDescriptionSettings
): void => {
  /**
   * Creates and runs a test case.
   *
   * @param hierarchy   The case's hierarchy.
   * @returns A Promise for running the test.
   */
  const runTest = async (hierarchy: Hierarchy): Promise<void> => {
    const caseSettings = createTestCaseSettings(
      settings,
      hierarchy.directoryPath
    );
    if (caseSettings === undefined) {
      throw new Error(
        `Could not find ${settings.original} under ${hierarchy.directoryPath}.`
      );
    }

    await runTestCase(caseSettings, mutationsProviderFactory);
  };

  if (settings.includes !== undefined && settings.includes.length !== 0) {
    console.log(
      "Including only tests that match any of:\n - ",
      chalk.cyan(settings.includes.join("\n - "))
    );
  }

  describeTests(
    crawlHierarchy(settings.original, "cases", casesPath),
    async (hierarchy) => runTest(hierarchy),
    settings.includes
  );
};
