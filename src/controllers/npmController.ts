import {Request, Response} from 'express';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';
import OutputParser from '../utilities/OutputParser';

class NpmController {

  public runTests = async (req: Request, res: Response) => {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.imageName);
    if (testDir.length > 0 && testDir !== 'test') {
      async function checkDirExists() {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          const checkDirOutput: string = await ChildProcessHandler.executeChildProcCommand(
            'cd imagesTestDir && find . -maxdepth 1 -name ' + testDir, false);
          if (!checkDirOutput.includes(testDir)) {
            return res.status(404).json({
              error: 'No source code found',
            });
          }
        }
        try {
          let testResults: string[];
          async function runNpmTests() {
            /* istanbul ignore if */
            if (process.env.NODE_ENV !== 'test') {
              try {
                const dirName: string = 'imagesTestDir/' + testDir;
                const object: object = JSON.parse(await ChildProcessHandler.executeChildProcCommand(
                  'docker inspect ' + req.body.imageName, false));
                const workingDir: string = object[0].ContainerConfig.WorkingDir;
                const dirToScan: string = dirName + workingDir;

                await ChildProcessHandler.executeChildProcCommand(
                  'cd ' + dirToScan + ' && npm test > npmTestResults.txt', true);
                testResults = OutputParser.parseNpmTests(dirToScan + '/npmTestResults.txt');
              } catch (error) {
                return res.status(500).json({
                  error: 'Unable to run npm tests',
                });
              }
            } else {
              testResults = OutputParser.parseNpmTests('test/test-files/npmTestResults.txt');
            }
            return res.status(200).json({
              testResults,
            });
          }
          runNpmTests();
        } catch (error) {
          return res.status(500).json({
            error: 'Unable to run npm tests',
          });
        }
      }
      checkDirExists();
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }

}

export default new NpmController();
