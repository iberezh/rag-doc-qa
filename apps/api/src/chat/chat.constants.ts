export const GROQ_MODEL = 'llama-3.3-70b-versatile';
export const GROQ_TEMPERATURE = 0.2;

export const LOW_CONFIDENCE_MESSAGE =
  "I don't have a confident answer for that yet. Leave your email and the team will follow up.";

export const MESSAGE_LIMIT_MESSAGE =
  'This assistant has reached its monthly message limit. Please check back later.';

// A retrieval hit can clear the confidence bar while the model still falls back to
// "I don't have enough information" (per prompt.ts). Treat that as unanswered so the
// deflection / unanswered analytics reflect real outcomes, not just the retrieval score.
export const NO_ANSWER_PATTERN =
  /(do not|don'?t|cannot|can'?t|couldn'?t|unable to)[\s\S]{0,40}(enough|sufficient)[\s\S]{0,20}information/i;

export const isNonAnswer = (text: string): boolean => NO_ANSWER_PATTERN.test(text);
