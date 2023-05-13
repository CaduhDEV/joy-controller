import { Whatsapp, Message } from '@wppconnect-team/wppconnect';
import interface_on from '../configs/interfaces.json'
import { User } from './User';
import { Database } from './Db';
import { calculateAge, capitalizeFirstLetter, isValidDate } from './Snippets';

let user_logged: Record<string, User> = {};
let current_stage: { [key: string]: string } = {}; // estágio atual.
let current_interface: { [key: string]: string } = {}; // Interface que deve imprimir.
let temp_data: { [key: string]: register_temp } = {}; // variavel para criação de registro do usuário.

interface register_temp {
  name?: string;
  contact?: string;
  birthday?: string;
  age?: number;
  instagram?: string;
  email?: string;
  address?: string;
  role?: number;
  language?: string;
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

const interfaces = interface_on as InterfacesConfig;

export async function replaceKeywordsWithVariables(translate: string, variables: string[]) {
  let newStr = translate;
  for (let i = 0; i < variables.length; i++) {
      let regex = new RegExp('%%');
      newStr = newStr.replace(regex, variables[i]);
  }
  return newStr;
}

export async function access_interface(client: Whatsapp, message: Message, c_interface: keyof typeof interfaces, lang: keyof typeof interface_on, variables?: string[]) {
  if (!(c_interface in interfaces[lang])) {
    return;
  }

  current_interface[message.from] = `${c_interface}`

  const { msg, interacts } = interfaces[lang][c_interface];

  for (let i = 0; i < msg.length; i++) {
    let m = msg[i];
    let full_message = '';
    let isFirstMsg = i === 0;
    
    if ('text' in m && m.text && variables) {
      m.text = await replaceKeywordsWithVariables(m.text, variables);
    }

    if (m.type === 'text' && m.text.trim() !== '') {
      full_message += `${m.text}`;

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
      const contacts = m.contacts.flat();
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

export async function interact_interface(client: Whatsapp, message: Message) {
  switch (current_stage[message.from]) {
    default:
      if (!(message.from in user_logged)) {
        const db = new Database();
        const data = await db.getUserData(message.from);
        if (!data) { 
            await access_interface(client, message, 'select_language', 'ptbr'); // perguntar linguagem 
            return current_stage[message.from] = 'interact';
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
        // enviar para o menu
        await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, [data.name, 'Nenhum.', '19:00 às 07:00', 'Provérbios', 'Israel Natural que reflete na espiritual.']);
        return current_stage[message.from] = 'interact';
      }
    break;
    case 'register':
      console.log(temp_data[message.from])
      const step = Object.keys(temp_data[message.from] || {}).length;
      console.log(`Etapa do Registro é: ${step}.`);
      switch(step) {
        case 1:
          const rule = new RegExp(/\b[A-Za-zÀ-ú][A-Za-zÀ-ú]+,?\s[A-Za-zÀ-ú][A-Za-zÀ-ú]{2,19}\b/, "gi")
          if (rule.test(message.body) === false || message.body.trim().split(' ').length > 2) {
            return console.error('Nome inválido.')
          }
          delete user_logged[message.from];
          temp_data[message.from].name = capitalizeFirstLetter(message.body.toLowerCase());
          access_interface(client, message, "register_birthday", temp_data[message.from].language as keyof typeof interface_on, [ temp_data[message.from].name as keyof typeof temp_data.name ]);
        break;
        case 2:
          let date = isValidDate(message.body);
          if (date === false || calculateAge(message.body) < 10) { return console.error('data inválida.'); }
          temp_data[message.from].birthday = date;
          temp_data[message.from].age = calculateAge(message.body);
          access_interface(client, message, 'register_email', temp_data[message.from].language as keyof typeof interface_on, [ temp_data[message.from].name as keyof typeof temp_data.name, `${temp_data[message.from].age}` ])
        break;
        case 4:
          console.log('coletar email e perguntar instagam.')
        break;
      }
    break;
    case 'interact':
      const interacts = interfaces[temp_data[message.from].language][current_interface[message.from]].interacts;
      
      for (const interact of interacts) {
        console.log(message.body.normalize().toLowerCase(), interact.title.normalize().toLowerCase())
        if (message.body.normalize().toLowerCase() === interact.title.normalize().toLowerCase() || message.body === interact.emoji || message.body === String(interacts.indexOf(interact) + 1)) { 
          const actionFunction = actionFunctions[interact.action];
          if (actionFunction) {
            await actionFunction(client, message, interact);
          } else {
            console.error(`ERROR: Action "${interact.action}" not implemented`);
          }
          break;
        }
      }
    break;
  }
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
    console.log(temp_data[message.from].language)
    access_interface(client, message, 'try_register', temp_data[message.from].language  as keyof typeof interface_on);
  },
  register: async(client, message, interact) => {
    if (interact.value === 'back' ) {
      current_stage[message.from] = 'interact';
      await access_interface(client, message, 'select_language', temp_data[message.from].language as keyof typeof interface_on);
    } else if (interact.value === 'start') {
      current_stage[message.from] = 'register';
      await access_interface(client, message, 'register_name', temp_data[message.from].language as keyof typeof interface_on);
    }
  }
};