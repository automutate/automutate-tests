import { AutoMutator } from "automutate";
import { expect } from "chai";
import * as fs from "mz/fs";

import { AutoMutatorFactory } from "./autoMutatorFactory";

/**
 * File names and settings for test cases.
 */
export interface ITestCaseSettings {
    /**
     * Whether to override the expected file content's with the actual results, instead of checking equality.
     */
    accept?: boolean;

    /**
     * File name for the mutation result.
     */
    actual: string;

    /**
     * File name for what the mutation result should be.
     */
    expected: string;

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
 * Runs a single test case.
 *
 * @param settings   Settings for the test case.
 * @param autoMutatorFactory   Generates AutoMutator instances for testing.
 * @returns A Promise for running the test.
 */
export const runTestCase = async (
    settings: ITestCaseSettings,
    autoMutatorFactory: AutoMutatorFactory,
): Promise<void> => {
    // Arrange
    await arrangeFiles(settings.actual, settings.original);
    const expectedContents: string = (await fs.readFile(settings.expected)).toString();
    const autoMutator: AutoMutator = autoMutatorFactory.create(settings.actual, settings.settings);

    // Act
    await autoMutator.run();

    // Assert
    const actualContents: string = (await fs.readFile(settings.actual)).toString();

    if (settings.accept) {
        await fs.writeFile(settings.expected, actualContents);
    } else {
        expect(actualContents).to.be.equal(expectedContents);
    }
};

/**
 * Resets a test case's files.
 */
const arrangeFiles = async (actual: string, original: string): Promise<void> => {
    await fs.writeFile(actual, await fs.readFile(original));
};
