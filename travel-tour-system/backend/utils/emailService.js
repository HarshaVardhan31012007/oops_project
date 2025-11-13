const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (options) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || 
        process.env.EMAIL_USER === 'your-email@gmail.com' || 
        process.env.EMAIL_PASS === 'your-16-digit-app-password') {
      console.warn('⚠️  Email service not configured. Please update EMAIL_USER and EMAIL_PASS in .env file.');
      console.warn('📧 Email would have been sent to:', options.email);
      console.warn('📝 Subject:', options.subject);
      return { messageId: 'mock-' + Date.now() };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Travel Tour System'} <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    console.log('📧 To:', options.email);
    console.log('📝 Subject:', options.subject);
    return info;
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check your EMAIL_USER and EMAIL_PASS in .env');
    }
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Travel Tour System!</h2>
      <p>Hello ${user.name},</p>
      <p>Thank you for joining our travel community! We're excited to help you discover amazing destinations and create unforgettable memories.</p>
      <p>Your account has been successfully created. You can now:</p>
      <ul>
        <li>Browse our curated tour packages</li>
        <li>Create custom itineraries</li>
        <li>Book tours and make secure payments</li>
        <li>Earn reward points with every booking</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Happy travels!</p>
      <p>The Travel Tour Team</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Welcome to Travel Tour System!',
    html
  });
};

const sendEmailVerification = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Verify Your Email Address</h2>
      <p>Hello ${user.name},</p>
      <p>Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Verify Your Email Address',
    html
  });
};

const sendPasswordReset = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Reset Your Password</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    email: user.email,
    subject: 'Reset Your Password',
    html
  });
};

const sendBookingConfirmation = async (booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Booking Confirmation</h2>
      <p>Hello ${booking.user.name},</p>
      <p>Your booking has been confirmed! Here are the details:</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Booking Details</h3>
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Tour:</strong> ${booking.tourPackage.title}</p>
        <p><strong>Destination:</strong> ${booking.tourPackage.destination}</p>
        <p><strong>Travel Dates:</strong> ${new Date(booking.travelDates.startDate).toLocaleDateString()} - ${new Date(booking.travelDates.endDate).toLocaleDateString()}</p>
        <p><strong>Travelers:</strong> ${booking.travelers.length}</p>
        <p><strong>Total Amount:</strong> ${booking.pricing.currency} ${booking.pricing.totalAmount}</p>
      </div>
      
      <p>We'll send you more details about your tour closer to the departure date.</p>
      <p>If you have any questions, please contact our support team.</p>
      <p>Happy travels!</p>
      <p>The Travel Tour Team</p>
    </div>
  `;

  return sendEmail({
    email: booking.user.email,
    subject: `Booking Confirmation - ${booking.bookingReference}`,
    html
  });
};

const sendBookingCancellation = async (booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Booking Cancelled</h2>
      <p>Hello ${booking.user.name},</p>
      <p>Your booking has been cancelled. Here are the details:</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3>Cancellation Details</h3>
        <p><strong>Booking Reference:</strong> ${booking.bookingReference}</p>
        <p><strong>Tour:</strong> ${booking.tourPackage.title}</p>
        <p><strong>Refund Amount:</strong> ${booking.pricing.currency} ${booking.refundAmount || 0}</p>
        <p><strong>Cancellation Date:</strong> ${new Date(booking.cancellationDate).toLocaleDateString()}</p>
      </div>
      
      <p>If you have any questions about the refund process, please contact our support team.</p>
      <p>We hope to serve you again in the future!</p>
      <p>The Travel Tour Team</p>
    </div>
  `;

  return sendEmail({
    email: booking.user.email,
    subject: `Booking Cancelled - ${booking.bookingReference}`,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordReset,
  sendBookingConfirmation,
  sendBookingCancellation
};
