const nodemailer = require('nodemailer');
const config = require('config.json');

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
    console.log('\n--- Sending Email ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Using SMTP host:', config.smtpOptions.host);

    try {
        let transporter;
        
        // For Ethereal email in development
        if (config.smtpOptions.host.includes('ethereal.email')) {
            console.log('Using Ethereal email from config:', config.smtpOptions.auth.user);
            
            // Create reusable transporter object using the config credentials
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: config.smtpOptions.auth.user,
                    pass: config.smtpOptions.auth.pass
                },
                tls: {
                    rejectUnauthorized: false
                },
                debug: true,
                logger: true
            });
            
            // Update the from address to use the configured email
            from = `"Test User" <${config.smtpOptions.auth.user}>`;
        } else {
            // Production SMTP configuration
            transporter = nodemailer.createTransport({
                ...config.smtpOptions,
                secure: config.smtpOptions.secure || false,
                tls: {
                    rejectUnauthorized: false
                },
                debug: true,
                logger: true
            });
        }

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from,
            to,
            subject: subject,
            html,
            // Attachments if needed
            // attachments: [{
            //     filename: 'logo.png',
            //     path: __dirname + '/logo.png',
            //     cid: 'unique@nodemailer.com'
            // }]
        });

        // Log the result
        console.log('Message sent: %s', info.messageId);
        
        // Preview only available when sending through an Ethereal account
        if (config.smtpOptions.host.includes('ethereal.email')) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log('Preview URL: %s', previewUrl);
            console.log('Ethereal account:', config.smtpOptions.auth.user);
        }
        
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SMTP Error Response:', error.response);
        }
        throw error;
    }
}