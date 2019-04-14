import chalk from "chalk";
import * as glob from "glob";
import * as path from "path";

import { describeTests } from "./describeTests";
import { HierarchyCrawler, IHierarchy } from "./hierarchyCrawler";
import { IMutationsProviderFactory } from "./mutationsProviderFactory";
import { ITestCaseSettings, runTestCase } from "./testCase";

/**
 * Settings to describe test cases, namely file names and CLI flag equivalents.
 */
export interface ITestDescriptionSettings {
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
}

/**
 * Creates tests for provided cases.
 *
 * @deprecated   Use {@link describeMutationTestCases} instead.
 */
export class TestsFactory {
    /**
     * Generates a directory-based test hierarchy from the file system.
     */
    private readonly hierarchyCrawler: HierarchyCrawler;

    /**
     * Creates test cases from test case settings.
     */
    private readonly mutationsProviderFactory: IMutationsProviderFactory;

    /**
     * Settings for the test cases.
     */
    private readonly settings: ITestDescriptionSettings;

    /**
     * Initializes a new instance of the TestsFactory class.
     *
     * @param mutationsProviderFactory   Creates test cases from test case settings.
     * @param extension   File extension of test case files.
     */
    public constructor(mutationsProviderFactory: IMutationsProviderFactory, settings: ITestDescriptionSettings) {
        this.mutationsProviderFactory = mutationsProviderFactory;
        this.settings = settings;

        this.hierarchyCrawler = new HierarchyCrawler(this.settings.original);
    }

    /**
     * Describes tests for the cases directory.
     *
     * @param casesPath   Path to the test cases.
     */
    public describe(casesPath: string): void {
        if (this.settings.includes !== undefined && this.settings.includes.length !== 0) {
            console.log(
                "Including only tests that match any of:\n - ",
                chalk.cyan(this.settings.includes.join("\n - ")),
            );
        }

        describeTests(
            this.hierarchyCrawler.crawl("cases", casesPath),
            async (hierarchy: IHierarchy): Promise<void> => this.runTest(hierarchy),
            this.settings.includes,
        );
    }

    /**
     * Creates and runs a test case.
     *
     * @param hierarchy   The case's hierarchy.
     * @returns A Promise for running the test.
     */
    private async runTest(hierarchy: IHierarchy): Promise<void> {
        const caseSettings = createTestCaseSettings(this.settings, hierarchy.directoryPath);
        if (caseSettings === undefined) {
            throw new Error(`Could not find ${this.settings.original} under ${hierarchy.directoryPath}.`);
        }

        await runTestCase(caseSettings, this.mutationsProviderFactory);
    }
}

/**
 * Creates settings for a test case.
 *
 * @param settings   Settings for test cases.
 * @param casePath   Path to a test case.
 * @returns Settings for the test case.
 */
const createTestCaseSettings = (settings: ITestDescriptionSettings, casePath: string): ITestCaseSettings | undefined => {
    const matches = glob.sync(path.join(casePath, settings.original));
    if (matches.length === 0) {
        return undefined;
    }

    return {
        accept: settings.accept,
        actual: path.join(casePath, getSettingsFile(settings.actual, settings.original)),
        expected: path.join(casePath, getSettingsFile(settings.expected, settings.original)),
        normalizeEndlines: settings.normalizeEndlines,
        original: matches[0],
        settings: path.join(casePath, settings.settings),
    };
};

const getSettingsFile = (filePath: string | ((original: string) => string), original: string): string =>
    typeof filePath === "string"
        ? filePath
        : filePath(original);

/**
 * @param casesPath   Path to the test cases.
 * @param mutationsProviderFactory   Creates test cases from test case settings.
 * @param settings   Settings to describe test cases, namely file names and CLI flag equivalents.
 */
export const describeMutationTestCases = (
    casesPath: string,
    mutationsProviderFactory: IMutationsProviderFactory,
    settings: ITestDescriptionSettings,
): void => {
    // tslint:disable-next-line:deprecation
    const testsFactory = new TestsFactory(mutationsProviderFactory, settings);

    testsFactory.describe(casesPath);
};
