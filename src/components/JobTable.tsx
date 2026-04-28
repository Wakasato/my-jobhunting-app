import React, { useState } from 'react';
import type { JobApplication, JobStatus } from '../types';
import { Trash2, Edit2, Check, X } from 'lucide-react';

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
            <th>Status</th>
            <th>Applied Date</th>
            <th>Salary Range</th>
            <th>Submitted Documents</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">No job applications found. Add one above!</td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id}>
                {editingId === job.id && editFormData ? (
                  <>
                    <td><input type="text" name="companyName" value={editFormData.companyName} onChange={handleChange} /></td>
                    <td><input type="text" name="jobTitle" value={editFormData.jobTitle} onChange={handleChange} /></td>
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
                    <td>
                      <span className="status-badge" style={{ backgroundColor: statusColors[job.status] }}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.appliedDate}</td>
                    <td>{job.salaryRange}</td>
                    <td>{job.submittedDocuments}</td>
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
