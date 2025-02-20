const { SlashCommandBuilder } = require('@discordjs/builders');
const { SECOND_GUILD_ID, DUYURU_KANAL_ID, GUILD_ID, BOT_OWNER_ID, ALLOWED_USER_IDS, GROUP_OWNER } = require('./config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('duyuru')
    .setDescription('Belirli bir sunucuda duyuru yapar.')
    .addStringOption(option =>
      option.setName('mesaj')
        .setDescription('Duyurulacak mesajı yazın.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('everyone')
        .setDescription('Everyone etiketini kullanmak istiyor musunuz?')
        .setRequired(true)
        .addChoices(
          { name: 'Evet', value: 'evet' },
          { name: 'Hayır', value: 'hayir' }
        )
    ),

  async execute(interaction) {
    if (interaction.guild.id !== GUILD_ID) {
      return interaction.reply({ content: 'Bu komut yalnızca belirli bir sunucuda çalıştırılabilir.', ephemeral: true });
    }

    const message = interaction.options.getString('mesaj');
    const useEveryone = interaction.options.getString('everyone') === 'evet';

    const secondGuild = interaction.client.guilds.cache.get(SECOND_GUILD_ID);
    if (!secondGuild) {
      return interaction.reply({ content: 'Hedef sunucu bulunamadı.', ephemeral: false });
    }

    const channel = secondGuild.channels.cache.get(DUYURU_KANAL_ID);
    if (!channel) {
      return interaction.reply({ content: 'Duyuru kanalı bulunamadı.', ephemeral: false });
    }

    const userId = interaction.user.id;
    let roleName = 'Kullanıcı';

    if (userId === BOT_OWNER_ID) {
      roleName = 'Bot Geliştiricisi';
    } else if (ALLOWED_USER_IDS.includes(userId)) {
      roleName = 'Grup Yöneticisi';
    } else if (GROUP_OWNER.includes(userId)) {
      roleName = 'Kamp Sahibi';
    }

    const finalMessage = useEveryone ? `@everyone\n\n${message}` : message;

    try {
      await channel.send(`${finalMessage}\n\n- ${interaction.user.username}, ${roleName}`);
      await interaction.reply({ content: 'Duyuru başarıyla gönderildi!', ephemeral: false });
    } catch (error) {
      await interaction.reply({ content: 'Duyuru gönderilirken bir hata oluştu.', ephemeral: false });
    }
  },
};