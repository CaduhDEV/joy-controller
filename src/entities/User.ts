interface UserData {
  name: string;
  contact: string;
  age: number;
  birthday: string;
  instagram: string;
  email: string;
  address: string;
  role: number;
  language: string;
}

export class User {
  name: string;
  contact: string;
  age: number;
  birthday: string;
  instagram: string;
  email: string;
  address: string;
  role: number;
  language: string;

  constructor(props: UserData) {
    this.name = props.name;
    this.contact = props.contact;
    this.age = props.age;
    this.birthday = props.birthday;
    this.instagram = props.instagram;
    this.email = props.email;
    this.address = props.address;
    this.role = props.role;
    this.language = props.language;
  }
}
