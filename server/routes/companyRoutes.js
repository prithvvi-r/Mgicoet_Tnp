const express = require('express');
const router = express.Router();
const {
    getAllCompanies, getCompanyById, createCompany, updateCompany,
    updateCompanyStatus, addRemark, deleteCompany
} = require('../controllers/companyController');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// All routes are protected
router.use(authMiddleware);

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

// TNP Officer only routes
router.post('/', roleCheck('tnp_officer', 'admin'), createCompany);
router.put('/:id', roleCheck('tnp_officer', 'admin'), updateCompany);
router.patch('/:id/status', roleCheck('tnp_officer', 'admin'), updateCompanyStatus);
router.post('/:id/remarks', roleCheck('tnp_officer', 'admin'), addRemark);
router.delete('/:id', roleCheck('tnp_officer', 'admin'), deleteCompany);

module.exports = router;
