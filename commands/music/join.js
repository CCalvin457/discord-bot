const { JoinChannel } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'join',
    description: 'Joins the same voice channel as the user.',
    aliases: ['j'],
    execute(message, data) {
        const serverInfo = data.serverInfo;
        const serverList = data.serverList;

        JoinChannel(message).then(connection => {
            serverInfo.UpdateServerConnectionInfo(serverList, message, serverInfo.voiceChannel, connection);
        });
    }
}