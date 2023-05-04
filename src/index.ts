import { create, Whatsapp, Message } from '@wppconnect-team/wppconnect';
import { User } from './entities/User';
import { Database } from './entities/Db';

let user_logged: Record<string, User> = {};

create({
    session: 'joy-session',
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
    console.log('LOG -> Successfull loadded Joy Project v2.0.0 - DEV: @caduh.sz');

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
    client.onMessage(async(message: Message) => { 
        if (message.isGroupMsg === false) {
            if (!(message.from in user_logged)) {
                const db = new Database();
                const data = await db.getUserData(message.from);
                if (!data) { 
                    // registrar membros
                    return;
                }
                user_logged[message.from] = new User({
                    contact: data.contact,
                    name: data.name,
                    age: data.age,
                    birthday: data.birthday,
                    instagram: data.instagram,
                    email: data.email,
                    address: data.address,
                    role: data.role,
                    language: data.language
                });
            }
            console.log('interagir com o robô.')
            return;
        }    
        // Monitoramento dos grupos
        console.log('Mensagem de grupo recebida.')

    });
}