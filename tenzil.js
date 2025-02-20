const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');
const config = require('./config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rütbe-rd')
        .setDescription('Bir kişiye rd ver (rütbesini düşür)')
        .addStringOption(option => 
            option.setName('kişi')
                .setDescription('Rütbesi düşürülecek kişi, Roblox adını yaz')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('sebep')
                .setDescription('Rütbelendirme sebebi, zorunlu. 3-300 karakter arası olmalıdır')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        try {
            const allowedRoleId = "1330249838297747547";
            if (!interaction.member.roles.cache.has(allowedRoleId)) {
                return interaction.reply({
                    content: "Bu komutu kullanmak için yetkin yok!",
                    ephemeral: true,
                });
            }

            const robloxUsername = interaction.options.getString('kişi');
            const reason = interaction.options.getString('sebep');

            await interaction.deferReply();

            await noblox.setCookie(config.ROBLOX_COOKIE);

            const userId = await noblox.getIdFromUsername(robloxUsername);
            if (!userId) {
                return interaction.editReply({
                    content: `**${robloxUsername}** adlı kişi bulunamadı, Lütfen doğru bir roblox adı girin`
                });
            }

            const roles = await noblox.getRoles(config.ROBLOX_GROUP_ID);
            const userCurrentRole = await noblox.getRankInGroup(config.ROBLOX_GROUP_ID, userId);
            const currentRole = roles.find(role => role.rank === userCurrentRole);

            if (!currentRole) {
                return interaction.editReply({
                    content: `**${robloxUsername}** adlı kişinin geçerli bir rütbesi bulunamadı`
                });
            }

            const sortedRoles = roles.sort((a, b) => b.rank - a.rank);
            const currentRoleIndex = sortedRoles.findIndex(role => role.rank === currentRole.rank);
            const prevRole = sortedRoles[currentRoleIndex + 1];

            if (!prevRole) {
                return interaction.editReply({
                    content: `**${robloxUsername}** adlı kişinin bir alt rütbesi bulunamadı, Bu kişi zaten en düşük rütbeye sahip`
                });
            }

            await noblox.setRank(config.ROBLOX_GROUP_ID, userId, prevRole.rank);

            const successEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('İşlemler Tamamlandı')
                .setDescription(
                    `**${robloxUsername} (${userId})** isimli kişiye **${currentRole.name}** rütbesinden **${prevRole.name}** rütbesi başarıyla verildi\n\nSebep: ${reason}`
                );
            await interaction.editReply({ embeds: [successEmbed] });

            const logEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('İşlemler Tamamlandı')
                .setDescription(
                    `**${robloxUsername} (${userId})** isimli kişiye **${currentRole.name}** rütbesinden **${prevRole.name}** rütbesi başarıyla verildi\n\nSebep: ${reason}`
                );
            const logChannel = await interaction.client.channels.fetch(config.ALLOWED_CHANNEL_ID);
            if (logChannel) {
                logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            await interaction.editReply({
                content: "Rütbelendirme işlemi başarısız oldu, daha sonra tekrar deneyin."
            });
        }
    },
};