const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

const DEFAULT_FROM = process.env.EMAIL_FROM;
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const response = await resend.emails.send({
      from: DEFAULT_FROM,
      to,
      subject,
      html,
      text,
    });

    return response;
  } catch (error) {
    console.error('Resend email error:', error);
    throw new Error('Email sending failed');
  }
};




const sendVerificationEmail = async (email, verifyUrl) => {
  return sendEmail({
    to: email,
    subject: 'Verify Your Email',
    text: `Click to verify your email: ${verifyUrl}`,
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Please click the button below to verify your email:</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:10px 20px;background:#4CAF50;color:white;text-decoration:none;border-radius:5px;">
           Verify Email
        </a>
      </div>
    `,
  });
};



const sendPasswordResetEmail = async (email, resetUrl) => {
  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    text: `Click to reset your password: ${resetUrl}`,
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}"
           style="display:inline-block;padding:10px 20px;background:#f44336;color:white;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>
      </div>
    `,
  });
};



const sendDailyReminderEmail = async (email, taskCount) => {
  return sendEmail({
    to: email,
    subject: 'Daily Task Reminder 🚀',
    text: `You have ${taskCount} incomplete tasks today.`,
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Stay Consistent 🚀</h2>
        <p>You have <strong>${taskCount}</strong> incomplete task(s) today.</p>
        <p>Consistency builds mastery. Keep going!</p>
      </div>
    `,
  });
};



const sendMilestoneEmail = async (email, milestoneText) => {
  return sendEmail({
    to: email,
    subject: 'Milestone Achieved 🎉',
    text: milestoneText,
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Congratulations 🎉</h2>
        <p>${milestoneText}</p>
      </div>
    `,
  });
};



module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendDailyReminderEmail,
  sendMilestoneEmail,
};