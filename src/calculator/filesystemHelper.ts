import fs from 'fs/promises'

export const loadJSONfromFile = async (filename: string): Promise<string> => {
  try {
    return await fs.readFile(filename, 'utf-8')
  } catch (e: any) {
    throw new Error(`Unable to process JSON: ${e.message}`)
  }
}
