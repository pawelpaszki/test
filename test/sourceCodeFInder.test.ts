import {expect} from 'chai';
import SourceCodeFinder from "../src/utilities/SourceCodeFinder";

describe('# SourceCodeFinder', () => {

  describe('test getPath', () => {
    it('should return source code path', () => {
      async function getPath() {
        const testImageName1 = 'pawelpaszki/non-existent';
        let fullPath1: string = await SourceCodeFinder.getFullSrcPath(testImageName1);
        expect(fullPath1).to.equal('');
      }
      getPath();
    });
  });
});