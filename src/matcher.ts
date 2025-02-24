import { closest } from 'fastest-levenshtein';
import createDebug from 'debug';
import { type Options } from './options.js';
import { getCompletion } from './ollama.js';
import { stats } from './stats.js';

const debug = createDebug('matcher');

export async function findBestMatch(search: string, name: string, candidates: string[], options: Options) {
  if (!candidates?.length) return undefined;

  if (options?.ai) {
    const bestMatch = await findBestMatchWithAi(search, name, candidates, options);
    if (bestMatch) return bestMatch;
  }

  // Use Levenstein distance after removing (...) and [...] in the name
  const strippedCandidates = candidates.map((c) => c.replaceAll(/(\(.*?\)|\[.*?])/g, '').trim());
  const best = closest(search, strippedCandidates);
  const bestIndex = strippedCandidates.indexOf(best);
  const bestMatch = candidates[bestIndex];

  console.info(`Partial match for "${name}" (searched: "${search}"): "${bestMatch}"`);
  stats.matches.partial++;
  return bestMatch;
}

export async function findBestMatchWithAi(
  search: string,
  name: string,
  candidates: string[],
  options: Options
): Promise<string | undefined> {
  const prompt = `
## Candidates
${candidates.map((c) => `${c}`).join('\n')}

## Instructions
Find the best matching image for the ROM name "${name}" in the listed candidates.
If a direct match isn't available, use the closest match trying to translate the name in english.
For example, "Pokemon - Version Or (France) (SGB Enhanced)" should match "Pokemon - Gold Version (USA, Europe) (SGB Enhanced) (GB Compatible).png".
When multiple regions are available, prefer the one that matches the region of the ROM if possible.
If the region is not available, use this order of preference: ${options.regions}.
If no match is found, return null.

## Output
Answer with JSON using the following format:
{
  "bestMatch": "<best matching candidate>"
}`;

  const response = await getCompletion(prompt, options.aiModel!);
  debug('AI response:', response);

  const bestMatch = response?.bestMatch;
  if (!bestMatch) {
    debug(`AI failed to find a match for "${name}" (searched: "${search}")`);
    return undefined;
  }

  if (!candidates.includes(bestMatch)) {
    debug(`AI found a match for "${name}" (searched: "${search}"), but it's not a candidate: "${bestMatch}"`);
    return undefined;
  }

  console.info(`AI match for "${name}" (searched: "${search}"): "${bestMatch}"`);
  stats.matches.ai++;
  return bestMatch;
}
