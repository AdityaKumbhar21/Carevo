const { getCourseAdvice } = require('../services/courseAdvisorService');

const getCourseAdviceController = async (req, res) => {
  try {
    const { careerId, currentCourse, alternativeCourse } = req.body;

    if (!careerId || !currentCourse || !alternativeCourse) {
      return res.status(400).json({
        msg: 'careerId, currentCourse and alternativeCourse are required',
      });
    }

    const result = await getCourseAdvice({
      user: req.user,
      careerId,
      currentCourse,
      alternativeCourse,
    });

    res.json(result);

  } catch (err) {
    console.error('Course Advice Error:', err);
    res.status(500).json({ msg: 'Failed to generate course advice' });
  }
};

module.exports = {
  getCourseAdviceController,
};