interface UserData {
  id: number;
  name: string;
  full_name: string;
  contact: string;
  age: number;
  birthday: string | false;
  instagram: string;
  email: string;
  address: string;
  complement: string;
  role: number;
  language: string;
  createdin: number;
}

export class User {
  id: number;
  name: string;
  full_name: string;
  contact: string;
  age: number;
  birthday: string | false;
  instagram: string;
  email: string;
  address: string;
  complement: string;
  role: number;
  language: string;
  createdin: number;

  constructor(props: UserData) {
    this.id = props.id;
    this.name = props.name;
    this.full_name = props.full_name;
    this.contact = props.contact;
    this.age = props.age;
    this.birthday = props.birthday;
    this.instagram = props.instagram;
    this.email = props.email;
    this.address = props.address;
    this.complement = props.complement;
    this.role = props.role;
    this.language = props.language;
    this.createdin = props.createdin;
  }
}
