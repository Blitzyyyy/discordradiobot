import 'dotenv/config'
import discord from "discord.js"
import ytdl from "ytdl-core"

const { URL, CHANNELID, TOKEN, STATUS } = process.env
const client = new discord.Client();

if (!TOKEN) {
    console.error("token ungültig");
} else if (!CHANNELID || !Number(CHANNELID)) {
    console.error("channel id ungültig");
} else if (!ytdl.validateURL(URL)) {
    console.error("video link ungültig");
}

let channel = null;
let broadcast = null;
let stream = ytdl(URL, { highWaterMark: 100 << 150,filter: 'audio'})
client.on('ready', async() => {

    
    client.user.setActivity(STATUS || "Nothings Radio",{ type: 'LISTENING'})
    channel = client.channels.cache.get(CHANNELID) || await client.channels.fetch(CHANNELID);

    if (!channel || channel.type !== "voice") return console.error("Sprachkanal existiert nicht")

    broadcast = client.voice.createBroadcast();
    stream.on('error', console.error);

    try {
        const connection = await channel.join();
        broadcast.play(stream);
        connection.play(broadcast);
        
        setInterval(async ()=>{   
                stream.destroy()
                stream = ytdl(URL, { highWaterMark: 100 << 150, filter: 'audio'});
                await broadcast.play(stream)
        }, 1800000)
    } catch (error) {
        console.error(error);
    }
  console.log("Bot Online!")
});
setInterval(async ()=>{   
             await channel.leave()
        }, 900000)

client.on('voiceStateUpdate', async userEvent => {
    if (userEvent.id !== client.user.id) return;
    if(!channel) return;
    const connection = await channel.join();
    connection.play(broadcast);
})

client.login(TOKEN);