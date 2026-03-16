import dotenv from 'dotenv';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { loadLessonGuide } from './lib/lessonGuideParser.mjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const TTS_MODEL = 'gpt-4o-mini-tts';
const TTS_VOICE = 'coral';
const TTS_INSTRUCTIONS = `Accent/Affect: Warm, refined, and gently instructive, reminiscent of a friendly art instructor.

Tone: Calm, encouraging, and articulate, clearly describing each step with patience.

Pacing: Slow and deliberate, pausing often to allow the listener to follow instructions comfortably.

Emotion: Cheerful, supportive, and pleasantly enthusiastic; convey genuine enjoyment and appreciation of art.

Pronunciation: Clearly articulate artistic terminology (e.g., "brushstrokes," "landscape," "palette") with gentle emphasis.

Personality Affect: Friendly and approachable with a hint of sophistication; speak confidently and reassuringly, guiding users through each painting step patiently and warmly.`;

const PROJECT_ROOT = process.cwd();
const AUDIO_OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'client', 'public', 'audio');
const MANIFEST_PATH = path.resolve(AUDIO_OUTPUT_DIR, 'manifest.json');
const EXTRA_TEXTS = ['다시 써보세요'];
const TTS_INPUT_OVERRIDES = {
  'ㅡ': '모음 으. 으.',
  'ㅣ': '모음 이. 이.',
  오: '오'
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const hashText = (value) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
};

const parseDaysFromArgs = () => {
  const allFlag = process.argv.includes('--all');
  if (allFlag) {
    return Array.from({ length: 30 }, (_, index) => index + 1);
  }

  const daysArg = process.argv.find((arg) => arg.startsWith('--days='));
  if (!daysArg) {
    return [1, 2, 3];
  }

  const parsedDays = daysArg
    .replace('--days=', '')
    .split(',')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => !Number.isNaN(value) && value >= 1 && value <= 30);

  if (parsedDays.length === 0) {
    return [1, 2, 3];
  }

  return [...new Set(parsedDays)];
};

const collectTexts = (lesson) => {
  const texts = new Set();

  for (const goal of lesson.goals ?? []) {
    texts.add(goal.trim());
  }

  for (const letter of lesson.letters ?? []) {
    texts.add(letter.trim());
  }

  for (const word of lesson.words ?? []) {
    texts.add(word.trim());
  }

  for (const stage of lesson.stages ?? []) {
    texts.add(stage.title.trim());
    for (const activity of stage.activities ?? []) {
      texts.add(activity.trim());
    }
  }

  return [...texts].filter((value) => value.length > 0);
};

const loadAllTexts = async (days) => {
  const allTexts = new Set();

  for (const day of days) {
    const lesson = await loadLessonGuide(day, PROJECT_ROOT);
    if (!lesson) {
      continue;
    }

    const lessonTexts = collectTexts(lesson);
    for (const text of lessonTexts) {
      allTexts.add(text);
    }
  }

  for (const text of EXTRA_TEXTS) {
    allTexts.add(text);
  }

  return [...allTexts];
};

const fileExists = async (targetPath) => {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
};

const synthesizeSpeech = async (text) => {
  const response = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: text,
    instructions: TTS_INSTRUCTIONS
  });

  return Buffer.from(await response.arrayBuffer());
};

const main = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required in root .env file.');
  }

  await fs.mkdir(AUDIO_OUTPUT_DIR, { recursive: true });

  const targetDays = parseDaysFromArgs();
  const texts = await loadAllTexts(targetDays);
  const manifestEntries = {};

  console.log(`Target days: ${targetDays.join(', ')}`);
  console.log(`Preparing audio for ${texts.length} text items...`);

  for (const text of texts) {
    const hash = hashText(text);
    const fileName = `${hash}.mp3`;
    const filePath = path.resolve(AUDIO_OUTPUT_DIR, fileName);
    const publicPath = `audio/${fileName}`;

    manifestEntries[text] = publicPath;

    const alreadyExists = await fileExists(filePath);
    if (alreadyExists) {
      continue;
    }

    const inputText = TTS_INPUT_OVERRIDES[text] ?? text;
    console.log(`Generating: ${text}`);
    const audioBuffer = await synthesizeSpeech(inputText);
    await fs.writeFile(filePath, audioBuffer);
  }

  const manifest = {
    model: TTS_MODEL,
    voice: TTS_VOICE,
    instructions: TTS_INSTRUCTIONS,
    generatedAt: new Date().toISOString(),
    availableDays: targetDays,
    total: texts.length,
    entries: manifestEntries
  };

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Done. Manifest saved: ${MANIFEST_PATH}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
