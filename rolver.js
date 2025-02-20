const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { GUILD_ID, SECOND_GUILD_ID, ALLOWED_USER_IDS } = require('./config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rolver')
    .setDescription('İEGM Sunucusunda rol verir')
    .addStringOption(option =>
      option.setName('kişi')
        .setDescription("Rol verilecek kullanıcının ID'si.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('rol')
        .setDescription('Verilecek rolün adı')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false });

    if (interaction.guild.id !== GUILD_ID) {
      return interaction.editReply({ content: 'Bu komut yalnızca belirli bir sunucuda çalıştırılabilir.' });
    }

    if (!ALLOWED_USER_IDS.includes(interaction.user.id)) {
      return interaction.editReply({ content: 'Bu komutu kullanma izniniz yok.' });
    }

    const userId = interaction.options.getString('kişi');
    const roleName = interaction.options.getString('rol');

    const secondGuild = interaction.client.guilds.cache.get(SECOND_GUILD_ID);
    if (!secondGuild) {
      return interaction.editReply({ content: 'Hedef sunucu bulunamadı.' });
    }

    try {
      const role = secondGuild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
      if (!role) {
        return interaction.editReply({ content: `**${roleName}** adlı rol ikinci sunucuda bulunamadı.` });
      }

      let member = secondGuild.members.cache.get(userId);
      if (!member) {
        member = await secondGuild.members.fetch(userId).catch(() => null);
      }

      if (!member) {
        return interaction.editReply({ content: 'Bu kullanıcı ikinci sunucuda bulunamadı.' });
      }

      await member.roles.add(role);
      
      const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('İşlemler Tamamlandı')
        .setDescription(`<@${userId}> kişisine <@&${role.id}> rolü başarıyla verildi.`);

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({ content: 'Rol verilmesi sırasında bir hata oluştu.' });
    }
  },
};