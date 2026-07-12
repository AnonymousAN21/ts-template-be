import sqllite from 'better-sqlite3'
import { BetterSQLite3Database, drizzle} from 'drizzle-orm/better-sqlite3';

export default async function ConnectSQLITE(string_url: string): Promise<BetterSQLite3Database<Record<string, never>> & {
    $client: sqllite.Database;
}>{
        const pool = new sqllite(string_url);
        const db = drizzle(pool);

        return db;
}