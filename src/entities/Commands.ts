// escrever sistema de console aqui hoje.

import { Message, Whatsapp } from "@wppconnect-team/wppconnect";
import { error, getUser, user_logged } from "./Interfaces";
import interface_on from '../configs/interfaces.json';

type CommandFunction = (args: string[], client: Whatsapp, message: Message) => Promise<string | void>;

const commands: Record<string, CommandFunction> = {
  help: async (args, client, message) => {
    client.sendText(message.from, `🤖 *Bem-vindo(a) ao Console*\n\nℹ️ Aqui, você tem acesso a comandos especiais que vão lhe auxiliar a aproveitar ao máximo todas as funcionalidades disponíveis.\n\n🌐 *Comandos Disponíveis:*\n\n*!help:* Exibe informações de ajuda sobre o uso do Console.\n*!stats:* Mostra a dashboard geral, com estatísticas gerais.\n*!profile (nome / número):* Obtém o perfil de um membro registrado através do nome ou número de telefone.\n*!birthdays (período):*  Obtém 1 relatório de todos os aniversariantes dentro do período em dias informado.\n*!checkin (ano-mes-dia):* Obtém um relatório de check-ins feitos numa data específica.\n`);
  },
};

export async function interact_console(client: Whatsapp, message: Message) {
    if (!message.body.startsWith(".")) { return; } // se n começar com ! n considera como comando.
    if (await getUser(message.author) === false ) { return; }
    if (user_logged[message.author].role <= 0) { return error(client, message, user_logged[message.author].language as keyof typeof interface_on, 'not_permission'); }
    const [command, ...args] = message.body.substring(1).split(" ");
    if (commands[command] === undefined || !commands[command]) { return error(client, message, user_logged[message.author].language as keyof typeof interface_on, 'invalid_command'); }
    await commands[command](args, client, message);
} 