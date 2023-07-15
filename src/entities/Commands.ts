// escrever sistema de console aqui hoje.

import { Message, Whatsapp } from "@wppconnect-team/wppconnect";
import { error, getUser, user_logged } from "./Interfaces";
import interface_on from '../configs/interfaces.json';
import moment from "moment";
import { calculateEngagement, calculatePing, isValidDate } from "./Snippets";
import { Database } from "./Db";

type CommandFunction = (args: string[], client: Whatsapp, message: Message) => Promise<string | void>;

const commands: Record<string, CommandFunction> = {
  help: async (args, client, message) => {
    client.sendText(message.from, `🤖 *Bem-vindo(a) ao Console*\n\nℹ️ Aqui, você tem acesso a comandos especiais que vão lhe auxiliar a aproveitar ao máximo todas as funcionalidades disponíveis.\n\n🌐 *Comandos Disponíveis:*\n\n*!help:* Exibe informações de ajuda sobre o uso do Console.\n*!stats:* Mostra a dashboard geral, com estatísticas gerais.\n*!profile (nome / número):* Obtém o perfil de um membro registrado através do nome ou número de telefone.\n*!birthdays (período):*  Obtém 1 relatório de todos os aniversariantes dentro do período em dias informado.\n*!checkin (ano-mes-dia):* Obtém um relatório de check-ins feitos numa data específica.\n`);
  },
  stats: async(args, client, message) => {
    const ping = calculatePing(moment());
    const db = new Database();
    const members = await db.getMembers();
    const new_members = await db.getUsersCreatedLast7Days();
    const last_devotional = await db.getCountDevotional();
    const engagement = await calculateEngagement(members, new_members);
    client.sendText(message.from, `📊 *Dados Gerais:*\n\nℹ️ Aqui estão algumas informações técnicas do sistema, esses dados são mais úteis aos desenvolvedores mas fique a vontade para explorar.\n\n📁 *Membros Totais:* ${members}\n🗂️ *Devocionais:* ${isValidDate(last_devotional)}\n\n💭 *Conversas abertas:* ${Object.keys(user_logged).length}\n👥 *Novos membros:* ${new_members}\n📈 *Engajamento:* ${engagement}%\n\n🏓 *Ping:* ${ping}ms\n⚙️ *Versão:* v2.0 Definitive\n👨‍💻 *Criado por:* Ágape®️\n`);
  },
  profile: async(args, client, message) => {
    // criar sistema de search profile
  }
};

export async function interact_console(client: Whatsapp, message: Message) {
  if (!message.body.startsWith(".")) { return; } // se n começar com ! n considera como comando.
  if (await getUser(message.author) === false ) { return; }
  if (user_logged[message.author].role <= 0) { return error(client, message, user_logged[message.author].language as keyof typeof interface_on, 'not_permission'); }
  const [command, ...args] = message.body.substring(1).split(" ");
  if (commands[command] === undefined || !commands[command]) { return error(client, message, user_logged[message.author].language as keyof typeof interface_on, 'invalid_command'); }
  await commands[command](args, client, message);
} 