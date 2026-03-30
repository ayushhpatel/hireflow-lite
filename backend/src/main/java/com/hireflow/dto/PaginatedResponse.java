package com.hireflow.dto;

import lombok.Data;
import org.springframework.data.domain.Page;
import java.util.List;

@Data
public class PaginatedResponse<T> {
    private List<T> content;
    private int totalPages;
    private long totalElements;
    private int currentPage;

    public PaginatedResponse(Page<?> page, List<T> content) {
        this.content = content;
        this.totalPages = page.getTotalPages();
        this.totalElements = page.getTotalElements();
        this.currentPage = page.getNumber();
    }
}
