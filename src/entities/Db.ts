import moment from 'moment';
import { createPool, Pool, Connection } from 'mysql2/promise';

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
    const [rows, fields] = await this.execute(`SELECT * FROM users WHERE contact = ?`, [phone]);

    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }
  
  async createUser(from: string, data: any): Promise<void> {
    
    const query = `INSERT INTO users (contact, name, birthday, age, email, gender, instagram, address, language, createdin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    console.log(data)
    const params = [from, data.name, data.birthday, data.age, data.email, data.gender, data.instagram, data.address, data.language, moment().format('DD/MM/YYYY') ];
  
    try {
      const [rows, fields] = await this.execute(query, params);
      console.log('User created successfully.');
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }
  

  private async getConnection(): Promise<MySqlConnection> {
    if (!this.conn) {
      this.conn = await this.pool.getConnection() as MySqlConnection;
    }
    return this.conn;
  }
}
