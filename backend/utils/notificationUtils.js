const nodemailer = require("nodemailer")

// ✅ UPDATED: Generate password using the specified formula
const generatePassword = (fullName, registerNumber) => {
  const firstName = fullName.split(" ")[0].toLowerCase()
  const last3Digits = registerNumber.slice(-3)
  const password = `${firstName}${last3Digits}`

  console.log(`🔑 Password generated for ${fullName}: ${password}`)
  return password
}

// Email configuration
const createEmailTransporter = () => {
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS

  if (!emailUser || !emailPass) {
    console.warn("⚠️ Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file")
    return null
  }

  return nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  })
}

// ✅ UPDATED: Enhanced approval email with login credentials
const sendApprovalEmail = async (email, name, password, courseName, organizationName) => {
  try {
    const transporter = createEmailTransporter()

    if (!transporter) {
      console.error("❌ Email transporter not configured")
      throw new Error("Email service not configured")
    }

    const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173"

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@internshipportal.com",
      to: email,
      subject: "✅ Your Internship Access Is Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
              <p style="color: #059669; font-size: 18px; font-weight: bold; margin: 10px 0;">
                Your Internship Access Is Approved!
              </p>
            </div>
            
            <!-- Welcome Message -->
            <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${name},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Your internship registration has been <strong style="color: #059669;">approved</strong>! 
              You can now access your registered course from the dashboard and begin your learning journey.
            </p>

            <!-- Login Credentials Box -->
            <div style="background-color: #f0f9ff; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 15px;">🔐 Your Login Credentials:</h3>
              <div style="background-color: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <p style="margin: 8px 0; color: #374151; font-size: 16px;">
                  <strong>Login ID:</strong> 
                  <span style="color: #2563eb; font-weight: bold;">${email}</span>
                </p>
                <p style="margin: 8px 0; color: #374151; font-size: 16px;">
                  <strong>Password:</strong> 
                  <code style="background-color: #f3f4f6; padding: 6px 12px; border-radius: 4px; font-family: monospace; color: #1f2937; font-size: 18px; font-weight: bold; border: 1px solid #d1d5db;">${password}</code>
                </p>
              </div>
            </div>

            <!-- Course Information -->
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
              <h4 style="color: #065f46; margin-top: 0; margin-bottom: 10px;">📚 Course Details:</h4>
              <p style="margin: 5px 0; color: #047857;"><strong>Organization:</strong> ${organizationName}</p>
              <p style="margin: 5px 0; color: #047857;"><strong>Course:</strong> ${courseName}</p>
              <p style="margin: 5px 0; color: #047857;"><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">UNLOCKED & READY</span></p>
            </div>

            <!-- Login Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}/login" 
                 style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);">
                🚀 Login to Dashboard
              </a>
            </div>

            <!-- Security Notice -->
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>🔒 Security Notice:</strong> For your account security, please log in and change your password after your first login. Keep your credentials secure and do not share them with anyone.
              </p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #1e40af; margin-top: 0; margin-bottom: 10px;">📋 Next Steps:</h4>
              <ol style="color: #1e40af; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Click the login button above or visit our portal</li>
                <li>Use your email and the provided password to log in</li>
                <li>Complete your profile setup</li>
                <li>Access your unlocked course materials</li>
                <li>Start your internship journey!</li>
              </ol>
            </div>

            <!-- Support Information -->
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin-top: 0; margin-bottom: 10px;">📞 Need Help?</h4>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Email: support@internshipportal.com</p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Phone: +1 (555) 123-4567</p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Hours: Monday - Friday, 9:00 AM - 6:00 PM</p>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 25px 0;">
              Welcome to the Remote Internship Portal! We're excited to have you on board and look forward to supporting you throughout your internship journey.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>The Internship Team</strong>
            </p>
            
            <!-- Footer -->
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                This is an automated message from the Remote Internship Portal. Please do not reply to this email.
                <br>© 2024 Remote Internship Portal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Approval email with login credentials sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send approval email to ${email}:`, error)
    throw error
  }
}

// Send rejection email
const sendRejectionEmail = async (email, name, reason = "Application did not meet requirements") => {
  try {
    const transporter = createEmailTransporter()

    const mailOptions = {
      from: process.env.EMAIL_USER || "noreply@internshipportal.com",
      to: email,
      subject: "Update on Your Internship Application",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 28px;">Application Update</h1>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${name},</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in our Remote Internship Portal. After careful review, 
              we regret to inform you that your application has not been approved at this time.
            </p>
            
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>Reason:</strong> ${reason}
              </p>
            </div>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We encourage you to continue developing your skills and consider applying again in the future.
            </p>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Best regards,<br>
              <strong>The Internship Team</strong>
            </p>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                This is an automated message from the Remote Internship Portal.
              </p>
            </div>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Rejection email sent to ${email}`)
  } catch (error) {
    console.error(`❌ Failed to send rejection email to ${email}:`, error)
    throw error
  }
}

module.exports = {
  generatePassword,
  sendApprovalEmail,
  sendRejectionEmail,
}
