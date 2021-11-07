import { MutationsProvider } from "automutate";

/**
 * Creates mutation providers for files.
 *
 * @param fileName   Name of a file to mutate.
 * @param settingsFileName   Name of its settings file, if any.
 * @returns A mutation provider for the file.
 */
export interface MutationsProviderFactory {
  (fileName: string, settingsFileName?: string): MutationsProvider;
}
