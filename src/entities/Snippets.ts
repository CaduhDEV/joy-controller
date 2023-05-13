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