const express = require('express');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/role');
const {
  createProject,
  listProjects,
  getProject,
  addMember,
  removeMember,
  deleteProject,
} = require('../controllers/projectController');

const router = express.Router();

router.use(auth);

router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', requireRole('admin'), createProject);
router.post('/:id/members', requireRole('admin'), addMember);
router.delete('/:id/members/:userId', requireRole('admin'), removeMember);
router.delete('/:id', requireRole('admin'), deleteProject);

module.exports = router;
