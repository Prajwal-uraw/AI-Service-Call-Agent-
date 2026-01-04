"""
Tenant Email Notification Service
Sends automated emails for tenant lifecycle events
"""

import os
from typing import Optional, Dict
from datetime import datetime
import resend

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "hello@kestrel.ai")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@kestrel.ai")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


class TenantNotificationService:
    """Service for sending tenant-related email notifications"""
    
    @staticmethod
    def send_email(to: str, subject: str, html: str) -> Dict:
        """Send email using Resend"""
        if not RESEND_API_KEY:
            print(f"[MOCK EMAIL] To: {to}, Subject: {subject}")
            return {"success": False, "message": "Resend not configured"}
        
        try:
            response = resend.Emails.send({
                "from": FROM_EMAIL,
                "to": to,
                "subject": subject,
                "html": html
            })
            return {"success": True, "id": response.get("id")}
        except Exception as e:
            print(f"Failed to send email: {e}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def notify_admin_new_tenant(tenant_data: Dict) -> Dict:
        """
        Notify admin when a new tenant signs up
        """
        subject = f"🎉 New Tenant Signup: {tenant_data['company_name']}"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2563eb;">New Tenant Signup</h2>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Company Information</h3>
                    <p><strong>Company:</strong> {tenant_data['company_name']}</p>
                    <p><strong>Slug:</strong> {tenant_data['slug']}</p>
                    <p><strong>Industry:</strong> {tenant_data.get('industry', 'N/A')}</p>
                    <p><strong>Plan:</strong> {tenant_data.get('plan_tier', 'N/A')}</p>
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Owner Details</h3>
                    <p><strong>Name:</strong> {tenant_data.get('owner_name', 'N/A')}</p>
                    <p><strong>Email:</strong> {tenant_data['owner_email']}</p>
                    <p><strong>Phone:</strong> {tenant_data.get('owner_phone', 'N/A')}</p>
                </div>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #92400e;">⚡ Next Steps</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li>Review tenant details in admin dashboard</li>
                        <li>Provision Twilio phone number</li>
                        <li>Test voice agent</li>
                        <li>Activate tenant account</li>
                        <li>Send welcome email to customer</li>
                    </ol>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://admin.kestrel.ai/tenants/{tenant_data['id']}" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Tenant Details
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
                    Tenant ID: {tenant_data['id']}<br>
                    Created: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                </p>
            </div>
        </body>
        </html>
        """
        
        return TenantNotificationService.send_email(ADMIN_EMAIL, subject, html)
    
    @staticmethod
    def send_welcome_pending(tenant_data: Dict) -> Dict:
        """
        Send welcome email to tenant after signup (pending activation)
        """
        subject = f"Welcome to Kestrel AI - Setup in Progress"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Welcome to Kestrel AI! 🎉</h1>
                
                <p>Hi {tenant_data.get('owner_name', 'there')},</p>
                
                <p>Thank you for signing up for Kestrel AI Voice Agent! We're excited to help automate your customer calls.</p>
                
                <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
                    <h3 style="margin-top: 0;">What Happens Next?</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li><strong>Within 24 hours:</strong> Our team will contact you to schedule your deployment</li>
                        <li><strong>Phone Setup:</strong> We'll provision your dedicated phone number</li>
                        <li><strong>AI Configuration:</strong> Customize your voice agent's greeting and behavior</li>
                        <li><strong>Go Live:</strong> Your voice agent will be live in 48 hours</li>
                    </ol>
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Account Details</h3>
                    <p><strong>Company:</strong> {tenant_data['company_name']}</p>
                    <p><strong>Dashboard URL:</strong> <a href="https://{tenant_data['slug']}.kestrel.ai">{tenant_data['slug']}.kestrel.ai</a></p>
                    <p><strong>Plan:</strong> {tenant_data.get('plan_tier', 'Professional').title()}</p>
                    <p><strong>Trial Period:</strong> 14 days (no credit card required)</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://{tenant_data['slug']}.kestrel.ai/dashboard" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Access Your Dashboard
                    </a>
                </div>
                
                <p>If you have any questions, just reply to this email. We're here to help!</p>
                
                <p>Best regards,<br>
                The Kestrel AI Team</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Need help? Contact us at support@kestrel.ai or visit our <a href="https://kestrel.ai/help">Help Center</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return TenantNotificationService.send_email(tenant_data['owner_email'], subject, html)
    
    @staticmethod
    def send_activation_complete(tenant_data: Dict, phone_number: str) -> Dict:
        """
        Send email when tenant is activated and phone is provisioned
        """
        subject = f"🚀 You're Live! Your AI Voice Agent is Ready"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #10b981;">You're Live! 🚀</h1>
                
                <p>Hi {tenant_data.get('owner_name', 'there')},</p>
                
                <p>Great news! Your AI Voice Agent is now live and ready to handle calls.</p>
                
                <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                    <h3 style="margin-top: 0; color: #065f46;">Your Voice Agent Number</h3>
                    <p style="font-size: 24px; font-weight: bold; margin: 10px 0; font-family: monospace;">
                        {phone_number}
                    </p>
                    <p style="margin: 0; color: #065f46;">Call this number now to test your AI agent!</p>
                </div>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">What Your AI Can Do</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                        <li>Answer calls 24/7, even after hours</li>
                        <li>Schedule appointments automatically</li>
                        <li>Qualify leads and collect information</li>
                        <li>Transfer urgent calls to your team</li>
                        <li>Send you detailed call summaries</li>
                    </ul>
                </div>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #92400e;">Next Steps</h3>
                    <ol style="margin: 0; padding-left: 20px;">
                        <li><strong>Test it:</strong> Call {phone_number} and have a conversation</li>
                        <li><strong>Update your website:</strong> Display your new number</li>
                        <li><strong>Forward calls:</strong> Route your main line to this number</li>
                        <li><strong>Monitor calls:</strong> Check your dashboard for analytics</li>
                    </ol>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://{tenant_data['slug']}.kestrel.ai/dashboard" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                        View Dashboard
                    </a>
                    <a href="https://kestrel.ai/help/getting-started" 
                       style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Getting Started Guide
                    </a>
                </div>
                
                <p>Your 14-day free trial starts now. No credit card required until you're ready to continue.</p>
                
                <p>Questions? Just reply to this email or call us at (555) 123-4567.</p>
                
                <p>Best regards,<br>
                The Kestrel AI Team</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #6b7280; font-size: 12px;">
                    Dashboard: <a href="https://{tenant_data['slug']}.kestrel.ai">{tenant_data['slug']}.kestrel.ai</a><br>
                    Support: support@kestrel.ai
                </p>
            </div>
        </body>
        </html>
        """
        
        return TenantNotificationService.send_email(tenant_data['owner_email'], subject, html)
    
    @staticmethod
    def send_trial_ending_reminder(tenant_data: Dict, days_remaining: int) -> Dict:
        """
        Send reminder when trial is ending soon
        """
        subject = f"⏰ Your Kestrel AI Trial Ends in {days_remaining} Days"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #f59e0b;">Trial Ending Soon</h1>
                
                <p>Hi {tenant_data.get('owner_name', 'there')},</p>
                
                <p>Your 14-day free trial of Kestrel AI ends in <strong>{days_remaining} days</strong>.</p>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                    <h3 style="margin-top: 0; color: #92400e;">Your Trial Stats</h3>
                    <p><strong>Total Calls Handled:</strong> {tenant_data.get('total_calls', 0)}</p>
                    <p><strong>Appointments Scheduled:</strong> {tenant_data.get('total_appointments', 0)}</p>
                    <p><strong>Current Plan:</strong> {tenant_data.get('plan_tier', 'Professional').title()}</p>
                </div>
                
                <p>To continue using Kestrel AI after your trial, please update your billing information.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://{tenant_data['slug']}.kestrel.ai/billing" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Update Billing
                    </a>
                </div>
                
                <p>Questions about pricing or need help? Just reply to this email.</p>
                
                <p>Best regards,<br>
                The Kestrel AI Team</p>
            </div>
        </body>
        </html>
        """
        
        return TenantNotificationService.send_email(tenant_data['owner_email'], subject, html)
    
    @staticmethod
    def send_usage_warning(tenant_data: Dict, usage_percentage: int) -> Dict:
        """
        Send warning when monthly usage reaches 80%
        """
        subject = f"⚠️ You've Used {usage_percentage}% of Your Monthly Calls"
        
        html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #f59e0b;">Usage Alert</h1>
                
                <p>Hi {tenant_data.get('owner_name', 'there')},</p>
                
                <p>You've used <strong>{usage_percentage}%</strong> of your monthly call limit.</p>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Current Usage:</strong> {tenant_data.get('current_month_calls', 0)} / {tenant_data.get('max_monthly_calls', 0)} calls</p>
                    <p><strong>Plan:</strong> {tenant_data.get('plan_tier', 'Professional').title()}</p>
                </div>
                
                <p>Consider upgrading to a higher plan to avoid service interruption.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://{tenant_data['slug']}.kestrel.ai/billing/upgrade" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Upgrade Plan
                    </a>
                </div>
                
                <p>Best regards,<br>
                The Kestrel AI Team</p>
            </div>
        </body>
        </html>
        """
        
        return TenantNotificationService.send_email(tenant_data['owner_email'], subject, html)


def get_notification_service() -> TenantNotificationService:
    """Get notification service instance"""
    return TenantNotificationService()
