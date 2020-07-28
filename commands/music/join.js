const { JoinChannel } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'j',
    description: 'Calls the bot to join the same voice channel as the user.',
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;

        JoinChannel(message).then(connection => {
            serverInfo.UpdateServerConnectionInfo(serverList, message, serverInfo.voiceChannel, connection);
        });
    }
}