const functions = require('firebase-functions');
const { App } = require("@slack/bolt");
const axios = require("axios");
const qs = require("querystring");

const app = new App({
    token: functions.config().slack.token,
    signingSecret: functions.config().slack.signing_secret,
});

// set your status emoji (this is a custom emoji)
const EMOJI = ':spotify:'

const connect = (res) => {
    const scopes = "user-read-currently-playing user-read-playback-state";
    return res.redirect(
        "https://accounts.spotify.com/authorize" +
        "?response_type=code" +
        "&client_id=" +
        functions.config().spotify.client_id +
        (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
        "&redirect_uri=" +
        encodeURIComponent(functions.config().spotify.redirect_uri)
    );
}

const oauth = async (req, res) => {
    const result = await getSpotifyToken({
        grant_type: "authorization_code",
        code: req.query.code,
        redirect_uri: functions.config().spotify.redirect_uri
    });
    return res.send(result.refresh_token);
}

const getSpotifyToken = async body => {
    try {
        const config = {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    base64(
                        functions.config().spotify.client_id +
                        ":" +
                        functions.config().spotify.client_secret
                    )
            }
        };

        const result = await axios.post(
            `https://accounts.spotify.com/api/token`,
            qs.stringify(body),
            config
        );
        return result.data;
    } catch (err) {
        return console.error(err.response.data);
    }
};

const getSpotifyStatus = async () => {
    const token = await getSpotifyToken({
        grant_type: "refresh_token",
        refresh_token: functions.config().spotify.refresh_token
    });

    const config = {
        headers: {
            Authorization: "Bearer " + token.access_token
        }
    };
    const result = await axios.get(
        `https://api.spotify.com/v1/me/player/currently-playing`,
        config
    );
    return result.data;
};

// poll function to update status
const poll = async () => {
    const spotifyInfo = await getSpotifyStatus();

    if (spotifyInfo.is_playing) {
        const song = {
            name: spotifyInfo.item.name,
            artists: spotifyInfo.item.artists
                .map(artist => artist.name)
                .join(" & ")
        };

        await setStatus(song, EMOJI);

        return true;
    } else {
        const status = await getSlackStatus();
        // only unset status if it's a spotify status
        if (isSpotifyStatus(status)) await unsetStatus();
        return false
    }
}

// check if the current Slack status is a spotify status
const isSpotifyStatus = status => {
    return status.emoji === EMOJI;
};

const getSlackStatus = async () => {
    const profile = await app.client.users.profile.get({
        token: functions.config().slack.token
    });
    return {
        emoji: profile.profile.status_emoji,
        text: profile.profile.status_text
    };
};

const unsetStatus = async () => {
    await app.client.users.profile.set({
        token: functions.config().slack.token,
        profile: {
            status_text: "",
            status_emoji: ""
        }
    });
};

const setStatus = async (song, emoji) => {
    let statusText = `listening to ${song.name} by ${song.artists}`
    if (statusText.length > 100) statusText = statusText.substring(0, 97) + '...'
    await app.client.users.profile.set({
        token: functions.config().slack.token,
        profile: {
            status_text: statusText,
            status_emoji: `${emoji}`,
            status_expiration: 0
        }
    });
};

const base64 = data => {
    const buff = Buffer.from(data);
    return buff.toString("base64");
};

module.exports = {
    connect,
    oauth,
    poll
}