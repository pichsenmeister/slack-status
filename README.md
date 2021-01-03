# Slack Status

A simple Slack app that updates your Slack status to the game you currently play on Steam, the song you listen to on Spotify, or a recent reaction you got to one of your messages on Slack.

This app uses the [Bolt for Slack](https://slack.dev/bolt/concepts) framework.

## Firebase configuration

1. Create a [new Firebase project](https://console.firebase.google.com/)
2. Upgrade to Blaze plan
3. Set following config variables (`firebase functions:config:set service.key="value"`):
```
{
  "steam": {
    "api_key": "xxxxxx"
  },
  "spotify": {
    "client_secret": "xxxxxx",
    "client_id": "xxxxxx",
  },
  "slack": {
    "signing_secret": "xxxxxx",
  }
}

```

## Slack app configuration

1. Create an [app](https://api.slack.com/apps) on Slack
2. Enable `Event Subscription`
  - Request url: `https://<region>-<firebase-project-id>.cloudfunctions.net/events`
  - Subscribe to `events on behalf of a user`: `reaction_added`
3. Add `User Token Scopes` in `OAuth & Permissions`
  - `reactions:read`
  - `users.profile:write`
4. Install App
5. Set token in Firebase config: `firebase functions:config:set slack.token="xoxp-xxxxxx"`

## Steam configuration

1. Get a Steam API key [here](https://steamcommunity.com/dev/apikey)
2. Get your numeric Steam ID 
  - Add your `STEAM_API_KEY` to the `.env` file and call `https://<region>-<firebase-project-id>.cloudfunctions.net/steamId?username=<your Steam display name>`
3. Set steam id in Firebase config: `firebase functions:config:set steam.user_id="xxxxxx"  

## Spotify configuration

1. Create a Spotify app [here](https://developer.spotify.com/dashboard/applications)
2. Set client id, client secret and redirect url in your Firebase config: firebase functions:config:set spotify.client_id="xxxxxx" spotify.client_secret="xxxxxx" spotify.redirect_uri="https://<region>-<firebase-project-id>.cloudfunctions.net/spotifyOAuth"`
3. Get a refresh token by going through the OAUTH flow `https://<region>-<firebase-project-id>.cloudfunctions.net/spotifyConnect`
4. Set refresh token in Firebase config: `firebase functions:config:set spotify.refresh_token="xxxxxx"` 
