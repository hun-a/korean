const buildStaticUrl = (relativePath) => new URL(relativePath, import.meta.env.BASE_URL).toString();

const formatDay = (day) => String(Number.parseInt(String(day), 10)).padStart(3, '0');

export const fetchLesson = async (day) => {
  const normalizedDay = formatDay(day);
  const response = await fetch(buildStaticUrl(`lessons/${normalizedDay}.json`), { cache: 'no-store' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: '레슨을 찾을 수 없어요.' }));
    throw new Error(payload.error || '레슨을 찾을 수 없어요.');
  }

  return response.json();
};

export const fetchAudioManifest = async () => {
  const response = await fetch(buildStaticUrl('audio/manifest.json'), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('오디오 사전 파일이 없습니다. 먼저 generate:audio를 실행해 주세요.');
  }

  return response.json();
};
