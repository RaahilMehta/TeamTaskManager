const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description: description || '',
      members: Array.isArray(members) ? members : [],
      createdBy: req.user._id,
    });

    const populated = await project.populate('members', 'email role');
    return res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listProjects = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin'
        ? {}
        : { $or: [{ members: req.user._id }, { createdBy: req.user._id }] };

    const projects = await Project.find(filter)
      .populate('members', 'email role')
      .populate('createdBy', 'email role')
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'email role')
      .populate('createdBy', 'email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (
      req.user.role !== 'admin' &&
      !project.members.some((m) => m._id.equals(req.user._id)) &&
      !project.createdBy._id.equals(req.user._id)
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.members.includes(userId)) project.members.push(userId);
    await project.save();

    const populated = await project.populate('members', 'email role');
    return res.json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();

    const populated = await project.populate('members', 'email role');
    return res.json(populated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await Task.deleteMany({ projectId: project._id });
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
