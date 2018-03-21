import {ChildProcessHandler} from './ChildProcessHandler';
import ImageNameToDirNameConverter from './ImageNameToDirNameConverter';

class SourceCodeFinder {

  public static async getFullSrcPath(imageName: string): Promise<string>  {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(imageName);
    const checkDirOutput = await ChildProcessHandler.executeChildProcCommand(
      'cd imagesTestDir && find . -maxdepth 1 -name ' + testDir, false);
    if (!checkDirOutput.includes(testDir)) {
      return '';
    }
    const object: object = JSON.parse(await ChildProcessHandler.executeChildProcCommand(
      'docker inspect ' + imageName, false));
    const workingDir = object[0].ContainerConfig.WorkingDir;
    const dirName: string = 'imagesTestDir/' + testDir;
    return dirName + workingDir;
  }
}

export default SourceCodeFinder;
