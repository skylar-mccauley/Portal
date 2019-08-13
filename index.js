const fs = require('fs')
const fse = require('fs-extra')
const moment = require('moment')
const Discord = require("discord.js");
const RichEmbed = require("discord.js").RichEmbed;
const client = new Discord.Client({autoReconnect:true});
const config = require("./data/config.json");
const token = config.token
const request = require('request')

client.on("ready", () => {
    console.log('[Logged in] ' + client.user.tag)
    console.log('[Time] ' + moment().format('MMMM Do YYYY, h:mm:ss a'))

    function setAct() {
        client.user.setActivity('Portal', { type: 'PLAYING' })
      }
    
    if(!fs.existsSync("./data/portals")) {
        fs.mkdir("./data/portals")
    }
    if(!fs.existsSync("./tmp")) {
        fs.mkdir("./tmp")
    }
      setAct()
      setInterval(setAct, 300000)
});
client.on("message", (message) => {
    const prefixMention = new RegExp(`^<@!?${client.user.id}>`);
    const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : config.testString;
    
    const args = message.content.split(" ");

        if (message.author.bot) return;
        if (message.author == client.user) return;

        var newUser = new Discord.RichEmbed()
            .setColor(config.color.normal)
            .setTitle(`Welcome to ${client.user.username}`)
            .setDescription("With portal you can have all of your important links in one place for your server members to access!\n\n" +
                            "**Getting Started**\n" +
                            `To get started, make a \`.txt\` file with all of your important links inside. It **must** be 2048 characters or less! Afterwards, type @Portal \`update\` send that message with your \`.txt\` file as an attachment.\n\n` +
                            "**Other Commands**\n" +
                            "@Portal info\n" +
                            "@Portal getportal\n" +
                            "@Portal help")
            .setFooter("We hope you are mindful of what you are saving to your portal.")
            .setAuthor(client.user.username, client.user.displayAvatarURL)
        if(message.content.startsWith(`${prefix} ping`)) {
        	var pingstart = new Discord.RichEmbed()
		        .setDescription('Pinging...')
		        .setAuthor(message.author.username, message.author.displayAvatarURL)
		    message.channel.send({embed: pingstart}).then(sent => {
        	var pinged = new Discord.RichEmbed()
	          .setTitle('**Pong!**')
	          .setDescription(`${sent.createdTimestamp - message.createdTimestamp}ms`)
        sent.edit({embed: pinged})
      })
        }
        if(message.content.startsWith(`${prefix} getportal`)) {
        if(!fs.existsSync(`./data/portals/${message.guild.id}/portal.txt`)) return message.channel.send("Portal has not been opened!")
        message.channel.send({file: `./data/portals/${message.guild.id}/portal.txt`})
        return;
    }
    if(message.content.startsWith(`${prefix} update`)) {
        if(!fs.existsSync(`./data/portals/${message.guild.id}`)) {
            fs.mkdir(`./data/portals/${message.guild.id}`)
        }
        message.channel.send("Processing... (1/3)")
        var download = function(uri, filename, callback){
            request.head(uri, function(err, res, body){
              console.log('content-type:', res.headers['content-type']);
              console.log('content-length:', res.headers['content-length']);
          
              request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
            });
          };
        if(!message.member.hasPermission('MANAGE_GUILD')) return message.channel.send("Error during processing... Permissions insufficient, need `MANAGE_CHANNELS` permission.")

          var Attachment = (message.attachments).array();
          if (Attachment === undefined || Attachment.length == 0) return message.channel.send("Error during processing... No `.txt` file provided!")
          Attachment.forEach(function(attachment) {
            e = 1 
                // var filename = attachment.url.substring(attachment.url.lastIndexOf('/')+1);
                const t = Date.now()
                const lf = `./tmp/${message.guild.id}.txt`
                var fileDL = `${attachment.url}`
                console.log(fileDL)
                download(fileDL, lf, function() {
                    message.channel.send("Processing... (2/3)")
                    fs.readFile(`./tmp/${message.guild.id}.txt`, 'utf8', function(err, data) {
                        if(err) return message.channel.send("Error during processing... " + err)
                        if(data.length > 2048) return message.channel.send("Error during processing... Portal too big! (Character length greater than 2048)")
                        
                        if(!fs.existsSync(`./data/portals/${message.guild.id}`)) {
                            fs.mkdir(`./data/portals/${message.guild.id}`)
                        }
                        message.channel.send("Processing... (3/3)")
                        fs.rename(`./tmp/${message.guild.id}.txt`, `./data/portals/${message.guild.id}/portal.txt`, function(err) {
                            if(err) return message.channel.send("Error during processing... " + err)
                            message.channel.send("Portal opened! Just ping me to view your portal!")
                            console.log(`Portal Created by ${message.guild.name} | ${message.guild.id}`)
                        })
                    })
                })
                  
                return;
        });
        return;
    }
    if(message.content.startsWith(`${prefix} info`)) {
        var inf = new Discord.RichEmbed()
            .setColor(config.color.normal)
            .setTitle(`${client.user.username} Info`)
            .addField("Created By", "[Skylar McCauley](https://skylarmccauley.xyz)", true)
            .addField("Website", "[Portal Website](https://skylarmccauley.xyz/portal)", true)
            .addField("Invite", "[Portal Invite](https://skylarmccauley.xyz/ql/portal-invite)", true)
            .addField("Support Server", "[Support Server Invite](https://skylarmccauley.xyz/ql/hackerworld-server)", true)
            .setAuthor(client.user.username, client.user.displayAvatarURL)
        return message.channel.send({embed: inf})
    }
    if(message.content.startsWith(`${prefix} help`)) return message.channel.send({embed: newUser})
    if(message.content.startsWith(`${prefix}`)) {
        if(!fs.existsSync(`./data/portals/${message.guild.id}`)) {
            fs.mkdir(`./data/portals/${message.guild.id}`)
        }
        
        if(fs.existsSync(`./data/portals/${message.guild.id}/portal.txt`)) {
            fs.readFile(`./data/portals/${message.guild.id}/portal.txt`, 'utf8', function(err, data) {
                if(err) return message.channel.send({embed: newUser})
                if(data.length < 1) return message.channel.send({embed: newUser})
                if(data.length > 2048) return message.channel.send({embed: newUser})
                var existingUser = new Discord.RichEmbed()
                    .setColor(config.color.abNormal)
                    .setDescription(data)
                    .setFooter("Use @Portal update to update your Portal")
                    .setAuthor(message.guild.name + " Portal", client.user.displayAvatarURL)
                    return message.channel.send(existingUser)
            })
            return;
        }
        return message.channel.send({embed: newUser})
    }
})
client.login(config.token)