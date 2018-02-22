import { Request, Response } from 'express';
import {ImageFreshnessEntry,
  IVulnerability,
  IVulnerabilityCheckRecord,
} from '../models/imageFreshnessEntry';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import DateComparator from '../utilities/DateComparator';
import ImageFreshnessProvider from '../utilities/ImageFreshnessProvider';
import ImageNameToDirNameConverter from '../utilities/ImageNameToDirNameConverter';
import OutputParser, {IVulnScanJSON} from '../utilities/OutputParser';

class ImagesFreshnessController {

  public getAll = async (req: Request, res: Response) => {
    const imageFreshnessEntries = await ImageFreshnessEntry.find({}).exec();
    return res.status(200).json(imageFreshnessEntries);
  }

  public getOne = async (req: Request, res: Response) => {
    try {
      const imageFreshnessEntry = await ImageFreshnessEntry.findById(req.params.id).exec();
      if (!imageFreshnessEntry) {
        return res.status(404).json({ error: 'ImageFreshnessEntry with given id does not exist!' });
      } else {
        if (req.body.startDate && req.body.endDate) {
          const vulnerabilityCheckRecords: IVulnScanJSON[] = [];
          for (const vulnerabilityEntry of imageFreshnessEntry.vulnerabilityCheckRecords) {
            if (DateComparator.isWithinRange(req.body.startDate, req.body.endDate, vulnerabilityEntry.date)) {
              vulnerabilityCheckRecords.push(vulnerabilityEntry);
            }
          }
          return res.status(200).json(vulnerabilityCheckRecords);
        } else {
          const freshnessGrade: string = ImageFreshnessProvider.getFreshnessGrade(imageFreshnessEntry.lowVulnCount,
            imageFreshnessEntry.mediumVulnCount, imageFreshnessEntry.highVulnCount);
          return res.status(200).json({entry: imageFreshnessEntry, freshnessGrade});
        }
      }
    } catch (err) {
      return res.status(400).json(err);
    }
  }

  public create = async (req: Request, res: Response) => {
    try {
      const newEntry = new ImageFreshnessEntry();
      newEntry.name = req.body.name;
      newEntry.lowVulnCount = 0;
      newEntry.mediumVulnCount = 0;
      newEntry.highVulnCount = 0;
      newEntry.vulnerabilityCheckRecords = [];
      await newEntry.save();
      return res.status(201).json({message: 'Image freshness created saved successfully!', entry: newEntry});
    } catch (err) {
      return res.status(403).json({error: 'Unable to create image freshness entry'});
    }
  }

  public delete = async (req: Request, res: Response) => {
    await ImageFreshnessEntry.findByIdAndRemove(req.params.id);
    return res.status(200).json({message: 'Image freshness entry deleted successfully!'});
  }

  public performVulnerabilityCheck = async (req: Request, res: Response) => {
    if (!req.body.name) {
      return res.status(403).json({
        error: 'Unable to persist vulnerability check. Docker image\'s name required!',
      });
    }
    const folderName: string = ImageNameToDirNameConverter.convertImageNameToDirName(req.body.name);
    const dirName: string = 'imagesTestDir/' + folderName;
    async function runCliVulnTest() {
      try {
        let entry = await ImageFreshnessEntry.findOne({name: req.body.name}).exec();
        if (entry === null) {
          entry = new ImageFreshnessEntry();
          entry.name = req.body.name;
          entry.lowVulnCount = 0;
          entry.mediumVulnCount = 0;
          entry.highVulnCount = 0;
          entry.vulnerabilityCheckRecords = [];
        }
        const todaysDate: Date = new Date();
        let lastCheckDate: Date;
        if (entry.vulnerabilityCheckRecords.length > 0) {
          lastCheckDate = entry.vulnerabilityCheckRecords[entry.vulnerabilityCheckRecords.length - 1].date;
          if (DateComparator.isSameDay(todaysDate, lastCheckDate)) {
            return res.status(403).json({
              error: 'Vulnerability check already persisted for today\'s date',
            });
          }
        }
        let snykResults: IVulnScanJSON[];
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          const checkDir = await ChildProcessHandler.executeChildProcCommand(
            'cd imagesTestDir && find . -maxdepth 1 -name ' + folderName, false);
          if (!checkDir.toString().includes(folderName)) {
            return res.status(404).json({
              message: 'Source code not extracted for this image',
            });
          }
          const object: object = JSON.parse(await ChildProcessHandler.executeChildProcCommand(
            'docker inspect ' + req.body.name, false));
          const workingDir = object[0].ContainerConfig.WorkingDir;
          const dirToScan = dirName + workingDir;
          await ChildProcessHandler.executeChildProcCommand(
            'cd ' + dirToScan + ' && snyk test > snykScanResults.txt', true);
          snykResults = OutputParser.parseSnykOutput(dirToScan + '/snykScanResults.txt');
        } else {
          snykResults = OutputParser.parseSnykOutput('test/test-files/snykScanResultVulnFound.txt');
        }

        const lowSeverity: IVulnerability[] = [];
        const mediumSeverity: IVulnerability[] = [];
        const highSeverity: IVulnerability[] = [];
        for (const result of snykResults) {
          if (result.severity === 'low') {
            lowSeverity.push({
              dependencyPath: result.vulnPath,
              description: result.description,
              name: result.vulnComp,
              remediation: result.remediation,
            });
          }
          if (result.severity === 'medium') {
            mediumSeverity.push({
              dependencyPath: result.vulnPath,
              description: result.description,
              name: result.vulnComp,
              remediation: result.remediation,
            });
          }
          if (result.severity === 'high') {
            highSeverity.push({
              dependencyPath: result.vulnPath,
              description: result.description,
              name: result.vulnComp,
              remediation: result.remediation,
            });
          }
        }
        const vulnerabilityCheckRecord: IVulnerabilityCheckRecord = {} as IVulnerabilityCheckRecord;

        vulnerabilityCheckRecord.date = new Date();
        vulnerabilityCheckRecord.lowSeverity = lowSeverity;
        vulnerabilityCheckRecord.mediumSeverity = mediumSeverity;
        vulnerabilityCheckRecord.highSeverity = highSeverity;
        if (lowSeverity.length === 0) {
          entry.lowVulnCount = 0;
        } else {
          entry.lowVulnCount = entry.lowVulnCount + 1;
        }
        if (mediumSeverity.length === 0) {
          entry.mediumVulnCount = 0;
        } else {
          entry.mediumVulnCount = entry.mediumVulnCount + 1;
        }
        if (highSeverity.length === 0) {
          entry.highVulnCount = 0;
        } else {
          entry.highVulnCount = entry.highVulnCount + 1;
        }
        entry.vulnerabilityCheckRecords.push(vulnerabilityCheckRecord);
        await entry.save();
        return res.status(201).json({
          entry,
          message: 'Vulnerability check persisted successfully',
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Unable to persist vulnerability check',
        });
      }
    }
    runCliVulnTest();
  }

  public deleteAll = async (req: Request, res: Response) => {
    try {
      await ImageFreshnessEntry.deleteMany({});
      return res.status(200).json({message: 'Image freshness entries deleted successfully!'});
    } catch (err) {
      return res.status(400).json({error: `Unable to delete image freshness entries: ${err}`});
    }
  }
}

export default new ImagesFreshnessController();
