import { useEffect, useMemo, useState } from 'react';

const mouthPhotoByLetter = {
  'ㅏ': {
    src: 'mouth-photos/a.jpg',
    hint: '입을 세로로 크게 열고 소리를 내요.'
  },
  'ㅓ': {
    src: 'mouth-photos/eo.jpg',
    hint: '입을 세로로 열고 천천히 발음해요.'
  },
  'ㅗ': {
    src: 'mouth-photos/o.jpg',
    hint: '입술을 동그랗게 모아 소리 내요.'
  },
  'ㅜ': {
    src: 'mouth-photos/u.jpg',
    hint: '입술을 더 오므려 동그랗게 읽어요.'
  },
  'ㅡ': {
    src: 'mouth-photos/eu.jpg',
    hint: '입술을 옆으로 길게 펴서 읽어요.'
  },
  'ㅣ': {
    src: 'mouth-photos/i.jpg',
    hint: '입꼬리를 살짝 올려 밝게 읽어요.'
  }
};

const normalizeLetters = (letters) => Array.from(new Set((letters ?? []).map((letter) => letter.trim())));

const buildStaticUrl = (relativePath) => {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  return `${normalizedBase}${normalizedPath}`;
};

const MouthShapeAnimator = ({ letters, onPlayText }) => {
  const normalizedLetters = useMemo(() => normalizeLetters(letters), [letters]);
  const availableLetters = useMemo(
    () => normalizedLetters.filter((letter) => mouthPhotoByLetter[letter]),
    [normalizedLetters]
  );
  const [activeLetter, setActiveLetter] = useState(availableLetters[0] ?? '');

  useEffect(() => {
    setActiveLetter(availableLetters[0] ?? '');
  }, [availableLetters]);

  if (availableLetters.length === 0) {
    return null;
  }

  const activePhoto = mouthPhotoByLetter[activeLetter] ?? mouthPhotoByLetter[availableLetters[0]];

  return (
    <section className="mouth-trainer" aria-label="발음 입모양 사진">
      <div className="mouth-title-row">
        <h3>발음 입모양 사진</h3>
        <button type="button" onClick={() => onPlayText(activeLetter)}>
          {activeLetter} 소리 듣기
        </button>
      </div>

      <p>{activePhoto.hint}</p>

      <div className="mouth-stage">
        <img
          className="mouth-photo"
          src={buildStaticUrl(activePhoto.src)}
          alt={`${activeLetter} 발음 입모양`}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="mouth-letter-row">
        {availableLetters.map((letter) => {
          const photo = mouthPhotoByLetter[letter];
          return (
            <button
              key={letter}
              type="button"
              className={letter === activeLetter ? 'active' : ''}
              onClick={() => setActiveLetter(letter)}
            >
              <img
                src={buildStaticUrl(photo.src)}
                alt={`${letter} 입모양 미리보기`}
                loading="lazy"
                decoding="async"
              />
              <span>{letter}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MouthShapeAnimator;
