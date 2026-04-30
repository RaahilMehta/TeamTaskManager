const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const {
  createTask,
  listTasksByProject,
  listMyTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.use(auth);

router.get('/mine', listMyTasks);
router.get('/project/:projectId', listTasksByProject);
router.post('/', requireRole('admin'), createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
