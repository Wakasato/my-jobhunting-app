import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { JobApplication } from '../types';

interface JobChartsProps {
  jobs: JobApplication[];
}

const COLORS = ['#aa3bff', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#9ca3af'];

export function JobCharts({ jobs }: JobChartsProps) {
  // Aggregate by Job Title
  const jobTitleCounts = jobs.reduce((acc, job) => {
    acc[job.jobTitle] = (acc[job.jobTitle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobTitleData = Object.entries(jobTitleCounts).map(([name, value]) => ({ name, value }));

  // Aggregate by Rejection Type
  const rejectionTypes = ['rejection', 'ATS rejection', 'No-reply rejection', 'Visa rejection'];
  const rejectionCounts = jobs
    .filter(job => rejectionTypes.includes(job.status))
    .reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const rejectionData = Object.entries(rejectionCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        <h3>Applications by Job Title</h3>
        {jobTitleData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jobTitleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {jobTitleData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">No job title data yet.</div>
        )}
      </div>

      <div className="chart-wrapper">
        <h3>Rejection Breakdown</h3>
        {rejectionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={rejectionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#82ca9d"
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              >
                {rejectionData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">No rejections yet. Keep it up!</div>
        )}
      </div>
    </div>
  );
}
