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

  async getUserByID(id: number) {
    let [rows] = await this.execute(`SELECT * FROM users WHERE id = ?`, [id]);

    if (rows.length === 0) {
      return 0;
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
    
    let query = `INSERT INTO users (contact, name, full_name, birthday, email, gender, instagram, address, complement, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    console.log(data.birthday);
    const birth = moment(data.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');
    console.log(birth)
    let params = [from, data.name, data.full_name, birth, data.email, data.gender, data.instagram, data.address, data.complement, data.language ];
  
    try {
      let [rows, fields] = await this.execute(query, params);
      console.log('User created successfully.');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
  
  async getBirthday(): Promise<any> {
      let query = `SELECT id, contact, full_name, email, birthday, age, language, gender FROM users WHERE DATE_FORMAT(birthday, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d') AND DATE_FORMAT(birthday, '%m-%d') <= DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 20 DAY), '%m-%d') ORDER BY DATE_FORMAT(birthday, '%m-%d') ASC;`
      try {
        let [ rows ] = await this.execute(query);
        console.log(rows)
        return rows
      } catch (error){
        console.log(error);
      }
  }

  async getUsersByBirthdayMonth(month: number): Promise<any[]> {
    const query = `SELECT full_name,birthday,age FROM users WHERE MONTH(birthday) = ? ORDER BY DATE_FORMAT(birthday, '%m-%d') >= DATE_FORMAT(CURDATE(), '%m-%d'), DATE_FORMAT(birthday, '%m-%d') ASC;`;
    const values = [month];
    
    try {
      const [rows] = await this.execute(query, values);
      return rows;
    } catch (error) {
      return [];
    }
  }

  
  async getDevotional(date: string): Promise<any[] | any> {
    const query = `SELECT * FROM devotionals WHERE datetime = ?;`;
    const params = [ date ];
    try {
      const [ rows ] = await this.execute(query, params);
      return rows;
    } catch (error) {
      return [];
    }
  }
  
  async insertDevotional(body: string, date: string): Promise<any> {
    const query = `INSERT INTO devotionals (text, datetime) VALUES (?, ?);`;
    const params = [ body, date ];
    try {
      let [ rows ] = await this.execute(query, params);
      return rows;
    } catch (error) {
    }
  }

  async getCountDevotional(): Promise<any> {
    let [ row] = await this.execute(`SELECT datetime FROM devotionals WHERE id = (SELECT MAX(id) FROM devotionals);`);
    return row[0].date
  }

  async CheckIn(contact: string): Promise<void> {
    let query = `INSERT INTO checkin (user_id) VALUES (?);`
    let params = [ contact ]
    try {
      await this.execute(query, params);

    } catch (error) {
      console.error('Error register Checkin:', error);
    }
  }

  async getCheckinsByDate(date: string): Promise<any[]>  {
    const query = `SELECT * FROM checkin WHERE DATE(date) = ?;`;
    const params = [ date ]
    try {
      const [ row ] = await this.execute(query, params);
      return row;

    } catch(error) {
      return []
    }
  }

  async getUsersNotPresence(date: string) {
    const query = `SELECT u.full_name FROM users AS u WHERE NOT EXISTS ( SELECT 1 FROM checkin AS c WHERE u.contact = c.user_id AND DATE(c.date) = ?);`;
    const params = [ date ];
    try {
      const [ row ] = await this.execute(query, params);
      return row;
    } catch (error){
      return []
    }
  }

  async getCheckinWarning(): Promise<any[]> {
    const query = `SELECT * FROM checkin WHERE DATE < DATE_SUB(CURDATE(), INTERVAL 10 DAY) ORDER BY DATEDIFF(CURDATE(), DATE) DESC;`;
    try {
      const [ row ] = await this.execute(query);
      return row
    } catch (error) {
      return []
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
  async updateAge(from: string, age: number) {
    const query = `UPDATE users SET age = ? WHERE id = ?`;
    const values = [ age, from ];

    try {
      const [rows] = await this.execute(query, values);
      return rows 
    } catch (error) {
    }
  }

  async insertTask(purpose: string, fast: string, book: string, prayer: string, start: string, finish: string | null): Promise<void> {
    const query = `INSERT INTO board (purpose, fast, book, prayer, start, finish) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [purpose, fast, book, prayer, start, finish];
    try {
      await this.execute(query, params);
    } catch (error) {
    }
  }

  async getTasksWithinPeriod() {
    const query = `SELECT * FROM board WHERE start <= CURDATE() AND (finish IS NULL OR finish >= CURDATE());`;
    try {
      const [rows] = await this.execute(query);
      return rows;
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
