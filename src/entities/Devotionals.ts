import moment from "moment";
import { Database } from "./Db";
import { Whatsapp } from "@wppconnect-team/wppconnect";
import { calculateTimeRemaining } from "./Snippets";

let first_devotional = false;

export async function sendDailyDevotional(client: Whatsapp, cb: Function, date?: string) {
  if (first_devotional === false && date === undefined) { 
    first_devotional = true;
    date = moment().format('YYYY-MM-DD');
  }

  try {
    if (date === undefined) { return console.log("Nenhuma data fornecida para buscar o devocional."); }
    const db = new Database();
    console.log(date)
    const devotional = await db.getDevotional(date);
    if (devotional.length === 0) {
      console.log("Nenhum Devocional foi encontrado para hoje.");
      return false;
    }

    const timeRemaining = calculateTimeRemaining(5, 30);
    
    setTimeout(async function() {
      const connection = new Database();
      const [ rows ] = await connection.execute(`SELECT contact FROM users;`);

      if (rows.length <= 0) {
        throw new Error("Nenhum usuário encontrado.");
      }

      for (let i = 0; i < rows.length; i++) {
        const contact = rows[i].contact;
        await client.sendText(contact, devotional.text);
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
