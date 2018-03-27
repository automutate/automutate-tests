import { AutoMutator, FileMutationsApplier, IMutationsProvider, Logger } from "automutate";

/**
 * Creates mutation providers for files.
 *
 * @param fileName   Name of a file to mutate.
 * @param settingsFileName   Name of its settings file, if any.
 * @returns A mutation provider for the file.
 */
export interface IMutationsProviderFactory {
    (fileName: string, settingsFileName?: string): IMutationsProvider;
}

/**
 * Creates AutoMutators for testing.
 */
export class AutoMutatorFactory {
    /**
     * Creates mutation providers for files.
     */
    private readonly mutationsProviderFactory: IMutationsProviderFactory;

    /**
     * Initializes a new instance of the AutoMutatorFactory class.
     *
     * @param mutationsProviderFactory   Creates mutation providers for files.
     */
    public constructor(mutationsProviderFactory: IMutationsProviderFactory) {
        this.mutationsProviderFactory = mutationsProviderFactory;
    }

    /**
     * Creates an AutoMutator for testing.
     *
     * @param fileName   Name of a file to automutate.
     * @param settingsFileName   Name of its settings file, if any.
     * @returns A new AutoMutator for testing.
     */
    public create(fileName: string, settingsFileName?: string): AutoMutator {
        const logger = new Logger();

        return new AutoMutator({
            logger,
            mutationsApplier: new FileMutationsApplier({ logger }),
            mutationsProvider: this.mutationsProviderFactory(fileName, settingsFileName),
        });
    }
}
