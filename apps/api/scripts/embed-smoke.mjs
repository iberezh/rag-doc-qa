// Standalone check that the real embedder works (downloads the model on first run).
// Mirrors TransformersEmbedder. Run: node apps/api/scripts/embed-smoke.mjs
import { pipeline } from '@xenova/transformers';

const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const out = await pipe(
  ['the cat sat on the mat', 'a feline rested on the rug', 'quarterly revenue exceeded forecasts'],
  { pooling: 'mean', normalize: true },
);

const [cat, feline, finance] = out.tolist();
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0); // normalized → cosine

console.log('dimension:', cat.length);
console.log('cos(cat, feline) :', dot(cat, feline).toFixed(3));
console.log('cos(cat, finance):', dot(cat, finance).toFixed(3));
