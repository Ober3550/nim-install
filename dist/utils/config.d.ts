/**
 * Write content to a file, creating any missing parent directories.
 * Throws if the file already exists and overwrite is false.
 */
export declare function writeConfig(outputPath: string, content: string, overwrite: boolean): Promise<void>;
export declare function fileExists(filePath: string): boolean;
//# sourceMappingURL=config.d.ts.map