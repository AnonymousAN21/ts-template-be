import ConnectMYSQL from "./mysql/database-config.js";
import ConnectSQLITE from "./sqlite/database-config.js";
import ConnectPOSTGRE from "./postgres/database-config.js";
import ConnectMongodb from "./mongodb/database-config.js";
import Show from "../../utils/error.handler.js";

/**
 * Tipe database yang didukung oleh aplikasi.
 */
type DatabaseType = "postgre" | "mysql" | "sqlite" | "mongodb";

export let dbInstance: any = null;

/**
 * Menghubungkan aplikasi ke database eksternal berdasarkan tipe dan URL koneksi yang diberikan.
 * * @async
 * @function ConnectDB
 * @param {DatabaseType | string} type - Jenis database yang ingin dituju (contoh: 'mysql', 'mongodb').
 * @param {string} string_url - String koneksi atau URI database.
 * @returns {Promise<any>} Mengembalikan instance koneksi database jika berhasil, atau `null` jika gagal/tidak valid.
 * * @example
 * // Contoh penggunaan untuk MongoDB
 * const db = await ConnectDB("mongodb", "mongodb://localhost:27017/mydb");
 */
export default async function ConnectDB(type: DatabaseType | string, string_url: string){
    let db = null;

    switch (type){
        case "postgre":
            db = await ConnectPOSTGRE(string_url).catch((error) => {
                Show({error: new Error(error), text: "Failed to connect."})
            });
            break;
        case "mysql":
            db = await ConnectMYSQL(string_url).catch((error) => {
                Show({error: new Error(error), text: "Failed to connect."})
            });
            break;
        case "sqlite":
            db = await ConnectSQLITE(string_url).catch((error) => {
                Show({error: new Error(error), text: "Failed to connect."})
            });
            break;
        case "mongodb":
            db = await ConnectMongodb(string_url).catch((error) => {
                Show({error: new Error(error), text: "Failed to connect."})
            });
            break;
        default:
            Show({error: new Error("Invalid or Unsupported Database type."), text: "Failed to connect."});
            break;
    }

    dbInstance = db;
    return db;
}