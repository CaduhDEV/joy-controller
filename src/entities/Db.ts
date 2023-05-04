import { createPool, Pool, Connection } from 'mysql2/promise';

export class Database {
  private pool: Pool;
  private conn: Connection | null;

  constructor() {
    this.pool = createPool({
      host: 'localhost',
      user: 'root',
      password: '258$rax',
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
      conn.end();
    }
  }

  async getUserData(phone: string) {
    const [rows, fields] = await this.execute(`SELECT * FROM users WHERE contact = ?`, [phone]);

    if (rows.length === 0) {
      return null;
    }
    
    return rows[0];
  }

  private async getConnection(): Promise<Connection> {
    if (!this.conn) {
      this.conn = await this.pool.getConnection();
    }
    return this.conn;
  }
}
