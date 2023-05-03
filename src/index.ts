import { create, Whatsapp, Message } from '@wppconnect-team/wppconnect';
import sql from 'mysql2/promise';
import moment from 'moment';

create({
    session: 'merchan-session',
    catchQR: (base64Qrimg, asciiQR, attempts, usrlCode) => {
      console.log(asciiQR);
    },
    devtools: false, 
    useChrome: true,
    debug: false,
    logQR: false,
    browserWS: '',
    browserArgs: [''],
    puppeteerOptions: { headless: "new" },
    disableWelcome: true,
    updatesLog: false,
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
    ('LOG -> Successfull loadded Merchan Controller. - DEV: @caduh.sz');

    // quando mudar o status do client, faça isso ->
    client.onStateChange((state: any) => {
        if (state === 'CONFLICT') { client.useHere() };
        if (state === 'UNPAIRED') { console.error('O Whatsapp foi desconectado da sessão.') };
    });
    // Rejeitar chamadas.
    client.onIncomingCall((call: any) => {
        client.rejectCall();
    });
    client.onReactionMessage( (react: any) => {
        // Evento de reações: Usar para sistema de aprovação.
    });
    client.onMessage((message: Message) => { 
        // Ao Receber uma mensagem pessoal
        if (message.isGroupMsg === false) {
            console.log('Acessar ferramentas pessoais.')
            return;
        }    
        // Monitoramento dos grupos
        console.log('Mensagem de grupo recebida.')

    });
}