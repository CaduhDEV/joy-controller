import moment from "moment";
import { Database } from "./Db";
import { Whatsapp } from "@wppconnect-team/wppconnect";
import { calculateTimeRemaining } from "./Snippets";

async function getDevotional(now: string) {
    const connection = new Database();
    const rows = await connection.getDevotional(now);
    if (rows.length <= 0) { return false }

    return { text: rows[0].text, date: moment(rows[0].date).format('YYYY-MM-DD') };
}

let first_devotional = false;

export async function sendDailyDevotional(client: Whatsapp, cb: Function, date?: string) {
  if (first_devotional === false && date === undefined) { 
    first_devotional = true;
    date = moment().format('YYYY-MM-DD');
  }

  try {
    if (date === undefined) { return console.log("Nenhuma data fornecida para buscar o devocional."); }
    const devotional = await getDevotional(date);

    if (devotional === false) {
      console.log("Nenhum Devocional foi encontrado para hoje.");
      return false;
    }

    const timeRemaining = calculateTimeRemaining(5, 30);
    
    setTimeout(async function() {
      const connection = new Database();
      const [ rows, fields ] = await connection.execute(`SELECT contact FROM users;`);

      if (rows.length <= 0) {
        throw new Error("Nenhum usuário encontrado.");
      }

      for (let i = 0; i < rows.length; i++) {
        const contact = rows[i].contact;
        client.sendText(contact, devotional.text);
      }

      const new_date = moment(date).add(1, 'days').format('YYYY-MM-DD');
      sendDailyDevotional(client, cb, new_date);
      cb();
    }, timeRemaining);
  } catch (error) {
    console.log(error);
    return false;
  }
}
