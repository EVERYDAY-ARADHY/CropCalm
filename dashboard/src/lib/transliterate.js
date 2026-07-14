export const transliterate = async (text, lang) => {
  if (!text || lang === 'en') return text;
  
  // Basic heuristic: Only transliterate if it looks mostly English.
  // If it already contains Hindi/Tamil characters, skip to save network calls.
  const isEnglish = /^[A-Za-z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(text);
  if (!isEnglish) return text;

  const langCode = lang === 'hi' ? 'hi-t-i0-und' : lang === 'ta' ? 'ta-t-i0-und' : null;
  if (!langCode) return text;

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${langCode}&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data[0] === 'SUCCESS' && data[1] && data[1][0] && data[1][0][1] && data[1][0][1][0]) {
      return data[1][0][1][0];
    }
  } catch (e) {
    console.warn('Transliteration failed:', e);
  }
  return text;
};
