const axios = require('axios');
require('dotenv').config();
const { EmbedBuilder } = require('discord.js');

const universeId = '5880852790';
const allowedRoleId = '1330249838297747547';

module.exports = {
  slash: true,
  name: ['aktiflik-sorgu'],
  async execute(client, interaction) {
    if (!interaction.member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: "Bu komutu kullanmak için yetkin yok.",
        ephemeral: true,
      });
    }

    try {
      await interaction.deferReply();

      const response = await axios.get(`https://games.roblox.com/v1/games?universeIds=${universeId}`);

      if (!response || !response.data || !response.data.data || response.data.data.length === 0) {
        await interaction.editReply('Aktiflik bilgisi alınamadı, veriler boş görünüyor.');
        return;
      }

      const gameData = response.data.data[0];

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setDescription(`### **An itibariyle oyunda ${gameData.playing} kişi var.**`);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Error:', error);
      await interaction.editReply('Bir hata oluştu, lütfen tekrar deneyin.');
    }
  }
};