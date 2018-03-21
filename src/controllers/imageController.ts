import * as Docker from 'dockerode';
import {Request, Response} from 'express';
import * as fs from 'fs';
import {ImageFreshnessEntry} from '../models/imageFreshnessEntry';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import ImageFreshnessProvider from '../utilities/ImageFreshnessProvider';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';
import SourceCodeFinder from '../utilities/SourceCodeFinder';

const docker = new Docker({
  socketPath: '/var/run/docker.sock',
});

class ImageController {

  public list = async (req: Request, res: Response) => {
    const imageFreshnessEntries = await ImageFreshnessEntry.find({}).exec();
    docker.listImages((err, data) => {
      const imagesData = data;
      const imagesList: IImage[] = [];
      for (const image of imagesData) {
        const name: string = image.RepoTags[0].toString().substr(0, image.RepoTags[0].toString().indexOf(':'));
        const id: string = image.Id.toString().substr(image.Id.toString().indexOf(':') + 1);
        let tag: string = '';
        for (const imageTag of image.RepoTags) {
          tag = imageTag.toString().substr(imageTag.toString().indexOf(':') + 1);
          if (tag === 'latest') {
            break;
          }
        }
        const size: string = Number(image.Size / 1000000).toFixed(2) + ' MB';
        let freshnessGrade: string = '';
        for (const entry of imageFreshnessEntries) {
          if (entry.name.toString() === name) {
            freshnessGrade = ImageFreshnessProvider.getFreshnessGrade(entry.lowVulnCount,
              entry.mediumVulnCount, entry.highVulnCount);
          }
        }
        // if(tag !== 'latest' && freshnessGrade !== '') {
        //   continue;
        // }
        imagesList.push({
          freshnessGrade,
          id,
          name,
          size,
          tag,
        });
      }
      res.status(200).json({
        imagesList,
      });
    });
  }

  public search = async (req: Request, res: Response) => {
    const searchTerm: string = req.body.imageName;
    const options = {term: searchTerm};
    docker.searchImages(options, (error, results) => {
      if (error) {
        res.status(500).json({
          error,
        });
      } else {
        res.status(200).json({
          results,
        });
      }
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
          error: 'Unable to pull image',
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
      const dirToScan = await SourceCodeFinder.getFullSrcPath(shortName);
      if (dirToScan === '') {
        return res.status(404).json({
          error: 'No source code found',
        });
      }
      const checkDockerfileOutput: string = await ChildProcessHandler.executeChildProcCommand(
        'cd ' + dirToScan + ' && find . -maxdepth 1 -name \"Dockerfile\"', false);
      if (checkDockerfileOutput.includes('Dockerfile')) {
        const buildOutput: string = await ChildProcessHandler.executeChildProcCommand(
          'cd ' + dirToScan + ' && docker build -t ' + imageName + ' .', true);
        if (buildOutput.includes('Successfully built')) {
          await ChildProcessHandler.executeChildProcCommand(
            'cd ' + dirToScan + ' && docker tag ' + imageName + ' ' + imageName + ' :latest', true);
          res.status(200).json({
            message: 'Image successfully built',
          });
        } else {
          res.status(500).json({
            error: 'Unable to build image',
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
          error: 'Image not found',
        });
      } else {
        res.status(200).json({
          message: 'Image removed successfully',
        });
      }
    } catch (error) {
      res.status(409).json({
        error: 'Image cannot be removed',
      });
    }
  }

  public checkTag = async (req: Request, res: Response) => {
    const imageName: string = req.body.imageName;
    const checkTagCommand: string = 'docker images --format "{{.Tag}}" ' + imageName;
    const tagsOutput: string = await ChildProcessHandler.executeChildProcCommand(
      checkTagCommand, false);
    let tags: string[] = tagsOutput.split('\n');
    tags = tags.filter((tag) => tag !== 'latest' && tag !== '');
    tags.sort();
    let major: string = '0';
    let minor: string = '0';
    let patch: string = '0';
    if (tags.length !== 0) {
      const semVerValues = tags[tags.length - 1].split('.');
      major = semVerValues[0];
      minor = semVerValues[1];
      patch = semVerValues[2];
    }
    return res.status(200).json(JSON.stringify({
      major,
      minor,
      patch,
    }));
  }
}

export default new ImageController();

interface IImage {
  freshnessGrade: string;
  id: string;
  name: string;
  size: string;
  tag: string;
}
