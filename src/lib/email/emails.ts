/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createTransport } from "nodemailer";
import { env } from "process";

const transporter = createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: Number(env.EMAIL_SERVER_PORT) || 0,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendRegistrationEmail(emailTo: string, password: string) {
  await transporter.sendMail({
    from: `"SOC Loan System" <${env.EMAIL_FROM}>`,
    to: emailTo, // list of receivers
    subject: "SOC Loan System Password", // Subject line
    html: `<body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 700px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style=" text-align: center;">Your Password from <span style="color: #1C6C91;">SOC Loan System</span></h1>
        <p style="margin-bottom: 20px; margin-top: 40px; font-size: 20px;">Dear User,</p>
        <p style="margin-bottom: 40px; font-size: 20px;">Your password for accessing the SOC Loan System is: <strong>${password}</strong><br>We recommend keeping your password secure and not sharing it with anyone.<br>If you have any questions or need further assistance, feel free to contact our support team.</p>
        <div style="margin-top: 20px; text-align: center; color: #999999;">
            <p>This email was sent by SOC Loan System. Please do not reply to this email.</p>
        </div>
    </div>
</body>`,
  });
}

export async function sendPasswordResetEmail(emailTo: string, link: string) {
  await transporter.sendMail({
    from: `"SOC Loan System" <${env.EMAIL_FROM}>`,
    to: emailTo,
    subject: "SOC Loan System Reset Password",
    html: `<body style="font-family: Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0;">
    <div style="width: 100%; max-width: 700px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="text-align: center;">Password Reset Request from <span style="color: #1C6C91;">SOC Loan System</span></h1>
        <p style="margin-bottom: 20px; margin-top: 40px; font-size: 20px;">Dear User,</p>
        <p style="margin-bottom: 40px; font-size: 20px;">We received a request to reset your password for the SOC Loan System. Please click the link below to reset your password:</p>
        <p style="margin-bottom: 40px; font-size: 20px; text-align: center;">
            <a href="${link}" style="color: #1C6C91; text-decoration: none;">Reset Password</a>
        </p>
        <p style="margin-bottom: 40px; font-size: 20px;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <div style="margin-top: 20px; text-align: center; color: #999999;">
            <p>This email was sent by SOC Loan System. Please do not reply to this email.</p>
        </div>
    </div>
</body>`,
  });
}
