module.exports = {
    name: 'music',
    description: 'Allows user to request a song for the bot to play',
    execute(message, args) {
        // code here
        if(!message.guild) return;
        
        message.reply('what do you want');
        console.log("WAT");
    }
}