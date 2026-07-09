const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // Generate a test account for Ethereal (mock SMTP)
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
}

async function sendWelcomeEmail(email, username) {
  try {
    const tp = await getTransporter();
    const info = await tp.sendMail({
      from: '"Patch Notifier" <noreply@patchnotifier.local>',
      to: email,
      subject: 'Welcome to Patch Notifier! 🎮',
      text: `Hello ${username},\n\nWelcome to Patch Notifier! You can now manage your Discord webhooks and subscribe to game updates.`,
      html: `<h2>Welcome to Patch Notifier! 🎮</h2><p>Hello <b>${username}</b>,</p><p>Welcome to Patch Notifier! You can now manage your Discord webhooks and subscribe to game updates.</p>`,
    });
    
    console.log('[Email] Welcome email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (err) {
    console.error('[Email] Error sending welcome email:', err);
    return false;
  }
}

async function sendPasswordResetEmail(email, token) {
  try {
    const tp = await getTransporter();
    // Assuming the app runs on localhost:3000
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    
    const info = await tp.sendMail({
      from: '"Patch Notifier" <noreply@patchnotifier.local>',
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click here to reset your password: ${resetLink}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>You requested a password reset.</p><p><a href="${resetLink}">Click here to reset your password</a></p><p>If you did not request this, please ignore this email.</p>`,
    });
    
    console.log('[Email] Password reset email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return true;
  } catch (err) {
    console.error('[Email] Error sending reset email:', err);
    return false;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
