import { Message, Whatsapp } from "@wppconnect-team/wppconnect";
import { error, getUser, user_logged } from "./Interfaces";
import interface_on from '../configs/interfaces.json';
import moment from "moment";
import { calculateEngagement, calculatePing, formatTimestamp, getRoleName, isValidDate } from "./Snippets";
import { Database } from "./Db";

type CommandFunction = (args: string[], client: Whatsapp, message: Message) => Promise<string | void>;

const commands: Record<string, CommandFunction> = {
  help: async (args, client, message) => {
    client.sendText(message.from, `🤖 *Bem-vindo(a) ao Console*\n\nℹ️ Aqui, você tem acesso a comandos especiais que vão lhe auxiliar a aproveitar ao máximo todas as funcionalidades disponíveis.\n\n🌐 *Comandos Disponíveis:*\n\n*!help:* Exibe informações de ajuda sobre o uso do Console.\n*!stats:* Mostra a dashboard geral, com estatísticas gerais.\n*!search (nome):* Procura membros baseados em uma palavra chave ou letra(!search joão).\n*!profile (id):* Exibe o perfil completo de um usuário específico.\n*!birthdays (mês 1 a 12):*  Obtém 1 relatório de todos os aniversariantes do mês solicitado.\n*!warning:* Obtém um relatório de pessoas inativas da plataforma.\n*!checkin (dia/mes/ano):* Obtém um relatório avançado do checkin para uma data específica.\n`);
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
  search: async(args, client, message) => {
    if (args.length === 0) { return error(client, message, 'ptbr', 'invalid_sintax'); }
    const db = new Database();
    const users = await db.getUsersByName(args[0]);
  
    if (users.length === 0) { return error(client, message, 'ptbr', 'user_notfound'); }
    const profiles = users.map((user) => {
      return `🪪 *ID:* ${user.id}\n👤 *Nome:* ${user.full_name}\n`;
    }); 
    const full_msg = `🕵🏼‍♂️ *Pessoas encontradas*\n\nℹ️ Encontrei *${profiles.length}* membro(s) com esse nome, utilize *!profile (id)* para exibir o perfil.\n\n${profiles.join("\n")}`
    client.reply(message.from, full_msg, message.id);
  },
  profile: async(args, client, message) => {
    if (args.length === 0) { return error(client, message, 'ptbr', 'invalid_sintax'); }
    const db = new Database();
    const user = await db.getUserByID(Number(args[0]));
    if (user.lenght === 0 ) { return error(client, message, 'ptbr', 'user_notfound'); }

    const full_msg = `👤 *Perfil Pessoal*\n\n📕 Aqui estão os dados cadastrais encontrados para esse ID.\n\n🪪 *Nome:* ${user.full_name}\n🥳 *Aniversário:* ${isValidDate(user.birthday)}\n🗓️ *Idade:* ${user.age}\n\n📍*Endereço Registrado:*\n${user.address}\n\n📷 *Instagram:* ${user.instagram}\n✉️ *Email:*\n${user.email}\n\n🧳 *Cargo:* ${getRoleName(user.role)}\n🚪*Membro desde:* ${formatTimestamp(user.createdin)}`;
    await client.reply(message.from, full_msg, message.id);
  },
  birthdays: async(args, client, message) => { 
    const month = Number(args[0]);
    if (args.length === 0 || isNaN(month) || month < 1 || month > 12) {
      return error(client, message, 'ptbr', 'invalid_month');
    }
    const db = new Database();
    const users = await db.getUsersByBirthdayMonth(month);
  
    if (users.length === 0) {
      return error(client, message, 'ptbr', 'invalid_search_birthday');
    }
  
    let result = `🎉 *Aniversariantes de ${moment(month, 'M').format('MMMM')}*\n\nAqui está um relatório completo para todos os aniversariantes do mês.\n\n`;
    const today = moment();

    users.forEach((user) => {
      const birthday = moment(user.birthday, 'YYYY-MM-DD', true).startOf('day');

      const thisYearBirthday = moment(birthday).year(today.year());
      if (thisYearBirthday.isBefore(today)) {
          thisYearBirthday.add(1, 'year');
      }
      const nextBirthday = moment(thisYearBirthday).startOf('day');
      const dayMonth = birthday.format("DD [de] MMMM");
      const diaDaSemana = nextBirthday.format('dddd'); // Nome do dia da semana em português: sexta-feira
      result += `🎂 *${user.full_name}*\n📅 ${dayMonth} fará *${user.age+1}* anos. (${diaDaSemana})\n\n`;
    });
  
    client.sendText(message.from, result);
  },
  warning: async(args, client, message) => {
    const check_date = isValidDate(moment().format('YYYY-MM-DD'));
    if (!check_date) { return error(client, message, 'ptbr', 'invalid_date'); } // criar esse erro.
    const db = new Database(); 
    const members = await db.getMembers();

    const warning_checks = await db.getCheckinWarning();

    let full_msg = `😴 *Relatório de Inatividade*\n\n🕵️‍♂️ Aqui está o relatório completo solicitado, tomei a liberdade e fiz algumas investigações para auxiliar na melhoria do pastoreio da igreja.\n\n🗓️ *Data:* ${check_date}\n👥 *Membros Cadastrados:* ${members}\n😴 *Membros Inativos:* ${warning_checks.length}\n\n🕵️‍♂️ *Preocupações:*\n\n`
    let warnings = '';
    let contactMan: { name: string; contact: string }[] = [];
    let contactWoman: { name: string; contact: string }[] = [];

    for (const check of warning_checks) {
      const user = await db.getUserData(check.user_id);

      const currentDate = moment();
      const checkinDate = moment(check.date, 'YYYY-MM-DD');
      const daysDifference = currentDate.diff(checkinDate, 'days');
      if (user.gender === 'man') { contactMan.push({ name: user.name, contact: user.contact} );} 
      else if (user.gender === 'woman') { contactWoman.push({ name: user.name, contact: user.contact}); }

      if (daysDifference > 10) {
        warnings += `*${user.full_name}* não faz checkin há *${daysDifference}* dias, favor procurá-lo(a).\n`;
      }
    }

    if (warnings.length === 0 ) {
      full_msg += `❌ Não detectei nenhuma preocupação.\n`;
    }
    else {
      full_msg += `${warnings}\n🫡❤️‍🔥 Para ajudar vocês vou montar abaixo 2 listas de Contatos dos sumidos para vocês irem atrás, vou separar por homem e mulher.`;
      const man = await client.sendContactVcardList(message.from, contactMan.map((contact) => ({ id: contact.contact, name: contact.name })));
      const woman = await client.sendContactVcardList(message.from, contactWoman.map((contact) => ({ id: contact.contact, name: contact.name })));
      client.sendReactionToMessage(man.id, '👨');
      client.sendReactionToMessage(woman.id, '👩');
    }

    client.sendText(message.from, full_msg);
  },
  checkin: async(args, client, message) => {
    if (args.length === 0 ) { return error(client, message, 'ptbr', 'invalid_sintax'); }
    const date = isValidDate(args[0]);
    if (!date) { return error(client, message, 'ptbr', 'invalid_date'); } // criar esse erro.
    const db = new Database();
    const check_date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
    const checks = await db.getCheckinsByDate(check_date);
    if (checks.length === 0) { return error(client, message, 'ptbr', 'checkin_notfound') } // criar esse erro.
    
    const members = await db.getMembers();
    
    let full_msg = `📈 *Relatório do Culto*\n\n🕵️‍♂️ Aqui está o relatório completo solicitado, tomei a liberdade e fiz algumas investigações para auxiliar na melhoria do pastoreio da igreja.\n\n📊 *Estatísticas Gerais:*\n\n🗓️ *Data:* ${date}\n👥 *Membros Cadastrados:* ${members}\n🎟️ *Registros encontrados:* ${checks.length}\n☁️ *Faltas Detectadas:* ${members-checks.length}\n`
    client.sendText(message.from, full_msg).then(async() => {
      let presence = ``
    for (const p of checks) {
      const user = await db.getUserData(p.user_id);
      const time = moment(p.date).format('HH:mm');
      presence += `🪪 ${user.full_name}\n⌚️ ${time}\n\n`;
    }
    client.sendText(message.from, `✅ *Lista de presenças*\n\n🕵️‍♂️ Aqui está a lista das pessoas que marcaram presença no culto da data informada, fiz a lista por ordem de chegada.\n\n${presence}`);
    const fails = await db.getUsersNotPresence(check_date);
    if (fails.lenght === 0 ) { return; }
    
    let fail = ``
    for (const f of fails){
      fail += `🪪 ${f.full_name}\n`
    }

    client.sendText(message.from, `❌ *Lista de faltas*\n\n🕵️‍♂️ Aqui está a lista das pessoas que faltaram no culto da data informada.\n\n${fail}`);
    });
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

