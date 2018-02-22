import {expect} from 'chai';
import ImageFreshnessProvider from '../src/utilities/ImageFreshnessProvider';

describe('# ImageFreshnessProvider', () => {

  describe('test returning freshness grade based on provided data', () => {
    it('should return correct freshness grade', () => {
      const gradeData1: number[] = [0,0,0];
      const result1: string = ImageFreshnessProvider.getFreshnessGrade(gradeData1[0],gradeData1[1],gradeData1[2]);
      expect(result1).to.equal('A');
      const gradeData2: number[] = [4,0,0];
      const result2: string = ImageFreshnessProvider.getFreshnessGrade(gradeData2[0],gradeData2[1],gradeData2[2]);
      expect(result2).to.equal('B');
      const gradeData3: number[] = [12,3,0];
      const result3: string = ImageFreshnessProvider.getFreshnessGrade(gradeData3[0],gradeData3[1],gradeData3[2]);
      expect(result3).to.equal('C');
      const gradeData4: number[] = [80,0,0];
      const result4: string = ImageFreshnessProvider.getFreshnessGrade(gradeData4[0],gradeData4[1],gradeData4[2]);
      expect(result4).to.equal('D');
      const gradeData5: number[] = [0,0,2];
      const result5: string = ImageFreshnessProvider.getFreshnessGrade(gradeData5[0],gradeData5[1],gradeData5[2]);
      expect(result5).to.equal('D');
      const gradeData6: number[] = [0,20,0];
      const result6: string = ImageFreshnessProvider.getFreshnessGrade(gradeData6[0],gradeData6[1],gradeData6[2]);
      expect(result6).to.equal('D');
      const gradeData7: number[] = [144,0,0];
      const result7: string = ImageFreshnessProvider.getFreshnessGrade(gradeData7[0],gradeData7[1],gradeData7[2]);
      expect(result7).to.equal('E');
      const gradeData8: number[] = [0,80,0];
      const result8: string = ImageFreshnessProvider.getFreshnessGrade(gradeData8[0],gradeData8[1],gradeData8[2]);
      expect(result8).to.equal('E');
      const gradeData9: number[] = [1,2,22];
      const result9: string = ImageFreshnessProvider.getFreshnessGrade(gradeData9[0],gradeData9[1],gradeData9[2]);
      expect(result9).to.equal('E');
      const gradeData10: number[] = [3,3,31];
      const result10: string = ImageFreshnessProvider.getFreshnessGrade(gradeData10[0],gradeData10[1],gradeData10[2]);
      expect(result10).to.equal('F');
      const gradeData11: number[] = [2,100,0];
      const result11: string = ImageFreshnessProvider.getFreshnessGrade(gradeData11[0],gradeData11[1],gradeData11[2]);
      expect(result11).to.equal('F');
      const gradeData12: number[] = [212,0,0];
      const result12: string = ImageFreshnessProvider.getFreshnessGrade(gradeData12[0],gradeData12[1],gradeData12[2]);
      expect(result12).to.equal('F');
    });
  });
});