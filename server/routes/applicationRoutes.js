const express = require('express');
const router = express.Router();
const {
    getAllApplications, createApplication, updateApplicationStatus, deleteApplication
} = require('../controllers/applicationController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAllApplications);
router.post('/', createApplication); // Student applies

// TNP Officer/Admin only
router.put('/:id', roleCheck('tnp_officer', 'admin'), updateApplicationStatus);
router.delete('/:id', roleCheck('tnp_officer', 'admin'), deleteApplication);

module.exports = router;
