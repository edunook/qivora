import nodemailer from 'nodemailer'

export const sendEmail = async (options: { email: string; subject: string; html: string }) => {
  // Create transporter using Gmail or any SMTP
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: `"Qivora" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  }

  await transporter.sendMail(mailOptions)
}
