import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import type { JobApplication, JobStatus, JobType } from '../types';
import { JobTable } from './JobTable';
import { JobCharts } from './JobCharts';
import { PlusCircle, Upload, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, writeBatch } from 'firebase/firestore';
import type { User } from 'firebase/auth';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) return;

        setLoading(true);
        // Firestore batch setup
        const batch = writeBatch(db);
        const jobsRef = collection(db, 'jobs');
        
        let count = 0;

        data.forEach((row: any) => {
          // Normalization logic to find keys case-insensitively
          const getField = (keys: string[]) => {
            for (const key of keys) {
              const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
              if (foundKey) return row[foundKey];
            }
            return '';
          };

          const companyName = getField(['company', 'company name', 'companyname']) || 'Unknown Company';
          const jobTitle = getField(['job title', 'jobtitle', 'title', 'position']) || 'Unknown Title';
          let rawStatus = String(getField(['status']) || '').toLowerCase();
          let status = 'will apply';
          if (rawStatus.includes('ats rejection') || rawStatus.includes('easy apply ats')) {
            status = 'ATS rejection';
          } else if (rawStatus.includes('no-reply') || rawStatus.includes('no reply')) {
            status = 'No-reply rejection';
          } else if (rawStatus.includes('visa')) {
            status = 'Visa rejection';
          } else if (rawStatus.includes('rejection')) {
            status = 'rejection';
          } else if (rawStatus.includes('interview') || rawStatus.includes('shortlisted')) {
            status = 'interview';
          } else if (rawStatus.includes('applied') || rawStatus.includes('closed') || rawStatus.includes('見送り')) {
            status = 'applied'; 
          }

          let rawJobType = String(getField(['job type', 'jobtype', 'type']) || '').toLowerCase();
          let jobType = 'Permanent';
          if (rawJobType.includes('contract')) jobType = 'Contract';
          else if (rawJobType.includes('ftc')) jobType = 'FTC';
          else if (rawJobType.includes('part-time') || rawJobType.includes('part time')) jobType = 'Part-time';
          else if (rawJobType.includes('intern')) jobType = 'Internship';
          else if (rawJobType.includes('remote')) jobType = 'Remote';
          else if (rawJobType.includes('permanent')) jobType = 'Permanent';

          let appliedDate = getField(['applied date', 'applieddate', 'application date', 'applicationdate', 'date']);
          let appliedDateStr = '';
          if (appliedDate instanceof Date) {
            const yyyy = appliedDate.getFullYear();
            const mm = String(appliedDate.getMonth() + 1).padStart(2, '0');
            const dd = String(appliedDate.getDate()).padStart(2, '0');
            appliedDateStr = `${yyyy}-${mm}-${dd}`;
          } else if (typeof appliedDate === 'number') {
            const d = new Date((appliedDate - 25569) * 86400 * 1000);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            appliedDateStr = `${yyyy}-${mm}-${dd}`;
          } else if (typeof appliedDate === 'string' && appliedDate.trim() !== '') {
            let s = appliedDate.trim().replace(/[\/\.]/g, '-');
            const parsed = new Date(s);
            if (!isNaN(parsed.getTime())) {
              const yyyy = parsed.getFullYear();
              const mm = String(parsed.getMonth() + 1).padStart(2, '0');
              const dd = String(parsed.getDate()).padStart(2, '0');
              appliedDateStr = `${yyyy}-${mm}-${dd}`;
            } else {
              appliedDateStr = s; // fallback
            }
          }

          const salaryRange = getField(['salary range', 'salaryrange', 'salary']);
          const submittedDocuments = getField(['submitted documents', 'submitted docs', 'documents', 'docs', 'submitted doicuments']);
          const jdUrl = getField(['jd url', 'jdurl', 'jd', 'url']);

          const newDocRef = doc(jobsRef);
          batch.set(newDocRef, {
            companyName,
            jobTitle,
            status,
            jobType,
            appliedDate: appliedDateStr,
            salaryRange: String(salaryRange || ''),
            submittedDocuments: String(submittedDocuments || ''),
            jdUrl: String(jdUrl || ''),
            userId: user.uid
          });
          count++;
        });

        await batch.commit();
        alert(`Successfully imported ${count} jobs!`);
      } catch (error) {
        console.error("Error parsing/uploading Excel file:", error);
        alert("Failed to import file. Make sure it's a valid Excel/CSV file.");
      } finally {
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const [newJob, setNewJob] = useState<Partial<JobApplication>>({
    companyName: '',
    status: 'will apply',
    appliedDate: new Date().toISOString().split('T')[0],
    salaryRange: '',
    jobTitle: '',
    jobType: 'Permanent',
    submittedDocuments: '',
    jdUrl: ''
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
        jobType: newJob.jobType as JobType,
        submittedDocuments: newJob.submittedDocuments || '',
        jdUrl: newJob.jdUrl || '',
        userId: user.uid
      });

      // Reset form
      setNewJob({
        companyName: '',
        status: 'will apply',
        appliedDate: new Date().toISOString().split('T')[0],
        salaryRange: '',
        jobTitle: '',
        jobType: 'Permanent',
        submittedDocuments: '',
        jdUrl: ''
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
  const handleDeleteAllJobs = async () => {
    if (!window.confirm("Are you sure you want to delete ALL jobs? This cannot be undone.")) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      jobs.forEach((job) => {
        batch.delete(doc(db, 'jobs', job.id));
      });
      await batch.commit();
      alert("All jobs deleted successfully.");
    } catch (error) {
      console.error("Error deleting all documents: ", error);
      alert("Failed to delete all jobs.");
    } finally {
      setLoading(false);
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button className="primary-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <PlusCircle size={20} />
            <span>{showAddForm ? 'Cancel' : 'Add Job'}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls, .csv"
            style={{ display: 'none' }}
          />
          <button className="primary-btn" onClick={() => fileInputRef.current?.click()} style={{ background: '#10b981' }}>
            <Upload size={20} />
            <span>Import Excel</span>
          </button>
          <button className="primary-btn" onClick={handleDeleteAllJobs} style={{ background: '#ef4444' }}>
            <Trash2 size={20} />
            <span>Delete All</span>
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
              <label>Job Type</label>
              <select name="jobType" value={newJob.jobType} onChange={handleChange}>
                <option value="Permanent">Permanent</option>
                <option value="FTC">FTC</option>
                <option value="Contract">Contract</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
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
            <div className="form-group">
              <label>JD URL</label>
              <input type="url" name="jdUrl" value={newJob.jdUrl} onChange={handleChange} placeholder="https://..." />
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">Save Application</button>
            </div>
          </form>
        </div>
      )}

      {(() => {
        const filteredJobs = jobs.filter(job => 
          job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (job.jobType && job.jobType.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
          <>
            <JobCharts jobs={filteredJobs} />

            <div className="table-section">
              <h2>Applications ({filteredJobs.length})</h2>
              <JobTable jobs={filteredJobs} onUpdateJob={handleUpdateJob} onDeleteJob={handleDeleteJob} />
            </div>
          </>
        );
      })()}
    </div>
  );
}