# MoodWave

MoodWave is an Angular-based playlist generator that utilizes OpenAI's GPT-3.5 Turbo to curate playlists based on your mood and intent.

## How to Add Your GPT API Key
To integrate OpenAI's GPT-3.5 Turbo, add your API key in the `environments` folder. Locate the `environment.ts` file and add your key as shown below:
```typescript
export const environment = {
  production: false,
  GPT_API_KEY: '<Your-API-Key-Here>'
};
```

## How to Run
```console
npm i
ng serve
```
