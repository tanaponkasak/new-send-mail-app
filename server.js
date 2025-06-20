require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('❌ Missing SMTP config in .env');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((err) => {
  if (err) {
    console.error('❌ SMTP Error:', err);
  } else {
    console.log('✅ SMTP Ready');
  }
});

app.post('/api/send-email-with-attachment', async (req, res) => {
  const { recipientEmail, subject, body, attachment, attachmentFileName } = req.body;

  if (!recipientEmail || !subject || !body) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject,
    html: body,
    attachments: [],
  };

  if (attachment && attachmentFileName) {
    mailOptions.attachments.push({
      filename: attachmentFileName,
      content: Buffer.from(attachment, 'base64'),
      encoding: 'base64',
    });
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📤 Email sent:', info.messageId);
    res.status(200).json({ success: true, message: 'Email sent!', messageId: info.messageId });
  } catch (error) {
    console.error('❌ Send error:', error);
    res.status(500).json({ success: false, message: 'Send failed', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
