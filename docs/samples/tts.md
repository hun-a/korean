# TTS (Text to speech)
The Audio API provides a speech endpoint based on our GPT-4o mini TTS (text-to-speech) model. It comes with 11 built-in voices and can be used to:
- Narrate a written blog post
- Produce spoken audio in multiple languages
- Give realtime audio output using streaming

## Text-to-speech models
For intelligent realtime applications, use the gpt-4o-mini-tts model, our newest and most reliable text-to-speech model. You can prompt the model to control aspects of speech, including:

- Accent
- Emotional range
- Intonation
- Impressions
- Speed of speech
- Tone
- Whispering

## Example

```javascript
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();
const speechFile = path.resolve("./speech.mp3");

const mp3 = await openai.audio.speech.create({
  model: "gpt-4o-mini-tts",
  voice: "coral",
  input: "Today is a wonderful day to build something people love!",
  instructions: "Speak in a cheerful and positive tone.",
});

const buffer = Buffer.from(await mp3.arrayBuffer());
await fs.promises.writeFile(speechFile, buffer);
```
