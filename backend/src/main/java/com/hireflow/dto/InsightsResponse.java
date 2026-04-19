package com.hireflow.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class InsightsResponse {
    private List<SkillCount> topSkills;
    private List<SkillCount> rareSkills;

    @Data
    @Builder
    public static class SkillCount {
        private String skill;
        private int count;
    }
}
