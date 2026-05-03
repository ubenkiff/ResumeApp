import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Groq from 'groq-sdk';
import pool from '../db.js';

const router = express.Router();
router.use(authenticate);

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Extract keywords from job description
router.post('/extract-keywords', async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    const prompt = `Extract the key skills, technologies, and requirements from the following job description. Return ONLY a JSON array of keywords. Do not include any other text.

Job Description: ${jobDescription}

JSON array of keywords:`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    });

    const text = completion.choices[0]?.message?.content || '[]';

    // Clean and parse
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let keywords;
    try {
      keywords = JSON.parse(cleanText);
    } catch {
      keywords = [];
    }

    res.json({ keywords });
  } catch (error) {
    console.error('Keyword extraction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate cover letter
router.post('/generate-cover-letter', async (req, res) => {
  try {
    const { jobTitle, companyName, jobDescription } = req.body;

    const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
    const experienceResult = await pool.query('SELECT * FROM experience WHERE user_id = $1 ORDER BY start_date DESC', [req.userId]);
    const skillsResult = await pool.query('SELECT name FROM skills WHERE user_id = $1', [req.userId]);
    const coverDataResult = await pool.query('SELECT * FROM user_cover_data WHERE user_id = $1', [req.userId]);

    const profile = profileResult.rows[0] || {};
    const experience = experienceResult.rows;
    const skills = skillsResult.rows.map(s => s.name);
    const coverData = coverDataResult.rows[0] || {};

    const experienceSummary = experience.map(exp =>
      `- ${exp.job_title} at ${exp.company} (${exp.start_date} - ${exp.current ? 'Present' : exp.end_date}): ${exp.description}`
    ).join('\n');

    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${companyName}.

User Profile:
- Name: ${profile.name || 'Applicant'}
- Current Title: ${profile.title || 'Professional'}
- Bio: ${profile.bio || ''}
- Skills: ${skills.join(', ')}

Experience:
${experienceSummary}

Career Goals: ${coverData.career_goals || 'Professional growth'}
Notice Period: ${coverData.notice_period || '2 weeks'}

Job Description: ${jobDescription}

Write a professional cover letter as plain text, no markdown. Sign with the applicant's name.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
    });

    const coverLetter = completion.choices[0]?.message?.content || '';

    res.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Analyze gap between job and resume
router.post('/analyze-gap', async (req, res) => {
  try {
    const { jobDescription } = req.body;

    const skillsResult = await pool.query('SELECT name FROM skills WHERE user_id = $1', [req.userId]);
    const experienceResult = await pool.query('SELECT job_title, description FROM experience WHERE user_id = $1', [req.userId]);

    const userSkills = skillsResult.rows.map(s => s.name);
    const userExperience = experienceResult.rows.map(e => `${e.job_title}: ${e.description}`).join('\n');

    const prompt = `Analyze the gap between this job description and the candidate's profile.

Job Description: ${jobDescription}

Candidate Skills: ${userSkills.join(', ')}

Candidate Experience: ${userExperience}

Return ONLY valid JSON in this exact format:
{
  "targetKeywords": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "matchedKeywords": ["matched1", "matched2"],
  "matchPercentage": 65,
  "suggestedBulletPoints": []
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content || '{}';

    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let analysis;
    try {
      analysis = JSON.parse(cleanText);
    } catch {
      analysis = {
        targetKeywords: [],
        missingKeywords: [],
        matchedKeywords: [],
        matchPercentage: 0,
        suggestedBulletPoints: []
      };
    }

    res.json(analysis);
  } catch (error) {
    console.error('Gap analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search jobs (InfraScan)
router.post('/search-jobs', async (req, res) => {
  try {
    const { keyword, location } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const prompt = `Generate 5 realistic job listings for ${keyword} ${location ? `in ${location}` : ''}.

Return ONLY valid JSON array with objects containing: title, company, location, description, postedDate.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || '[]';
    let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
    if (jsonMatch) cleanText = jsonMatch[0];

    let jobs;
    try {
      jobs = JSON.parse(cleanText);
    } catch {
      jobs = [];
    }

    res.json({ jobs });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
