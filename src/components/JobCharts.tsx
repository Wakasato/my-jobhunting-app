import React, { useMemo } from 'react';
import { JobApplication } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JobChartsProps {
  jobs: JobApplication[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF66B2', '#00E676'];

export function JobCharts({ jobs }: JobChartsProps) {
  const positionData = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(job => {
      const title = job.jobTitle || 'Unknown';
      counts[title] = (counts[title] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const rejectionData = useMemo(() => {
    const counts: Record<string, number> = {};
    const rejectionStatuses = ['rejection', 'ATS rejection', 'No-reply rejection', 'Visa rejection'];
    jobs.forEach(job => {
      if (rejectionStatuses.includes(job.status)) {
        counts[job.status] = (counts[job.status] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="charts-container">
      <div className="chart-card">
        <h3>Position Names</h3>
        <div className="chart-wrapper">
          {positionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={positionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {positionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No data yet</div>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h3>Rejection Reasons</h3>
        <div className="chart-wrapper">
          {rejectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rejectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {rejectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart">No rejections yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
