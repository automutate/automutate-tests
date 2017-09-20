import * as fs from "fs";
import * as path from "path";

/**
 * Nested hierarchy of test cases.
 */
export interface IHierarchy {
    /**
     * Child test hierarchies.
     */
    children: IHierarchy[];

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
 * Generates a directory-based test hierarchy from the file system.
 */
export class HierarchyCrawler {
    /**
     * File name that must exist in a test case.
     */
    private readonly indicatingFileName: string;

    /**
     * Initialize a new instance of the HierarchyCrawler class.
     *
     * @param indicatingFileName   File name that must exist in a test case.
     */
    public constructor(indicatingFileName: string) {
        this.indicatingFileName = indicatingFileName;
    }

    /**
     * Crawls a directory to generate a test hierarchy.
     *
     * @param groupName   Friendly name of the directory.
     * @param directoryPath   Full path to the directory.
     * @returns The directory's generated test hierarchy.
     */
    public crawl(groupName: string, directoryPath: string): IHierarchy {
        const childDirectories: string[] = fs.readdirSync(directoryPath)
            .filter((fileName: string): boolean =>
                fs.statSync(path.join(directoryPath, fileName)).isDirectory());

        const containsTest: boolean = fs.existsSync(path.join(directoryPath, this.indicatingFileName));

        return {
            children: childDirectories.map((childDirectory: string): IHierarchy =>
                this.crawl(childDirectory, path.join(directoryPath, childDirectory))),
            containsTest,
            directoryPath,
            groupName,
        };
    }
}
