const functions = require('firebase-functions');
const reacji = require('./reacji')
const spotify = require('./spotify')
const steam = require('./steam')

exports.scheduledFunction = functions.pubsub.schedule('* * * * *').onRun(async (context) => {
    const isSteamStatus = await steam.poll()
    if (!isSteamStatus) {
        await spotify.poll()
    }
});

exports.events = functions.https.onRequest(async (req, res) => {
    if (!req.body) {
        return res.send()
    }

    if (req.body.challenge) {
        return res.send(req.body.challenge)
    }

    if (!req.body.event) {
        return res.send()
    }

    return await reacji.events(req.body.event, res)
})

exports.spotifyConnect = functions.https.onRequest(async (_req, res) => {
    return spotify.connect(res)
});

exports.spotifyOAuth = functions.https.onRequest(async (req, res) => {
    return spotify.oauth(req, res)
});

exports.steamId = functions.https.onRequest(async (req, res) => {
    return steam.getId(req, res)
});
