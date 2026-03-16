import { promises as fs } from 'node:fs';
import path from 'node:path';

const parseList = (value) => {
  if (!value) {
    return [];
  }

  return value
    .replaceAll('`', '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const extractSectionLines = (markdown, heading) => {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex((line) => line.trim() === `## ${heading}`);
  if (startIndex < 0) {
    return [];
  }

  const sectionLines = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith('## ')) {
      break;
    }

    sectionLines.push(line);
  }

  return sectionLines;
};

const parseBulletLines = (lines) =>
  lines
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace('- ', '').trim())
    .filter(Boolean);

const normalizeDay = (dayInput) => {
  const numericDay = Number.parseInt(String(dayInput), 10);
  if (Number.isNaN(numericDay) || numericDay < 1 || numericDay > 30) {
    return null;
  }

  return String(numericDay).padStart(3, '0');
};

const buildStageBlocks = (markdown) => {
  const lines = markdown.split('\n');
  const stageBlocks = [];
  let currentStage = null;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (currentStage) {
        stageBlocks.push(currentStage);
      }

      currentStage = {
        title: line.replace('### ', '').trim(),
        activities: []
      };
      continue;
    }

    if (!currentStage) {
      continue;
    }

    if (line.startsWith('- ')) {
      currentStage.activities.push(line.replace('- ', '').trim());
      continue;
    }

    if (line.startsWith('## ')) {
      stageBlocks.push(currentStage);
      currentStage = null;
    }
  }

  if (currentStage) {
    stageBlocks.push(currentStage);
  }

  return stageBlocks;
};

export const loadLessonGuide = async (dayInput, projectRoot = process.cwd()) => {
  const day = normalizeDay(dayInput);
  if (!day) {
    return null;
  }

  const lessonPath = path.resolve(projectRoot, 'docs', 'lectures', `${day}.md`);
  const markdown = await fs.readFile(lessonPath, 'utf8');
  const goalLines = parseBulletLines(extractSectionLines(markdown, '오늘 목표'));
  const focusLines = parseBulletLines(extractSectionLines(markdown, '핵심 학습'));

  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const lettersLine = focusLines.find((line) => line.startsWith('자모:'))?.replace('자모:', '').trim();
  const wordsLine = focusLines.find((line) => line.startsWith('단어:'))?.replace('단어:', '').trim();

  return {
    day,
    title: titleMatch?.[1] ?? `${day}일차`,
    goals: goalLines,
    letters: parseList(lettersLine),
    words: parseList(wordsLine),
    stages: buildStageBlocks(markdown),
    markdown
  };
};

export const normalizeLessonDay = normalizeDay;
