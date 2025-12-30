const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    // Safety check: Ensure the sender email is defined
    if (!process.env.EMAIL_USER) {
        console.error("❌ ERROR: process.env.EMAIL_USER is missing.");
        return;
    }

    try {
        await sgMail.send({
            from: {
                name: 'Shawarma Fahman',
                email: process.env.EMAIL_USER // 👈 FIX: Must be 'email', not 'address'
            },
            to,
            subject,
            html,
        });
        console.log(`✅ Email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ SendGrid Error:', error.response?.body || error);
        // We do NOT throw error here so it doesn't crash the server if email fails
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };