import {expect} from 'chai';
import FileToStringConverter from '../src/utilities/FileToStringConverter';

describe('# FileToStringConverter', () => {

  describe('test reading file content', () => {
    it('should return content of a file or an empty string if the path is invalid', () => {
      let filePath = 'test/test-files/os-release-v1';
      let readString: string = FileToStringConverter.readFile(filePath);
      expect(readString.length).to.not.equal(0);
      let nonExistentPath = '/nonexistentpath';
      let readEmptyString: string = FileToStringConverter.readFile(nonExistentPath);
      expect(readEmptyString.length).to.equal(0);
    });
  });
});