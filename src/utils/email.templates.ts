// src/utils/email.templates.ts

type EmailOptions = {
    title: string;
    message: string;
    ctaText?: string;
    ctaLink?: string;
    code?: string; // For verification codes
};

/**
 * THE BASE WRAPPER
 * This ensures your background, container, and footer are always 100% consistent.
 */
const baseLayout = (headerColor: string, icon: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #333333;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        
        <tr>
            <td style="background-color: ${headerColor}; padding: 30px; text-align: center; font-size: 48px;">
                ${icon}
            </td>
        </tr>

        <tr>
            <td style="padding: 40px 30px;">
                ${content}
            </td>
        </tr>

        <tr>
            <td style="background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eaeaea; font-size: 12px; color: #888888;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} ISCO Platform. All rights reserved.</p>
                <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
            </td>
        </tr>
    </table>
</body>
</html>
`;

/**
 * 1. NOTIFICATION TEMPLATE (Blue)
 * Best for: "Your profile was updated", "You have a new message", "Task assigned"
 */
export const buildNotificationEmail = ({ title, message, ctaText, ctaLink }: EmailOptions) => {
    let buttonHtml = "";
    if (ctaText && ctaLink) {
        buttonHtml = `
        <div style="margin-top: 30px;">
            <a href="${ctaLink}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                ${ctaText}
            </a>
        </div>`;
    }

    const content = `
        <h2 style="margin: 0 0 15px 0; color: #1e293b; font-size: 24px;">${title}</h2>
        <p style="margin: 0; line-height: 1.6; color: #475569; font-size: 16px;">${message}</p>
        ${buttonHtml}
    `;

    return baseLayout("#eff6ff", "🔔", content); // Soft Blue Header
};

/**
 * 2. ANNOUNCEMENT TEMPLATE (Purple/Vibrant)
 * Best for: "Welcome to the platform", "New feature released", "System maintenance"
 */
export const buildAnnouncementEmail = ({ title, message, ctaText, ctaLink }: EmailOptions) => {
    let buttonHtml = "";
    if (ctaText && ctaLink) {
        buttonHtml = `
        <div style="text-align: center; margin-top: 35px;">
            <a href="${ctaLink}" style="display: inline-block; padding: 14px 28px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                ${ctaText}
            </a>
        </div>`;
    }

    const content = `
        <div style="text-align: center;">
            <h2 style="margin: 0 0 15px 0; color: #4c1d95; font-size: 26px;">${title}</h2>
            <p style="margin: 0; line-height: 1.6; color: #475569; font-size: 16px;">${message}</p>
            ${buttonHtml}
        </div>
    `;

    return baseLayout("#f5f3ff", "🚀", content); // Soft Purple Header
};

/**
 * 3. IMPORTANT / SECURITY TEMPLATE (Red/High Contrast)
 * Best for: Email verification, Password resets, Suspicious login alerts
 */
export const buildImportantEmail = ({ title, message, code, ctaText, ctaLink }: EmailOptions) => {
    let actionHtml = "";
    
    // If it's a code-based email (like your verification)
    if (code) {
        actionHtml = `
        <div style="margin-top: 25px; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
            <span style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</span>
            <div style="font-size: 32px; font-weight: bold; color: #0f172a; margin-top: 10px; letter-spacing: 4px;">
                ${code}
            </div>
        </div>`;
    } 
    // If it's a button-based security action
    else if (ctaText && ctaLink) {
        actionHtml = `
        <div style="margin-top: 30px;">
            <a href="${ctaLink}" style="display: inline-block; padding: 12px 24px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">
                ${ctaText}
            </a>
        </div>`;
    }

    const content = `
        <h2 style="margin: 0 0 15px 0; color: #b91c1c; font-size: 24px; border-bottom: 2px solid #fee2e2; padding-bottom: 10px;">
            ${title}
        </h2>
        <p style="margin: 0; line-height: 1.6; color: #334155; font-size: 16px;">${message}</p>
        ${actionHtml}
        <p style="margin-top: 25px; font-size: 13px; color: #94a3b8;">
            If you did not request this, please ignore this email or contact support immediately.
        </p>
    `;

    return baseLayout("#fef2f2", "🛡️", content); // Soft Red Header
};