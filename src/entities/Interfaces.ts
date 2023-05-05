import { Whatsapp, Message } from '@wppconnect-team/wppconnect';
import interface_on from '../configs/interfaces.json'

interface TextMessage {
  type: 'text';
  text: string;
}

interface ImageMessage {
  type: 'image';
  url: string;
  caption?: string;
}

interface GifMessage {
  type: 'gif';
  url: string;
  caption?: string;
}

interface ContactMessage {
  type: 'contact';
  name: string;
  phone: string;
}

interface ContactsMessage {
  type: 'contacts';
  contacts: Array<{ name: string; phone: string }>;
}

interface LocationMessage {
  type: 'location';
  latitude: string;
  longitude: string;
  title?: string;
}

type MessageConfig = TextMessage | ImageMessage | GifMessage | ContactMessage | ContactsMessage | LocationMessage;

interface InterfaceConfig {
  msg: MessageConfig[];
  interacts: Array<{ emoji: string; title: string; action: string }>;
}

const interfaces = interface_on as Record<string, InterfaceConfig>;

export async function access_interface(client: Whatsapp, message: Message, c_interface: keyof typeof interfaces) {
  if (!(c_interface in interfaces)) {
    return false;
  }

  const { msg, interacts } = interfaces[c_interface];

  for (let i = 0; i < msg.length; i++) {
    const m = msg[i];
    let full_message = '';
    let isFirstMsg = i === 0;

    if (m.type === 'text' && m.text.trim() !== '') {
      full_message += `${m.text}`;

      if (isFirstMsg && interacts) {
        const interactOptions = interacts.map((option, index) => `${index + 1}. ${option.emoji} ${option.title}`).join('\n');
        full_message += `\n\n${interactOptions}\n`;
      }
      await client.sendText(message.from, full_message);

    } else if (m.type === 'image' && m.url) {
      await client.sendImage(message.from, m.url, m.caption);
    } else if (m.type === 'gif' && m.url) {
      await client.sendImageAsStickerGif(message.from, m.url);
    } else if (m.type === 'contact' && m.phone) {
      await client.sendContactVcard(message.from, m.phone, m.name);
    } else if (m.type === 'location' && m.latitude && m.longitude) {
      await client.sendLocation(message.from, m.latitude, m.longitude, m.title || '');
    }
  }  
}

