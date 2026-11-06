export function listen(language, { onResult, onError, onEnd } = {}) {
  if (typeof window === 'undefined') return null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = event => {
    const transcript = event.results?.[0]?.[0]?.transcript?.trim();
    if (transcript) onResult?.(transcript);
    else onError?.('no-speech');
  };
  recognition.onerror = event => onError?.(event.error || 'unknown');
  recognition.onend = () => onEnd?.();

  try {
    recognition.start();
    return recognition;
  } catch (error) {
    onError?.(error.name || 'start-failed');
    return null;
  }
}

export function speak(text, language) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  return true;
}