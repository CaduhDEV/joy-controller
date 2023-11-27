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
    const devotional = await db.getDevotional(date);
    console.log(devotional)
    if (devotional.length === 0) {
      console.log("Nenhum Devocional foi encontrado para hoje.");
      return false;
    }

    const timeRemaining = calculateTimeRemaining(16, 14);
    
    setTimeout(async function() {
      const connection = new Database();
      const [ rows ] = await connection.execute(`SELECT contact,name FROM users;`);
      console.log(rows)
      if (rows.length <= 0) {
        throw new Error("Nenhum usuário encontrado.");
      }

      const randomDelay = Math.floor(Math.random() * 1000) + 1000; // Entre 1000ms (1 segundo) e 2000ms (2 segundos)

      for (let i = 0; i < rows.length; i++) {
        console.log(rows[i])
        let contact = rows[i].contact;
        setTimeout(async function () {
          await client.sendText(contact, `${devotional[1].text}\n\n*${rows[i].name}* Bom dia!`);
        }, randomDelay);
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
