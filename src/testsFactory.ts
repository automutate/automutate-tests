import * as path from "path";

import { AutoMutatorFactory, IMutationsProviderFactory } from "./autoMutatorFactory";
import { HierarchyCrawler, IHierarchy } from "./hierarchyCrawler";
import { TestDescriber } from "./testDescriber";
import { ITestCaseSettings, TestCase } from "./testCase";

/**
 * Creates tests for provided cases.
 */
export class TestsFactory {
    /**
     * Creates test cases from test case settings.
     */
    private readonly autoMutatorFactory: AutoMutatorFactory;

    /**
     * Settings for the test cases.
     */
    private readonly settings: ITestCaseSettings;

    /**
     * Generates a directory-based test hierarchy from the file system.
     */
    private readonly hierarchyCrawler: HierarchyCrawler;

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
        this.testDescriber = new TestDescriber((hierarchy: IHierarchy): Promise<void> => {
            return this.runTest(hierarchy);
        });
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
     * Creates and runs a test case.
     * 
     * @param hierarchy   The case's hierarchy.
     * @returns A Promise for running the test.
     */
    private runTest(hierarchy: IHierarchy): Promise<void> {
        return (new TestCase(this.createTestCaseSettings(hierarchy.directoryPath), this.autoMutatorFactory))
            .run();
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
            settings: path.join(casePath, this.settings.settings)
        };
    }
}
