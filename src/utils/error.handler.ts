export interface ShowOptions {
    error?: Error | null;
    text?: string;
    ignore_env?: boolean;
}


/**
 * Displays a notification, alert, or status message to the user.
 * * @param {Object} [options] - Configuration options for the display.
 * @param {Error | null} [options.error=null] - An optional Error object if displaying a failure state.
 * @param {string} [options.text=""] - The text message content to be rendered.
 * * @example
 * // Basic usage
 * Show({ text: "Operation successful!" });
 * * @example
 * // Error handling usage
 * Show({ error: new Error("Network timeout"), text: "Failed to connect." });
 */
export default function Show(options: ShowOptions = { 
    error: null,
    text: "",
    ignore_env: false 
}): void {
    const ignore_env = options.ignore_env;
    const environment = process.env.ENVIRONMENT || "PROD";

    if(environment === 'PROD' && ( ignore_env === false || ignore_env === undefined)){
        return;
    }
    
    const text = options.text ?? "";
    const error = options.error ?? null;
    const currentTime = new Date(Date.now()).toLocaleString('en-US');

    if(error)
        return console.error(`[${currentTime}] : "${text}" \n ${error}`);

    return console.log(`[${currentTime}] : "${text}"`);
}