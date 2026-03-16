# Happy Learning Korean MVP

GitHub Pages 배포를 전제로 만든 정적(Static) React 학습 서비스입니다.

## 기능
- `docs/lectures/001.md ~ 030.md`를 정적 JSON으로 변환해 회차별 학습 제공
- OpenAI TTS 사전 생성 mp3 재생 (`client/public/audio/manifest.json`)
- 15분 학습 UI (5분 읽기 + 5분 단어 읽기 + 5분 따라쓰기)
- 따라쓰기 결과를 점수 대신 `성공/다시 써보기` 피드백으로 제공
- 박수 소리(`client/clap.mp3`) + 폭죽 효과

## 개발 실행
1. 의존성 설치
```bash
npm install
npm install --prefix client
```

2. 정적 데이터 생성
```bash
# 강의 JSON 30회차 생성
npm run generate:lessons

# 오디오 생성 (MVP 기본: 1~3일차)
npm run generate:audio

# 전체 회차 오디오 생성
npm run generate:audio -- --all
```

3. 프론트 실행
```bash
npm run dev
```

## 배포 빌드
```bash
npm run build
```
- 산출물: `client/dist`
- `vite base`는 `./`로 설정되어 GitHub Pages 하위 경로에서 동작합니다.

## GitHub Pages 자동 배포
- 워크플로: `.github/workflows/deploy-pages.yml`
- 트리거: `main` 브랜치 push
- 동작: `client` 의존성 설치 -> `client/dist` 빌드 -> Pages 배포
- CI에서는 `generate:audio`를 실행하지 않습니다. 오디오 파일은 저장소에서 정적으로 관리합니다.

GitHub 저장소 설정에서 다음 1회 설정이 필요합니다.
1. `Settings -> Pages -> Build and deployment`에서 `Source`를 `GitHub Actions`로 선택
2. `main` 브랜치에 push

## 환경변수
`.env`는 오디오 사전 생성할 때만 필요합니다.

```env
OPENAI_API_KEY=...
```

## 참고
- TTS 샘플 문서: `docs/samples/tts.md`
- TTS voice/instructions는 생성 스크립트에서 고정(`coral` + 지정 instruction)됩니다.
