import mysql from "mysql2/promise";
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';

export default async function ConnectMYSQL(string_url: string): Promise<MySql2Database<Record<string, never>>& {
    $client: mysql.Pool;
}>{
    const pool = await mysql.createPool({
        uri: string_url
    });
    
    const db = drizzle(pool);

    return db;
}