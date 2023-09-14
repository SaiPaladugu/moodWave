# MoodWave

MoodWave is an Angular-based playlist generator that utilizes OpenAI's GPT-3.5 Turbo to curate playlists based on your mood and intent.

## How to Add Your GPT API Key
To integrate OpenAI's GPT-3.5 Turbo, add your API key in a .env file located at the root of the repo. Add your key as shown below:
```typescript
NG_APP_API_KEY=YOUR_KEY_HERE
```

## How to Run
```console
npm i
ng serve
```

## Future
Wrote the application to transition MoodWave into production level, to where I won't need to add users as project developers to give remote access
Production mode would also unrestrict Spotify's API limits
