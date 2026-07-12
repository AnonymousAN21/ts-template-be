import { Pool as Postgre } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';

export default async function ConnectPOSTGRE(string_url: string): Promise<NodePgDatabase<Record<string, never>> & {
    $client: Postgre;
}>{
    const pool = new Postgre({
        connectionString: string_url
    });

    const db = drizzle(pool);

    return db;
}


