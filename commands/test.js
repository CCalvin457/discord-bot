module.exports = {
    name: 'test',
    description: 'test',
    async execute(message, data) {
        const test = await message.fetch();

        console.log(test.channel.messages);
    }
}