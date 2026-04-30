import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/tasks/mine')
      .then((res) => setTasks(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load tasks')
      )
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const byStatus = {
    Todo: tasks.filter((t) => t.status === 'Todo'),
    'In Progress': tasks.filter((t) => t.status === 'In Progress'),
    Done: tasks.filter((t) => t.status === 'Done'),
  };
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done'
  );

  if (loading) {
    return (
      <div className="p-8 text-gray-500">Loading dashboard...</div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Assigned" value={tasks.length} color="bg-indigo-50 text-indigo-700" />
        <StatCard label="Todo" value={byStatus.Todo.length} color="bg-gray-50 text-gray-700" />
        <StatCard label="In Progress" value={byStatus['In Progress'].length} color="bg-yellow-50 text-yellow-700" />
        <StatCard label="Overdue" value={overdue.length} color="bg-red-50 text-red-700" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-3">My Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks assigned yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y">
          {tasks.map((t) => (
            <div key={t._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{t.title}</div>
                <div className="text-sm text-gray-500">
                  {t.projectId?.name && (
                    <Link
                      to={`/projects/${t.projectId._id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {t.projectId.name}
                    </Link>
                  )}
                  {t.dueDate && (
                    <span className="ml-2">
                      • Due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className={`rounded-lg p-4 ${color}`}>
    <div className="text-sm font-medium opacity-80">{label}</div>
    <div className="text-3xl font-bold mt-1">{value}</div>
  </div>
);

export default Dashboard;
