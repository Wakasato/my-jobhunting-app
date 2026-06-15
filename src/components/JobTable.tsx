import React, { useState } from 'react';
import type { JobApplication, JobStatus } from '../types';
import { Trash2, Edit2, Check, X, ExternalLink } from 'lucide-react';

interface JobTableProps {
  jobs: JobApplication[];
  onUpdateJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
}

const statusColors: Record<JobStatus, string> = {
  'applied': '#3b82f6', // blue
  'will apply': '#eab308', // yellow
  'rejection': '#9ca3af', // grey
  'ATS rejection': '#6b7280', // dark grey
  'No-reply rejection': '#4b5563', // darker grey
  'interview': '#22c55e', // green
  'Visa rejection': '#ef4444', // red
};

export function JobTable({ jobs, onUpdateJob, onDeleteJob }: JobTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<JobApplication | null>(null);

  const handleEditClick = (job: JobApplication) => {
    setEditingId(job.id);
    setEditFormData({ ...job });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = () => {
    if (editFormData) {
      onUpdateJob(editFormData);
      setEditingId(null);
      setEditFormData(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="table-container">
      <table className="job-table">
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Job Title</th>
            <th>Job Type</th>
            <th>Status</th>
            <th>Applied Date</th>
            <th>Salary Range</th>
            <th>Submitted Documents</th>
            <th>JD</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">No job applications found. Add one above!</td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id}>
                {editingId === job.id && editFormData ? (
                  <>
                    <td><input type="text" name="companyName" value={editFormData.companyName} onChange={handleChange} /></td>
                    <td><input type="text" name="jobTitle" value={editFormData.jobTitle} onChange={handleChange} /></td>
                    <td>
                      <select name="jobType" value={editFormData.jobType || 'Permanent'} onChange={handleChange}>
                        <option value="Permanent">Permanent</option>
                        <option value="FTC">FTC</option>
                        <option value="Contract">Contract</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </td>
                    <td>
                      <select name="status" value={editFormData.status} onChange={handleChange}>
                        <option value="will apply">will apply</option>
                        <option value="applied">applied</option>
                        <option value="interview">interview</option>
                        <option value="rejection">rejection</option>
                        <option value="ATS rejection">ATS rejection</option>
                        <option value="No-reply rejection">No-reply rejection</option>
                        <option value="Visa rejection">Visa rejection</option>
                      </select>
                    </td>
                    <td><input type="date" name="appliedDate" value={editFormData.appliedDate} onChange={handleChange} /></td>
                    <td><input type="text" name="salaryRange" value={editFormData.salaryRange} onChange={handleChange} /></td>
                    <td><input type="text" name="submittedDocuments" value={editFormData.submittedDocuments} onChange={handleChange} /></td>
                    <td><input type="url" name="jdUrl" value={editFormData.jdUrl || ''} onChange={handleChange} placeholder="https://..." style={{width: '100px'}} /></td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={handleSaveEdit} className="icon-btn save-btn" title="Save"><Check size={18} /></button>
                        <button onClick={handleCancelEdit} className="icon-btn cancel-btn" title="Cancel"><X size={18} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="font-medium">{job.companyName}</td>
                    <td>{job.jobTitle}</td>
                    <td>{job.jobType || '-'}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: statusColors[job.status] }}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.appliedDate}</td>
                    <td>{job.salaryRange}</td>
                    <td>{job.submittedDocuments}</td>
                    <td>
                      {job.jdUrl ? (
                        <a href={job.jdUrl} target="_blank" rel="noopener noreferrer" className="icon-btn" title="View Job Description" style={{ display: 'inline-flex', color: '#6366f1' }}>
                          <ExternalLink size={18} />
                        </a>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>-</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => handleEditClick(job)} className="icon-btn edit-btn" title="Edit"><Edit2 size={18} /></button>
                        <button onClick={() => onDeleteJob(job.id)} className="icon-btn delete-btn" title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
