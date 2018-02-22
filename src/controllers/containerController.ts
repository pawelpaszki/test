import * as Docker from 'dockerode';
import {ContainerInspectInfo} from 'dockerode';
import { Request, Response } from 'express';
import * as fs from 'fs';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';


const docker = new Docker({
  socketPath: '/var/run/docker.sock',
});

class ContainerController {

  public create = async (req: Request, res: Response) => {
    const name: string = req.body.name;
    docker.createContainer({
      AttachStderr: true,
      AttachStdin: false,
      AttachStdout: true,
      Image: name,
      OpenStdin: false,
      StdinOnce: false,
      Tty: true,
    }, (err, data) => {
      if (data === null) {
        res.status(500).json({
          error: 'Unable to create container',
        });
      } else {
        const id = data.id;
        res.status(200).json({
          id,
        });
      }
    });
  }

  public start = async (req: Request, res: Response) => {
    const container = docker.getContainer(req.body.containerId);
    container.start((err, data) => {
      if (data === null) {
        res.status(404).json({
          error: 'Unable to start container',
        });
      } else {
        res.status(200).json({
          message: 'Container started successfully',
        });
      }
    });
  }

  public list = async (req: Request, res: Response) => {
    docker.listContainers({
      all: 1,
    }, (err, data) => {
      res.status(200).json({
        containers: data,
      });
    });
  }


  public stop = async (req: Request, res: Response) => {
    const container = docker.getContainer(req.body.containerId);
    container.stop((err, data) => {
      if (data === null) {
        res.status(404).json({
          error: 'Unable to stop container',
        });
      } else {
        res.status(200).json({
          message: 'Container stopped successfully',
        });
      }
    });
  }


  public remove = async (req: Request, res: Response) => {
    const container = docker.getContainer(req.params.containerId);
    container.remove((err, data) => {
      if (data === null) {
        if (err.statusCode === 409) {
          res.status(409).json({
            error: 'Unable to remove running container',
          });
        } else {
          res.status(404).json({
            error: 'Unable to remove container',
          });
        }
      } else {
        res.status(200).json({
          message: 'Container removed successfully',
        });
      }
    });
  }

  public extract = async (req: Request, res: Response) => {
    const container = docker.getContainer(req.body.containerId);
    let containerInfo: ContainerInspectInfo;
    try {
      containerInfo = await container.inspect();
    } catch (error) {
      return res.status(404).json({
        err: 'Unable to extract source code. Container not found',
      });
    }
    if (containerInfo.State.Running === false) {
      return res.status(403).json({
        err: 'The container must be running to extract the source code',
      });
    }
    const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.imageName);
    if (testDir.length > 0 && testDir !== 'test') {
      let checkDirOutput: string = '';
      async function getDirOutput() {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          checkDirOutput = await ChildProcessHandler.executeChildProcCommand(
            'cd imagesTestDir && find . -maxdepth 1 -name ' + testDir, false);
          if (checkDirOutput.includes(testDir)) {
            return res.status(403).json({
              error: 'Source code already extracted',
            });
          }
        }
        try {
          container.export((err, stream) => {
            const ws = fs.createWriteStream('imageArchive.tar');
            stream.pipe(ws);
            ws.on('finish', () => {
              async function extractCont() {
                try {
                  await ChildProcessHandler.executeChildProcCommand('cd imagesTestDir && mkdir ' + testDir, true);
                  await ChildProcessHandler.executeChildProcCommand(
                    'tar -x -f imageArchive.tar --directory imagesTestDir/' + testDir, true);
                  await ChildProcessHandler.executeChildProcCommand('rm -rf imageArchive.tar', true);
                  return res.status(200).json({
                    message: 'Container source code extracted successfully',
                  });
                } catch (error) {
                  return res.status(500).json({
                    error: 'Unable to extract source code',
                  });
                }
              }
              extractCont();
            });
          });
        } catch (error) {
          return res.status(500).json({
            error: 'Unable to extract source code',
          });
        }
      }
      getDirOutput();
    } else {
      res.status(500).json({
        error: 'No image name provided',
      });
    }
  }
}

export default new ContainerController();
