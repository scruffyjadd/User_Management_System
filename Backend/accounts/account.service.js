const config = require('../config.json'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const sendEmail = require('../_helpers/send-email');
const db = require('../_helpers/db');
const Role = require('../_helpers/role');
const { param } = require('../_helpers/swagger');

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
    verifyEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({ where: { email } });

    console.log(`Login attempt for ${email}`);
    
    if (!account) {
        console.log(`Account not found for ${email}`);
        throw 'Email or password is incorrect';
    }

    console.log(`Account found, details:`);
    console.log(`- Email: ${account.email}`);
    console.log(`- Verified field: ${account.verified}`);
    console.log(`- PasswordReset field: ${account.passwordReset}`);
    console.log(`- isVerified computed value: ${account.isVerified}`);
    
    const verificationStatus = !!(account.verified || account.passwordReset);
    console.log(`- Verification check result: ${verificationStatus}`);
    
    if (!account.isVerified) {
        console.log(`Account ${email} is not verified`);
        throw 'Please verify your email before logging in';
    }
    
    const passwordValid = await bcrypt.compare(password, account.passwordHash);
    if (!passwordValid) {
        console.log(`Invalid password for ${email}`);
        throw 'Email or password is incorrect';
    }

    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    await refreshToken.save();

    console.log(`Successfully authenticated ${email}`);
    
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount();

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replaceByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();
    const jwtToken = generateJwtToken(account);
    return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: newRefreshToken.token
};
}

async function revokeToken({token, ipAddress}) {
    const refreshToken = await getRefreshToken(token);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    console.log('Starting registration for:', params.email);
    
    // Check if account already exists
    const existingAccount = await db.Account.findOne({ where: { email: params.email } });
    if (existingAccount) {
        console.log('Account already exists:', params.email);
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }
    
    // Create new account
    const account = new db.Account(params);
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();
    account.passwordHash = await hash(params.password);
    
    // For development, auto-verify but still send the email
    account.verified = new Date(Date.now());
    
    console.log('Saving account to database...');
    await account.save();
    console.log('Account saved successfully');
    
    // Send verification email
    try {
        console.log('Sending verification email to:', params.email);
        console.log('Origin:', origin);
        await sendVerificationEmail(account, origin);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Failed to send verification email:', error);
        // Continue with registration even if email fails
    }
    
    return { 
        message: 'Registration successful. Please check your email for verification instructions.',
        verificationSent: true
    };
}

async function verifyEmail({ token }) {
    console.log(`Starting verification with token: ${token}`);
    const account = await db.Account.findOne({ where: { verificationToken: token } });
    if (!account) {
        console.log(`Verification failed: No account found with token: ${token}`);
        throw 'Verification failed';
    }
    console.log(`Account found for verification: ${account.email}`);
    console.log(`Current account state: verified=${account.verified}, verificationToken=${account.verificationToken}`);
        account.verified = new Date();
    account.verificationToken = null;
    
    try {
        await account.save();
        console.log(`Account saved after verification: ${account.email}`);
        const verifiedAccount = await db.Account.findByPk(account.id);
        console.log(`Verified status after save: email=${verifiedAccount.email}, verified=${verifiedAccount.verified}, verificationToken=${verifiedAccount.verificationToken}`);
        console.log(`isVerified computation: ${verifiedAccount.isVerified}`);
        
        return true;
    } catch (error) {
        console.error(`Error saving account during verification: ${error.message}`);
        throw 'Verification failed due to database error';
    }
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });
    if (!account) {
        // Don't reveal that the email doesn't exist
        return { message: 'If your email is registered, you will receive a password reset link' };
    }
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();
    await sendPasswordResetEmail(account, origin);
    
    return { message: 'Please check your email for password reset instructions' };
}

 async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
    where: {
    resetToken: token,
    resetTokenExpires: { [Op.gt]: Date.now() }
    }
    });

    if (!account) throw 'Invalid token';

    return account;
 }

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function getAll() {
    const accounts = await db.Account.findAll();
    return accounts.map(x => basicDetails(x));
}

async function getById(id) {
    const account = await getAccount(id);
    return basicDetails(account);
}

async function create(params) {
    if (await db.Account.findOne({ where: { email: params.email } }) ) {
    throw 'Email " ' + params.email + ' " is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();
    account.passwordHash = await hash(params.password);
    await account.save();

    return basicDetails(account);
}

async function update(id, params) {
    const account = await getAccount(id);
    if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email }})) {
        throw 'Email "' + params.email + ' " is already taken';
    }
    if (params.password) {
        params.passwordHash = await hash(params.password);
    }
    Object.assign(account, params);
    account.updated = Date.now();
    await account.save();

    return basicDetails(account);
}

async function _delete(id) {
    const account = await getAccount(id);
    await account.destroy();
}
async function getAccount(id) {
    const account = await db.Account.findByPk(id); 
    if (!account) throw 'Account not found';
    return account;
}
async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}
async function hash(password) {
    return await bcrypt.hash(password, 10);
}
function generateJwtToken(account) {
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken (account, ipAddress) {
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp : ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified} = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified};
}

async function sendVerificationEmail(account, origin) {
    const message = `
        <h4>Verify Email</h4>
        <p>Thanks for registering!</p>
        <p>Please use the following verification token to verify your email address:</p>
        <p><strong>Verification Token:</strong></p>
        <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">
            ${account.verificationToken}
        </div>
        <p>Use this token in your application to verify your email address.</p>
    `;

    await sendEmail({
        to: account.email,
        subject: 'Verify Your Email Address',
        html: message
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
    message = `
    <p>If you don't know your password please visit the <a href="${origin}/account/forget-password">forget password</a> page.</p>`;
    } else {
    message = `
    <p>If you don't know your password you can reset it via the <code>/account/forget-passwords/code> api route.</p>`;
    }

    await sendEmail({
    to: email,
    subject: 'Sign-up Verification API - Email Already Registered',
    html: `<h4>Email Already Registered</h4>
           <h4>Your Email <strong>${email}</strong> is already registered.</p>
           ${message} `
    });
}

async function sendPasswordResetEmail(account, origin) {
    const message = `
        <h4>Reset Your Password</h4>
        <p>You requested to reset your password.</p>
        <p>Please use the following reset token to set a new password:</p>
        <p><strong>Reset Token:</strong></p>
        <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all;">
            ${account.resetToken}
        </div>
        <p>This token will expire in 24 hours.</p>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `;

    await sendEmail({
        to: account.email,
        subject: 'Password Reset Request',
        html: message
    });
}