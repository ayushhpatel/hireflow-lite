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

    @Async
    public void sendApplicationReceivedEmail(String candidateEmail, String jobTitle, String companyName) {
        String subject = "Application Received - " + jobTitle;
        String htmlBody = String.format(
            "<p>Thank you for applying to <strong>%s</strong> for the <strong>%s</strong> role.</p>" +
            "<p>We have successfully received your application and our team is currently reviewing your profile.</p>" +
            "<p>Best regards,<br>The %s Hiring Team</p>",
            companyName, jobTitle, companyName
        );

        sendEmail(candidateEmail, subject, htmlBody);
    }

    @Async
    public void sendStatusUpdateEmail(String candidateEmail, String jobTitle, String status, String companyName) {
        String subject = "Application Update - " + jobTitle;
        String htmlBody;

        switch (status) {
            case "INTERVIEW":
                htmlBody = String.format("<p>Hello,</p><p>Great news! You have been shortlisted for an interview for the <strong>%s</strong> role at <strong>%s</strong>.</p><p>We will be in touch shortly with scheduling details.</p>", jobTitle, companyName);
                break;
            case "HIRED":
                htmlBody = String.format("<p>Hello,</p><p>Congratulations! We are thrilled to offer you the <strong>%s</strong> position at <strong>%s</strong>.</p><p>Welcome to the team!</p>", jobTitle, companyName);
                break;
            case "REJECTED":
                htmlBody = String.format("<p>Hello,</p><p>Thank you for taking the time to apply for the <strong>%s</strong> role at <strong>%s</strong>.</p><p>We appreciate your interest, but we have decided to move forward with other candidates at this time.</p><p>We wish you the best of luck in your job search.</p>", jobTitle, companyName);
                break;
            default:
                // For other status states like SCREENING/OFFER, omit or map custom paths.
                log.info("No email template defined for status mutation: {}", status);
                return;
        }

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
