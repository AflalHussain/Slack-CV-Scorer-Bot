// Mock API Service - Simulates Teamther API responses
const logger = require('../utils/logger');

/**
 * Generate realistic mock CV scoring data
 */
function generateMockScore() {
  const scores = [65, 72, 78, 82, 85, 88, 91, 95];
  const score = scores[Math.floor(Math.random() * scores.length)];
  
  const strengthsPool = [
    'Strong technical background with 5+ years of experience',
    'Excellent communication and leadership skills demonstrated',
    'Relevant certifications in required technologies',
    'Proven track record of successful project delivery',
    'Advanced degree in Computer Science or related field',
    'Experience with modern development frameworks',
    'Strong problem-solving and analytical abilities',
    'Multilingual with business-level proficiency',
    'Active contributor to open-source projects',
    'Experience managing remote/distributed teams'
  ];
  
  const weaknessesPool = [
    'Limited experience with cloud infrastructure (AWS/Azure)',
    'No mention of agile/scrum methodology experience',
    'Gap in employment history needs clarification',
    'Could benefit from more quantified achievements',
    'Limited domain expertise in target industry',
    'Resume could be more concise (currently 3+ pages)',
    'Weak summary section lacks impact',
    'No evidence of continuous learning or recent upskilling',
    'Limited international work experience',
    'Technical skills section needs updating with current tools'
  ];
  
  // Randomly select strengths and weaknesses
  const shuffledStrengths = strengthsPool.sort(() => 0.5 - Math.random());
  const shuffledWeaknesses = weaknessesPool.sort(() => 0.5 - Math.random());
  
  const numStrengths = Math.floor(Math.random() * 2) + 3; // 3-4 strengths
  const numWeaknesses = Math.floor(Math.random() * 2) + 2; // 2-3 weaknesses
  
  return {
    score,
    strengths: shuffledStrengths.slice(0, numStrengths),
    weaknesses: shuffledWeaknesses.slice(0, numWeaknesses),
    skills_match: (score / 100) * 0.9 + (Math.random() * 0.1), // Correlated with score
    report_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    analysis_time_ms: Math.floor(Math.random() * 1000) + 1500,
    metadata: {
      total_experience_years: Math.floor(Math.random() * 10) + 2,
      education_level: ['Bachelor', 'Master', 'PhD'][Math.floor(Math.random() * 3)],
      top_skills: ['JavaScript', 'Python', 'React', 'AWS'].slice(0, Math.floor(Math.random() * 2) + 2)
    }
  };
}

/**
 * Mock API call with realistic delay
 */
async function mockScoreResume(fileBuffer, userId) {
  // Simulate API processing time
  const delay = parseInt(process.env.MOCK_API_DELAY) || 2000;
  
  logger.info(`🧪 Mock API: Processing resume for user ${userId}`);
  logger.debug(`Mock API: Simulating ${delay}ms delay...`);
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Generate mock response
  const response = generateMockScore();
  
  logger.success(`🧪 Mock API: Generated score ${response.score}/100`);
  
  return response;
}

/**
 * Simulate API error (for testing error handling)
 */
async function mockErrorResponse() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  throw new Error('Mock API Error: Service temporarily unavailable');
}

module.exports = {
  mockScoreResume,
  mockErrorResponse,
  generateMockScore
};
