package com.hireflow.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    private final Resend resend;
    
    // We ideally should have a verified domain to use as the FROM address.
    // For Resend testing natively without a custom domain, you can use onboarding@resend.dev
    // but Emails will only physically deliver to the email bound to your Resend Account until domain verification!
    private final String fromEmail = "onboarding@resend.dev"; 

    public EmailService(@Value("${resend.api.key}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    private String buildHtmlTemplate(String companyName, String title, String content) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head>" +
               "<body style='font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;background-color:#f8fafc;margin:0;padding:40px 20px;'>" +
               "<div style='max-w-xl;margin:0 auto;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:600px;'>" +
               "<div style='background-color:#0f172a;padding:32px 40px;text-align:center;'>" +
               "<h1 style='color:#ffffff;font-size:24px;margin:0;letter-spacing:1px;'>" + companyName + "</h1>" +
               "</div>" +
               "<div style='padding:40px;'>" +
               "<h2 style='color:#0f172a;font-size:20px;margin-top:0;margin-bottom:24px;'>" + title + "</h2>" +
               "<div style='color:#475569;font-size:16px;line-height:26px;'>" + content + "</div>" +
               "</div>" +
               "<div style='background-color:#f1f5f9;padding:24px;text-align:center;border-top:1px solid #e2e8f0;'>" +
               "<p style='color:#64748b;font-size:13px;margin:0;'>This email was sent automatically by the HireFlow ATS Platform.</p>" +
               "</div>" +
               "</div></body></html>";
    }

    @Async
    public void sendApplicationReceivedEmail(String candidateEmail, String jobTitle, String companyName) {
        String subject = "Application Received - " + jobTitle;
        String content = "<p>Thank you for applying for the <strong>" + jobTitle + "</strong> role.</p>" +
                         "<p>We have successfully received your application portfolio. Our hiring team will carefully review your profile and we will be in touch with the next steps soon.</p>" +
                         "<br><p>Best regards,<br><strong>The " + companyName + " Team</strong></p>";
        
        String htmlBody = buildHtmlTemplate(companyName, "Application Confirmation", content);
        sendEmail(candidateEmail, subject, htmlBody);
    }

    @Async
    public void sendStatusUpdateEmail(String candidateEmail, String jobTitle, String status, String companyName) {
        String subject = "Application Update - " + jobTitle;
        String content;
        String title;

        switch (status) {
            case "INTERVIEW":
                title = "Interview Invitation";
                content = "<p>Great news!</p><p>We reviewed your application and would love to invite you for an interview for the <strong>" + jobTitle + "</strong> role.</p><p>A team member will reach out shortly with scheduling details and instructions.</p>";
                break;
            case "HIRED":
                title = "Welcome to the Team!";
                content = "<p>Congratulations!</p><p>We are absolutely thrilled to offer you the <strong>" + jobTitle + "</strong> position at " + companyName + ".</p><p>We were incredibly impressed by your background and can't wait to have you onboard.</p>";
                break;
            case "REJECTED":
                title = "Update on your application";
                content = "<p>Thank you for taking the time to apply for the <strong>" + jobTitle + "</strong> role.</p><p>While your background is impressive, we have decided to move forward with other candidates whose profiles more closely align with our current needs.</p><p>We wish you the very best in your search and future endeavors.</p>";
                break;
            default:
                log.info("No email template defined for status mutation: {}", status);
                return;
        }

        content += "<br><p>Best regards,<br><strong>The " + companyName + " Team</strong></p>";
        String htmlBody = buildHtmlTemplate(companyName, title, content);

        sendEmail(candidateEmail, subject, htmlBody);
    }

    private void sendEmail(String toEmail, String subject, String htmlBody) {
        try {
            CreateEmailOptions params = CreateEmailOptions.builder()
                .from("HireFlow ATS <" + fromEmail + ">")
                .to(toEmail)
                .subject(subject)
                .html(htmlBody)
                .build();

            resend.emails().send(params);
            log.info("Successfully sent async email to: {}", toEmail);
        } catch (ResendException e) {
            // Trapping exactly as standard constraints. We DO NOT crash the application loop!
            log.error("Failed to send email to {} via Resend SDK: {}", toEmail, e.getMessage(), e);
        } catch (Exception e) {
            // Catch-all safety
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
