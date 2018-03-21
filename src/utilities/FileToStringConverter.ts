import * as fs from 'fs';

class FileToStringConverter {

  public static readFile(path: string): string {
    try {
      return fs.readFileSync(path).toString();
    } catch (err) {
      return '';
    }
  }
}

export default FileToStringConverter;
