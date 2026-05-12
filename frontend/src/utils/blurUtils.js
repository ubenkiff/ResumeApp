// AI-powered sensitive info detection
export const detectSensitiveInfo = async (text, ollamaEndpoint = 'http://localhost:11434') => {
  const prompt = `Identify sensitive information in this text that should be blurred for privacy (names, emails, phones, addresses, company names, dates):\n\n${text}\n\nReturn as JSON: { "detected": ["type1", "type2"], "confidence": 0-1 }`;
  
  const response = await fetch(`${ollamaEndpoint}/api/generate`, {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama2',
      prompt: prompt,
      stream: false
    })
  });
  
  return await response.json();
};

export const blurElement = (element, type) => {
  if (type === 'text') {
    element.style.filter = 'blur(8px)';
    element.style.backgroundColor = '#f3f4f6';
  } else if (type === 'image') {
    element.style.filter = 'blur(12px)';
  }
  element.setAttribute('data-blurred', 'true');
};

export const removeBlur = (element) => {
  element.style.filter = '';
  element.style.backgroundColor = '';
  element.removeAttribute('data-blurred');
};