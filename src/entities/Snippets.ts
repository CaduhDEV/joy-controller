import axios from "axios";
import moment from "moment";
import nodemailer from 'nodemailer';
import current_email from '../configs/emails.json'

export function capitalizeFirstLetter(str: string) {
    let words = str.split(' ');
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ') || 'Sem Nome';
}

export function calculateAge(birthdate: string) {
    const today = moment();
    const birthdateObj = moment(birthdate, 'DD/MM/YYYY');
    const age = today.diff(birthdateObj, 'years');
    return age;
}

export function isValidDate(dateString: string) {
    const formats = ['DD/MM/YYYY', 'DD/MM/YY', 'DDMMYYYY', 'DDMMYY', 'YYYY-MM-DD'];
    for (let i = 0; i < formats.length; i++) {
      const format = formats[i];
      const parsedDate = moment(dateString, format, true);
      if (parsedDate.isValid()) {
        return parsedDate.format('DD/MM/YYYY');
      }
    }
    return false;
}

export async function collectAddressByCode(input: string) {
  const cep = input.replace(/[^\d]/g, "")
  if (cep.length !== 8) { return false; }
  const collect = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
  return collect.data
}

export function formatAddress(address: { [key: string]: string } | string, number: string | '0'): string {
  if (typeof address === 'string') {
    return "Zona Rural";
  }

  const logradouro = address.logradouro || "";
  const bairro = address.bairro || "";
  const localidade = address.localidade || "";
  const uf = address.uf || "";
  const cep = address.cep || "";

  if (logradouro === "" || bairro === "") {
    return `Zona Rural, ${number} ${localidade} ${uf} - ${cep}`;
  }

  return `${logradouro}, ${number} - ${bairro} ${localidade} ${uf} - ${cep}`;
}


interface EmailConfig<T> {
  woman: T;
  man: T;
}

interface EmailConfigs<T> {
  [key: string]: EmailConfig<T>;
}

const body_email = current_email as EmailConfigs<string>

// tipar os args dessa função e criar o sistema de enviar o email especifo para a pessoa.
export async function sendEmail(email: string, name: string, language: keyof typeof current_email, gender: keyof EmailConfig<string>) {
  // Crie um objeto de transporte de e-mail
  const body = body_email[language][gender].replace("%%", name);
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'contato@cultomix.com.br',
      pass: '0502200213036434992Ca@',
    },
  });

  // Configure as opções do e-mail
  const mailOptions = {
    from: 'contato@cultomix.com.br',
    to: email,
    subject: 'Bem-vindo(a) ao Culto MIX!',
    html: body,
    attachments: [
      {
        filename: 'joy-footer.jpg',
        path: 'https://cdn.discordapp.com/attachments/344136295943241728/1114018688237064312/assinatura-joy.png',
        cid: 'footer'
      }
    ]
  };

  try {
    // Envie o e-mail
    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail enviado:', info.messageId);
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }

}