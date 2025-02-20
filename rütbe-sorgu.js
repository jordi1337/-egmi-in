const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { ROBLOX_COOKIE, ROBLOX_GROUP_ID } = require('./config.json');

async function fetchUserIdByUsername(username) {
  try {
    const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
    });

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    } else {
      throw new Error('Kullanıcı bulunamadı.');
    }
  } catch (error) {
    console.error('Kullanıcı kimliği sorgulama hatası:', error.response?.data || error.message);
    throw new Error('Kullanıcı kimliği sorgulama işlemi başarısız oldu.');
  }
}

async function fetchUserRank(userId) {
  try {
    const response = await axios.get(`https://groups.roblox.com/v1/users/${userId}/groups/roles`, {
      headers: {
        Cookie: `.ROBLOSECURITY=${ROBLOX_COOKIE}`,
      },
    });

    const groupData = response.data.data.find(group => group.group.id === parseInt(ROBLOX_GROUP_ID, 10));

    if (groupData) {
      return groupData.role.name;
    } else {
      throw new Error('Kişi bu grupta bulunmuyor.');
    }
  } catch (error) {
    console.error('Rütbe sorgulama hatası:', error.response?.data || error.message);
    throw new Error('Rütbe sorgulama işlemi başarısız oldu');
  }
}

module.exports = {
  data: {
    name: 'rütbe-sorgu',
    description: 'Birinin İEGM rütbesini gör',
    options: [
      {
        name: 'kişi',
        type: 3,
        description: 'Rütbesi sorgulanacak kişi, Roblox adını yaz',
        required: true,
      },
    ],
  },
  async execute(interaction) {
    const username = interaction.options.getString('kişi');

    try {
      const userId = await fetchUserIdByUsername(username);
      const rank = await fetchUserRank(userId);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('İşlemler Tamamlandı')
        .setDescription(`**${username} (${userId})** isimli kişinin rütbesi: **${rank}**  `);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Rütbe sorgulama sırasında hata oluştu:', error.message);

      await interaction.reply({
        content: 'İsmi doğru yazdığınızdan emin olun; Sadece a-z, A-Z, 0-9 ve _ karakterleri kabul edilir. (İngilizce)',
        ephemeral: false,
      });
    }
  },
};