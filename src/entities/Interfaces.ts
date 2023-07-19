import { Whatsapp, Message, create, AckType } from '@wppconnect-team/wppconnect';
import interface_on from '../configs/interfaces.json';
import errors_on from '../configs/errors.json';
import { User } from './User';
import { Database } from './Db';
import { calculateAge, calculateDistance, capitalizeFirstLetter, collectAddressByCode, formatAddress, formatTimestamp, getRoleName, isValidDate, sendEmail } from './Snippets';
import moment from 'moment-timezone';
import 'moment/locale/pt-br';
moment.tz.setDefault('America/Sao_Paulo');
moment.locale('pt-br');

export let user_logged: Record<string, User> = {};
let current_stage: { [key: string]: string } = {}; // estágio atual.
let current_interface: { [key: string]: string } = {}; // Interface que deve imprimir.
let temp_data: { [key: string]: register_temp } = {}; // variavel para criação de registro do usuário.
let tasks = [ '', 'Nenhum.', '19:00 às 07:00', 'Provérbios', 'Nenhuma.' ]; // tasks semanais para execução do grupo mix.

export async function reset_chats() {
  console.log('DEBUG: resetando memória cache.');
  user_logged = {};
  current_stage = {};
  current_interface = {};
  temp_data = {};
}


interface register_temp {
  name?: string;
  full_name?: string;
  contact?: string;
  birthday?: string | false;
  age?: string;
  instagram?: string;
  email?: string;
  gender?: string;
  address?: { [key: string]: string } | string;
  role?: number;
  cep?: string;
  complement?: string;
  language?: string;
  confirm?: boolean;
}

interface TextMessage {
  type: 'text';
  text: string;
}

interface ImageMessage {
  type: 'image';
  url: string;
  text?: string;
  oneview?: boolean;
}

interface GifMessage {
  type: 'gif';
  url: string;
  text?: string;
}

interface ContactMessage {
  type: 'contact';
  name: string;
  phone: string;
}

interface ContactsMessage {
  type: 'contacts';
  contacts: Array<Array<{ id: string; name: string }>>;
}

interface LocationMessage {
  type: 'location';
  latitude: string;
  longitude: string;
  title?: string;
}

interface ReactionMessages {
  type: 'reaction';
  emoji: ''; 
}

interface PollMessages {
  type: 'poll';
  name: string;
  options: string[];
  selectable?: number;
}


type MessageConfig = TextMessage | ImageMessage | GifMessage | ContactMessage | ContactsMessage | LocationMessage | ReactionMessages | PollMessages;


interface InterfaceConfig {
  msg: MessageConfig[];
  interacts: Array<{ emoji: string; title: string; action: string;  value?: string | 'ptbr' }>;
}

interface LanguageConfig {
  [interfaceName: string]: InterfaceConfig;
}

interface InterfacesConfig {
  [language: string]: LanguageConfig;
}

interface errors_config {
  [interfaceName: string]: string;
}

interface LangConfig {
  [language: string]: errors_config;
}


let interfaces = interface_on as InterfacesConfig;
let errors_lang = errors_on as LangConfig;


interface EmailConfig<T> {
  woman: T;
  man: T;
}

export async function replaceKeywordsWithVariables(translate: string, variables: string[]) {
  let newStr = translate;
  let index = 0;
  while (newStr.includes('%%')) {
    newStr = newStr.replace('%%', variables[index]);
    index++;
    if (index === variables.length) {
      break;
    }
  }
  return newStr;
}

export async function access_interface(client: Whatsapp, message: Message, c_interface: keyof typeof interfaces, lang: keyof typeof interface_on, variables?: string[]) {
  if (!(c_interface in interfaces[lang])) {
    return;
  }
  current_interface[message.from] = `${c_interface}`
  let { msg, interacts } = interfaces[lang][c_interface];

  for (let i = 0; i < msg.length; i++) {
    let m = msg[i];
    let full_message;
    let isFirstMsg = i === 0;
    
    if ('text' in m && m.text && variables) {
      let updateText = await replaceKeywordsWithVariables(m.text, variables);
      full_message = updateText
    }

    if (m.type === 'text' && m.text.trim() !== '') {
      if (!full_message) { full_message = `${m.text}`; }

      if (isFirstMsg && interacts && interacts.length >= 1) {
        const interactOptions = interacts.map((option, index) => `${index + 1}. ${option.emoji} ${option.title}`).join('\n');
        full_message += `\n\n${interactOptions}\n`;
      }
      await client.sendText(message.from, full_message);
    } else if (m.type === 'image' && m.url) {
      await client.sendImage(message.from, m.url, 'joy_controller', m.text, undefined, m.oneview );
    } else if (m.type === 'gif' && m.url) {
      await client.sendGif(message.from, m.url, 'joy_controller', m.text)
    } else if (m.type === 'contact' && m.phone) {
      await client.sendContactVcard(message.from, m.phone, m.name);
    } else if (m.type === 'contacts' && Array.isArray(m.contacts)) {
      let contacts = m.contacts.flat();
      await client.sendContactVcardList(message.from, contacts);
    } else if (m.type === 'location' && m.latitude && m.longitude) {
      await client.sendLocation(message.from, m.latitude, m.longitude, m.title || '');
    } else if (m.type === 'reaction' && m.emoji) {
      await client.sendReactionToMessage(message.id, m.emoji);
    } else if (m.type === "poll") {
      await client.sendPollMessage(message.from, m.name, m.options, { selectableCount: m.selectable })
    }
  }  
}

export async function interact_interface(client: Whatsapp, message: CustomMessage) {
  switch (current_stage[message.from]) {
    default:
      if (!(message.from in user_logged)) {
        let db = new Database();
        let data = await db.getUserData(message.from);
        if (!data) { 
            await access_interface(client, message, 'select_language', 'ptbr'); // perguntar linguagem 
            return current_stage[message.from] = 'interact';
        }

        getUser(message.from);
        current_stage[message.from] = 'interact';
        return await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, [data.name, tasks[1], tasks[2], tasks[3], tasks[4]]);
      } else {
        current_stage[message.from] = 'interact';
        return await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, [user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4]]);
      }
    break;
    case 'register':
      let step = Object.keys(temp_data[message.from] || {}).length;
      switch(step) {
        case 1:
          const select_gender = interfaces[temp_data[message.from].language as keyof typeof interface_on][current_interface[message.from]].interacts;
          if (message.body.normalize().toLowerCase() === select_gender[0].title.normalize().toLowerCase() || message.body === select_gender[0].emoji || message.body === '1') {
            temp_data[message.from].gender = 'man';
            return await access_interface(client, message, 'register_name', temp_data[message.from].language as keyof typeof interface_on, [ message.body.toLocaleLowerCase() ])
          } else if(message.body.normalize().toLowerCase() === select_gender[1].title.normalize().toLowerCase() || message.body === select_gender[1].emoji || message.body === '2') {
            temp_data[message.from].gender = 'woman';
            return await access_interface(client, message, 'register_name', temp_data[message.from].language as keyof typeof interface_on, [ message.body.toLocaleLowerCase() ])
          }

          error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_gender');
        break;
        case 2:
          const rule = new RegExp(/\b[A-Za-zÀ-ú][A-Za-zÀ-ú]+,?\s[A-Za-zÀ-ú][A-Za-zÀ-ú]{2,19}\b/, "gi")
          if (rule.test(message.body) === false || message.body.trim().split(' ').length > 5) {
            return error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_name')
          }
          delete user_logged[message.from];
          const full_n = message.body.toLocaleLowerCase();
          const split_name = full_n.split(' ');
          temp_data[message.from].full_name = capitalizeFirstLetter(full_n);
          temp_data[message.from].name = capitalizeFirstLetter(split_name[0]);

          access_interface(client, message, "register_birthday", temp_data[message.from].language as keyof typeof interface_on, [ temp_data[message.from].name as keyof typeof temp_data.name ]);
        break;
        case 4:
          let date = isValidDate(message.body);
          if (date === false || calculateAge(message.body) < 10) { return error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_birthday') }
          temp_data[message.from].birthday = date;
          temp_data[message.from].age = calculateAge(message.body).toString();
          access_interface(client, message, 'register_email', temp_data[message.from].language as keyof typeof interface_on, [ temp_data[message.from].name as keyof typeof temp_data.name, `${temp_data[message.from].age}` ])
        break;
        case 6:
          const checkMail = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/, "gi");
          if (checkMail.test(message.body) == false) { return error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_email') }
          temp_data[message.from].email = message.body.toLowerCase();
          access_interface(client, message, 'register_instagram', temp_data[message.from].language as keyof typeof interface_on)
        break;
        case 7:
          let interacts = interfaces[temp_data[message.from].language as keyof typeof interface_on][current_interface[message.from]].interacts;
          if (message.body.normalize().toLowerCase() === interacts[0].title.normalize().toLowerCase() || message.body === interacts[0].emoji || message.body === '1') {
            temp_data[message.from].instagram = 'N/A';
          } else {
            const instagramRegex = /^[a-zA-Z0-9_.]+$/;
            if (!instagramRegex.test(message.body)) {

              return error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_instagram');
            }
            temp_data[message.from].instagram = message.body.toLowerCase();
          } 
          access_interface(client, message, 'register_address', temp_data[message.from].language as keyof typeof interface_on)
        break;
        case 8:
          const cepWithoutHyphen = message.body.replace('-', '');
          const address = await collectAddressByCode(cepWithoutHyphen);
          if (address.erro === true || address === false) { return error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_address')}
          temp_data[message.from].address = address
          access_interface(client, message, 'register_number', temp_data[message.from].language as keyof typeof interface_on);
        break;
        case 9:
          if (!message.body.match(/\d/)) { error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_number') }
          const address_format = formatAddress(temp_data[message.from].address || 'Zona Rural', message.body);
          temp_data[message.from].address = address_format
          access_interface(client, message, 'register_complement', temp_data[message.from].language as keyof typeof interface_on);
          temp_data[message.from].confirm = true;
        break;
        case 10:
          if (message.body.length > 15) { return error(client, message, temp_data[message.from].language as keyof typeof interface_on, 'invalid_complement'); }
          temp_data[message.from].complement = message.body.toLowerCase();
          access_interface(client, message, 'profile', temp_data[message.from].language as keyof typeof interface_on, [
            temp_data[message.from].full_name || '',
            temp_data[message.from].birthday || '',
            temp_data[message.from].age || '',
            temp_data[message.from].email || '',
            temp_data[message.from].address?.toString() || '',
            temp_data[message.from].instagram || ''
          ]);
        case 11:
          let interact = interfaces[temp_data[message.from].language as keyof typeof interface_on][current_interface[message.from]].interacts;
          if (message.body.normalize().toLowerCase() === interact[0].title.normalize().toLowerCase() || message.body === interact[0].emoji || message.body === '1') {          
            const db = new Database();
            await db.createUser(message.from, temp_data[message.from]);
            access_interface(client, message, 'finish_register', temp_data[message.from].language as keyof typeof interface_on);
            const gender: keyof EmailConfig<string> = temp_data[message.from].gender as keyof EmailConfig<string> || 'man';
            sendEmail(temp_data[message.from].email || '', temp_data[message.from].name || '', temp_data[message.from].language as keyof typeof interface_on, 'welcome', gender, 'Bem-vindo(a) ao Culto MIX!');
            delete current_stage[message.from];
            delete current_interface[message.from];
            delete temp_data[message.from];
          } else if (message.body.normalize().toLowerCase() === interact[1].title.normalize().toLowerCase() || message.body === interact[1].emoji || message.body === '2') {
            access_interface(client, message, 'cancel_register',  temp_data[message.from].language as keyof typeof interface_on);
            delete current_stage[message.from];
            delete current_interface[message.from];
            delete temp_data[message.from];
          }
        break;
      }
    break;
    case 'interact':
      let lang = user_logged[message.from]?.language || temp_data[message.from]?.language || 'ptbr';
      let interacts = interfaces[lang][current_interface[message.from]].interacts;
      for (let interact of interacts) {
        if (message.body.normalize().toLowerCase() === interact.title.normalize().toLowerCase() || message.body === interact.emoji || message.body === String(interacts.indexOf(interact) + 1)) { 
          let actionFunction = actionFunctions[interact.action];
          if (actionFunction) {
            await actionFunction(client, message, interact);
          } else {
            console.error(`ERROR: Action "${interact.action}" not implemented`);
          }
          break;
        }
      }
    break;
    case 'collect':
      await access_interface(client, message, `${current_interface[message.from]}_confirm`, user_logged[message.from].language as keyof typeof interface_on, [ message.body ]);
      current_stage[message.from] = 'interact';
      temp_data[message.from] = {}
      temp_data[message.from].contact = message.body
    break;
    case 'collect_checkin':
      const coords = checkinHandler(message);
      if (message.type !== 'location' || coords === false || coords[2] === false) { return error(client, message, user_logged[message.from].language as keyof typeof interface_on, 'invalid_location');}

      const distance = await calculateDistance(-23.276407679481114, -51.166471360350506, message.lat || 0, message.lng || 0);
      if (distance > 0.1) { return error(client, message, user_logged[message.from].language as keyof typeof interface_on, 'invalid_coords') }
      
      const db = new Database();
      const currentDate = moment().format('YYYY-MM-DDTHH:mm:ss');
      await db.CheckIn(message.from, currentDate);
      
      current_stage[message.from] = 'interact';
      client.sendReactionToMessage(message.id, '❤️‍🔥');
      await client.sendText(message.from, 'Check-in realizado!! ❤️‍🔥❤️‍🔥❤️‍🔥').then( async() => {
        client.sendText('120363069819222921@g.us', `🎟️ *MIX Check-in*\n\n*${user_logged[message.from].name}* acaba de realizar check-in no Culto MIX!\n\n*Data e Hora:*\n${currentDate}`)
        access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
        [ user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4]  ]);
      });
    break;
  }
}

interface CustomMessage extends Message {
  lat?: number;
  lng?: number;
  isLive?: boolean;
}

export function checkinHandler(message: CustomMessage) {
  if (!message.lat || !message.lng) { return false; }

  return [ message.lat, message.lng, message.isLive ]
}

// Define uma interface para as funções de ação
interface ActionFunction {
  (client: Whatsapp, message: Message, interact: { emoji: string; title: string; action: string; value?: string | 'ptbr' }): Promise<void>;
}

// Define as funções para cada ação
const actionFunctions: Record<string, ActionFunction> = {
  selected_lang: async (client, message, interact) => {
    temp_data[message.from] = {}
    temp_data[message.from].language = interact.value as keyof typeof interface_on;
    access_interface(client, message, 'try_register', temp_data[message.from].language  as keyof typeof interface_on);
  },
  register: async(client, message, interact) => {
    // not_instagram e finish
    if (interact.value === 'back' ) {
      current_stage[message.from] = 'interact';
      await access_interface(client, message, 'select_language', temp_data[message.from].language as keyof typeof interface_on);
    } else if (interact.value === 'start') {
      current_stage[message.from] = 'register';
      await access_interface(client, message, 'register_gender', temp_data[message.from].language as keyof typeof interface_on);
    }
  },
  main_menu: async (client, message, interact) => {   
    await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
    [ user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4]]);
  },
  mix_street: async (client, message, interact) => {   
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  leaders: async (client, message, interact) => {   
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  about_us: async (client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  library:  async (client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  missionaries:  async (client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  mission_elisa:  async (client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  playlists: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  ministeries: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  ministeries_agape: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  ministeries_mixstreet: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  ministeries_events: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  ministeries_mixpraise: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  ministeries_comunhao: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  pray_request: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
    current_stage[message.from] = "collect";
  },
  check_pray: async(client, message, interact) => {
    if (interact.value === 'finish') {
      client.sendText('120363087133589835@g.us', `🙏 *Pedido de Oração*\n\nNovo pedido de oração de *${user_logged[message.from].name}*, ele(a) tem *${user_logged[message.from].age}* anos.\n\n*Descrição:*\n\n${temp_data[message.from].contact}\n`)
      client.sendReactionToMessage(message.id, '🙏');
      await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
      [ user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4] ]);
    } else if(interact.value === 'main_menu') {
      await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
      [ user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4] ]);
    }
    delete temp_data[message.from];
  },
  feedback_request: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on, [ user_logged[message.from].name ]);
    current_stage[message.from] = "collect";
  },
  check_feedback: async(client, message, interact) => {
    if (interact.value === 'finish') {
      client.sendText('120363115685082193@g.us', `🤖 *Feedback*\n\nNovo feedback recebido de *${user_logged[message.from].name}*, ele(a) tem *${user_logged[message.from].age}* anos.\n\n*Descrição:*\n\n${temp_data[message.from].contact}\n`)
      client.sendReactionToMessage(message.id, '🤖');
      await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
      [ user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4] ]);
    } else if(interact.value === 'main_menu') {
      await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
      [ user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4] ]);
    }
    delete temp_data[message.from];
  },
  user_profile: async(client, message, interact) => {
    let user = user_logged[message.from]
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on, [
      user.full_name,
      moment(user.birthday || '00/00/0000', 'YYYY-MM-DD').format('DD/MM/YYYY'),
      user.age.toString(),
      user.address, 
      user.instagram,
      user.email,
      getRoleName(user.role),
      formatTimestamp(user.createdin)
    ]);
  },
  warning: async (client, message, interact) => {   
    switch (interact.value) {
      case 'agape':
        client.sendReactionToMessage(message.id, '❤️‍🔥');
        await client.sendText('120363069819222921@g.us', `❤️‍🔥 *Ministério Ágape*\n\n*${user_logged[message.from].name}* tem interesse em entrar no Ministério Ágape!\n\nLíderes favor entrar em contato para saber mais.\n`);
      break;
      case 'm_events':
        client.sendReactionToMessage(message.id, '🎉');
        await client.sendText('120363069819222921@g.us', `🎉 *Ministério de Eventos*\n\n*${user_logged[message.from].name}* tem interesse em participar do Ministério de Eventos\n\nLíderes favor entrar em contato para saber mais.\n`);
      break;
      case 'mix_street': 
        client.sendReactionToMessage(message.id, '🚸');
        await client.sendText('120363069819222921@g.us', `🚸 *MIX Street*\n\n*${user_logged[message.from].name}* tem interesse em participar do MIX Street\n\nLíderes favor entrar em contato para saber mais.\n`);
      break;
      case 'mix_praise':
        client.sendReactionToMessage(message.id, '🎸');
        await client.sendText('120363069819222921@g.us', `🎸 *MIX Praise*\n\n*${user_logged[message.from].name}* tem interesse em participar do MIX Praise\n\nLíderes favor entrar em contato para saber mais.\n`);
      break;
      case 'mix_comunhao':
        client.sendReactionToMessage(message.id, '🍞');
        await client.sendText('120363069819222921@g.us', `🍞 *Ministério de Comunhão*\n\n*${user_logged[message.from].name}* tem interesse em participar do Ministério de Comunhão\n\nLíderes favor entrar em contato para saber mais.\n`);
      break;
    }

    await client.sendContactVcard('120363069819222921@g.us', message.from, user_logged[message.from].name).then( async() => {
      await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, 
    [user_logged[message.from].name, tasks[1], tasks[2], tasks[3], tasks[4]]);
    });
  },
  checkin: async (client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on, [ user_logged[message.from].name ]);
  },
  register_checkin: async (client, message, interact) => {
    const now = moment();
    const start = moment().set({ hour: 19, minute: 0, second: 0 });
    const end = moment().set({ hour: 19, minute: 30, second: 0 });

    if (now.day() !== 6 || now.isBetween(start, end) === false) {
      return error(client, message, user_logged[message.from].language as keyof typeof interface_on, 'invalid_day');
    }

    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
    current_stage[message.from] = 'collect_checkin';
  },
  language_change: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on);
  },
  change_lang: async (client, message, interact) => {
    user_logged[message.from].language = interact.value as keyof typeof interface_on;
    const db = new Database();
    db.changeLanguage(message.from, interact.value || 'ptbr');
    access_interface(client, message, 'main_menu', user_logged[message.from].language  as keyof typeof interface_on);
  },
  calendary_events: async(client, message, interact) => {
    await access_interface(client, message, interact.action, user_logged[message.from].language as keyof typeof interface_on, [ user_logged[message.from].name ]);
  },
};

export async function error(client: Whatsapp, message: Message,language: keyof typeof errors_on, error_name: keyof typeof errors_lang) {
  if (!(error_name in errors_lang[language])) {
    return console.log('Error not found, please contact support.');
  }

  await client.sendText(message.from, errors_lang[language][error_name]);
}

export async function getUser(from: string) {
  if (!(from in user_logged)) {
    let db = new Database();
    let data = await db.getUserData(from);
    if (!data) { return false; }
    user_logged[from] = new User({
        id: data.id,
        contact: data.contact,
        name: data.name,
        full_name: data.full_name,
        age: data.age,
        birthday: isValidDate(data.birthday),
        instagram: data.instagram,
        email: data.email,
        address: data.address,
        complement: data.complement,
        role: data.role,
        language: data.language,
        createdin: data.createdin,
    });
    return true
  }  
}