import {Request, Response} from 'express';
import * as lodash from 'lodash';
import * as get from 'simple-get';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';
import {default as OutputParser, IOsJSON} from '../utilities/OutputParser';
import SourceCodeFinder from '../utilities/SourceCodeFinder';

class SrcController {

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
            await ChildProcessHandler.executeChildProcCommand(
              'cd imagesTestDir && rm -rf ' + testDir, false);
            res.status(200).json({
              message: 'Source code successfully removed',
            });
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

  public checkOS = async (req: Request, res: Response) => {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.imageName);
    if (testDir.length > 0) {
      async function checkOSVersion() {
        const checkDirOutput: string = await ChildProcessHandler.executeChildProcCommand(
          'cd imagesTestDir && find . -maxdepth 1 -name ' + testDir, false);
        if (!checkDirOutput.includes(testDir)) {
          return res.status(404).json({
            error: 'No source code found',
          });
        } else {
          try {
            const path: string = 'imagesTestDir/' + testDir + '/etc/os-release';
            const osVersion: IOsJSON = await OutputParser.getOSVersion(path);
            if (osVersion.name !== '') {
              const url: string = 'https://registry.hub.docker.com/v2/repositories/library/'
                + osVersion.name + '/tags/';
              let jsonResponse = null;
              /* tslint:disable */
              get.concat(url, function(err, response, data) {
                /* tslint:enable */
                jsonResponse = JSON.parse(data.toString());
                const results = lodash.map(jsonResponse.results, 'name');
                /* tslint:disable */
                const osVersions  = results.filter(function(el) {
                  return el.toString().length && el == +el;
                });
                /* tslint:enable */
                osVersions.sort();
                res.status(200).json({
                  latest: osVersions[osVersions.length - 1],
                  name: osVersion.name,
                  version: osVersion.version,
                });
              });
            }
          } catch (error) {
            res.status(500).json({
              error: 'Unable to get OS version',
            });
          }
        }
      }
      checkOSVersion();
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }

  public getAvailableDirs = async (req: Request, res: Response) => {
    const directories: string = await ChildProcessHandler.executeChildProcCommand(
      'cd imagesTestDir && ls', false);
    const directoryArray = directories.split('\n').filter((directory) => directory !== '');
    res.status(200).json({
      directoryArray,
    });
  }

  public runTests = async (req: Request, res: Response) => {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.imageName);
    if (testDir.length > 0 && testDir !== 'test') {
      let testResults: string[];
      async function runNpmTests() {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          try {
            const dirToScan = await SourceCodeFinder.getFullSrcPath(req.body.imageName);
            if (dirToScan === '') {
              return res.status(404).json({
                error: 'No source code found',
              });
            }
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
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }

  public checkForUpdates = async (req: Request, res: Response) => {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.imageName);
    if (testDir.length > 0 && testDir !== 'test') {
      let updatesAvailable: string[];
      async function checkForUpdates() {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          try {
            const dirToScan = await SourceCodeFinder.getFullSrcPath(req.body.imageName);
            if (dirToScan === '') {
              return res.status(404).json({
                error: 'No source code found',
              });
            }
            await ChildProcessHandler.executeChildProcCommand(
              'cd ' + dirToScan + ' &&  ncu --packageFile package.json > ncuResults.txt', true);
            updatesAvailable = OutputParser.parseNpmTests(dirToScan + '/ncuResults.txt');
            if (updatesAvailable.length > 0) {
              updatesAvailable = updatesAvailable.filter(
                (entry) => !entry.startsWith('Run ncu') && !entry.startsWith('The following'));
            }
          } catch (error) {
            return res.status(500).json({
              error: 'Unable to check for npm updates',
            });
          }
        } else {
          updatesAvailable = OutputParser.parseNcuOutput('test/test-files/npmUpdatesAvailable.txt');
        }
        return res.status(200).json({
          updatesAvailable,
        });
      }
      checkForUpdates();
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }

  public updateComponents = async (req: Request, res: Response) => {
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.imageName);
    if (testDir.length > 0 && testDir !== 'test') {
      let updatedModules: string[] = [];
      async function checkForUpdates() {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          const dirToScan = await SourceCodeFinder.getFullSrcPath(req.body.imageName);
          if (dirToScan === '') {
            return res.status(404).json({
              error: 'No source code found',
            });
          }
          try {
            if (req.body.packageName) {
              await ChildProcessHandler.executeChildProcCommand(
                'cd ' + dirToScan + ' && npm install --save ' + req.body.packageName, false);
              updatedModules.push(req.body.packageName);
            } else {
              await ChildProcessHandler.executeChildProcCommand(
                'cd ' + dirToScan + ' &&  ncu -a --packageFile package.json > upgraded.txt', true);

              updatedModules = OutputParser.parseNcuOutput(dirToScan + '/upgraded.txt');
            }
            if (!req.body.packageName || req.body.reinstall) {
              await ChildProcessHandler.executeChildProcCommand(
                'cd ' + dirToScan + ' &&  rm -rf node_modules', true);
              await ChildProcessHandler.executeChildProcCommand(
                'cd ' + dirToScan + ' &&  npm install', true);
            }
          } catch (error) {
            return res.status(500).json({
              error: 'Unable to upgrade components',
            });
          }
        } else {
          updatedModules = OutputParser.parseNcuOutput('test/test-files/npmUpdatesAvailable.txt');
        }
        return res.status(200).json({
          updatedModules,
        });
      }
      checkForUpdates();
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }

}

export default new SrcController();
