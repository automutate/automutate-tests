import * as path from "path";

import { AutoMutatorFactory, IMutationsProviderFactory } from "./autoMutatorFactory";
import { HierarchyCrawler, IHierarchy } from "./hierarchyCrawler";
import { ITestCaseSettings, runTestCase } from "./testCase";
import { TestDescriber } from "./testDescriber";

/**
 * Creates tests for provided cases.
 *
 * @deprecated   Use {@link describeMutationTestCases} instead.
 */
export class TestsFactory {
    /**
     * Creates test cases from test case settings.
     */
    private readonly autoMutatorFactory: AutoMutatorFactory;

    /**
     * Generates a directory-based test hierarchy from the file system.
     */
    private readonly hierarchyCrawler: HierarchyCrawler;

    /**
     * Settings for the test cases.
     */
    private readonly settings: ITestCaseSettings;

    /**
     * Describes test cases using their hierarchy.
     */
    private readonly testDescriber: TestDescriber;

    /**
     * Initializes a new instance of the TestsFactory class.
     *
     * @param mutationsProviderFactory   Creates test cases from test case settings.
     * @param extension   File extension of test case files.
     */
    public constructor(mutationsProviderFactory: IMutationsProviderFactory, settings: ITestCaseSettings) {
        this.autoMutatorFactory = new AutoMutatorFactory(mutationsProviderFactory);
        this.settings = settings;

        this.hierarchyCrawler = new HierarchyCrawler(this.settings.original);
        this.testDescriber = new TestDescriber(
            async (hierarchy: IHierarchy): Promise<void> => this.runTest(hierarchy));
    }

    /**
     * Describes tests for the cases directory.
     *
     * @param casesPath   Path to the test cases.
     */
    public describe(casesPath: string): void {
        this.testDescriber.describe(this.hierarchyCrawler.crawl("cases", casesPath));
    }

    /**
     * Creates settings for a test case.
     *
     * @param casePath   Path to a test case.
     * @returns Settings for the test case.
     */
    private createTestCaseSettings(casePath: string): ITestCaseSettings {
        return {
            actual: path.join(casePath, this.settings.actual),
            expected: path.join(casePath, this.settings.expected),
            original: path.join(casePath, this.settings.original),
            settings: path.join(casePath, this.settings.settings),
        };
    }

    /**
     * Creates and runs a test case.
     *
     * @param hierarchy   The case's hierarchy.
     * @returns A Promise for running the test.
     */
    private async runTest(hierarchy: IHierarchy): Promise<void> {
        await runTestCase(this.createTestCaseSettings(hierarchy.directoryPath), this.autoMutatorFactory);
    }
}

/**
 * @param casesPath   Path to the test cases.
 * @param mutationsProviderFactory   Creates test cases from test case settings.
 * @param settings   File names for test cases.
 */
export const describeMutationTestCases = (
    casesPath: string,
    mutationsProviderFactory: IMutationsProviderFactory,
    testCaseSettings: ITestCaseSettings,
): void => {
    // tslint:disable-next-line:deprecation
    const testsFactory = new TestsFactory(mutationsProviderFactory, testCaseSettings);

    testsFactory.describe(casesPath);
};
