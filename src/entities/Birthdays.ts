import { Whatsapp } from "@wppconnect-team/wppconnect";
import { Database } from "./Db";
import moment from "moment";
import { calculateAge, calculateTimeRemaining, sendEmail } from "./Snippets";

export async function generateBirthdayReport(client: Whatsapp) {
    const db = new Database();
    const birth = await db.getBirthday();
  
    if (!birth || birth.length <= 0) {
        return false;
    }

    const today = moment();
    let message = `🎂 *Relatório de Aniversários*\n\n⛅ Bom dia líderes! Aqui está o tão esperado relatório de aniversariantes próximos.\n\n📅 Preparamos essa lista especial para que vocês possam programar e criar cronogramas comemorativos incríveis para o MIX.\n\n🗞️ *Lista de aniversários:*\n\n`;
    let upcomingBirthdays: any[] = [];
  
    birth.forEach((row: any) => {
        const full_n = row.full_name;
        const split_name = full_n.split(' ');
        const name = `${split_name[0]} ${split_name[1]}`;
        const birthday = moment(row.birthday, 'DD/MM/YYYY', true).startOf('day');

        const thisYearBirthday = moment(birthday).year(today.year());
        if (thisYearBirthday.isBefore(today)) {
            thisYearBirthday.add(1, 'year');
        }
        const nextBirthday = moment(thisYearBirthday).startOf('day');
        const diffDays = nextBirthday.diff(today.startOf('day'), 'days');
        const dayMonth = birthday.format("DD [de] MMMM");
        const diaDaSemana = nextBirthday.format('dddd'); // Nome do dia da semana em português: sexta-feira
        let age = calculateAge(birthday.format('DD/MM/YYYY'))+1
        const emojis = [ '🎈', '🎉', '🎊' ]
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        if (diffDays <= 20 && diffDays !== 1 && diffDays !== 0) {
            upcomingBirthdays.push(`${name} faz *${age}* anos em *${diffDays}* dias! ${randomEmoji} (${dayMonth}, ${diaDaSemana})`);
        } else if (diffDays === 1) {
            upcomingBirthdays.push(`${name} faz *${age}* anos em *1* dia! ${randomEmoji} (${dayMonth}, ${diaDaSemana})`);
        } else if (diffDays === 0) {
            upcomingBirthdays.push(`${name} faz *${age}* anos *hoje*! ${randomEmoji} (${dayMonth}, ${diaDaSemana})`);
            client.sendText(row.contact, '🎉 *É dia de festa!!*\n\nDesejo um dia repleto de alegria, paz e muitas bênçãos. Que esta nova etapa da sua vida seja marcada por momentos especiais e realizações incríveis. Que você seja sempre abençoado(a) e iluminado(a) por Deus.\n\nFeliz aniversário! 🥳🎂🎈');
            sendEmail(row.email, row.full_name, row.language, 'birthday', row.gender, 'É Dia de Festa!!! 🎉🎉');
            db.updateAge(row.id, Number(row.age)+1);
        }
    });
  
    message += upcomingBirthdays.join('\n');
  
    if (upcomingBirthdays.length === 0) {
      message += '❌ Não encontrei nenhum aniversariante próximo.';
    }

    message += '\n\n🎁 Aproveitem essa oportunidade para enviar mensagens, preparar surpresas especiais para tornar o aniversário de cada um desses queridos membros do nosso grupo ainda mais especial.\n'
    // Send the report message to the group
    client.sendText('120363096082046223@g.us', message);
}

export async function dataBirthdays(client: Whatsapp) {
    const timeRemaining = calculateTimeRemaining(0, 22);
    setTimeout(async function() {
        generateBirthdayReport(client);
        dataBirthdays(client);
    }, timeRemaining);
}