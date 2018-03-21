import { Request, Response } from 'express';
import {ImageFreshnessEntry,
  IVulnerability,
  IVulnerabilityCheckRecord,
} from '../models/imageFreshnessEntry';
import {ChildProcessHandler} from '../utilities/ChildProcessHandler';
import DateComparator from '../utilities/DateComparator';
import ImageFreshnessProvider from '../utilities/ImageFreshnessProvider';
import OutputParser, {IVulnScanJSON} from '../utilities/OutputParser';
import SourceCodeFinder from '../utilities/SourceCodeFinder';

class ImagesFreshnessController {

  public getAll = async (req: Request, res: Response) => {
    const imageFreshnessEntries = await ImageFreshnessEntry.find({}).exec();
    return res.status(200).json(imageFreshnessEntries);
  }

  public getOne = async (req: Request, res: Response) => {
    try {
      const imageFreshnessEntry = await ImageFreshnessEntry.findOne({name: req.params.imageName}).exec();
      if (!imageFreshnessEntry) {
        return res.status(404).json({ error: 'Unable to find image freshness with name provided' });
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
          let freshnessGrade: string = '';
          if (imageFreshnessEntry.vulnerabilityCheckRecords.length > 0) {
            freshnessGrade = ImageFreshnessProvider.getFreshnessGrade(imageFreshnessEntry.lowVulnCount,
              imageFreshnessEntry.mediumVulnCount, imageFreshnessEntry.highVulnCount);
          }
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
      newEntry.name = req.body.imageName;
      newEntry.lowVulnCount = 0;
      newEntry.mediumVulnCount = 0;
      newEntry.highVulnCount = 0;
      newEntry.vulnerabilityCheckRecords = [];
      await newEntry.save();
      return res.status(201).json({message: 'Image freshness created saved successfully', entry: newEntry});
    } catch (err) {
      return res.status(403).json({error: 'Unable to create image freshness entry'});
    }
  }

  public delete = async (req: Request, res: Response) => {
    try {
      await ImageFreshnessEntry.findByIdAndRemove(req.params.id);
      return res.status(200).json({message: 'Image freshness entry deleted successfully'});
    } catch (error) {
      return res.status(404).json({error: 'Unable to remove image freshness entry'});
    }
  }

  public performVulnerabilityCheck = async (req: Request, res: Response) => {
    if (!req.body.imageName) {
      return res.status(403).json({
        error: 'Unable to persist vulnerability check. Docker image\'s name required',
      });
    }
    async function runCliVulnTest() {
      try {
        const checkOnly: boolean = (!!req.body.checkOnly);
        let entry;
        if (checkOnly !== true) {
          entry = await ImageFreshnessEntry.findOne({name: req.body.imageName}).exec();
          if (entry === null) {
            entry = new ImageFreshnessEntry();
            entry.name = req.body.imageName;
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
              return res.status(409).json({
                error: 'Vulnerability check already persisted for today\'s date',
              });
            }
          }
        }

        let snykResults: IVulnScanJSON[];
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'test') {
          const dirToScan = await SourceCodeFinder.getFullSrcPath(req.body.imageName);
          if (dirToScan === '') {
            return res.status(404).json({
              error: 'Source code not extracted for this image',
            });
          }
          await ChildProcessHandler.executeChildProcCommand(
            'cd ' + dirToScan + ' && snyk test > snykScanResults.txt', true);
          snykResults = OutputParser.parseSnykOutput(dirToScan + '/snykScanResults.txt');
        } else {
          snykResults = OutputParser.parseSnykOutput('test/test-files/snykScanResultVulnFound.txt');
        }
        const lowSeverity: IVulnerability[] = [];
        const mediumSeverity: IVulnerability[] = [];
        const highSeverity: IVulnerability[] = [];
        const tempUpdates: string[] = [];
        for (const result of snykResults) {
          if (result.remediation.toLowerCase() !== 'no upgrade available' &&
            result.remediation.toLowerCase() !== 'try to reinstall components') {
            if (result.remediation.indexOf('(') > 0) {
              tempUpdates.push(result.remediation.substring(result.remediation.indexOf(' to ') + 4,
                result.remediation.indexOf('(') - 1));
            } else {
              tempUpdates.push(result.remediation.substring(result.remediation.indexOf(' to ') + 4));
            }
          }
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
        const uniqueUpdates = Array.from(new Set(tempUpdates)).sort();
        const indicesToRemove: number[] = [];
        for (let i = 0; i < uniqueUpdates.length - 1; i++) {
          if (uniqueUpdates[i].substring(0, uniqueUpdates[i].indexOf('@'))
            === uniqueUpdates[i + 1].substring(0, uniqueUpdates[i + 1].indexOf('@'))) {
            indicesToRemove.push(i);
          }
        }
        const updates: string[] = [];
        if (indicesToRemove.length > 0) {
          for (let i = 0; i < uniqueUpdates.length; i++) {
            if (indicesToRemove.indexOf(i) === -1) {
              updates.push(uniqueUpdates[i]);
            }
          }
        }
        const vulnerabilityCheckRecord: IVulnerabilityCheckRecord = {} as IVulnerabilityCheckRecord;
        vulnerabilityCheckRecord.date = new Date();
        vulnerabilityCheckRecord.lowSeverity = lowSeverity;
        vulnerabilityCheckRecord.mediumSeverity = mediumSeverity;
        vulnerabilityCheckRecord.highSeverity = highSeverity;
        if (checkOnly !== true) {
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
        }
        if (checkOnly !== true) {
          return res.status(201).json({
            highSeverity: vulnerabilityCheckRecord.highSeverity,
            lowSeverity: vulnerabilityCheckRecord.lowSeverity,
            mediumSeverity: vulnerabilityCheckRecord.mediumSeverity,
            message: 'Vulnerability check persisted successfully',
            updates,
          });
        } else {
          const getVulnerableAndUpdates: boolean = (!!req.body.checkOnly);
          if (getVulnerableAndUpdates !== true) {
            return res.status(200).json({
              updates,
            });
          } else {
            return res.status(200).json({
              updates,
              vulnerabilityCheckRecord,
            });
          }

        }
      } catch (error) {
        return res.status(500).json({
          error: 'Unable to persist vulnerability check',
        });
      }
    }
    runCliVulnTest();
  }

  public deleteAll = async (req: Request, res: Response) => {
    await ImageFreshnessEntry.deleteMany({});
    return res.status(200).json({message: 'Image freshness entries deleted successfully'});
  }
}

export default new ImagesFreshnessController();
