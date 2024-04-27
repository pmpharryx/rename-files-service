import fs from "node:fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

/**
 * Retrieves a list of file names from a specified directory.
 * @param {string} directoryPath - The path of the directory to read.
 * @returns {Promise<string[]>} A Promise that resolves to an array of file names.
 * @throws {Error} If there is an error while reading the directory.
 */
async function getFiles(directoryPath: string): Promise<string[]> {
  try {
    const fileNames = await fs.readdir(directoryPath);
    return fileNames;
  } catch (error) {
    console.error(`Error while reading files from -> ${directoryPath}:`, error);
    throw error;
  }
}

/**
 * Generates a new file name with a UUID and the original file extension.
 * @param {string} fileExtension - The original file extension.
 * @returns {string} The new file name.
 */
function getNewFilename(fileExtension: string): string {
  return uuid() + fileExtension;
}

/**
 * Checks if a given string is a valid UUID.
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string is a valid UUID, false otherwise.
 */
function isUUID(str: string): boolean {
  const hex = "0-9a-fA-F";
  const regex = new RegExp(
    `^[${hex}]{8}-[${hex}]{4}-[${hex}]{4}-[${hex}]{4}-[${hex}]{12}$`
  );
  return regex.test(str);
}

/**
 * Renames files in a specified directory by replacing a UUID to their names.
 * @param {string} directoryName - The name of the directory to process.
 * @returns {Promise<void>} A Promise that resolves once the renaming process is complete.
 */
async function renameProcess(directoryName: string): Promise<void> {
  const directoryPath = path.join(__dirname, "../", directoryName);

  try {
    // Check if the directory exists
    const directoryExists = await fs
      .stat(directoryPath)
      .then((stat) => stat.isDirectory())
      .catch(() => false);

    if (!directoryExists) {
      console.error(`Directory does not exist: ${directoryPath}`);
      return;
    }

    // Get the list of file names in the directory
    const fileNames = await getFiles(directoryPath);
    
    const total = fileNames.length;
    let done = 0;

    console.log("Started renaming process.");

    // Iterate through each file and rename it
    for (const fileName of fileNames) {
      try {
        // Skip files that already have a UUID in their names
        if (isUUID(path.parse(fileName).name)) continue;

        const fileExtension = path.extname(fileName);
        const newFileName = getNewFilename(fileExtension);

        // Rename the file
        await fs.rename(
          path.join(directoryPath, fileName),
          path.join(directoryPath, newFileName)
        );

        done += 1;

        console.log(`Processing ${fileName} (${done}/${total})`);
      } catch (error) {
        console.error(`Error while renaming file -> ${fileName}:`, error);
      }
    }

    console.log("Renaming process completed.");
  } catch (error) {
    console.error(`Error in renameProcess:`, error);
  }
}

/**
 * Starts the renaming process for the "files" directory.
 * @returns {Promise<void>} A Promise that resolves once the renaming process is complete.
 */
async function startRenameFilesService(): Promise<void> {
  await renameProcess("files");
}

// Start the service
startRenameFilesService();

/**
 * Creates n number of empty files in the specified directory.
 * @param {string} directoryPath - The path of the directory where empty files will be created.
 * @param {number} n - The number of empty files to create.
 * @param {string} fileExtension - The file extension for the empty files (e.g., ".txt").
 * @returns {Promise<void>} A Promise that resolves once the empty files are created.
 */
async function createEmptyFiles(directoryPath: string, n: number, fileExtension: string): Promise<void> {
  try {
    // Ensure the directory exists
    const directoryExists = await fs
      .stat(directoryPath)
      .then((stat) => stat.isDirectory())
      .catch(() => false);

    if (!directoryExists) {
      console.error(`Directory does not exist: ${directoryPath}`);
      return;
    }

    // Generate and create empty files
    for (let i = 0; i < n; i++) {
      const fileName = i + fileExtension;
      const filePath = path.join(directoryPath, fileName);

      await fs.writeFile(filePath, " ");

      console.log(`Created empty file: ${fileName}`);
    }

    console.log(`Creation of ${n} empty files completed.`);
  } catch (error) {
    console.error(`Error in createEmptyFiles:`, error);
  }
}

// Example usage: create 5 empty files with a ".txt" extension in the "files" directory
// createEmptyFiles(path.join(__dirname, "../", "files"), 20, ".jpg");