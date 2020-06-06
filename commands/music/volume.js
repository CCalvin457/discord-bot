const { ValidateVolume, SetVolume } = require('../../utils/musicUtils.js');

module.exports = {
    name: 'v',
    description: 'Adjusts the volume of the bot',
    execute(message, data) {
        if(data.args[1] == null) {
            return message.reply('Please include a value between 0 and 1');
        }

        const volumeInfo = ValidateVolume(data.args[1]);

        if(!volumeInfo.success) {
            return message.reply(volumeInfo.message);
        }

        SetVolume(data.queue, message, volumeInfo.value);
    }
}