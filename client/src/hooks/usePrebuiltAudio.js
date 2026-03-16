import { useCallback, useEffect, useState } from 'react';
import { fetchAudioManifest } from '../api';

const buildStaticUrl = (relativePath) => {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${normalizedBase}${normalizedPath}`;
};

export const usePrebuiltAudio = ({ onError }) => {
  const [audioEntries, setAudioEntries] = useState({});
  const [availableAudioDays, setAvailableAudioDays] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadAudioManifest = async () => {
      try {
        const manifest = await fetchAudioManifest();
        setAudioEntries(manifest.entries ?? {});
        setAvailableAudioDays(manifest.availableDays ?? []);
      } catch (error) {
        onError(error.message);
      }
    };

    loadAudioManifest();
  }, [onError]);

  const playText = useCallback(
    async (text, options = {}) => {
      const { force = false } = options;

      if (!text) {
        return;
      }

      if (!force && isSpeaking) {
        return;
      }

      const normalized = text.trim();
      const audioPath = audioEntries[normalized];
      if (!audioPath) {
        onError(`오디오가 준비되지 않았어요: ${normalized}`);
        return;
      }

      try {
        setIsSpeaking(true);
        const audio = new Audio(buildStaticUrl(audioPath));

        audio.onended = () => {
          setIsSpeaking(false);
        };

        audio.onerror = () => {
          onError(`오디오 재생에 실패했어요: ${normalized}`);
          setIsSpeaking(false);
        };

        await audio.play();
      } catch (error) {
        onError(error.message);
        setIsSpeaking(false);
      }
    },
    [audioEntries, isSpeaking, onError]
  );

  return {
    availableAudioDays,
    playText
  };
};
