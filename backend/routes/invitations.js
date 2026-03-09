const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const auth = require('../middleware/auth');

router.get('/', auth, invitationController.listMine);
router.patch('/:id/read', auth, invitationController.markRead);

module.exports = router;
