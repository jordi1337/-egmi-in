const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const noblox = require('noblox.js');
const config = require('./config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rütbe-terfi')
        .setDescription('Bir kişiye terfi ver')
        .addStringOption(option => 
            option.setName('kişi')
                .setDescription('Terfi verilecek kişi, Roblox adını yaz')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('sebep')
                .setDescription('Rütbelendirme sebebi, zorunlu. 3-300 karakter arası olmalıdır')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        const allowedRoleId = "1330249838297747547";
        if (!interaction.member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({
                content: "Bu komutu kullanmak için yetkin yok!",
                ephemeral: true,
            });
        }

        const username = interaction.options.getString('kişi');
        const reason = interaction.options.getString('sebep');

        try {
            await noblox.setCookie(config.ROBLOX_COOKIE);

            const userId = await noblox.getIdFromUsername(username);
            if (!userId) {
                return interaction.reply({
                    content: `**${username}** adlı kişi bulunamadı`,
                    ephemeral: true
                });
            }

            const roles = await noblox.getRoles(config.ROBLOX_GROUP_ID);
            const userCurrentRole = await noblox.getRankInGroup(config.ROBLOX_GROUP_ID, userId);
            
            roles.sort((a, b) => a.rank - b.rank);

            const currentRoleIndex = roles.findIndex(role => role.rank === userCurrentRole);
            if (currentRoleIndex === -1) {
                return interaction.reply({
                    content: `**${username}** adlı kişi mevcut rütbesi bulunamadı`,
                    ephemeral: true
                });
            }

            const nextRole = roles[currentRoleIndex + 1];
            if (!nextRole) {
                return interaction.reply({
                    content: `**${username}** adlı kişi bir üst rütbesi bulunamadı`,
                    ephemeral: true
                });
            }

            await noblox.setRank(config.ROBLOX_GROUP_ID, userId, nextRole.rank);

            const successEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('İşlemler Tamamlandı')
                .setDescription(
                    `**${username} (${userId})** isimli kişiye **${nextRole.name}** rütbesi başarıyla verildi.\n\nSebep: ${reason}`
                );

            const logEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('İşlemler Tamamlandı')
                .setDescription(
                    `**${interaction.user.username}** isimli yetkili, **${username} (${userId})** isimli kişiye **${nextRole.name}** rütbesi başarıyla verildi.\n\nSebep: ${reason}`
                );

            const logChannel = await interaction.client.channels.fetch(config.ALLOWED_CHANNEL_ID);
            if (logChannel) {
                logChannel.send({ embeds: [logEmbed] });
            }

            return interaction.reply({
                embeds: [successEmbed],
                ephemeral: false
            });

        } catch {
            return interaction.reply({
                content: 'Rütbelendirme işlemi başarısız oldu, daha sonra tekrar deneyin.',
                ephemeral: false
            });
        }
    },
};