const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, dashboardController.stats);
router.get('/schedules-today', auth, dashboardController.schedulesToday);
router.get('/upcoming', auth, dashboardController.upcoming);

module.exports = router;
