require('dotenv').config();
const { sendEmail } = require('../utils/emailService');

const testEmail = async () => {
  console.log('📧 Testing Email Configuration...\n');
  
  console.log('Current Email Settings:');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'Not set');
  console.log('EMAIL_FROM_NAME:', process.env.EMAIL_FROM_NAME);
  console.log('\n---\n');

  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
    console.error('❌ EMAIL_USER is not configured in .env file');
    console.log('\n📝 To configure email:');
    console.log('1. Open backend/.env file');
    console.log('2. Update EMAIL_USER with your Gmail address');
    console.log('3. Update EMAIL_PASS with your Gmail App Password');
    console.log('\n🔐 To get Gmail App Password:');
    console.log('   - Enable 2FA: https://myaccount.google.com/security');
    console.log('   - Generate App Password: https://myaccount.google.com/apppasswords');
    process.exit(1);
  }

  try {
    const testEmailData = {
      email: process.env.EMAIL_USER, // Send test email to yourself
      subject: 'Test Email - Travel Tour System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
          <p>Congratulations! Your email service is working correctly.</p>
          <p>This is a test email sent from your Travel Tour Management System.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <p><strong>Host:</strong> ${process.env.EMAIL_HOST}</p>
            <p><strong>Port:</strong> ${process.env.EMAIL_PORT}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_FROM_NAME}</p>
            <p><strong>User:</strong> ${process.env.EMAIL_USER}</p>
          </div>
          <p>Your booking confirmation emails will now be sent successfully!</p>
          <p style="color: #22c55e;">✅ Email service is ready to use!</p>
        </div>
      `
    };

    await sendEmail(testEmailData);
    console.log('\n✅ Test email sent successfully!');
    console.log('📬 Check your inbox:', process.env.EMAIL_USER);
    console.log('\n🎉 Email configuration is working correctly!');
    console.log('💡 Booking confirmation emails will now be sent to users automatically.');
    
  } catch (error) {
    console.error('\n❌ Test email failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Authentication Error - Common Solutions:');
      console.log('   1. Make sure you are using an App Password, not your regular Gmail password');
      console.log('   2. Enable 2-Factor Authentication on your Google account');
      console.log('   3. Generate a new App Password: https://myaccount.google.com/apppasswords');
      console.log('   4. Update EMAIL_PASS in backend/.env with the 16-digit app password');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Connection Error - Check:');
      console.log('   1. Your internet connection');
      console.log('   2. Firewall settings allowing SMTP connections');
    }
    
    process.exit(1);
  }
};

testEmail();
