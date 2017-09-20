import { expect } from "chai";
import * as fs from "mz/fs";

import { AutoMutator } from "automutate/lib/automutator";
import { AutoMutatorFactory } from "./autoMutatorFactory";

/**
 * File names or contents for test cases.
 */
export interface ITestCaseSettings {
    /**
     * File name or contents for the mutation result.
     */
    actual: string;

    /**
     * File name or contents for what the mutation result should be.
     */
    expected: string;

    /**
     * File name or contents for the original file contents.
     */
    original: string;

    /**
     * File name or contents for the settings file.
     */
    settings: string;
}

/**
 * Describes a single test case to be run.
 */
export class TestCase {
    /**
     * Generates AutoMutator instances for testing.
     */
    private readonly autoMutatorFactory: AutoMutatorFactory;

    /**
     * Settings for the test case.
     */
    private readonly settings: ITestCaseSettings;

    /**
     * Initializes a new instance of the TestCase class.
     *
     * @param settings   Settings for the test case.
     * @param autoMutatorFactory   Generates AutoMutator instances for testing.
     */
    public constructor(settings: ITestCaseSettings, autoMutatorFactory: AutoMutatorFactory) {
        this.settings = settings;
        this.autoMutatorFactory = autoMutatorFactory;
    }

    /**
     * Runs the test case.
     *
     * @returns A Promise for running the test.
     */
    public async run(): Promise<void> {
        // Arrange
        await this.arrangeFiles();
        const expectedContents: string = (await fs.readFile(this.settings.expected)).toString();
        const autoMutator: AutoMutator = this.autoMutatorFactory.create(this.settings.actual, this.settings.settings);

        // Act
        await autoMutator.run();

        // Assert
        const actualContents: string = (await fs.readFile(this.settings.actual)).toString();
        expect(actualContents).to.be.equal(expectedContents);
    }

    /**
     * Resets the test case files.
     */
    private async arrangeFiles(): Promise<void> {
        const original = await fs.readFile(this.settings.original);

        await fs.writeFile(this.settings.actual, original);
    }
}
