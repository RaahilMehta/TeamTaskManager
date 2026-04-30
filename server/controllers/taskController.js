const Task = require('../models/Task');
const Project = require('../models/Project');

const canAccessProject = (project, user) => {
  if (user.role === 'admin') return true;
  if (project.createdBy.toString() === user._id.toString()) return true;
  return project.members.some((m) => m.toString() === user._id.toString());
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate, assignedTo, projectId } = req.body;
    if (!title || !projectId) {
      return res.status(400).json({ message: 'title and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'Todo',
      dueDate: dueDate || null,
      assignedTo: assignedTo || null,
      projectId,
    });

    const populated = await task.populate('assignedTo', 'email role');
    return res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'email role')
      .sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'name')
      .populate('assignedTo', 'email role')
      .sort({ dueDate: 1 });
    return res.json(tasks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isAdmin = req.user.role === 'admin';
    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());

    const { title, description, status, dueDate, assignedTo } = req.body;

    if (isAdmin || isCreator) {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    } else if (isMember || isAssignee) {
      // Members can only update status
      if (status !== undefined) task.status = status;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await task.save();
    const populated = await task.populate('assignedTo', 'email role');
    return res.json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.projectId);
    if (
      req.user.role !== 'admin' &&
      project.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await task.deleteOne();
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
