import axios from "axios";
import moment from "moment";

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




export function formatAddress(address: {[key: string]: string} | string, number: string | '0'): string {
  if (typeof(address) === 'string') {
    return "Zona rural";
  }

  const logradouro = address.logradouro ?? "";
  return `${logradouro}, ${number} - ${address.bairro} ${address.localidade} ${address.uf} - ${address.cep ?? ""}`;
}
