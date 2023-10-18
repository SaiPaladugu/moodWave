# MoodWave

**MoodWave is an Angular-based playlist generator that utilizes OpenAI's GPT-3.5 Turbo to curate playlists based on your mood and intent.**

```diff
- Note: Playlist creation will NOT work without being added to the developer dashboard. DM me for access
- Current spots available: 12/25
```

## Control Flow
![moodwave control flow (2)](https://github.com/SaiPaladugu/moodWave/assets/50923875/4f5493a6-32a2-4b96-acdf-37cde48a9ff3)

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
Application to transition MoodWave into production level is submitted
- Users will no longer needed to be manually addded to the developer dashboard
- Production mode would also unrestrict Spotify's API limits allowing for more accurate playlist curation
