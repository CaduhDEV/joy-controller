import { create, Whatsapp, Message, SocketState } from '@wppconnect-team/wppconnect';
import { interact_interface, reset_chats } from './entities/Interfaces'
import { sendDailyDevotional } from './entities/Devotionals';
import { dataBirthdays } from './entities/Birthdays';
import { interact_console } from './entities/Commands';

create({
    session: 'joy-session',
    catchQR: (base64Qrimg, asciiQR, attempts, usrlCode) => {
      console.log(asciiQR);
    },
    devtools: false, 
    useChrome: true,
    debug: true,
    logQR: false,
    browserWS: '',
    browserArgs: [''],
    puppeteerOptions: { headless: "new" },
    disableWelcome: true,
    updatesLog: true,
    autoClose: 60000,
    tokenStore: 'file',
    folderNameToken: './tokens',
    sessionToken: {
      WABrowserId: '"UnXjH....."',
      WASecretBundle: '{"key":"+i/nRgWJ....","encKey":"kGdMR5t....","macKey":"+i/nRgW...."}',
      WAToken1: '"0i8...."',
      WAToken2: '"1@lPpzwC...."',
    }
}).then((client: Whatsapp) => main(client)).catch((error) => console.log(error));

function main(client: Whatsapp) {
    sendDailyDevotional(client, reset_chats);  
    dataBirthdays(client);                                                                                        
    // quando mudar o status do client, faça isso ->
    client.onStateChange((state: SocketState) => {
        if (state === 'CONFLICT') { client.useHere() };
        if (state === 'UNPAIRED') { console.error('O Whatsapp foi desconectado da sessão.') };
        if (state === 'CONNECTED') { 
            console.log('                                                     ');
            console.log('     ██╗ ██████╗ ██╗   ██╗    ██████╗     ██████╗');
            console.log('     ██║██╔═══██╗╚██╗ ██╔╝    ╚════██╗   ██╔═████╗');
            console.log('     ██║██║   ██║ ╚████╔╝      █████╔╝   ██║██╔██║');
            console.log('██   ██║██║   ██║  ╚██╔╝      ██╔═══╝    ████╔╝██║');
            console.log('╚█████╔╝╚██████╔╝   ██║       ███████╗██╗╚██████╔╝');
            console.log(' ╚════╝  ╚═════╝    ╚═╝       ╚══════╝╚═╝ ╚═════╝');
            console.log('                                                     ');
            console.log('LOG -> Successfull loadded Joy Project v2.0.0 - DEV: @culto.mix');
        }
    });
    // Rejeitar chamadas.
    client.onIncomingCall((call: any) => {
        client.rejectCall();
    });
    client.onReactionMessage((react: any) => {
        // Evento de reações: Usar para sistema de aprovação.
    });
    client.onMessage(async(message: Message) => { 
        if (message.isGroupMsg === false) {
            console.log('554391847843@c.us', message.from)
            if (message.from !== '554391847843@c.us') { return; } // dev mode
            if (message.isMedia === true) { return; }
            return interact_interface(client, message);
        }
        
        if (message.from === "120363069819222921@g.us") { // se for 1 mensagem do console.
            return interact_console(client, message);
        }
    });
}