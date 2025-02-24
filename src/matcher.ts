import ollama from 'ollama';
import { closest } from 'fastest-levenshtein';
import createDebug from 'debug';
import { Options } from './options.js';

const debug = createDebug('matcher');

export async function hasOllama() {
  try {
    await ollama.list();
    return true;
  } catch (e) {
    return false;
  }
}

export async function checkOllamaModel(model: string) {
  try {
    const response = await ollama.show({ model });
    console.log(response);
  } catch (e) {
  }
}

export async function findBestMatch(search: string, name: string, candidates: string[], options: Options) {
  if (!candidates?.length) return undefined;

  // Use Levenstein distance after removing (...) and [...] in the name
  const strippedCandidates = candidates.map((c) => c.replaceAll(/(\(.*?\)|\[.*?])/g, '').trim());
  const best = closest(name, strippedCandidates);
  const bestIndex = strippedCandidates.indexOf(best);
  const bestMatch = candidates[bestIndex];

  debug(`Found match for "${name}" (searched: "${search}"): "${bestMatch}"`);
  return bestMatch;
}
