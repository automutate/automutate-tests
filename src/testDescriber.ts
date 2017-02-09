import { IHierarchy } from "./hierarchyCrawler";

/**
 * Handler for a hierarchy containing test files.
 * 
 * @param hierarchy   The testable hierarchy.
 * @returns A Promise for running the test.
 */
export interface IOnTest {
    (hierarchy: IHierarchy): Promise<void>;
}

/**
 * Describes test cases using their hierarchy.
 */
export class TestDescriber {
    /**
     * Handler for a hierarchy containing test files.
     */
    private readonly onTest: IOnTest;

    /**
     * Initializes a new instance of the TestDescriber class.
     * 
     * @param onTest   Handler for a hierarchy containing test files.
     */
    public constructor(onTest: IOnTest) {
        this.onTest = onTest;
    }

    /**
     * Describes the test hierarchy.
     * 
     * @param hierarchy   The root hierarchy.
     */
    public describe(hierarchy: IHierarchy): void {
        if (hierarchy.containsTest) {
            it(hierarchy.groupName, (): Promise<void> => this.onTest(hierarchy));
            return;
        }

        describe(hierarchy.groupName, (): void => {
            for (const child of hierarchy.children) {
                this.describe(child);
            }
        });
    }
}
