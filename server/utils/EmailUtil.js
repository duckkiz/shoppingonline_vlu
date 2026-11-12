// CLI: npm install nodemailer --save
const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS
  }
});

const EmailUtil = {
  isConfigured() {
    return Boolean(MyConstants.EMAIL_USER.trim() && MyConstants.EMAIL_PASS.trim());
  },

  async send(email, id, token) {
    if (!this.isConfigured()) {
      throw new Error('Email service credentials are not configured');
    }

    const text = 'Thanks for signing up, please input these informations to activate your account:\n\t .id: ' + id + '\n\t .token: ' + token;
    await transporter.sendMail({
      from: MyConstants.EMAIL_USER,
      to: email,
      subject: 'Signup | Verification',
      text: text
    });
    return true;
  }
};

module.exports = EmailUtil;