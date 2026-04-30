const STATUS_COLORS = {
  Todo: 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Done: 'bg-green-100 text-green-800',
};

const TaskCard = ({ task, onStatusChange, canDelete, onDelete }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Done';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[task.status]}`}
        >
          {task.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
        {task.assignedTo && (
          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
            {task.assignedTo.email}
          </span>
        )}
        {task.dueDate && (
          <span
            className={`px-2 py-1 rounded ${
              isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100'
            }`}
          >
            Due {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        {canDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
