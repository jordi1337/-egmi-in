const axios = require('axios');
const { EmbedBuilder } = require('discord.js');

const gamePasses = [
  { name: "Başpolis", value: "809103877" },
  { name: "Kıdemli Başpolis", value: "809513494" },
  { name: "Komiser Yardımcısı", value: "809539449" },
  { name: "Komiser", value: "809341466" },
  { name: "Başkomiser", value: "809951713" },
  { name: "Emniyet Amiri", value: "809705464" },
  { name: "Müdür", value: "809642374" },
  { name: "Özel Harekat (PÖH)", value: "817490823" },
  { name: "Trafik Şube (TŞ)", value: "817645033" },
  { name: "Yunus Şube (YŞ)", value: "817456985" },
  { name: "Çevik Kuvvet (ÇK)", value: "817360977" },
  { name: "Havacılık Şube (HŞ)", value: "817366996" },
  { name: "Sahil Güvenlik (SGK)", value: "817583116" }
];

module.exports = {
  data: {
    name: 'gamepass-sorgu',
  },
  async execute(interaction) {
    const allowedRoleId = "1330249838297747547";
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: "Bu komutu kullanmak için yetkin yok!",
        ephemeral: true,
      });
    }

    const gamepassId = interaction.options.getString('gamepass');
    const username = interaction.options.getString('kisi');

    await interaction.deferReply();

    const selectedGamePass = gamePasses.find(gp => gp.value === gamepassId);

    if (!selectedGamePass) {
      return interaction.editReply('Geçersiz gamepass ID\'si! Lütfen doğru bir GamePass ID\'si girin.');
    }

    const gamepassName = selectedGamePass.name;

    try {
      const userResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username],
        excludeBannedUsers: true
      });

      if (!userResponse.data.data.length) {
        return interaction.editReply(`Kullanıcı bulunamadı: **${username}**`);
      }

      const userId = userResponse.data.data[0].id;

      const gamepassResponse = await axios.get(`https://inventory.roblox.com/v1/users/${userId}/items/GamePass/${gamepassId}`);

      const hasGamepass = gamepassResponse.data.data.length > 0;

      const embed = new EmbedBuilder()
        .setColor(hasGamepass ? 'Green' : 'Red')
        .setTitle(hasGamepass
          ? `Kişi gamepasse sahip!`
          : `Kişi gamepasse sahip değil!`
        )
        .setDescription(`**${username}** **(${userId})** isimli kişi, ${gamepassName} gamepassine ${hasGamepass ? 'sahip!' : 'sahip değil!'} `);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Gamepass sorgulama hatası:', error);
      await interaction.editReply('Bir hata oluştu, lütfen daha sonra tekrar dene.');
    }
  }
};