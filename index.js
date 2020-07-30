const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const Server = require('./utils/serverInfo.js');

const client = new Discord.Client();
dotenv.config();

const botToken = process.env.BOT_TOKEN;

// Creating an empty collection to store our commands
client.commands = new Discord.Collection();

// Looking for all .js files inside the commands folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Server list to keep track of each servers song list and channel info
const serverList = new Map();
const commandHelp = new Map();
let generalHelp = [];

// Adding all commands into the empty collection, 'client.commands'
// Generating help command details
for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    let subCommandFiles;

    client.commands.set(command.name, command);
    
    let help = {
        name: `${process.env.PREFIX}${command.name}`,
        value: command.description
    };

    generalHelp.push(help);

    try {
        subCommandFiles = fs.readdirSync(`commands/${command.name}`).filter(file => file.endsWith('.js'));
        console.log(`Found folder '${command.name}' under commands.`)
    } catch(error) {
        console.error(`No folder found named: '${command.name}' under commands.`);
    }

    if(subCommandFiles) {
        commandHelp.set(command.name, subCommandFiles);
    }
}

commandHelp.forEach((value, key) => {
    let curHelp = [];
    for(let file of value) {
        const command = require(`./commands/${key}/${file}`);

        let help =  {
            name: `${process.env.PREFIX}${key} ${command.name}`,
            value: command.description
        }

        curHelp.push(help);
    }
    commandHelp.set(key, curHelp);
});

commandHelp.set('help', generalHelp);

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async msg => {
    if(!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) return;

    let serverInfo = serverList.get(msg.guild.id);

    // Create serverInfo object if one doesn't exist for the discord server
    if(!serverInfo) {
        serverInfo = new Server(msg);
        serverList.set(msg.guild.id, serverInfo);
    }
    
    const args = msg.content.slice(process.env.PREFIX.length).split(' ');
    const commandName = args.shift().toLowerCase();

    if(!client.commands.has(commandName) && !client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))) 
        return msg.reply(`'${commandName}' is not a valid command! To view a list of commands you can use the \`!help\` command.`);

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // For command specific data
    let commandData = {};

    if(command.name === 'music') {
        commandData = {
            serverInfo: serverInfo,
            serverList: serverList
        }
    }

    // Data object that will be passed as a parameter in order to execute the given command
    const data = {
        args: args,
        help: commandHelp,
        commandData: commandData
    }

    try {
        command.execute(msg, data);
    } catch(error) {
        console.error(error);
    }
});

client.login(botToken);