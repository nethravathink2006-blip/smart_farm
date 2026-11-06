const cropWords = [
  [/tomato|ಟೊಮೆಟೊ/i, 'TOMATO'],
  [/onion|ಈರುಳ್ಳಿ/i, 'ONION'],
  [/potato|ಆಲೂಗಡ್ಡೆ/i, 'POTATO'],
  [/maize|ಮೆಕ್ಕೆಜೊಳ/i, 'MAIZE'],
  [/paddy|ಭತ್ತ/i, 'PADDY'],
  [/ragi|ರಾಗಿ/i, 'RAGI'],
  [/cotton|ಹತ್ತಿ/i, 'COTTON'],
  [/chilli|ಮೆಣಸಿನಕಾಯಿ/i, 'CHILLI'],
  [/brinjal|ಬದನೆಕಾಯಿ/i, 'BRINJAL'],
  [/tur|ತೊಗರಿ/i, 'TUR']
];

export function parseIntent(phrase = '') {
  const text = String(phrase).toLocaleLowerCase();
  const cropCode = cropWords.find(([pattern]) => pattern.test(text))?.[1];
  const quantity = text.match(/\b\d+(?:\.\d+)?\b/);

  if (/help|ಸಹಾಯ|ಏನು ಕೇಳ/i.test(text)) return { intent: 'HELP', cropCode };
  if (/transport|vehicle|ವಾಹನ|ಸಾರಿಗೆ/i.test(text)) return { intent: 'SHARED_TRANSPORT', cropCode };
  if (/storage|warehouse|ಗೋದಾಮು|ಸಂಗ್ರಹಣೆ/i.test(text)) return { intent: 'STORAGE', cropCode };
  if (/sell|wait|ಮಾರಾಟ|ಕಾಯು/i.test(text)) return { intent: 'SELL_OR_WAIT', cropCode };
  if (/compare|which market|ಹೋಲಿಕೆ/i.test(text)) return { intent: 'COMPARE_MARKETS', cropCode };
  if (/cost|net|profit|ಲಾಭ|ವೆಚ್ಚ/i.test(text)) return { intent: 'CALCULATE_NET', cropCode };
  if (quantity) return { intent: 'SET_QUANTITY', quantityQuintals: Number(quantity[0]), cropCode };
  if (cropCode && /price|rate|ಬೆಲೆ/i.test(text)) return { intent: 'GET_PRICE', cropCode };
  if (cropCode) return { intent: 'SELECT_CROP', cropCode };
  return null;
}