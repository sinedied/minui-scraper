import process from 'node:process';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import ollama from 'ollama';
import createDebug from 'debug';

const debug = createDebug('ollama');

export async function getCompletion(prompt: string, model: string, retryCount = 2) {
  debug('Requesting completion for prompt:', prompt);
  const response = await ollama.chat({
    model,
    messages: [{ role: 'user', content: prompt }],
    options: { temperature: 0.3 },
    format: 'json'
  });
  const content = response?.message?.content;

  try {
    const jsonContent = JSON.parse(content) as Record<string, string | undefined>;
    return jsonContent;
  } catch {
    debug('Failed to parse JSON response:', content);
    if (retryCount > 0) {
      debug('Retrying, remaining attempts:', retryCount);
      return getCompletion(prompt, model, retryCount - 1);
    }

    return undefined;
  }
}

export async function checkOllama(model: string) {
  try {
    await ollama.list();
    debug('Ollama is installed');
  } catch {
    console.error(
      `Ollama is not installed or running, but --ai option is enabled.\nPlease install it from https://ollama.com/download.`
    );
    return false;
  }

  let hasModel = false;

  try {
    const response = await ollama.show({ model });
    hasModel = true;
    debug(`Model "${model}" available`);
  } catch (error: any) {
    if (error.status_code !== 404) {
      console.error(`Could not connect to Ollama API, please try again.`);
      return false;
    }
  }

  if (!hasModel) {
    const confirm = await askForConfirmation(`Model "${model}" not found. Do you want to download it?`);
    if (!confirm) {
      throw new Error(`Model "${model}" is not available.\nPlease run "ollama pull ${model}" to download it.`);
    }

    try {
      console.info(`Downloading model "${model}"...`);
      runCommandSync(`ollama pull ${model}`);
    } catch (error: any) {
      console.error(`Failed to download model "${model}".\n${error.message}`);
      return false;
    }
  }

  return true;
}

export function runCommandSync(command: string) {
  execSync(command, { stdio: 'inherit', encoding: 'utf8' });
}

export async function askForInput(question: string): Promise<string> {
  return new Promise((resolve, _reject) => {
    const read = createInterface({
      input: process.stdin,
      output: process.stdout
    });
    read.question(question, (answer) => {
      read.close();
      resolve(answer);
    });
  });
}

export async function askForConfirmation(question: string): Promise<boolean> {
  const answer = await askForInput(`${question} [Y/n] `);
  return answer.toLowerCase() !== 'n';
}
