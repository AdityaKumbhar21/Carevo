let resend = null;
let RESEND_AVAILABLE = false;
try {
  // Try to require Resend and initialize if API key present.
  const { Resend } = require('resend');
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    RESEND_AVAILABLE = true;
  } else {
    console.warn('RESEND_API_KEY not set; emails will be logged to console in non-production.');
  }
} catch (err) {
  // If the package isn't installed or initialization failed, fall back.
  console.warn('Resend package not available or failed to initialize:', err && err.message);
}

// Ensure we have a sensible `from` address. Resend requires a `from` field.
// If the environment variable isn't set, fall back to a no-reply Carevo address.
const DEFAULT_FROM = process.env.EMAIL_FROM || `Carevo <no-reply@${process.env.DOMAIN || 'carevo.app'}>`;
const sendEmail = async ({ to, subject, html, text }) => {
  if (RESEND_AVAILABLE && resend) {
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
  }

  // Development fallback: log email contents and resolve a mock response.
  console.info('EMAIL (dev fallback) ->', { to, subject });
  if (process.env.NODE_ENV !== 'production') {
    console.info('EMAIL HTML PREVIEW:', html ? html.slice(0, 500) : text);
  }

  return { ok: true, fallback: true, to, subject };
};




const sendVerificationEmail = async (email, verifyUrl, otp = null) => {
  const subject = 'Confirm your Carevo account — verify your email';
  const otpText = otp ? `\n\nYour verification code: ${otp} (expires in 10 minutes)` : '';
  const linkText = verifyUrl ? `\n\nOpen this page to enter the code:\n${verifyUrl}` : '';
  const text = `Thanks for creating a Carevo account!\n\n` +
    `Use the code below to verify your account.${otpText}${linkText}\n\n` +
    `If you did not create an account, you can safely ignore this message.`;

  const otpHtmlBlock = otp ? `
        <div style="margin:18px 0;text-align:center;padding:14px;background:rgba(255,255,255,0.03);border-radius:8px;">
          <div style="font-size:18px;color:#fff;font-weight:800;letter-spacing:2px">${otp}</div>
          <div style="font-size:12px;color:#9fb0d6;margin-top:6px">Enter this code on the verification page (expires in 10 minutes)</div>
        </div>
  ` : '';

  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Helvetica Neue', Arial; padding:24px; color:#0f172a;">
      <div style="max-width:600px;margin:0 auto;background:#0f172a;color:#e6eef8;padding:28px;border-radius:12px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <div style="width:44px;height:44px;border-radius:8px;background:linear-gradient(135deg,#8c5bf5,#4f46e5);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;">C</div>
          <div>
            <strong style="font-size:16px">Carevo</strong>
            <div style="font-size:12px;color:#9fb0d6;margin-top:2px">AI Career Intelligence</div>
          </div>
        </div>

        <h2 style="margin:0 0 12px;color:#fff">Verify your email</h2>
        <p style="color:#b8cef0;margin:0 0 18px;line-height:1.45">Thanks for signing up — use the code below to verify your email. The code expires in 10 minutes.</p>

        ${verifyUrl ? `
        <div style="text-align:center;margin:22px 0">
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 22px;background:linear-gradient(90deg,#8c5bf5,#4f46e5);color:white;text-decoration:none;border-radius:10px;font-weight:700;">Open verification page</a>
        </div>

        <p style="color:#9fb0d6;font-size:13px;margin:0 0 8px;">If the button doesn't work, open this page in your browser:</p>
        <p style="color:#acc6ec;font-size:12px;word-break:break-all">${verifyUrl}</p>
        ` : ''}

        ${otpHtmlBlock}

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.04);margin:18px 0" />
        <p style="font-size:12px;color:#7f9fc9;margin:0">Need help? Reply to this email or contact <a href="mailto:support@${process.env.DOMAIN || 'carevo.app'}" style="color:#8c5bf5">support@${process.env.DOMAIN || 'carevo.app'}</a></p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};



const sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Carevo password reset request';
  const text = `We received a request to reset your Carevo password. Open the link below to choose a new password:\n\n${resetUrl}\n\nIf you did not request a password reset, you can ignore this message.`;

  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Helvetica Neue', Arial; padding:24px; color:#0f172a;">
      <div style="max-width:600px;margin:0 auto;background:#0f172a;color:#e6eef8;padding:28px;border-radius:12px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;">
          <div style="width:44px;height:44px;border-radius:8px;background:#f97373;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;">P</div>
          <div>
            <strong style="font-size:16px">Carevo</strong>
            <div style="font-size:12px;color:#9fb0d6;margin-top:2px">Password assistance</div>
          </div>
        </div>

        <h2 style="margin:0 0 12px;color:#fff">Reset your password</h2>
        <p style="color:#b8cef0;margin:0 0 18px;line-height:1.45">Click the button below to choose a new password. This link will expire in one hour.</p>

        <div style="text-align:center;margin:22px 0">
          <a href="${resetUrl}" style="display:inline-block;padding:12px 22px;background:#ef4444;color:white;text-decoration:none;border-radius:10px;font-weight:700;">Reset Password</a>
        </div>

        <p style="color:#9fb0d6;font-size:13px;margin:0 0 8px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color:#acc6ec;font-size:12px;word-break:break-all">${resetUrl}</p>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.04);margin:18px 0" />
        <p style="font-size:12px;color:#7f9fc9;margin:0">If you didn't request this, please ignore. For help contact <a href="mailto:support@${process.env.DOMAIN || 'carevo.app'}" style="color:#8c5bf5">support@${process.env.DOMAIN || 'carevo.app'}</a></p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
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

const sendOtpEmail = async (email, otp) => {
  const subject = 'Your Carevo verification code';
  const text = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
  const html = `
    <div style="font-family: Inter, system-ui, -apple-system, 'Helvetica Neue', Arial; padding:24px; background:#0f172a;color:#e6eef8;">
      <div style="max-width:600px;margin:0 auto;padding:28px;border-radius:12px;">
        <h2 style="margin:0 0 12px;color:#fff">Your Carevo verification code</h2>
        <p style="color:#b8cef0">Use the code below to verify your email. It expires in 10 minutes.</p>
        <div style="margin:18px 0;text-align:center;font-size:22px;font-weight:700;color:#fff;">
          ${otp}
        </div>
        <p style="color:#9fb0d6">If you did not request this, you can ignore this message.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject, text, html });
};

module.exports.sendOtpEmail = sendOtpEmail;