const { JoinChannel, UpdateQueue } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'j',
    description: 'Calls the bot to join the same voice channel as the user.',
    execute(message, data) {
        JoinChannel(message).then(connection => {
            UpdateQueue(data.queue, message, data.voiceChannel, connection);
        });
    }
}