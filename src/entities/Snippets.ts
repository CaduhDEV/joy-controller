import axios from "axios";
import moment from "moment";
import nodemailer from 'nodemailer';
import current_email from '../configs/emails.json'
import { Database } from "./Db";

export function capitalizeFirstLetter(str: string) {
    let words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ') || 'Sem Nome';
}

export function calculateAge(birthdate: string) {
    let today = moment();
    let birthdateObj = moment(birthdate, 'DD/MM/YYYY');
    let age = today.diff(birthdateObj, 'years');
    return age;
}

export function isValidDate(dateString: string) {
    let formats = ['DD/MM/YYYY', 'DD/MM/YY', 'DDMMYYYY', 'DDMMYY', 'YYYY-MM-DD'];
    for (let i = 0; i < formats.length; i++) {
      let format = formats[i];
      let parsedDate = moment(dateString, format, true);
      if (parsedDate.isValid()) {
        return parsedDate.format('DD/MM/YYYY');
      }
    }
    return false;
}

enum Role {
  Membro = 0,
  Líder = 1,
  Administrador = 2,
  Supervisor = 3,
  Novato = 4,
}

export function getRoleName(role: Role): string {
  switch (role) {
    case Role.Membro:
      return 'Membro';
    case Role.Líder:
      return 'Líder';
    case Role.Administrador:
      return 'Administrador(a)';
    case Role.Supervisor:
      return 'Supervisor(a) Geral';
    default:
      return 'Novato(a)';
  }
}

export async function collectAddressByCode(input: string) {
  let cep = input.replace(/[^\d]/g, "")
  if (cep.length !== 8) { return false; }
  let collect = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
  return collect.data
}

export function calculatePing(receivedTime: moment.Moment): number {
  const currentTime = moment();
  const ping = currentTime.diff(receivedTime, 'milliseconds');
  return ping;
}

export function formatTimestamp(timestamp: number): string {
  const date = moment(timestamp);
  return date.format('DD/MM/YYYY');
}

export async function calculateEngagement(totalMembers: number, newRegistrations: number) {
  const engagementPercentage = (newRegistrations / totalMembers) * 100;
  return engagementPercentage.toFixed(2);
}

export function formatPhoneNumber(from: string): string {
  const phoneNumber = from.replace("@c.us", "");
  const countryCode = phoneNumber.slice(0, 2);
  const ddd = phoneNumber.slice(2, 4);
  const number = phoneNumber.slice(4);

  return `+${countryCode}${ddd}9${number}`;
}

export function formatAddress(address: { [key: string]: string } | string, number: string | '0'): string {
  if (typeof address === 'string') {
    return "Zona Rural";
  }

  let logradouro = address.logradouro || "";
  let bairro = address.bairro || "";
  let localidade = address.localidade || "";
  let uf = address.uf || "";
  let cep = address.cep || "";

  if (logradouro === "" || bairro === "") {
    return `Zona Rural, ${number} ${localidade} ${uf} - ${cep}`;
  }

  return `${logradouro}, ${number} - ${bairro} ${localidade} ${uf} - ${cep}`;
}


interface EmailGender {
  woman: string;
  man: string;
}

interface EmailConfig {
  [key: string]: EmailGender;
}

interface EmailConfigs {
  [key: string]: EmailConfig;
}

let body_email: EmailConfigs = current_email as EmailConfigs;

// tipar os args dessa função e criar o sistema de enviar o email especifo para a pessoa.
export async function sendEmail(email: string, name: string, language: keyof typeof current_email, email_sintax: keyof EmailConfigs, gender: keyof EmailGender, subject: string) {
  // Crie um objeto de transporte de e-mail
  let body = body_email[language][email_sintax][gender].replace("%%", name);
  let full_body = body.replace("@url", "https://i.imgur.com/iSKMhH3.png");
  let transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'contato@cultomix.com.br',
      pass: '0502200213036434992Ca@',
    },
  });

  // Configure as opções do e-mail
  let mailOptions = {
    from: 'contato@cultomix.com.br',
    to: email,
    subject: subject,
    html: full_body,
    attachments: []
  };

  try {
    // Envie o e-mail
    let info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.messageId);
  } catch (error) {
    console.log(error)
    console.log('Erro ao enviar o e-mail.');
  }

}

export async function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
  const earthRadius = 6371; // Raio médio da Terra em quilômetros

  // Converter as coordenadas de graus para radianos
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Diferença das latitudes e longitudes
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Fórmula de Haversine
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1Rad) * Math.cos(lat2Rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateTimeRemaining(hour: number, minute: number) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  let target = new Date();
  target.setHours(hour);
  target.setMinutes(minute);
  target.setSeconds(0);

  // retorna tempo restante do mesmo dia se for 00:01 até 5:29
  if (currentHour < target.getHours() || (currentHour === target.getHours() && currentMinute < target.getMinutes()) ||
    (currentHour === target.getHours() && currentMinute === target.getMinutes() && currentSecond < target.getSeconds())) {
    return target.getTime() - now.getTime();
  }
  // pega tempo restante do próximo dia.
  target.setDate(target.getDate() + 1);
  return target.getTime() - now.getTime();
}