import {Request, Response} from 'express';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';

class MiscController {

  public removeSrcCode = async (req: Request, res: Response) => {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.params.imageName);
    if (testDir.length > 0) {
      async function checkDirExists() {
        const checkDirOutput: string = await ChildProcessHandler.executeChildProcCommand(
          'cd imagesTestDir && find . -maxdepth 1 -name ' + testDir, false);
        if (!checkDirOutput.includes(testDir)) {
          return res.status(404).json({
            error: 'No source code found',
          });
        } else {
          try {
            const output: string = await ChildProcessHandler.executeChildProcCommand(
              'cd imagesTestDir && rm -rf ' + testDir, false);
            res.status(200).json({
              error: 'Source code successfully removed',
            });
            /* istanbul ignore next */
          } catch (error) {
            res.status(500).json({
              error: 'Unable to remove source code',
            });
          }
        }
      }
      checkDirExists();
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }

  public dockerLogin = async (req: Request, res: Response) => {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const dockerLoginOutput: string = await ChildProcessHandler.executeChildProcCommand(
      'docker login -u ' + username + ' -p ' + password, true);
    /* istanbul ignore if */
    if (dockerLoginOutput.includes('Login Succeeded')) {
      res.status(200).json({
        message: 'Login Successful',
      });
    } else {
      res.status(401).json({
        error: 'Incorrect login and/or password',
      });
    }
  }
}

export default new MiscController();
