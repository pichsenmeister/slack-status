const functions = require('firebase-functions');
const { App } = require('@slack/bolt')

const app = new App({
    token: functions.config().slack.token,
    signingSecret: functions.config().slack.signing_secret,
    ignoreSelf: false
});

const events = async (event, res) => {
    if (event.type !== 'reaction_added') {
        return res.send()
    }

    const auth = await app.client.auth.test({
        token: functions.config().slack.token
    });

    // only update status if it's a reaction by someone else
    // and if it's on a message sent by myself
    if (auth.user_id !== event.user && auth.user_id === event.item_user) {
        await app.client.users.profile.set({
            token: functions.config().slack.token,
            profile: {
                status_text: `via <@${event.user}>`,
                status_emoji: `:${event.reaction}:`,
                status_expiration: ((new Date()).getTime() / 1000) + 3600
            }
        });
    }

    return res.send()
}

module.exports = {
    events
}