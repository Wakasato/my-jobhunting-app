import React, { useState, useEffect } from 'react';
import type { JobApplication, JobStatus } from '../types';
import { JobTable } from './JobTable';
import { JobCharts } from './JobCharts';
import { PlusCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newJob, setNewJob] = useState<Partial<JobApplication>>({
    companyName: '',
    status: 'will apply',
    appliedDate: new Date().toISOString().split('T')[0],
    salaryRange: '',
    jobTitle: '',
    submittedDocuments: ''
  });

  useEffect(() => {
    const q = query(
      collection(db, 'jobs'),
      where('userId', '==', user.uid)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const jobsData: JobApplication[] = [];
      querySnapshot.forEach((doc) => {
        // Document ID from Firestore is used as the job application ID
        jobsData.push({ id: doc.id, ...doc.data() } as JobApplication);
      });
      
      // Firestoreの複合インデックスの作成を待たずに済むように、JavaScript側で日付順にソートします
      jobsData.sort((a, b) => {
        const dateA = a.appliedDate ? new Date(a.appliedDate).getTime() : 0;
        const dateB = b.appliedDate ? new Date(b.appliedDate).getTime() : 0;
        return dateB - dateA; // 降順 (desc)
      });

      setJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs from Firestore: ", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user.uid]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.companyName || !newJob.jobTitle) return;

    try {
      // Create new document in 'jobs' collection
      await addDoc(collection(db, 'jobs'), {
        companyName: newJob.companyName,
        status: newJob.status as JobStatus,
        appliedDate: newJob.appliedDate || '',
        salaryRange: newJob.salaryRange || '',
        jobTitle: newJob.jobTitle,
        submittedDocuments: newJob.submittedDocuments || '',
        userId: user.uid
      });

      // Reset form
      setNewJob({
        companyName: '',
        status: 'will apply',
        appliedDate: new Date().toISOString().split('T')[0],
        salaryRange: '',
        jobTitle: '',
        submittedDocuments: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      alert("Failed to save job application. See console for details.");
    }
  };

  const handleUpdateJob = async (updatedJob: JobApplication) => {
    try {
      const jobRef = doc(db, 'jobs', updatedJob.id);
      // Remove the id property before saving back to Firestore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataToUpdate } = updatedJob;
      await updateDoc(jobRef, dataToUpdate);
    } catch (error) {
      console.error("Error updating document in Firestore: ", error);
      alert("Failed to update job application. See console for details.");
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
    } catch (error) {
      console.error("Error deleting document from Firestore: ", error);
      alert("Failed to delete job application. See console for details.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading your applications from Firebase...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Job Tracker</h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>Signed in as {user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle size={20} />
            <span>{showAddForm ? 'Cancel' : 'Add Job'}</span>
          </button>
          <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>
            Logout
          </button>
        </div>
      </header>

      {showAddForm && (
        <div className="add-job-card">
          <h2>Add New Application</h2>
          <form onSubmit={handleAddJob} className="add-job-form">
            <div className="form-group">
              <label>Company Name *</label>
              <input required type="text" name="companyName" value={newJob.companyName} onChange={handleChange} placeholder="e.g. Acme Corp" />
            </div>
            <div className="form-group">
              <label>Job Title *</label>
              <input required type="text" name="jobTitle" value={newJob.jobTitle} onChange={handleChange} placeholder="e.g. Frontend Engineer" />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={newJob.status} onChange={handleChange}>
                <option value="will apply">will apply</option>
                <option value="applied">applied</option>
                <option value="interview">interview</option>
                <option value="rejection">rejection</option>
                <option value="ATS rejection">ATS rejection</option>
                <option value="No-reply rejection">No-reply rejection</option>
                <option value="Visa rejection">Visa rejection</option>
              </select>
            </div>
            <div className="form-group">
              <label>Applied Date</label>
              <input type="date" name="appliedDate" value={newJob.appliedDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Salary Range</label>
              <input type="text" name="salaryRange" value={newJob.salaryRange} onChange={handleChange} placeholder="e.g. £100k - £120k" />
            </div>
            <div className="form-group">
              <label>Submitted Docs</label>
              <input type="text" name="submittedDocuments" value={newJob.submittedDocuments} onChange={handleChange} placeholder="e.g. Resume, Cover Letter" />
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">Save Application</button>
            </div>
          </form>
        </div>
      )}

      <JobCharts jobs={jobs} />

      <div className="table-section">
        <h2>Applications ({jobs.length})</h2>
        <JobTable jobs={jobs} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} />
      </div>
    </div>
  );
}