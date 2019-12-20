require('dotenv').config();
const functions = require('firebase-functions');
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');
const bot = new Telegraf(process.env.BOT_BROTHER_TOKEN);
const keyboard = Markup.inlineKeyboard([
    Markup.urlButton('❤️', 'http://nrobert.org'),
    Markup.callbackButton('Delete', 'delete')
]);

exports.botBrother = functions.https.onRequest((request, response) => {
    let triggers = {}, answers = {};

    bot.on('new_chat_members', ctx => {
        let msg;

        async function checkChatMembership(chatId, userId) {
            await ctx.telegram.getChatMember(chatId, userId).then(result => {
                msg = 'Привет, ' + '@' + result.user.username + '!';

                if (result.user.is_bot) {
                    msg += ' Очередной бот :(.';
                } else {
                    switch (result.status) {
                        case 'kicked':
                            msg += ' Почему тебя выкинули из соседнего чата?';
                            break;
                        case 'left':
                            msg += ' Как ты сюда попал? Ты же не из соседнего чата.';
                            break;
                        default:
                            msg += ' Скажи что-нибудь! Произведи впечатление, что ты не бот!';
                    }
                }

                return result;
            }).catch(error => {});

            if (msg) {
                ctx.telegram.sendMessage(ctx.chat.id, msg).catch(error => error);
            }
        }

        checkChatMembership('@joomlaru', ctx.message.new_chat_member.id);
    });

    triggers.drinks =
        /алкоголь|пив(о|а|ом|ко|ка|кой)|вин(о|а|ом|цо|ца|цом)|вод(ка|ки|ке|кой|очка|очки|очке|очкой)|виск(и|арь|аря|арем)|коня(к|ка|ку|ком|чок|чка|чку|чком)|текил(а|ы|у|ой)|коктейл|вермут|мартини|джин|тоник/i;
    triggers.callup = /@bot_brother_bot|botbrother/i;
    triggers.joomla = /joomla|J!|жумла|жумлы|жумле|жумлу|жумлой/i;

    answers.drinks =
        ['Хм, опять про бухло?', 'Бухаем :)?', 'Чат алкоголиков :).', 'Эх, пьяницы...',
            'О, люблю, когда обсуждают выпивки.'];
    answers.callup =
        ['Ау! Хочешь потрындеть?', 'Я все слышу.', 'Зачем позвали?', 'Я! Что случилось?',
            'Захотелось пообщаться с ботом?', 'Я тут, но пить не буду!'];
    answers.joomla = ['Эмм...В курилке не обсуждаются темы, связанные с той, чьего имени нельзя называть :).',
        'Го с такими темами в соседний чат!'];

    Object.getOwnPropertyNames(triggers).forEach(key => {
        let i, j, answer, msgCount = 0, firstTime = true, start = Math.floor(Date.now() / 1000), now;

        bot.hears(triggers[key], ctx => {
            while (i === null || i === j) {
                i = Math.floor(Math.random() * Math.floor(answers[key].length));
            }

            if (answers[key].length > 1) {
                j = i;
            }

            msgCount++;
            now = Math.floor(Date.now() / 1000);

            if (key !== 'drinks' || msgCount > 2 || (firstTime && msgCount === 0) || (now - start > 120)) {
                answer =
                    (key === 'joomla') ?
                        ('@' + ctx.message.from.username + ' ') : '';
                answer += answers[key][i];
                ctx.reply(answer);

                if (key === 'drinks') {
                    msgCount = 0;
                    start = now;
                    firstTime = false;
                }
            }
        });
    });

    bot.action('delete', ({deleteMessage}) => deleteMessage());
    bot.launch();
    // bot.startPolling(60, 200);
});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
