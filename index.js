const { Client, GatewayIntentBits, REST, SlashCommandBuilder } = require('discord.js');
const { TOKEN, CLIENT_ID, GUILD_ID, SECOND_GUILD_ID } = require('./config.json');
const aktiflikSorgu = require('./aktiflik-sorgu');
const tamYasakla = require('./tam-yasakla');
const tamYasaklaKaldir = require('./tam-yasakla-kaldır');
const rutbeSorgu = require('./rütbe-sorgu');
const rutbeDegistir = require('./rütbe-ver');
const duyuru = require('./duyuru');
const rolver = require('./rolver');
const terfi = require('./terfi');
const tenzil = require('./tenzil');
const { Routes } = require('discord-api-types/v9');
const gamepassSorgu = require('./gamepass-sorgu');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
});

const rest = new REST({ version: '9' }).setToken(TOKEN);

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Bot gecikmesini al').toJSON(),
  new SlashCommandBuilder().setName('aktiflik-sorgu').setDescription("İEGM'nin şuanki aktifliğini öğren").toJSON(),
  new SlashCommandBuilder()
    .setName('rütbe-ver')
    .setDescription("Bir kişiye İEGM'de belirlediğin bir rütbeyi ver")
    .addStringOption(option => option.setName('kişi').setDescription('Rütbesi değiştirilecek kişi, Roblox adını yaz').setRequired(true))
    .addStringOption(option => option.setName('rütbe').setDescription('Kişiye verilecek rütbe').setRequired(true)
    .addChoices(
      { name: "Polis Memuru", value: "Polis Memuru" },
      { name: "Başpolis", value: "Başpolis" },
      { name: "Kıdemli Başpolis", value: "Kıdemli Başpolis" },
      { name: "Komiser Yardımcısı", value: "Komiser Yardımcısı" },
      { name: "Komiser", value: "Komiser" },
      { name: "Başkomiser", value: "Başkomiser" },
      { name: "Emniyet Amiri", value: "Emniyet Amiri" },
      { name: "Kıdemli Emniyet Amiri", value: "Kıdemli Emniyet Amiri" },
      { name: "Emniyet Müdürü", value: "Emniyet Müdürü" },
      { name: "4. Sınıf Emniyet Müdürü", value: "4. Sınıf Emniyet Müdürü" },
      { name: "3. Sınıf Emniyet Müdürü", value: "3. Sınıf Emniyet Müdürü" },
      { name: "2. Sınıf Emniyet Müdürü", value: "2. Sınıf Emniyet Müdürü" },
      { name: "1. Sınıf Emniyet Müdürü", value: "1. Sınıf Emniyet Müdürü" },
      { name: "Sınıf Üstü Emniyet Müdürü", value: "Sınıf Üstü Emniyet Müdürü" },
      { name: "İlçe Emniyet Müdürü", value: "İlçe Emniyet Müdürü" },
      { name: "İl Emniyet Müdürü", value: "İl Emniyet Müdürü" },
      { name: "Yönetim Kurulu", value: "Yönetim Kurulu" },
      { name: "Yönetim Kurulu Başkanı", value: "Yönetim Kurulu Başkanı" },
      { name: "Teftiş Kurulu", value: "Teftiş Kurulu" },
      { name: "Teftiş Kurulu Başkanı", value: "Teftiş Kurulu Başkanı" },
      { name: "Disiplin Kurulu", value: "Disiplin Kurulu" },
      { name: "Disiplin Kurulu Başkanı", value: "Disiplin Kurulu Başkanı" },
      { name: "Grup Yönetimi", value: "Grup Yönetimi" },
      { name: "Emniyet Genel Müdürü", value: "Emniyet Genel Müdürü" },
      { name: "Dışişleri Bakanı", value: "Dışişleri Bakanı" }
    )
  )
    .addStringOption(option => option.setName('sebep').setDescription('Rütbelendirme sebebi, zorunlu. 3-300 karakter arası olmalıdır').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('rütbe-sorgu')
    .setDescription('Birinin İEGM rütbesini gör')
    .addStringOption(option => option.setName('kişi').setDescription('Rütbesi sorgulanacak kişi, Roblox adını yaz').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('rütbe-terfi')
    .setDescription('Bir kişiye terfi ver')
    .addStringOption(option => option.setName('kişi').setDescription('Terfi verilecek kişi, Roblox adını yaz').setRequired(true))
    .addStringOption(option => option.setName('sebep').setDescription('Rütbelendirme sebebi, zorunlu. 3-300 karakter arası olmalıdır').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('rütbe-rd')
    .setDescription('Bir kişiye rd ver (rütbesini düşür)')
    .addStringOption(option => option.setName('kişi').setDescription('Rütbesi düşürülecek kişi, Roblox adını yaz').setRequired(true))
    .addStringOption(option => option.setName('sebep').setDescription('Rütbelendirme sebebi, zorunlu. 3-300 karakter arası olmalıdır').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('tam-yasakla')
    .setDescription('Bir kişinin tüm ilişkili sunuculardan yasakla')
    .addUserOption(option => option.setName('kişi').setDescription('Yasaklanacak kişi, taglayın ya da IDsini girin').setRequired(true))
    .addStringOption(option => option.setName('sebep').setDescription('Yasaklama sebebi, zorunlu. 3-300 karakter arası olmalıdır').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('tam-yasakla-kaldır')
    .setDescription('Bir kişinin yasağını tüm ilişkili sunuculardan kaldır')
    .addStringOption(option => option.setName('kişi').setDescription('Yasağı kaldırılacak kişi, taglayın ya da IDsini girin').setRequired(true))
    .addStringOption(option => option.setName('sebep').setDescription('Yasak kaldırma sebebi, zorunlu. 3-300 karakter arası olmalıdır').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('duyuru')
    .setDescription('İEGM Sunucusunda duyuru yapar')
    .addStringOption(option => option.setName('mesaj').setDescription('Duyurulacak mesajı yazın.').setRequired(true))
    .addStringOption(option => option.setName('everyone').setDescription('Everyone etiketini kullanmak istiyor musunuz?').setRequired(true)
      .addChoices(
        { name: 'Evet', value: 'evet' },
        { name: 'Hayır', value: 'hayir' }
      )
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName('rolver')
    .setDescription('İEGM Sunucusunda rol verir')
    .addStringOption(option => option.setName('kişi').setDescription("Rol verilecek kullanıcının ID'si.").setRequired(true))
    .addStringOption(option => option.setName('rol').setDescription('Verilecek rolün adı').setRequired(true))
    .toJSON(),
  new SlashCommandBuilder()
    .setName('gamepass-sorgu')
    .setDescription('Bir kişinin verilen gamepasse sahip olup olmadığını sorgula')
    .addStringOption(option => option.setName('kişi').setDescription('Sorgulanacak kişi, Roblox adını yazın').setRequired(true))
    .addStringOption(option => option.setName('gamepass').setDescription('Sorgulanacak gamepassin ismi (Örnek: Subay, OR-4, KKK)').setRequired(true)
      .addChoices(
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
      )
    )
    .toJSON()
];

(async () => {
  console.log('Bot başlatılıyor...');

  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, SECOND_GUILD_ID), { body: commands });
    
    console.log('Slash komutları başarıyla yüklendi.');
  } catch (error) {
    console.error('Slash komutları yüklenirken bir hata oluştu:', error);
  }

  await client.login(TOKEN);
})();

client.on('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı.`);
  client.user.setPresence({
    status: 'online',
    activities: [{ name: 'İEGM', type: 'WATCHING' }], 
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'rütbe-ver') {
    const allowedChannelId = '1241317436717006848';
    if (interaction.channel.id !== allowedChannelId) {
      return interaction.reply({ content: 'Bu komut sadece \<#1241317436717006848> kanalında kullanılabilir.', ephemeral: true });
    }
  }

  try {
    switch (interaction.commandName) {
      case 'ping':
        await interaction.reply(`🏓 | Gecikme **${client.ws.ping}ms**`);
        break;
      case 'aktiflik-sorgu':
        await aktiflikSorgu.execute(client, interaction);
        break;
      case 'rütbe-sorgu':
        await rutbeSorgu.execute(interaction);
        break;
      case 'rütbe-ver':
        await rutbeDegistir.execute(interaction);
        break;
      case 'rütbe-terfi':
        await terfi.execute(interaction);
        break;
      case 'rütbe-rd':
        await tenzil.execute(interaction);
        break;
      case 'tam-yasakla':
        await tamYasakla.execute(client, interaction);
        break;
      case 'tam-yasakla-kaldır':
        await tamYasaklaKaldir.execute(client, interaction);
        break;
      case 'duyuru':
        await duyuru.execute(interaction);
        break;
      case 'rolver':
        await rolver.execute(interaction);
        break;
      case 'gamepass-sorgu':
        await gamepassSorgu.execute(interaction);
        break;
      default:
        await interaction.reply('Bu komut tanımlı değil!');
    }
  } catch (error) {
    console.error(`Komut çalıştırılırken hata oluştu (${interaction.commandName}):`, error);
    await interaction.reply({ content: 'Komut çalıştırılırken bir hata oluştu.', ephemeral: true });
  }
});