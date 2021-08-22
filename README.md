# Slack Status

A simple Slack app that updates your Slack status to the game you're currently playing on Steam, the song you're listening to on Spotify, or a recent reaction you got to one of your messages on Slack.

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
  - Subscribe to `events on behalf of a user`: `reaction_added`, `reaction_removed`
3. Add `User Token Scopes` in `OAuth & Permissions`
  - `reactions:read`
  - `users.profile:read`
  - `users.profile:write`
4. Install App
5. Set token in Firebase config: `firebase functions:config:set slack.token="xoxp-xxxxxx"`

## Steam configuration

(Note: This requires that your Steam profile and game details are public. You can find these settings in your Steam profile under `View Profile > Edit Profile > Privacy Settings`. Ensure that `My profile: Public` and `Game details: Public` are set.)

1. Get a Steam API key [here](https://steamcommunity.com/dev/apikey)
2. Get your numeric Steam ID: `https://<region>-<firebase-project-id>.cloudfunctions.net/steamId?username=<your Steam display name>`
3. Set steam id in Firebase config: `firebase functions:config:set steam.user_id="xxxxxx"`  

## Spotify configuration

1. Create a Spotify app [here](https://developer.spotify.com/dashboard/applications)
2. Set client id, client secret and redirect url in your Firebase config: `firebase functions:config:set spotify.client_id="xxxxxx" spotify.client_secret="xxxxxx" spotify.redirect_uri="https://<region>-<firebase-project-id>.cloudfunctions.net/spotifyOAuth"`
3. Get a refresh token by going through the OAUTH flow `https://<region>-<firebase-project-id>.cloudfunctions.net/spotifyConnect`
4. Set refresh token in Firebase config: `firebase functions:config:set spotify.refresh_token="xxxxxx"` 
