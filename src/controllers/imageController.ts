import * as Docker from 'dockerode';
import { Request, Response } from 'express';
import * as fs from 'fs';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';

const docker = new Docker({
  socketPath: '/var/run/docker.sock',
});

class ImageController {

  public search = async (req: Request, res: Response) => {
    const searchTerm: string = req.body.imageName;
    const searchResults: string = await ChildProcessHandler.executeChildProcCommand(
      'docker search --format "{{.Name}}" ' + searchTerm, true).toString();
    let images: string[] = searchResults.toString().split('\n');
    images = images.filter((image) => image !== '');
    res.status(200).json({
      images,
    });
  }

  public pull = async (req: Request, res: Response) => {
    let imageToPull: string = req.body.imageName;
    if (!imageToPull.includes(':')) {
      imageToPull += ':latest';
    }
    docker.pull(imageToPull, (error, stream) => {
      try {
        docker.modem.followProgress(stream, onFinished);
        function onFinished(err, output) {
          if (output) {
            res.status(200).json({
              message: 'Image pulled successfully',
            });
          }
        }
      } catch (err) {
        res.status(404).json({
          error: 'unable to pull image',
        });
      }
    });
  }

  public build = async (req: Request, res: Response) => {
    let imageName: string = req.body.imageName;
    if (!imageName.includes(':')) {
      imageName += ':latest';
    }
    const shortName: string = imageName.substr(0, imageName.indexOf(':'));
    async function getDirOutput() {
      const testDir: string = ImageNameToDirNameConverter.convertImageNameToDirName(shortName);
      const checkDirOutput = await ChildProcessHandler.executeChildProcCommand(
        'cd imagesTestDir && find . -maxdepth 1 -name ' + testDir, false);
      if (!checkDirOutput.includes(testDir)) {
        return res.status(404).json({
          error: 'No source code found',
        });
      }
      const object: object = JSON.parse(await ChildProcessHandler.executeChildProcCommand(
        'docker inspect ' + shortName, false));
      const workingDir = object[0].ContainerConfig.WorkingDir;
      const dirName: string = 'imagesTestDir/' + testDir;
      const dirToCheckForDockerfile: string = dirName + workingDir;
      const checkDockerfileOutput: string = await ChildProcessHandler.executeChildProcCommand(
        'cd ' + dirToCheckForDockerfile + ' && find . -maxdepth 1 -name \"Dockerfile\"', false);
      if (checkDockerfileOutput.includes('Dockerfile')) {
        const buildOutput: string = await ChildProcessHandler.executeChildProcCommand(
          'cd ' + dirToCheckForDockerfile + ' && docker build -t ' + imageName + ' .', true);
        /* istanbul ignore else*/
        if (buildOutput.includes('Successfully built')) {
          res.status(200).json({
            message: 'Image successfully built',
          });
        } else {
          res.status(500).json({
            message: 'Unable to build image',
          });
        }
      } else {
        res.status(403).json({
          error: 'No Dockerfile found in the source code folder',
        });
      }

    }
    getDirOutput();
  }

  public push = async (req: Request, res: Response) => {
    const imageName: string = req.body.imageName;
    try {
      await ChildProcessHandler.executeChildProcCommand(
        'docker push ' + imageName, false);
      res.status(200).json({
        message: 'Image pushed to DockerHub',
      });
    } catch (error) {
      res.status(404).json({
        error: 'Unable to push image',
      });
    }
  }

  public remove = async (req: Request, res: Response) => {
    const imageId: string = req.params.imageId;
    try {
      const removeResults: string = await ChildProcessHandler.executeChildProcCommand(
        'docker rmi --force ' + imageId, false);
      if (removeResults.includes('No such image')) {
        res.status(404).json({
          message: 'Image not found',
        });
      } else {
        res.status(200).json({
          message: 'Image removed successfully',
        });
      }
    } catch (error) {
      res.status(409).json({
        message: 'Image cannot be removed',
      });
    }
  }
}

export default new ImageController();
