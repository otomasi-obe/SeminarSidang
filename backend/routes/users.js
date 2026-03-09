const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

// IMPORTANT: specific routes before parameterized routes
router.get('/role/dosen', auth, rbac(['IT_ADMIN', 'ADMIN']), userController.getDosen);
router.get('/role/mahasiswa', auth, rbac(['IT_ADMIN', 'ADMIN']), userController.getMahasiswa);

router.get('/', auth, rbac(['IT_ADMIN']), userController.getAll);
router.get('/:id', auth, rbac(['IT_ADMIN']), userController.getOne);
router.post('/', auth, rbac(['IT_ADMIN']), userController.create);
router.put('/:id', auth, rbac(['IT_ADMIN']), userController.update);
router.delete('/:id', auth, rbac(['IT_ADMIN']), userController.deactivate);

module.exports = router;
