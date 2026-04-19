package com.hireflow.service;

import com.hireflow.dto.ApplicationRequest;
import com.hireflow.dto.ApplicationResponse;
import com.hireflow.dto.ApplicationAnswerDto;
import com.hireflow.model.Application;
import com.hireflow.model.ApplicationStage;
import com.hireflow.model.Candidate;
import com.hireflow.model.Job;
import com.hireflow.model.Organization;
import com.hireflow.model.CandidateRecommendation;
import com.hireflow.repository.ApplicationRepository;
import com.hireflow.repository.CandidateRepository;
import com.hireflow.repository.JobRepository;
import com.hireflow.repository.OrganizationRepository;
import com.hireflow.repository.CandidateRecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobRepository jobRepository;
    private final OrganizationRepository organizationRepository;
    private final CandidateRecommendationRepository candidateRecommendationRepository;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForJob(UUID jobId, UUID orgId) {
        // Validate job belongs to org
        jobRepository.findByIdAndOrganizationId(jobId, orgId)
                .orElseThrow(() -> new RuntimeException("Job not found or access denied"));

        List<Application> apps = applicationRepository.findByJobIdAndOrganizationId(jobId, orgId);

        apps.sort((a, b) -> {
            int scoreA = a.getMatchScore() == null ? -1 : a.getMatchScore();
            int scoreB = b.getMatchScore() == null ? -1 : b.getMatchScore();
            return Integer.compare(scoreB, scoreA);
        });

        List<ApplicationResponse> responses = new java.util.ArrayList<>();
        for (int i = 0; i < apps.size(); i++) {
            Application app = apps.get(i);
            boolean isTop = i < 3 && app.getMatchScore() != null && app.getMatchScore() >= 60;
            responses.add(mapToResponse(app, isTop));
        }

        return responses;
    }

    @Transactional(readOnly = true)
    public com.hireflow.dto.InsightsResponse getJobInsights(UUID jobId, UUID orgId) {
        jobRepository.findByIdAndOrganizationId(jobId, orgId)
                .orElseThrow(() -> new RuntimeException("Job not found or access denied"));

        List<Application> apps = applicationRepository.findByJobIdAndOrganizationId(jobId, orgId);

        java.util.Map<String, Integer> skillCounts = new java.util.HashMap<>();
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

        for (Application app : apps) {
            if (app.getSkills() != null && !app.getSkills().isEmpty()) {
                try {
                    List<String> skills = mapper.readValue(app.getSkills(), new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
                    for (String skill : skills) {
                        skillCounts.put(skill, skillCounts.getOrDefault(skill, 0) + 1);
                    }
                } catch (Exception e) {
                    // Ignore parse errors
                }
            }
        }

        List<com.hireflow.dto.InsightsResponse.SkillCount> allSkills = skillCounts.entrySet().stream()
                .map(e -> com.hireflow.dto.InsightsResponse.SkillCount.builder().skill(e.getKey()).count(e.getValue()).build())
                .collect(Collectors.toList());

        List<com.hireflow.dto.InsightsResponse.SkillCount> topSkills = allSkills.stream()
                .sorted((a, b) -> Integer.compare(b.getCount(), a.getCount()))
                .limit(7)
                .collect(Collectors.toList());

        List<com.hireflow.dto.InsightsResponse.SkillCount> rareSkills = allSkills.stream()
                .sorted((a, b) -> Integer.compare(a.getCount(), b.getCount()))
                .limit(5)
                .collect(Collectors.toList());

        return com.hireflow.dto.InsightsResponse.builder()
                .topSkills(topSkills)
                .rareSkills(rareSkills)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getApplicationsForCandidate(UUID candidateId, UUID orgId) {
        candidateRepository.findByIdAndOrganizationId(candidateId, orgId)
                .orElseThrow(() -> new RuntimeException("Candidate not found or access denied"));
        
        return applicationRepository.findByCandidateIdAndOrganizationIdOrderByAppliedAtDesc(candidateId, orgId)
                .stream()
                .map(app -> mapToResponse(app, false))
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse createApplication(ApplicationRequest request, UUID orgId) {
        Job job = jobRepository.findByIdAndOrganizationId(request.getJobId(), orgId)
                .orElseThrow(() -> new RuntimeException("Job not found or access denied"));

        Candidate candidate = candidateRepository.findByIdAndOrganizationId(request.getCandidateId(), orgId)
                .orElseThrow(() -> new RuntimeException("Candidate not found or access denied"));

        if (applicationRepository.existsByJobIdAndCandidateIdAndOrganizationId(job.getId(), candidate.getId(), orgId)) {
            throw new RuntimeException("Candidate has already applied to this job");
        }

        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        Application application = Application.builder()
                .organization(org)
                .job(job)
                .candidate(candidate)
                .stage(ApplicationStage.APPLIED) // Default stage
                .build();

        Application saved = applicationRepository.save(application);
        return mapToResponse(saved, false);
    }

    @Transactional
    public ApplicationResponse updateApplicationStage(UUID id, ApplicationStage stage, UUID orgId) {
        Application application = applicationRepository.findByIdAndOrganizationId(id, orgId)
                .orElseThrow(() -> new RuntimeException("Application not found or access denied"));
        
        application.setStage(stage);
        Application saved = applicationRepository.save(application);

        // Async dispatch
        emailService.sendStatusUpdateEmail(
                application.getCandidate().getEmail(),
                application.getJob().getTitle(),
                stage.name(),
                application.getOrganization().getName()
        );

        return mapToResponse(saved, false);
    }

    private ApplicationResponse mapToResponse(Application app, boolean isTop) {
        List<CandidateRecommendation> recs = candidateRecommendationRepository.findByCandidateIdOrderByMatchScoreDesc(app.getCandidate().getId());
        
        List<ApplicationResponse.RecommendationDTO> parsedRecs = recs.stream()
            .map(r -> ApplicationResponse.RecommendationDTO.builder()
                .jobTitle(r.getRecommendedJob().getTitle())
                .matchScore(r.getMatchScore())
                .reasoning(r.getReasoning())
                .build())
            .collect(Collectors.toList());

        return ApplicationResponse.builder()
                .id(app.getId())
                .candidateId(app.getCandidate().getId())
                .candidateName(app.getCandidate().getName())
                .candidateEmail(app.getCandidate().getEmail())
                .jobId(app.getJob().getId())
                .jobTitle(app.getJob().getTitle())
                .stage(app.getStage())
                .appliedAt(app.getAppliedAt())
                .resumeUrl(app.getResumeUrl())
                .answers(app.getAnswers() != null ? app.getAnswers().stream()
                        .map(ans -> {
                            boolean contradictory = false;
                            String preferred = null;
                            if (ans.getQuestion().getType() == com.hireflow.model.QuestionType.YES_NO && 
                                Boolean.TRUE.equals(ans.getQuestion().getIsDealbreaker())) {
                                preferred = ans.getQuestion().getPreferredAnswer();
                                if (preferred != null && ans.getAnswerText() != null) {
                                    contradictory = !preferred.equalsIgnoreCase(ans.getAnswerText().trim());
                                }
                            }
                            return ApplicationAnswerDto.builder()
                                .questionId(ans.getQuestion().getId())
                                .questionText(ans.getQuestion().getQuestionText())
                                .answerText(ans.getAnswerText())
                                .isContradictory(contradictory)
                                .preferredAnswer(preferred)
                                .build();
                        })
                        .collect(Collectors.toList()) : List.of())
                .matchScore(app.getMatchScore())
                .strengths(app.getStrengths())
                .gaps(app.getGaps())
                .skills(app.getSkills())
                .isTopCandidate(isTop)
                .hasContradictions(app.getAnswers() != null && app.getAnswers().stream()
                        .anyMatch(ans -> {
                            if (ans.getQuestion().getType() == com.hireflow.model.QuestionType.YES_NO && 
                                Boolean.TRUE.equals(ans.getQuestion().getIsDealbreaker())) {
                                String preferred = ans.getQuestion().getPreferredAnswer();
                                return preferred != null && ans.getAnswerText() != null && 
                                       !preferred.equalsIgnoreCase(ans.getAnswerText().trim());
                            }
                            return false;
                        }))
                .crossJobRecommendations(parsedRecs)
                .build();
    }
}
