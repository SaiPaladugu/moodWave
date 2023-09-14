import { Component } from '@angular/core';

@Component({
  selector: 'app-mood-home',
  templateUrl: './mood-home.component.html',
  styleUrls: ['./mood-home.component.css']
})
export class MoodHomeComponent {
  loginToSpotify() {
    const clientId = '9fede7ed32da4540bfe3ece0f874282c';
    const redirectUri = encodeURIComponent('http://localhost:4200/callback');
    const scopes = encodeURIComponent('user-top-read playlist-modify-private playlist-modify-public');
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopes}`;
    window.location.href = authUrl;
  }
}
