import { Resend } from "resend";
import { buildImportantEmail, buildNotificationEmail, buildAnnouncementEmail } from "../utils/email.templates.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = "http://localhost:5000/v1/auth/email-verify"
class AuthEmailAuthentication{
    constructor(){}

    public send_code = async (userEmail: string, token: string) => {
        const verificationUrl = `${domain}?token=${token}`;

        const HTMLContent = buildImportantEmail({
            title: "Verification code for email",
            message: "You're almost there! We just need to verify your email address to secure your account",
            ctaText: "Verify My Email",
            ctaLink: verificationUrl
        });

        try{
            const {data, error} = await resend.emails.send({
                from: "ISCO Center <noreply@isco.biz.id>",
                to: userEmail,
                subject: "Verify your Email",
                html: HTMLContent
            });

            if (error)
                return false;

            return true;
        }catch(error){
            return false;
        }
    }
}

const AuthEmailSender = new AuthEmailAuthentication();

export default AuthEmailSender;