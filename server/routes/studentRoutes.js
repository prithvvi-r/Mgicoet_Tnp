const express = require('express');
const router = express.Router();
const {
    getAllStudents, getStudentById, createStudent, updateStudent,
    deleteStudent, checkEligibility
} = require('../controllers/studentController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getAllStudents);
router.get('/:id', getStudentById);

// TNP Officer/Admin only
router.post('/', roleCheck('tnp_officer', 'admin'), createStudent);
router.delete('/:id', roleCheck('tnp_officer', 'admin'), deleteStudent);

// Student can update their own profile, Officer can update any (Middleware logic needed in controller or here)
router.put('/:id', updateStudent);

router.post('/check-eligibility', checkEligibility);

module.exports = router;
