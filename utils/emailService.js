const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
    try {
        await sgMail.send({
            from: process.env.EMAIL_USER, // Must be verified in SendGrid
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        console.error('SendGrid Error:', error.response?.body || error);
        throw error;
    }
};

module.exports = { sendEmail };