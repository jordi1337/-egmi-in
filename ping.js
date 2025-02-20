const { Client, GatewayIntentBits } = require('discord.js');
const { TOKEN } = process.env;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı.`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply(`🏓 | Gecikme **${client.ws.ping}ms**`); }
});

client.login(TOKEN);