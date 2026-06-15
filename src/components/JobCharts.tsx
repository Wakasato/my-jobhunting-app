import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { JobApplication } from '../types';

interface JobChartsProps {
  jobs: JobApplication[];
}

const COLORS = ['#aa3bff', '#60a5fa', '#f472b6', '#34d399', '#fbbf24', '#f87171', '#9ca3af'];

const formatLabel = ({ name, percent }: any) => {
  const shortName = name.length > 20 ? name.substring(0, 18) + '...' : name;
  return `${shortName} ${((percent || 0) * 100).toFixed(0)}%`;
};

export function JobCharts({ jobs }: JobChartsProps) {
  // Aggregate by Job Title
  const jobTitleCounts = jobs.reduce((acc, job) => {
    acc[job.jobTitle] = (acc[job.jobTitle] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalJobs = jobs.length;
  let othersCount = 0;
  const jobTitleData: { name: string; value: number }[] = [];

  Object.entries(jobTitleCounts).forEach(([name, value]) => {
    if (totalJobs > 0 && (value / totalJobs) <= 0.02) {
      othersCount += value;
    } else {
      jobTitleData.push({ name, value });
    }
  });

  if (othersCount > 0) {
    jobTitleData.push({ name: 'Others', value: othersCount });
  }

  // Sort largest to smallest, but keep "Others" at the end
  jobTitleData.sort((a, b) => {
    if (a.name === 'Others') return 1;
    if (b.name === 'Others') return -1;
    return b.value - a.value;
  });

  // Aggregate by Rejection Type
  const rejectionTypes = ['rejection', 'ATS rejection', 'No-reply rejection', 'Visa rejection'];
  const rejectionCounts = jobs
    .filter(job => rejectionTypes.includes(job.status))
    .reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const rejectionData = Object.entries(rejectionCounts).map(([name, value]) => ({ name, value }));

  // Aggregate by Job Type
  const jobTypeCounts = jobs.reduce((acc, job) => {
    const type = job.jobType || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const jobTypeData = Object.entries(jobTypeCounts).map(([name, value]) => ({ name, value }));

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
                labelLine={true}
                outerRadius={75}
                fill="#8884d8"
                dataKey="value"
                label={formatLabel}
                style={{ fontSize: '12px' }}
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
                labelLine={true}
                outerRadius={75}
                fill="#82ca9d"
                dataKey="value"
                label={formatLabel}
                style={{ fontSize: '12px' }}
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
      <div className="chart-wrapper">
        <h3>Applications by Job Type</h3>
        {jobTypeData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={jobTypeData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={75}
                fill="#fca5a5"
                dataKey="value"
                label={formatLabel}
                style={{ fontSize: '12px' }}
              >
                {jobTypeData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">No job type data yet.</div>
        )}
      </div>
    </div>
  );
}
