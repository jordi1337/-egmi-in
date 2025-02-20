const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

const allowedGuildIds = [
  '1133446699440943224',
  '1148510548393209857',
  '1031227145277681674',
  '1031223910542348438',
  '1313919736572149780',
  '1031227618118357104',
  '1138573542783471858',
  '1031226693744066620',
  '1031227733952430111',
  '1173583967883108402',
  '1313749867268411422',
];

const allowedRoleId = '1330249838297747547';
const LOG_CHANNEL_ID2 = '1338611036449673331';

function getServerName(client, guildId) {
  const guild = client.guilds.cache.get(guildId);
  return guild ? guild.name : guildId;
}

module.exports = {
  data: {
    name: 'tam-yasakla',
    description: 'Bir kişinin tüm ilişkili sunuculardan yasakla',
    options: [
      {
        type: ApplicationCommandOptionType.User,
        name: 'kişi',
        description: 'Yasaklanacak kişi, taglayın ya da IDsini girin',
        required: true,
      },
      {
        type: ApplicationCommandOptionType.String,
        name: 'sebep',
        description: 'Yasaklama sebebi, zorunlu. 3 karakterden az, 400 karakterden fazla olamaz',
        required: true,
      },
    ],
  },

  async execute(client, interaction) {
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: "Bu komutu kullanmak için yetkin yok!",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const user = interaction.options.getUser('kişi');
    const reason = interaction.options.getString('sebep');
    const bannedServers = [];
    const failedServers = [];
    const executor = interaction.user.tag;

    if (user) {
      try {
        await user.send(
          `@${executor} tarafından tüm İEGM sunucularından yasaklandınız.\nSebep: ${reason}`
        ).catch(() => console.log(`Kullanıcıya DM atılamadı: ${user.tag}`));

        for (const guildId of allowedGuildIds) {
          const guildInstance = client.guilds.cache.get(guildId);

          if (guildInstance) {
            try {
              await guildInstance.bans.create(user.id, { 
                reason: `Bu kişi ${executor} tarafından tüm İEGM sunucularından yasaklandı. Sebep: ${reason}` 
              });   
              bannedServers.push(getServerName(client, guildId));
            } catch (error) {
              console.error(`Sunucuda kullanıcı yasaklanırken hata oluştu ${guildId}:`, error);
              failedServers.push(guildId);
            }
          } else {
            failedServers.push(guildId);
          }
        }

        const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('İşlemler Tamamlandı')
        .setDescription(
          `**@${user.tag}** (${user.id}) isimli kişi aşağıdaki sunuculardan yasaklandı:\n\n` +
          (bannedServers.length > 0 ? bannedServers.map(server => `**${server}**`).join('\n') : 'Hiçbir sunucudan yasaklanamadı.') +
          '\n\n' +
          'Sorunlar:\n\n' +
          (failedServers.length > 0 ? failedServers.map(serverId => {
            return `**${serverId}** numaralı sunucu işlenemedi, bot bu sunucuda bulunmuyor olabilir. Sunucu yetkilisi ile görüşünüz.`;
          }).join('\n') : 'Yok') +
          `\n\nSebep: ${reason}`
        );        
      
        await interaction.editReply({ embeds: [embed] });

        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID2);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Kullanıcı Yasaklandı')
            .setDescription(
              `Yetkili: **${executor}**\n` +
              `Kişi: **${user.tag}** (${user.id})\n` +
              `Sebep: ${reason}\n\n` +
              `Yasaklanan Sunucular:\n\n` +
              (bannedServers.length > 0 ? bannedServers.map(server => `**${server}**`).join('\n') : 'Hiçbir sunucudan yasaklanamadı.') +
              '\n\n' +
              'Sorunlar:\n\n' +
              (failedServers.length > 0 ? failedServers.map(serverId => `**${serverId}**`).join('\n') : 'Yok')
            );

          await logChannel.send({ embeds: [logEmbed] });
        } else {
          console.error('Log kanalı bulunamadı.');
        }
      } catch (error) {
        console.error('Kullanıcıya mesaj gönderilirken veya yasaklama işlemi sırasında hata oluştu:', error);
        await interaction.editReply('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } else {
      await interaction.editReply('Geçersiz kullanıcı. Lütfen doğru kullanıcıyı seçin.');
    }
  },
};