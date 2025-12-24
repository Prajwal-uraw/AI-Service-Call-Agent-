/**
 * Email Templates for AI Demo Booking
 */

export interface DemoBookingData {
  customerName: string;
  customerEmail: string;
  bookingTime: Date;
  roomUrl: string;
  bookingId: string;
}

/**
 * Confirmation email when demo is booked
 */
export function getConfirmationEmailTemplate(data: DemoBookingData): {
  subject: string;
  html: string;
  text: string;
} {
  const formattedDate = data.bookingTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = data.bookingTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return {
    subject: '✅ Your AI Demo is Confirmed - Kestrel VoiceOps',
    
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                🎉 Demo Confirmed!
              </h1>
              <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Your AI-powered sales demo is scheduled
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi ${data.customerName},
              </p>
              
              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Great news! Your personalized AI demo with Kestrel VoiceOps is confirmed. Our AI presenter will walk you through how we help HVAC businesses capture every call and boost revenue.
              </p>

              <!-- Demo Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom: 15px;">
                          <p style="margin: 0; color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                            📅 Date & Time
                          </p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: 600;">
                            ${formattedDate}
                          </p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 18px; font-weight: 600;">
                            ${formattedTime}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 15px; border-top: 1px solid #e0e0e0;">
                          <p style="margin: 0; color: #666666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                            ⏱️ Duration
                          </p>
                          <p style="margin: 5px 0 0 0; color: #333333; font-size: 16px;">
                            15 minutes
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Join Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.roomUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      Join Demo Meeting →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What to Expect -->
              <div style="background-color: #f0f7ff; border-left: 4px solid #667eea; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">
                  What to Expect
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                  <li>Our AI presenter will greet you and guide the demo</li>
                  <li>See how we answer calls 24/7 with 200ms response time</li>
                  <li>Learn how we've helped HVAC companies recover $2M+ in revenue</li>
                  <li>Ask questions anytime - our AI is interactive!</li>
                  <li>Get a recording of the demo sent to you afterward</li>
                </ul>
              </div>

              <!-- Tips -->
              <div style="background-color: #fff9e6; border-left: 4px solid #ffc107; padding: 20px; margin-bottom: 30px; border-radius: 4px;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px; font-weight: 600;">
                  💡 Quick Tips
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                  <li>Join 2 minutes early to test your audio/video</li>
                  <li>Use headphones for best audio quality</li>
                  <li>Have your questions ready</li>
                  <li>No software download needed - works in browser</li>
                </ul>
              </div>

              <!-- Support -->
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Need to reschedule? Just reply to this email or visit our calendar.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                Kestrel VoiceOps - AI Phone System for HVAC
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                Booking ID: ${data.bookingId}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    
    text: `
Hi ${data.customerName},

Your AI demo with Kestrel VoiceOps is confirmed!

📅 Date: ${formattedDate}
⏰ Time: ${formattedTime}
⏱️ Duration: 15 minutes

Join here: ${data.roomUrl}

What to Expect:
- Our AI presenter will guide you through the demo
- See how we answer calls 24/7 with 200ms response time
- Learn how we've helped HVAC companies recover $2M+ in revenue
- Ask questions anytime - our AI is interactive!
- Get a recording sent to you afterward

Tips:
- Join 2 minutes early to test audio/video
- Use headphones for best quality
- No software download needed

Need to reschedule? Just reply to this email.

Booking ID: ${data.bookingId}

---
Kestrel VoiceOps - AI Phone System for HVAC
    `
  };
}

/**
 * Reminder email 15 minutes before demo
 */
export function getReminderEmailTemplate(data: DemoBookingData): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: '🔔 Your AI Demo Starts in 15 Minutes',
    
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demo Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                🔔 Demo Starting Soon!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 18px;">
                Hi ${data.customerName},
              </p>
              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px;">
                Your AI demo starts in <strong>15 minutes</strong>!
              </p>
              <a href="${data.roomUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                Join Now →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    
    text: `
Hi ${data.customerName},

Your AI demo starts in 15 minutes!

Join here: ${data.roomUrl}

See you soon!
    `
  };
}

/**
 * Post-demo email with recording
 */
export function getPostDemoEmailTemplate(data: DemoBookingData & { recordingUrl: string }): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: '🎬 Your Demo Recording is Ready',
    
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demo Recording</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">
                Thanks for Attending! 🎉
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px;">
                Hi ${data.customerName},
              </p>
              <p style="margin: 0 0 30px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                Thanks for joining our AI demo! Here's your recording so you can review it anytime or share with your team.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${data.recordingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      Watch Recording →
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 18px;">
                  Next Steps
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #555555; font-size: 15px; line-height: 1.8;">
                  <li>Review the recording with your team</li>
                  <li>Book an implementation call to get started</li>
                  <li>Questions? Reply to this email anytime</li>
                </ul>
              </div>
              <p style="margin: 0; color: #666666; font-size: 14px;">
                Ready to transform your phone system? Let's talk!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    
    text: `
Hi ${data.customerName},

Thanks for joining our AI demo!

Your recording is ready: ${data.recordingUrl}

Next Steps:
- Review the recording with your team
- Book an implementation call to get started
- Questions? Reply to this email anytime

Ready to transform your phone system? Let's talk!
    `
  };
}
