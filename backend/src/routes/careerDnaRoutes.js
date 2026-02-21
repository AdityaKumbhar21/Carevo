const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { getCareerDNA } = require('../controllers/careerDnaController');

const router = express.Router();

router.get('/', protect, getCareerDNA);

module.exports = router;