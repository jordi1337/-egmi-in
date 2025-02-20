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

const LOG_CHANNEL_ID = '1338611070453157949';
const allowedRoleId = '1330249838297747547';

function getServerName(client, guildId) {
    const guild = client.guilds.cache.get(guildId);
    return guild ? guild.name : 'Bilinmeyen Sunucu';
}

module.exports = {
    data: {
        name: 'tam-yasakla-kaldır',
        description: 'Bir kişinin yasağını tüm ilişkili sunuculardan kaldır',
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: 'kişi',
                description: 'Yasağı kaldırılacak kişi, taglayın ya da IDsini girin',
                required: true,
            },
            {
                type: ApplicationCommandOptionType.String,
                name: 'sebep',
                description: 'Yasaklama sebebi, zorunlu. 3-300 karakter arası olmalıdır',
                required: true,
            },
        ],
    },

    async execute(client, interaction) {
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({
                content: "Bu komutu kullanmak için yetkin yok.",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: false });

        const userIdOrTag = interaction.options.getString('kişi');
        const reason = interaction.options.getString('sebep');
        const unbannedServers = [];
        const failedServers = [];
        const executor = interaction.user.tag;

        try {
            const user = await client.users.fetch(userIdOrTag).catch(() => null);
            const targetId = user ? user.id : userIdOrTag;
            const targetName = user ? user.username : 'Bilinmeyen Kullanıcı';

            for (const guildId of allowedGuildIds) {
                const guildInstance = client.guilds.cache.get(guildId);

                if (guildInstance) {
                    try {
                        const isBanned = await guildInstance.bans.fetch(targetId).catch(() => null);

                        if (isBanned) {
                            await guildInstance.members.unban(targetId, reason);
                            unbannedServers.push(getServerName(client, guildId));
                        } else {
                            failedServers.push(guildId);
                        }
                    } catch (error) {
                        console.error(`Sunucuda işlem sırasında hata oluştu ${guildId}:`, error);
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
                    `**${targetName}** (${targetId}) isimli kişinin yasaklaması aşağıdaki sunuculardan kaldırıldı:\n\n` +
                    (unbannedServers.length > 0 ? unbannedServers.map(server => `**${server}**`).join('\n') : 'Hiçbir sunucuda yasaklama bulunamadı.') +
                    '\n\n' +
                    'Sorunlar:\n\n' +
                    (failedServers.length > 0 ? failedServers.map(serverId => {
                        return `**${serverId}** numaralı sunucu işlenemedi, bot bu sunucuda bulunmuyor olabilir. Sunucu yetkilisi ile görüşünüz.`;
                    }).join('\n') : 'Yok') +
                    `\n\nSebep: ${reason}`
                );

            await interaction.editReply({ embeds: [embed] });

            const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle('Yasak Kaldırıldı')
                    .setDescription(
                        `Yetkili: **${executor}**\n` +
                        `Kişi: **${targetName}** (${targetId})\n` +
                        `Sebep: ${reason}\n\n` +
                        `Yasak kaldırılan sunucular:\n\n` +
                        (unbannedServers.length > 0 ? unbannedServers.map(server => `**${server}**`).join('\n') : 'Yasak kaldırılan sunucu yok.') +
                        '\n\n' +
                        'Sorunlar:\n\n' +
                        (failedServers.length > 0 ? failedServers.join(', ') : 'Yok')
                    )

                await logChannel.send({ embeds: [logEmbed] });
            } else {
                console.error('Log kanalı bulunamadı.');
            }
        } catch (error) {
            console.error('İşlem sırasında hata oluştu:', error);
            await interaction.editReply('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    },
};