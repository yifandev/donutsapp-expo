import { PrismaClient } from "@/prisma/generated/client";
import { expo } from "@better-auth/expo";
import { withAccelerate } from "@prisma/extension-accelerate";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import nodemailer from "nodemailer";

// Konfigurasi Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const prisma = new PrismaClient().$extends(withAccelerate());

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        nullable: true,
        input: true,
      },
      role: {
        type: "string",
        required: false,
        input: false,
        nullable: true,
      },
    } as const,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    expo(),
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        try {
          const mailOptions = {
            from: `"Donuts" <${process.env.EMAIL_FROM || "noreply@donuts.com"}>`,
            to: email,
            subject: "Donuts - Verifikasi Email Kamu",
            html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #FF6B6B;">Donuts 🍩</h1>
                    <h2>Verifikasi Email Anda</h2>
                    <p>Halo! Terima kasih telah bergabung dengan Donuts.</p>
                    <p>Kode verifikasi Anda adalah:</p>
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; margin: 20px 0; border-radius: 10px;">
                      ${otp}
                    </div>
                    <p>Kode ini berlaku selama 10 menit.</p>
                    <p>Jika Anda tidak meminta kode ini, abaikan email ini.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #888; font-size: 12px;">&copy; ${new Date().getFullYear()} Donuts. All rights reserved.</p>
                  </div>
                `,
            text: `Kode verifikasi Donuts Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`,
          };

          await transporter.sendMail(mailOptions);
          console.log(`OTP email sent to ${email}`);
        } catch (error) {
          console.error("Failed to send OTP email:", error);
          throw error;
        }
      },
      otpLength: 4,
      expiresIn: 10 * 60, // 10 minutes
    }),
  ],

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:8081",
    "exp://localhost:8081",
    "exp://192.168.100.3:8081",
    "exp://*",
    "donuts://",
  ],

  // Tambahkan session configuration untuk menyimpan email
  session: {
    updateAge: 24 * 60 * 60, // 24 hours
  },
});
