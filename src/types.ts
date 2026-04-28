export type JobStatus = 
  | 'applied' 
  | 'will apply' 
  | 'rejection' 
  | 'ATS rejection' 
  | 'No-reply rejection' 
  | 'interview' 
  | 'Visa rejection';

export interface JobApplication {
  id: string;
  companyName: string;
  status: JobStatus;
  appliedDate: string;
  salaryRange: string;
  jobTitle: string;
  submittedDocuments: string;
}
