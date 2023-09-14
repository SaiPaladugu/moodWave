import { Component, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-mood-analysis',
  templateUrl: './mood-analysis.component.html',
  styleUrls: ['./mood-analysis.component.css'],
})
export class MoodAnalysisComponent {
  songIdSet = new Set<string>();
  topMatches: string[] = [];
  spotifyPayload: any;
  apiKey: string = '';
  userInput: string = '';
  analysisResult: string = '';
  playlistUrl: string | null = null;
  spotifyUserId: string | null = null;
  rateLimitMessage: string | null = null;
  isLoading = false;

  constructor(private http: HttpClient,
    private snackBar: MatSnackBar) {}

  ngOnInit() {
    let currentTimestamp = new Date().getTime();
    let expiryTimestamp = localStorage.getItem('spotify_token_expiry') || '0';
  
    const hash = window.location.hash
      .substring(1)
      .split('&')
      .reduce((initial: Record<string, string>, item: string) => {
        const parts = item.split('=');
        initial[parts[0]] = decodeURIComponent(parts[1]);
        return initial;
      }, {} as Record<string, string>);
    
    window.location.hash = '';
  
    if (hash["access_token"]) {
      this.apiKey = hash["access_token"];
      localStorage.setItem('spotify_access_token', this.apiKey);
      localStorage.setItem('spotify_token_expiry', (currentTimestamp + 3600000).toString());
      console.log(this.apiKey);
    } 
    else if (currentTimestamp < Number(expiryTimestamp)) {
      this.apiKey = localStorage.getItem('spotify_access_token') || '';
      console.log(this.apiKey);
    } 
    else {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_token_expiry');
      window.location.href = '/';
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.apiKey}`);
  
    this.http.get('https://api.spotify.com/v1/me', { headers })
      .subscribe((data: any) => {
        this.spotifyUserId = data.id;
      });
  
    this.grabRelevant();
  }
  
  
  grabRelevant() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.apiKey}`);

    const topTracks = this.http.get('https://api.spotify.com/v1/me/top/tracks?limit=50', { headers })
      .pipe(
        map((response: any) => {
          response.items.forEach((item: any) => {
            this.songIdSet.add(item.id);
          });
        })
      );
  
    const topArtists = this.http.get('https://api.spotify.com/v1/me/top/artists?limit=15', { headers })
      .pipe(
        mergeMap((response: any) => {
          const artistRequests: Observable<any>[] = [];
          response.items.forEach((artist: any) => {
            artistRequests.push(
              this.http.get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`, { headers })
            );
          });
          return forkJoin(artistRequests);
        }),
        map((responses: any[]) => {
          responses.forEach(response => {
            response.tracks.forEach((track: any) => {
              this.songIdSet.add(track.id);
            });
          });
        })
      );
  
    forkJoin([topTracks, topArtists]).subscribe(() => {
      console.log(this.songIdSet);
    });
  }
  

  analyzeMood() {
    this.isLoading = true;

    const prompt = this.userInput;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env['NG_APP_API_KEY']}`,
    });
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          "role": "system",
          "content": "The user will enter a prompt that represents the mood of the playlist they want.one such example:\"late night car ride\"Your goal is to interpret this mood and output a JSON accordingly with the following keys and values:{  \"acousticness\": 0.00242,  \"danceability\": 0.585,  \"energy\": 0.842,  \"valence\": 0.428}note that above the numbers are randomHere are the meanings for each key:acousticnessA confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.danceabilityDanceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.energyEnergy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale. Perceptual features contributing to this attribute include dynamic range, perceived loudness, timbre, onset rate, and general entropy.valenceA measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).the values are floats from 0 to 1 inclusiveyour goal is interpret the prompt and output the JSON with appropriate values for each key. Be reasonable in picking a value.If the user writes bad output, just output the word 'failure'. no matter what do not spit out anything but a json or the word 'failure' no matter what the user sends."
        },
        {
          "role": "user",
          "content": prompt
        }
      ],
      max_tokens: 256,
      temperature: 1,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };
    
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    
    this.http.post(apiUrl, requestBody, { headers }).subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.choices && response.choices.length > 0) {
          const assistantMessage = response.choices[0].message.content;
          this.spotifyPayload = JSON.parse(assistantMessage);
          this.analysisResult = `${assistantMessage}`;
          console.log(this.analysisResult);
          this.similarSongs();
        } else {
          this.isLoading = false;
          this.analysisResult = 'Error: Unable to analyze mood and intent.';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.analysisResult = 'Error: Unable to analyze mood and intent.';
        console.error(error);
      }
    });    
  }

  similarSongs() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.apiKey}`);
    let rateLimitExceeded = false;
  
    const songObservables: Observable<any>[] = Array.from(this.songIdSet).map(songId => {
      return this.http.get(`https://api.spotify.com/v1/audio-features/${songId}`, { headers });
    });
  
    forkJoin(songObservables).subscribe({
      next: (audioFeaturesArray: any[]) => {
        const differencesArray = audioFeaturesArray.map(features => {
          let difference = 0;
          for (let key in this.spotifyPayload) {
            difference += Math.abs(this.spotifyPayload[key] - features[key]);
          }
          return { id: features.id, difference };
        });
  
        differencesArray.sort((a, b) => a.difference - b.difference);
  
        this.topMatches = differencesArray.slice(0, 10).map(item => item.id);
        console.log('Top 10 matching song IDs:', this.topMatches);
        this.makePlaylist();
      },
      error: (error) => {
        if (error.status === 429) {
          this.isLoading = false;
          rateLimitExceeded = true;
          this.rateLimitMessage = "Rate limit; try again in 5 minutes";
        }
      }
    });
  }  

  makePlaylist() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.apiKey}`);
    const userId = this.spotifyUserId;
    const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
  
    this.http.post(createPlaylistUrl, {
      name: this.userInput,
      description: 'MoodWave',
      public: false
    }, { headers }).subscribe({
      next: (playlistData: any) => {
        const playlistId = playlistData.id;
        this.playlistUrl = playlistData.external_urls.spotify;
        const addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const trackUris = this.topMatches.map(id => `spotify:track:${id}`);
        this.http.post(addTracksUrl, {
          uris: trackUris
        }, { headers }).subscribe({
          next: () => {
            this.isLoading = false;
            console.log('Tracks added to the playlist successfully.');
          },
          error: error => {
            this.isLoading = false;
            console.error('Error adding tracks:', error);
          }
        });
      },
      error: error => {
        this.isLoading = false;
        console.error('Error creating playlist:', error);
      }
    });
  }  
}