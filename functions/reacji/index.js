const functions = require('firebase-functions');
const { App } = require('@slack/bolt')

const app = new App({
    token: functions.config().slack.token,
    signingSecret: functions.config().slack.signing_secret,
    ignoreSelf: false
});

const events = async (event, res) => {
    const allowedEvents = ['reaction_added', 'reaction_removed']
    if (!allowedEvents.includes(event.type)) {
        return res.send()
    }

    const auth = await app.client.auth.test({
        token: functions.config().slack.token
    })

    // only update status if it's a reaction by someone else
    // and if it's on a message sent by myself
    if (auth.user_id !== event.user && auth.user_id === event.item_user) {
        if (event.type === 'reaction_added') {
            const expiration = ((new Date()).getTime() / 1000) + 3600
            await setStatus(`via <@${event.user}>`, `:${event.reaction}:`, expiration)
        }
        if (event.type === 'reaction_removed') {
            const status = await getStatus()
            const emoji = status.profile.status_emoji
            if (emoji === `:${event.reaction}:`) {
                await setStatus('', '')
            }
        }
    }

    return res.send()
}

const setStatus = async (text, emoji, expiration) => {
    expiration = expiration || 0
    await app.client.users.profile.set({
        token: functions.config().slack.token,
        profile: {
            status_text: text,
            status_emoji: emoji,
            status_expiration: expiration
        }
    })
}

const getStatus = async () => {
    return await app.client.users.profile.get({
        token: functions.config().slack.token
    })
}

module.exports = {
    events
}