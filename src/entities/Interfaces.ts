import { Whatsapp, Message } from '@wppconnect-team/wppconnect';
import interface_on from '../configs/interfaces.json'
import { User } from './User';
import { Database } from './Db';

let user_logged: Record<string, User> = {};
let current_interface: { [key: string]: string } = {};

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
  interacts: Array<{ emoji: string; title: string; action: string }>;
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

      if (isFirstMsg && interacts) {
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
  if (!current_interface[message.from]) {
    if (!(message.from in user_logged)) {
      const db = new Database();
      const data = await db.getUserData(message.from);
      if (!data) { 
          await access_interface(client, message, 'not_user_select_language', 'ptbr'); // perguntar linguagem 
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
      // enviar para o menu
      return await access_interface(client, message, 'main_menu', user_logged[message.from].language as keyof typeof interface_on, [data.name, 'Nenhum.', '19:00 às 07:00', 'Provérbios', 'Israel Natural que reflete na espiritual.']);
    }
  } else {
    // lista de interações disponíveis:
    const language = user_logged[message.from]?.language || 'ptbr';
    const interacts = interfaces[language][current_interface[message.from]].interacts;
    
    for (const interact of interacts) {
      if (message.body === interact.title || message.body === interact.emoji || message.body === String(interacts.indexOf(interact) + 1)) { 
        switch (interact.action) { //lidar com as ações
          case 'select_language':
            
          break;
          case 'main_menu':
          break;
        }
        break;
      }
    }
  }
}
