import { useState, useCallback } from 'react';

export const useBlurSnip = (ollamaEnabled = true) => {
  const [blurredElements, setBlurredElements] = useState([]);
  const [snips, setSnips] = useState([]);
  
  const detectAndBlur = useCallback(async (element, aiEndpoint) => {
    if (!ollamaEnabled) return;
    
    // Use Ollama to detect sensitive content
    const text = element.innerText;
    const detection = await fetch(`${aiEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `Analyze this text and return ONLY the types of sensitive data present (comma-separated): name, email, phone, company, date, location, salary. Text: "${text}"`,
        stream: false
      })
    });
    
    const result = await detection.json();
    const sensitiveTypes = result.response.split(',');
    
    return sensitiveTypes;
  }, [ollamaEnabled]);
  
  const createSnip = useCallback((selectedText, context) => {
    const snip = {
      id: Date.now(),
      text: selectedText,
      context: context,
      timestamp: new Date().toISOString(),
      quote: `"${selectedText}" - ${context.source}`
    };
    setSnips(prev => [...prev, snip]);
    return snip;
  }, []);
  
  return { blurElements: detectAndBlur, createSnip, snips, blurredElements };
};