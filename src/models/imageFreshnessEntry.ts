import * as mongoose from 'mongoose';

export interface IVulnerabilityCheckRecord {
  date: Date;
  lowSeverity: IVulnerability[];
  mediumSeverity: IVulnerability[];
  highSeverity: IVulnerability[];
}

export interface IVulnerability {
  name: string;
  dependencyPath: string;
  remediation: string;
  description: string;
}

interface ImageFreshnessEntry extends mongoose.Document {
  name: string;
  lowVulnCount: number;
  mediumVulnCount: number;
  highVulnCount: number;
  vulnerabilityCheckRecords: any[];
}

const imageFreshnessEntrySchema = new mongoose.Schema({
  highVulnCount: Number,
  lowVulnCount: Number,
  mediumVulnCount: Number,
  name: {type: String, unique: true},
  vulnerabilityCheckRecords: [{}],
});

export const ImageFreshnessEntry = mongoose.model<ImageFreshnessEntry>(
  'ImageFreshnessEntry', imageFreshnessEntrySchema);
