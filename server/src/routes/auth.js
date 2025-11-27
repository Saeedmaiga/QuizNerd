const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { authenticateRequest } = require('../middleware/auth');

// Helper to find user by ID (supports both MongoDB _id and auth0Sub)
const findUserById = async (userId) => {
  if (!userId) return null;
  
  // Try MongoDB ObjectId first
  if (mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId);
    if (user) return user;
  }
  
  // Try auth0Sub (for backward compatibility)
  return await User.findOne({ auth0Sub: userId });
};

// Configure email transporter (you'll need to set up email service)
const getEmailTransporter = () => {
  // For development, you can use a service like Gmail, SendGrid, or Mailtrap
  // Set these in your .env file:
  // EMAIL_HOST=smtp.gmail.com
  // EMAIL_PORT=587
  // EMAIL_USER=your-email@gmail.com
  // EMAIL_PASS=your-app-password
  
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Return null if email not configured (for development)
  return null;
};

// Check email verification status
router.get('/verification-status/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      emailVerified: user.emailVerified || false,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
});

// Request verification email
router.post('/request-verification', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.userId; // From middleware
    
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    if (!user.email) {
      return res.status(400).json({ error: 'User email not found' });
    }
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours
    
    user.emailVerificationToken = token;
    user.emailVerificationExpires = expires;
    await user.save();
    
    // Send verification email
    const transporter = getEmailTransporter();
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${CLIENT_URL}/verify-email?token=${token}`;
    
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'Verify Your Email - QuizNerds',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #9333ea;">Email Verification</h2>
              <p>Hello ${user.name || user.username},</p>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
              <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
              <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Still return success but log the error
        // In production, you might want to use a queue system
      }
    } else {
      // Email not configured - return token for development
      console.log('Email not configured. Verification token:', token);
      console.log('Verification URL:', verificationUrl);
    }
    
    res.json({
      message: 'Verification email sent. Please check your inbox.',
      // Only include token in development if email not configured
      ...(transporter ? {} : { token, verificationUrl }),
    });
  } catch (error) {
    next(error);
  }
});

// Verify email with token (GET route for email links)
router.get('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Invalid Verification Link</h2>
            <p>No verification token provided.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Go to QuizNerds</a>
          </body>
        </html>
      `);
    }
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }, // Token not expired
    });
    
    if (!user) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2>Invalid or Expired Token</h2>
            <p>The verification link is invalid or has expired. Please request a new verification email.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Go to QuizNerds</a>
          </body>
        </html>
      `);
    }
    
    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();
    
    // Redirect to success page
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${CLIENT_URL}/verification-success`);
  } catch (error) {
    next(error);
  }
});

// Verify email with token (POST route for API calls)
router.post('/verify-email-token', async (req, res, next) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }, // Token not expired
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();
    
    res.json({
      message: 'Email verified successfully',
      emailVerified: true,
    });
  } catch (error) {
    next(error);
  }
});

// Sync email verification status (for manual updates)
router.post('/sync-verification', authenticateRequest, async (req, res, next) => {
  try {
    const userId = req.userId; // From middleware
    const { emailVerified } = req.body;
    
    const user = await findUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (emailVerified !== undefined) {
      user.emailVerified = emailVerified;
      await user.save();
    }
    
    res.json({
      message: 'Verification status synced',
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

