const { JoinChannel } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'join',
    description: `Joins the same voice channel as the user.
                    *aliases*: \`join\`, \`j\``,
    aliases: ['j'],
    execute(message, data) {
        const serverInfo = data.serverInfo;

        JoinChannel(message).then(connection => {
            serverInfo.UpdateServerConnectionInfo(message, connection);
        }).catch(err => {
            message.reply(err);
        });
    }
}