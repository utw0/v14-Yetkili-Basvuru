const {
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputStyle,
    TextInputBuilder
} = require('discord.js');
const client = new Client({ intents: ['Guilds', 'MessageContent', 'GuildMessages'] });
const config = require('./config.json');


client.on('ready', () => {
    console.log(`Giriş Yaptım ${client.user.tag}`);
    client.user.setStatus("idle");
    client.user.setActivity(`luhux was here!`)

})

client.on('messageCreate', (message) => {
    if (message.content === '.başvuru') {
        if (!config.yetkili.includes(message.author.id)) return;
        const embed = new EmbedBuilder()
        .setTitle(`${message.guild.name} Başvuru Sistemi`)
      
        .setThumbnail(message.guild.iconURL({ dynamic:true, size: 2048}))
        .setDescription(`Aşağıda ki butondan yetkili başvurusu yapabilirsiniz.
        \`\`\`Yetkili Başvurusu İçin Aşağıda Bulunan Butonu Kullanabilirsiniz\`\`\``)
        .setColor("2F3136")
        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel('Başvuru İçin Tıkla')
            .setCustomId('başvuru')
        )
        const channel = message.guild.channels.cache.get(config.embedkanal);
        if (!channel) return;
        channel.send({
            embeds: [embed],
            components: [row]
        })
    }
})

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'başvuru') {
            const modal = new ModalBuilder()
            .setTitle('Yetkili Başvuru')
            .setCustomId('yetkili')
    
            const nameComponent = new TextInputBuilder()
            .setCustomId('isim')
            .setLabel("İsim")
            .setMinLength(2)
            .setMaxLength(25)
            .setRequired(true)
            .setPlaceholder('Utku')
            .setStyle(TextInputStyle.Short)
    
            const ageComponent = new TextInputBuilder()
            .setCustomId('yaş')
            .setLabel("Yaş")
            .setMinLength(1)
            .setMaxLength(3)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('19')
            .setRequired(true)
    
            const whyYou = new TextInputBuilder()
            .setCustomId('neden')
            .setLabel("Neden burada yetkili olmalısınız?")
            .setMinLength(10)
            .setMaxLength(120)
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder(`Yetkili olmak istemenizin nedenini bize bildirin. ${interaction.guild.name}`)
            .setRequired(true)
    
            
            const rows = [nameComponent, ageComponent, whyYou].map(
                (component) => new ActionRowBuilder().addComponents(component)
            )
    
            modal.addComponents(...rows);
            interaction.showModal(modal);

        }


        if (interaction.customId === 'kabul') {
      
            const getIdFromFooter = interaction.message.embeds[0].footer.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.roles.add(config.yetkilirol).catch((err) => {
                console.error(err)
                return interaction.reply({
                    content: ":x: Kullanıcı için roller eklemeye çalışırken bir hata oluştu."
                })
            });
            interaction.reply({
                content: `✅ **${getMember.user.tag}** Kullanıcısı Onaylandı, Onaylayan ${interaction.user.tag}`
            })
            await getMember.send({
                content: `${getMember.user.tag}, Yetkili başvurusu için kabul edildiniz. 🎉 **Tebrikler** 🎉`
            }).catch(() => {
                return interaction.message.reply(':x: Kullanıcıya mesaj göndermeye çalıştığımda bir hata oluştu.')
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('skabul')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Kabul Et')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('sred')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Reddet')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
        if (interaction.customId === 'red') {
           
            const getIdFromFooter = interaction.message.embeds[0].footer?.text;
            const getMember = await interaction.guild.members.fetch(getIdFromFooter);
            await getMember.send({
                content: `${getMember.user.tag} Üzgünüz, Yetkili başvurusu için reddedildiniz.`
            }).catch(e => {})
            interaction.reply({
                content: `:x: ${getMember.user.tag} kullanıcısı ${interaction.user.tag} tarafından reddedildi.`
            })
            const newDisabledRow = new ActionRowBuilder()
            .setComponents(
                new ButtonBuilder()
                .setCustomId('skabul')
                .setDisabled()
                .setStyle(ButtonStyle.Success)
                .setLabel('Kabul Et')
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('sred')
                .setDisabled()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Reddet')
            )
            interaction.message.edit({ components: [newDisabledRow] })
        }
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'yetkili') {
            const staffName = interaction.fields.getTextInputValue('isim');
            const staffAge = interaction.fields.getTextInputValue('yaş');
            const staffWhyYou = interaction.fields.getTextInputValue('neden');
            if (isNaN(staffAge)) {
                return interaction.reply({
                    content: ":x: Yaşınız bir sayı olmalıdır, lütfen formu tekrar gönderin.",
                    ephemeral: true
                })
            }
            if (!isNaN(staffName)) {
                return interaction.reply({
                    content: ":x: Adınız bir sayı içermemelidir.",
                    ephemeral: true
                })
            }
            interaction.reply({
                content: '✅ Yetkili başvurunuz başarıyla gönderildi.',
                ephemeral: true
            })
            const staffSubmitChannel = interaction.guild.channels.cache.get(config.başvurukanalı);
            if (!staffSubmitChannel) return;
            const embed = new EmbedBuilder()
            .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
            .setColor('2F3136')
            .setTimestamp()
            .setFooter({ text: interaction.user.id })
            .setThumbnail(interaction.user.displayAvatarURL())
            .addFields(
                {
                    name: "İsim:",
                    value: staffName
                },
                {
                    name: "Yaş:",
                    value: staffAge
                },
                {
                    name: "Neden burada yetkili olmalısınız?:",
                    value: staffWhyYou
                }
            )
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('kabul')
                .setLabel('Kabul Et')
                .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                .setCustomId('red')
                .setLabel('Reddet')
                .setStyle(ButtonStyle.Danger)
            )
            staffSubmitChannel.send({
                embeds: [embed],
                components: [row]
            })
        }
    }
})

client.login(config.token);