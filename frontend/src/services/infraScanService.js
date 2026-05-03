import api from '../api';

// Job search using Groq backend endpoint — passes query directly, no region restrictions
export async function searchJobsOnWeb(query) {
  try {
    const res = await api.post('/ai/search-jobs', { keyword: query });
    const jobs = res.data.jobs || [];
    return jobs.map((job, idx) => ({
      id: job.id || `job-${idx}-${Date.now()}`,
      title: job.title || 'Untitled',
      company: job.company || 'Unknown',
      location: job.location || 'Not specified',
      salary: job.salary || 'Not disclosed',
      postedDate: job.postedDate || 'Recent',
      url: job.url || '#',
      description: job.description || '',
      isInfrastructureRelated: job.isInfrastructureRelated ?? false,
    }));
  } catch (error) {
    console.error('Job search error:', error);
    throw new Error('Failed to search jobs. Please try again.');
  }
}

// Extract keywords using Groq backend endpoint
export async function extractAndRewriteKeywords(job) {
  try {
    const res = await api.post('/ai/extract-keywords', {
      jobDescription: job.description,
    });
    const keywords = res.data.keywords || [];
    return {
      original: keywords,
      rewritten: keywords.map(kw => `• ${kw}`),
    };
  } catch (error) {
    console.error('Keyword extraction error:', error);
    return { original: [], rewritten: [] };
  }
}

// TTS using browser Web Speech API (free, no API key needed)
export function generateSpeech(text) {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser');
      resolve(null);
      return;
    }
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => resolve(null);
    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      resolve(null);
    };
    window.speechSynthesis.speak(utterance);
  });
}

// Stop any ongoing speech
export function stopSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// URL scan - disabled (Puppeteer not available on Render free tier)
export async function extractJobsFromHtml(html) {
  console.warn('URL scan mode is disabled. Use web search instead.');
  return [];
}
