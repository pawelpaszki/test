import {expect} from 'chai';
import ImageNameToDirNameConverter from '../src/utilities/ImageNameToDirNameConverter';

describe('# ImageNameToDirNameConverter', () => {
  describe('test converting image name to directory name', () => {
    it('should return correct directory name', () => {
      const dirName1: string = ImageNameToDirNameConverter.convertImageNameToDirName('pawelpaszki/vuln-demo-2-node');
      expect(dirName1).to.equal('testPAWELPASZKIvuln-demo-2-node');
      const dirName2: string = ImageNameToDirNameConverter.convertImageNameToDirName('official-image-name');
      expect(dirName2).to.equal('testOFFICIAL-IMAGE-NAME');
    });
  });
});