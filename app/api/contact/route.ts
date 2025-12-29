import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const token = getTokenFromRequest(request)
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = verifyToken(token)
        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()
        const { name, email, phone, queryType, message } = body

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            )
        }

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Contact Form Submission${queryType ? ` - ${queryType}` : ''}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4ecca3; border-bottom: 2px solid #4ecca3; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
            ${queryType ? `<p><strong>Query Type:</strong> ${queryType}</p>` : ''}
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333;">Message:</h3>
            <p style="white-space: pre-wrap; background: #fff; padding: 15px; border-left: 4px solid #4ecca3; border-radius: 4px;">
              ${message}
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This email was sent from MeraAi Contact Form</p>
            <p>Sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
        }

        // Send email
        await transporter.sendMail(mailOptions)

        return NextResponse.json({
            success: true,
            message: 'Your message has been sent successfully!',
        })
    } catch (error: any) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Failed to send message. Please try again later.' },
            { status: 500 }
        )
    }
}
