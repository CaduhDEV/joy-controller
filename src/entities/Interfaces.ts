import { Whatsapp, Message } from '@wppconnect-team/wppconnect';

async function access_interface(client: Whatsapp, message: Message, c_interface: keyof typeof interfaces) {
  if (!(c_interface in interfaces)) {
    return false;
  }

  const { msg, interacts } = interfaces[c_interface];
  const main_message = msg.find(msg => msg.type === 'text' && msg.text.trim() !== '');

  if (!main_message) {
    return false;
  }

  const interactOptions = interacts.map((option, index) => `${index + 1}. ${option.emoji} ${option.title}`).join('\n');
  const full_message = `${main_message.text}\n\n${interactOptions}`;

  await client.sendText(message.from, full_message);

}
