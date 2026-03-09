const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const examinerController = require('../controllers/examinerController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', auth, scheduleController.getAll);
router.get('/:id', auth, scheduleController.getOne);
router.post('/', auth, rbac(['IT_ADMIN', 'ADMIN', 'DOSEN']), scheduleController.create);
router.put('/:id', auth, rbac(['IT_ADMIN', 'ADMIN', 'DOSEN']), scheduleController.update);
router.delete('/:id', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.delete);

router.patch('/:id/status', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.updateStatus);
router.post('/:id/assign-examiners', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.assignExaminers);
router.post('/:id/set-schedule', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.setSchedule);
router.post('/:id/send-invitations', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.sendInvitations);
router.patch('/:id/start-exam', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.startExam);
router.patch('/:id/complete', auth, rbac(['IT_ADMIN', 'ADMIN']), scheduleController.complete);

// Examiner sub-routes
router.get('/:id/examiners', auth, examinerController.list);
router.post('/:id/examiners', auth, rbac(['IT_ADMIN', 'ADMIN']), examinerController.add);
router.delete('/:id/examiners/:examinerId', auth, rbac(['IT_ADMIN', 'ADMIN']), examinerController.remove);
router.put('/:id/examiners/:examinerId/score', auth, examinerController.updateScore);

module.exports = router;
