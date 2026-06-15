export type JobStatus = 
  | 'applied' 
  | 'will apply' 
  | 'rejection' 
  | 'ATS rejection' 
  | 'No-reply rejection' 
  | 'interview' 
  | 'Visa rejection';

export type JobType =
  | 'Permanent'
  | 'FTC'
  | 'Contract'
  | 'Part-time'
  | 'Internship'
  | 'Remote';

export interface JobApplication {
  id: string;
  companyName: string;
  status: JobStatus;
  appliedDate: string;
  salaryRange: string;
  jobTitle: string;
  jobType?: JobType;
  submittedDocuments: string;
  jdUrl?: string;
}
