const { generateCareerDNA } = require('../services/careerDnaService');

const getCareerDNA = async (req, res) => {
  try {
    const dna = await generateCareerDNA(req.user._id);
    res.json(dna);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      msg: 'Failed to generate Career DNA',
    });
  }
};

module.exports = { getCareerDNA };