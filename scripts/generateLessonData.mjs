import { promises as fs } from 'node:fs';
import path from 'node:path';
import { loadLessonGuide } from './lib/lessonGuideParser.mjs';

const PROJECT_ROOT = process.cwd();
const LESSONS_DIR = path.resolve(PROJECT_ROOT, 'client', 'public', 'lessons');

const main = async () => {
  await fs.mkdir(LESSONS_DIR, { recursive: true });

  const index = [];

  for (let day = 1; day <= 30; day += 1) {
    const lesson = await loadLessonGuide(day, PROJECT_ROOT);
    if (!lesson) {
      continue;
    }

    const fileName = `${lesson.day}.json`;
    const filePath = path.resolve(LESSONS_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(lesson, null, 2), 'utf8');

    index.push({
      day: lesson.day,
      title: lesson.title,
      path: `lessons/${fileName}`
    });
  }

  await fs.writeFile(
    path.resolve(LESSONS_DIR, 'index.json'),
    JSON.stringify({ total: index.length, lessons: index }, null, 2),
    'utf8'
  );

  console.log(`Generated ${index.length} lesson JSON files in ${LESSONS_DIR}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
