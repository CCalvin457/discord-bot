const { JoinChannel } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'j',
    description: 'Calls the bot to join the same voice channel as the user.',
    execute(message, data) {
        JoinChannel(message).then(connection => {
            data.serverInfo.UpdateServerConnectionInfo(data.serverList, message, data.voiceChannel, connection);
        });
    }
}