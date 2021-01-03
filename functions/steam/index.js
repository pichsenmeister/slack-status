const functions = require('firebase-functions');
const { App } = require("@slack/bolt");
const axios = require("axios");

const app = new App({
    token: functions.config().slack.token,
    signingSecret: functions.config().slack.signing_secret,
});

// these are custom emojis for specific games
const emojis = {
    "rocket-league": ":rocket-league:",
    "duck-game": ":duck-game:",
    "beat-saber": ":beatsaber:"
};

const getId = async (req, res) => {
    const username = req.query.username;

    const result = await axios.get(
        `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${functions.config().steam.api_key}&vanityurl=${username}`
    );
    return res.send(result.data.response.steamid);
}

// poll function to update status
const poll = async () => {
    const gameInfo = await getSteamStatus();

    if (gameInfo) {
        const key = gameInfo.toLowerCase().replace(" ", "-");
        const emoji = emojis[key] || ":video_game:";
        await setStatus(gameInfo, emoji);
        return true
    } else {
        const status = await getSlackStatus();
        // only unset status if it's a game status
        if (isGameStatus(status)) await unsetStatus();
        return false
    }
}

// check if the current Slack status is a game status
const isGameStatus = status => {
    const key = status.emoji.replace(/:/g, "");
    return (
        status.text.startsWith("playing") &&
        (status.emoji === ":video_game:" || emojis[key])
    );
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

const setStatus = async (gameInfo, emoji) => {
    await app.client.users.profile.set({
        token: functions.config().slack.token,
        profile: {
            status_text: `playing ${gameInfo}`,
            status_emoji: `${emoji}`,
            status_expiration: 0
        }
    });
};

const getSteamStatus = async () => {
    const res = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${functions.config().steam.api_key}&steamids=${functions.config().steam.user_id}`
    );
    const gameInfo = res.data.response.players[0].gameextrainfo;

    return gameInfo;
};

module.exports = {
    getId,
    poll
}
