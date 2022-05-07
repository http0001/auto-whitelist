const discord = require("discord.js")

const client = new discord.Client()
const db = require("quick.db")
const axios = require('axios');
const Express = require("express");
const App = Express();

const Settings = {
  GUILD_ID: "955793900101042196",
  OWNER_ID: "755705944813600779",
  Shoppy_API_KEY: "p3kZmAhUuzRdXO4Z9DNUB94HP1RpaWDRE87ibF4RievtiQdonZ",
  Whitelisted_Role_ID: "968318085528424468",
  Blacklisted_Role_ID: "968318123000356864",
  LogsChannel_Channel_ID: "972161571801415712",
  
  KeyDataStart: "Data_",
  UsersDataStart: "UsersData_",
  KeyRobloxNameDataStart: "RobloxData_"
}
App.get("/check", (request, res) => {
   let ThereKey =  request.query.Key;
  let robloxUser = request.query.User;
  if(!ThereKey) {
        res.send(" Key Not Supplyed!")
    return "Key Not Supplyed!";
    }
  if (!robloxUser) {
    res.send("Roblox User Not Supplyed!")
    return "Roblox User Not Supplyed!";
  }
  let ShoppyIDS = db.get(Settings.KeyDataStart+ThereKey) 
  if(ShoppyIDS) {
    if (db.get(Settings.UsersDataStart+ThereKey)) {
      if (robloxUser === db.get(Settings.UsersDataStart+ThereKey)) {
        res.send("Correct")
        return "Correct";
      }
      else
      {
      res.send("Nope.")
      return "Nope.";
      }
    }
    else
    {
      res.send("Nope.")
      return "Nope.";
    }
  }
  else
  {
    res.send("Not Whitelisted!")
    return "C";
  }
})

client.on("message", message => {
const args = message.content.slice("!".length).trim().split(/ +/g); // Not Important
const content = args.shift().toLowerCase(); // Not Important
if (content === "whitelist") {
  const key = args[0]
  let robloxid = args[1]
  if(!key)return(message.reply("Please Include your Shoppy Purchase ID!")) // Checks If they Included there Shoppy ID 
   if(!robloxid)return(message.reply("Please include a roblox id to whitelist!")) // Checks If they Included there Shoppy ID
   axios.get("https://shoppy.gg/api/v1/orders/"+key, {
      headers: {
      Authorization: Settings.Shoppy_API_KEY, // Needed to log data.
      }
   })
   .then(function (res) { 
     if (db.get(Settings.KeyDataStart+key)) {
       message.reply("That key was already used for a Whitelist!")
     }
     else
     {
       if (res.data["confirmations"] === 1 && res.data["product"]["confirmations"]) {
         db.set(Settings.KeyDataStart+key, "<@"+message.author.id+">")
         db.push(Settings.UsersDataStart+key, robloxid)
         let embed = new discord.MessageEmbed()
             .setTitle("Details:")
             .setColor("RANDOM")
             .addField("Shoppy ID:", key)
             .addField("Discord ID:", "<@"+message.author.id+">")
             .addField("Type: Whitelist")
         message.reply("You have successfully been whitelisted! Here are your details:")
         message.reply(embed)
         message.reply("Here is the script:")
         message.reply("_G.Key = '"+key+"'\nloadstring(game:HttpGet('https://PROJECTNAME.herokuapp.com/script.lua', true))()") // Change PROJECTNAME to the project u made on heroku!!!
         client.guilds.cache.get(Settings.GUILD_ID).channels.cache.get(Settings.LogsChannel_Channel_ID).send(embed)
         return;
       }
       else
      {
        message.reply("The purchase was not completed or submitted! Please contact the owner of the server If you are sure that you completed the Purchase(s)!")
      }
     }
   }).catch(err => {
            console.log("Not whtielisted")
            if(err.response === "401") {
              message.reply("**Invalid ID entered! (Shoppy ID not Valid/found)**")
              return;
            }
            else
          {
             message.reply("**Invalid ID entered! (Shoppy ID not Valid/found)**")
            return;
          }
          })
}
if(content === "getdata") {
  if(message.author.id === Settings.OWNER_ID) {
      const key = args[0]
    console.log("Command used")
    if(!key)return(message.reply("Please Include the shoppy ID to get the information from!"))
    if(!db.get(Settings.KeyDataStart+key)) {
      message.reply("The Key was not found or is not whitelisted!")
    }
    else
    {
      axios.get("https://shoppy.gg/api/v1/orders/"+key, {
            headers: {
              Authorization: Settings.Shoppy_AuthorizationID, // Needed to log data.
            }
          }).then(function (response) { 
        console.log(response.data)
        let confirm;
        confirm = response.data["product"]["confirmations"]+" AND "+response.data["confirmations"]
    let embed = new discord.MessageEmbed()
    
    .setTitle("Info")
    .addField("User: ", db.get(Settings.KeyDataStart+key))
    .addField("Key: ", key)
    .addField("IP: ", response["data"]["agent"]["geo"]["ip"])
    .addField("Country: ", response["data"]["agent"]["geo"]["country"])
    .addField("Confirmation: ", confirm)
    .addField("Roblox User ID: ", db.get(Settings.UsersDataStart+key))
    message.reply(embed)
    client.guilds.cache.get(Settings.GUILD_ID).channels.cache.get(Settings.LogsChannel_Channel_ID).send("Type: getdata\nUser who used the command: "+message.author.id)
    }).catch(err => {
            let embed = new discord.MessageEmbed()
                .setColor("RANDOM")
             .addField("User: ", "<@"+db.get(Settings.KeyDataStart+key)+">")
    .addField("Key: ", key)
            .addField("Roblox User ID: ", db.get(Settings.UsersDataStart+key))
            message.reply(embed)
        client.guilds.cache.get(Settings.GUILD_ID).channels.cache.get(Settings.LogsChannel_Channel_ID).send("Type: getdata\nUser who used the command: "+message.author.id)
    })
  }
  }
  else
  {
    message.reply("Owner Only COMMAND!")
  }
}
if(content === "rewhitelist") {
    const key = args[0]
    let robloxid = args[1]
    if(!key)return(message.reply("Please Include your Shoppy Purchase ID!")) // Checks If they Included there Shoppy ID
  if(!robloxid)return(message.reply("Please include a roblox id to whitelist!")) // Checks If they Included there Shoppy ID
    let a = db.get("Dataw22_"+key)
    if(a) {
    if (a == "<@"+message.author.id+">") {
    let guild = client.guilds.cache.get(Settings.GUILD_ID)
    let mem = guild.members.cache.get(message.author.id)
    let role = Settings.Whitelisted_Role_ID
    mem.roles.add(role.id)
     message.reply("You were successfully Updated with all the roles, new channels and other stuff!") 
     client.guilds.cache.get(Settings.GUILD_ID).channels.cache.get(Settings.LogsChannel_Channel_ID).send("Type: rewhitelist\nSuccessful\nUser who used the command: "+message.author.id)
    }
    else
    {
      client.guilds.cache.get(Settings.GUILD_ID).members.cache.get(message.author.id).roles.add(Settings.Blacklisted_Role_ID.id)
      message.reply("You have been blacklisted from this product for using another Buyers Key!")
      client.guilds.cache.get(Settings.GUILD_ID).channels.cache.get(Settings.LogsChannel_Channel_ID).send("Type: rewhitelist\nBlacklisted\nUser who used the command: "+message.author.id)
    }
    }
}
})

client.login("OTY1ODU3OTk0NDY0MTk4Njc2.Yl5TWg.ZwBKjZL4R5R9EWRylpaAwJ7hVhA")
