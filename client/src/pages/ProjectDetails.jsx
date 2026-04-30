import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';
import TaskCard from '../components/TaskCard.jsx';

const COLUMNS = ['Todo', 'In Progress', 'Done'];

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [memberToAdd, setMemberToAdd] = useState('');

  const isAdmin = user?.role === 'admin';

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks/project/${id}`),
      isAdmin ? api.get('/auth/users') : Promise.resolve({ data: [] }),
    ])
      .then(([p, t, u]) => {
        setProject(p.data);
        setTasks(t.data);
        setUsers(u.data);
      })
      .catch((err) =>
        setError(err.response?.data?.message || 'Failed to load')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', {
        title,
        description,
        dueDate: dueDate || null,
        assignedTo: assignedTo || null,
        projectId: id,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setAssignedTo('');
      setShowTaskForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status } : t))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberToAdd) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: memberToAdd });
      setMemberToAdd('');
      setShowMemberForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!project) return <div className="p-8 text-gray-500">Project not found</div>;

  const memberIds = new Set(project.members.map((m) => m._id));
  const availableUsers = users.filter((u) => !memberIds.has(u._id));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/projects" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to projects
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowTaskForm((s) => !s)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            {showTaskForm ? 'Cancel' : 'New Task'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm mt-4">
          {error}
        </div>
      )}

      {/* Members */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          {isAdmin && availableUsers.length > 0 && (
            <button
              onClick={() => setShowMemberForm((s) => !s)}
              className="text-sm text-indigo-600 hover:underline"
            >
              {showMemberForm ? 'Cancel' : '+ Add member'}
            </button>
          )}
        </div>
        {showMemberForm && isAdmin && (
          <form onSubmit={handleAddMember} className="flex gap-2 mb-3">
            <select
              value={memberToAdd}
              onChange={(e) => setMemberToAdd(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="">Choose user...</option>
              {availableUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.email}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
            >
              Add
            </button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {project.members.length === 0 && (
            <span className="text-sm text-gray-500">No members yet.</span>
          )}
          {project.members.map((m) => (
            <span
              key={m._id}
              className="flex items-center gap-2 bg-gray-100 text-sm px-3 py-1 rounded"
            >
              {m.email}
              <span className="text-xs text-gray-500">({m.role})</span>
              {isAdmin && (
                <button
                  onClick={() => handleRemoveMember(m._id)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* New task form */}
      {showTaskForm && isAdmin && (
        <form
          onSubmit={handleCreateTask}
          className="mt-6 bg-white p-6 rounded-lg shadow-sm border space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Unassigned</option>
                {project.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Create Task
          </button>
        </form>
      )}

      {/* Task board */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col} className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
              {col}
              <span className="text-xs bg-white text-gray-600 px-2 py-1 rounded">
                {tasks.filter((t) => t.status === col).length}
              </span>
            </h3>
            {tasks
              .filter((t) => t.status === col)
              .map((t) => (
                <TaskCard
                  key={t._id}
                  task={t}
                  onStatusChange={handleStatusChange}
                  canDelete={isAdmin}
                  onDelete={handleDeleteTask}
                />
              ))}
            {tasks.filter((t) => t.status === col).length === 0 && (
              <p className="text-sm text-gray-400 italic">No tasks</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
