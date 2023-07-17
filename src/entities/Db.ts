import moment from 'moment';
import { createPool, Pool, Connection } from 'mysql2/promise';
import { User } from './User';

interface MySqlConnection extends Connection {
  release(): void;
}

export class Database {
  private pool: Pool;
  private conn: MySqlConnection | null;

  constructor() {
    this.pool = createPool({
      host: 'localhost',
      user: 'root',
      password: undefined,
      database: 'joy',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    this.conn = null;
  }

  async execute(query: string, params?: any[]): Promise<any> {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(query, params);
      return result;
    } finally {
      conn.release();
    }
  }

  async getUserData(phone: string) {
    let [rows, fields] = await this.execute(`SELECT * FROM users WHERE contact = ?`, [phone]);

    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }
  async changeLanguage(from: string, language: string): Promise<void> {
    let query = ` UPDATE users SET language = ? WHERE contact = ?`;
    let params = [language, from];
    try {
      let [rows, fields ] = await this.execute(query, params);
    } catch(error){
      console.log(error);
    }
  }
  async createUser(from: string, data: any): Promise<void> {
    
    let query = `INSERT INTO users (contact, name, full_name, birthday, age, email, gender, instagram, address, complement, language, createdin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    console.log(data);
    let params = [from, data.name, data.full_name, data.birthday, data.age, data.email, data.gender, data.instagram, data.address, data.complement, data.language, moment().format('DD/MM/YYYY') ];
  
    try {
      let [rows, fields] = await this.execute(query, params);
      console.log('User created successfully.');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
  async getBirthday(): Promise<any> {
      let query = `SELECT contact,full_name,birthday,age FROM users;`
      try {
        let [ rows, fields ] = await this.execute(query);
        return rows
      } catch (error){
        console.log(error);
      }
  }
  
  async getDevotional(date: string): Promise<any> {
    const query = `SELECT * FROM devotionals WHERE date = ?`;
    const params = [ date ];
    try {
      let [ rows, fields ] = await this.execute(query, params);
      return rows;
    } catch (error) {
      console.log(error);
    }
  }

  async getCountDevotional(): Promise<any> {
    let [ row] = await this.execute(`SELECT date FROM devotionals WHERE id = (SELECT MAX(id) FROM devotionals);`);
    return row[0].date
  }

  async CheckIn(contact: string, date: string): Promise<void> {
    let query = `INSERT INTO checkin (user_id, date) VALUES (?, ?);`
    let params = [ contact, date ]
    try {
      let [ rows, fields ] = await this.execute(query, params);
    } catch (error) {
      console.error('Error register Checkin:', error);
    }
  }

  async getMembers(): Promise<any> {
    const query = `SELECT COUNT(*) AS total FROM users`;
    try {
       const [rows] = await this.execute(query);
       return rows[0].total;
    }
    catch(error){
      return 0
     }
  }
  async getUsersCreatedLast7Days(): Promise<number> {
    const query = `SELECT COUNT(*) AS total FROM users WHERE createdin >= NOW() - INTERVAL 7 DAY;`;
    try {
      const [rows] = await this.execute(query);
      return rows[0].total;
    } catch (error) {
      return 0;
    }
  }

  async getUsersByName(name: string): Promise<User[]> {
    const query = `SELECT * FROM users WHERE name LIKE ?`;
    const values = [`%${name}%`]; // Procura por correspondências parciais do nome
  
    try {
      const [rows] = await this.execute(query, values);
      return rows as User[];
    } catch (error) {
      return [];
    }
    
  }

  private async getConnection(): Promise<MySqlConnection> {
    if (!this.conn) {
      this.conn = await this.pool.getConnection() as MySqlConnection;
    }
    return this.conn;
  }
}
