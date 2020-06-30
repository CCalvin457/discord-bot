const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');

const client = new Discord.Client();
dotenv.config();

const botToken = process.env.BOT_TOKEN;

// Creating an empty collection to store our commands
client.commands = new Discord.Collection();

// Looking for all .js files inside the commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Server list to keep track of each servers song list and channel info
const serverList = new Map();

// Adding all commands into the empty collection, 'client.commands'
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if(!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) return;

    let serverInfo = serverList.get(msg.guild.id);
    const args = msg.content.slice(process.env.PREFIX.length).split(' ');
    const commandName = args.shift().toLowerCase();

    const data = {
        args: args,
        serverInfo: serverInfo,
        serverList: serverList
    }

    if(!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);

    try {
        command.execute(msg, data);
    } catch(error) {
        console.error(error);
    }
});

client.login(botToken);