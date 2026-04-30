import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberIds, setMemberIds] = useState([]);

  const isAdmin = user?.role === 'admin';

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/projects'),
      isAdmin ? api.get('/auth/users') : Promise.resolve({ data: [] }),
    ])
      .then(([p, u]) => {
        setProjects(p.data);
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
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/projects', {
        name,
        description,
        members: memberIds,
      });
      setName('');
      setDescription('');
      setMemberIds([]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleMember = (id) => {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      {showForm && isAdmin && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-lg shadow-sm border mb-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Members
            </label>
            <div className="border border-gray-200 rounded p-2 max-h-40 overflow-auto">
              {users
                .filter((u) => u._id !== user.id)
                .map((u) => (
                  <label
                    key={u._id}
                    className="flex items-center gap-2 py-1 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={memberIds.includes(u._id)}
                      onChange={() => toggleMember(u._id)}
                    />
                    {u.email}{' '}
                    <span className="text-xs text-gray-500">({u.role})</span>
                  </label>
                ))}
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Create
          </button>
        </form>
      )}

      {projects.length === 0 ? (
        <p className="text-gray-500">No projects yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <Link
                  to={`/projects/${p._id}`}
                  className="text-lg font-semibold text-indigo-600 hover:underline"
                >
                  {p.name}
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
              </div>
              {p.description && (
                <p className="text-sm text-gray-600 mt-2">{p.description}</p>
              )}
              <div className="text-xs text-gray-500 mt-3">
                {p.members.length} member{p.members.length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
