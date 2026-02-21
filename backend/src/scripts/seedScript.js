require('dotenv').config();
const mongoose = require('mongoose');
const Career = require('../models/Career');

const MONGO_URI = process.env.MONGO_URI;

const careers = [
  {
    name: 'Software Engineer',
    description: 'Designs and builds scalable software systems.',
    marketDemandScore: 90,
    difficultyScore: 7,
    averageSalaryRange: { min: 600000, max: 2000000 },
    skills: [
      { name: 'javascript', requiredLevel: 80, estimatedHours: 120, type: 'core', phase: 1 },
      { name: 'data structures', requiredLevel: 75, estimatedHours: 100, type: 'core', phase: 1 },
      { name: 'system design', requiredLevel: 70, estimatedHours: 150, type: 'advanced', phase: 3 },
      { name: 'react', requiredLevel: 70, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'Data Scientist',
    description: 'Analyzes complex data to extract actionable insights.',
    marketDemandScore: 85,
    difficultyScore: 8,
    averageSalaryRange: { min: 700000, max: 2200000 },
    skills: [
      { name: 'python', requiredLevel: 85, estimatedHours: 130, type: 'core', phase: 1 },
      { name: 'statistics', requiredLevel: 80, estimatedHours: 120, type: 'core', phase: 1 },
      { name: 'machine learning', requiredLevel: 75, estimatedHours: 160, type: 'advanced', phase: 3 },
      { name: 'data visualization', requiredLevel: 70, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'Data Analyst',
    description: 'Interprets data to help businesses make decisions.',
    marketDemandScore: 80,
    difficultyScore: 6,
    averageSalaryRange: { min: 500000, max: 1500000 },
    skills: [
      { name: 'sql', requiredLevel: 85, estimatedHours: 100, type: 'core', phase: 1 },
      { name: 'excel', requiredLevel: 80, estimatedHours: 70, type: 'core', phase: 1 },
      { name: 'power bi', requiredLevel: 70, estimatedHours: 80, type: 'supporting', phase: 2 },
      { name: 'statistics', requiredLevel: 65, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'Product Manager',
    description: 'Leads product vision and execution.',
    marketDemandScore: 75,
    difficultyScore: 7,
    averageSalaryRange: { min: 800000, max: 2500000 },
    skills: [
      { name: 'product strategy', requiredLevel: 80, estimatedHours: 120, type: 'core', phase: 1 },
      { name: 'communication', requiredLevel: 85, estimatedHours: 60, type: 'core', phase: 1 },
      { name: 'market research', requiredLevel: 75, estimatedHours: 100, type: 'supporting', phase: 2 },
      { name: 'analytics', requiredLevel: 70, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'UI/UX Designer',
    description: 'Designs intuitive and engaging user experiences.',
    marketDemandScore: 78,
    difficultyScore: 6,
    averageSalaryRange: { min: 500000, max: 1600000 },
    skills: [
      { name: 'figma', requiredLevel: 85, estimatedHours: 80, type: 'core', phase: 1 },
      { name: 'user research', requiredLevel: 75, estimatedHours: 100, type: 'core', phase: 2 },
      { name: 'prototyping', requiredLevel: 80, estimatedHours: 90, type: 'supporting', phase: 2 },
      { name: 'design systems', requiredLevel: 70, estimatedHours: 100, type: 'advanced', phase: 3 },
    ],
  },

  {
    name: 'Cybersecurity Analyst',
    description: 'Protects systems from security threats.',
    marketDemandScore: 88,
    difficultyScore: 8,
    averageSalaryRange: { min: 700000, max: 2100000 },
    skills: [
      { name: 'network security', requiredLevel: 80, estimatedHours: 120, type: 'core', phase: 1 },
      { name: 'ethical hacking', requiredLevel: 75, estimatedHours: 150, type: 'advanced', phase: 3 },
      { name: 'linux', requiredLevel: 70, estimatedHours: 100, type: 'supporting', phase: 2 },
      { name: 'cryptography', requiredLevel: 65, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'Cloud Engineer',
    description: 'Designs and manages cloud infrastructure.',
    marketDemandScore: 85,
    difficultyScore: 7,
    averageSalaryRange: { min: 700000, max: 2200000 },
    skills: [
      { name: 'aws', requiredLevel: 85, estimatedHours: 130, type: 'core', phase: 1 },
      { name: 'docker', requiredLevel: 75, estimatedHours: 100, type: 'core', phase: 2 },
      { name: 'kubernetes', requiredLevel: 70, estimatedHours: 120, type: 'advanced', phase: 3 },
      { name: 'linux', requiredLevel: 70, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'AI/ML Engineer',
    description: 'Builds intelligent systems using machine learning.',
    marketDemandScore: 92,
    difficultyScore: 9,
    averageSalaryRange: { min: 900000, max: 3000000 },
    skills: [
      { name: 'python', requiredLevel: 85, estimatedHours: 140, type: 'core', phase: 1 },
      { name: 'deep learning', requiredLevel: 80, estimatedHours: 160, type: 'advanced', phase: 3 },
      { name: 'linear algebra', requiredLevel: 75, estimatedHours: 120, type: 'core', phase: 1 },
      { name: 'data engineering', requiredLevel: 70, estimatedHours: 100, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'DevOps Engineer',
    description: 'Automates and optimizes software delivery pipelines.',
    marketDemandScore: 86,
    difficultyScore: 8,
    averageSalaryRange: { min: 800000, max: 2400000 },
    skills: [
      { name: 'ci/cd', requiredLevel: 85, estimatedHours: 120, type: 'core', phase: 1 },
      { name: 'docker', requiredLevel: 75, estimatedHours: 100, type: 'core', phase: 2 },
      { name: 'kubernetes', requiredLevel: 70, estimatedHours: 120, type: 'advanced', phase: 3 },
      { name: 'linux', requiredLevel: 75, estimatedHours: 90, type: 'supporting', phase: 2 },
    ],
  },

  {
    name: 'Business Analyst',
    description: 'Bridges business needs with technical solutions.',
    marketDemandScore: 75,
    difficultyScore: 6,
    averageSalaryRange: { min: 500000, max: 1500000 },
    skills: [
      { name: 'requirement gathering', requiredLevel: 85, estimatedHours: 80, type: 'core', phase: 1 },
      { name: 'communication', requiredLevel: 80, estimatedHours: 60, type: 'core', phase: 1 },
      { name: 'sql', requiredLevel: 70, estimatedHours: 90, type: 'supporting', phase: 2 },
      { name: 'data analysis', requiredLevel: 75, estimatedHours: 100, type: 'supporting', phase: 2 },
    ],
  },
];

// --------------------------------------------
// SEED FUNCTION
// --------------------------------------------

const seedCareers = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log('MongoDB Connected');

    await Career.deleteMany();
    console.log('Old careers removed');

    await Career.insertMany(careers);

    console.log('Careers seeded successfully');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedCareers();