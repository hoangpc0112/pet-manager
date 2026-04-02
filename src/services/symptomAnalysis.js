import { GoogleAIBackend, getAI, getGenerativeModel } from 'firebase/ai';
import { app } from '../config/firebase';

const MODEL_NAME = 'gemini-2.5-flash';
const MAX_OUTPUT_TOKENS = 2500;

const getFinishReason = (response) => {
  return response?.candidates?.[0]?.finishReason || '';
};

const normalizeMarkdownToPlainText = (text = '') => {
  if (!text) return '';

  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned;
};

export const analyzeSymptomsWithFirebase = async (payload) => {
  try {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    const model = getGenerativeModel(ai, {
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.2,
        topK: 20,
        topP: 0.85,
        maxOutputTokens: MAX_OUTPUT_TOKENS
      }
    });

    const triageInput = {
      pet: {
        id: payload?.selectedPetId || '',
        name: payload?.selectedPetName || ''
      },
      symptomGroup: {
        id: payload?.selectedGroupId || '',
        label: payload?.selectedGroupLabel || ''
      },
      selectedSymptoms: Array.isArray(payload?.symptoms) ? payload.symptoms : [],
      duration: payload?.duration || '',
      energy: payload?.energy || '',
      appetite: payload?.appetite || '',
      severity: payload?.severity || 1,
      hasImage: Boolean(payload?.symptomImageDataUri)
    };

    const prompt = [
      'You are a veterinary triage assistant for pets.',
      'Analyze the symptom payload and reply in Vietnamese for pet owner.',
      'Return natural text only, no JSON format required.',
      'Do not use markdown syntax, headings, bullet points, or numbering.',
      'Write as normal paragraphs, less than 200 words.',
      'Include: danh gia muc do, huong xu ly, dau hieu can di kham ngay.',
      `Symptom payload: ${JSON.stringify(triageInput)}`
    ].join('\n');

    const result = await model.generateContent(prompt);
    const response = result?.response;
    let responseText = response?.text?.() || '';

    const finishReason = getFinishReason(response);
    if (finishReason === 'MAX_TOKENS') {
      const continuePrompt = [
        'Continue the previous answer from where it stopped.',
        'Do not repeat previous content.',
        'Keep same language and formatting.',
        `Previous partial answer: ${JSON.stringify(responseText).slice(0, 5000)}`
      ].join('\n');

      const continueResult = await model.generateContent(continuePrompt);
      const continuation = continueResult?.response?.text?.() || '';
      if (continuation.trim()) {
        responseText = `${responseText}\n${continuation}`;
      }
    }

    if (__DEV__ && responseText) {
      // eslint-disable-next-line no-console
      console.log('[Firebase AI raw response]', responseText);
    }

    if (!responseText.trim()) {
      throw new Error('Firebase AI returned empty output.');
    }

    return normalizeMarkdownToPlainText(responseText);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Firebase AI symptom analysis failed.', error);
    throw error;
  }
};
