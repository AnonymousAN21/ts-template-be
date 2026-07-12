import mongoose from 'mongoose';
import Show from '../../../utils/error.handler.js';
import './schema/index.js'
export default async function ConnectMongodb(string_url: string): Promise<void> {
    mongoose.connection.on('error', (error) => {
        Show({ text: 'MongoDB disconnected or encountered a runtime error', error });
    });

    mongoose.connection.once('open', () => {
        Show({ text: 'MongoDB cluster connection established successfully.' });
    });

    mongoose.connect(string_url).catch((error) => {
        Show({ text: "Failed to establish initial connection to MongoDB", error });
    });

    
}