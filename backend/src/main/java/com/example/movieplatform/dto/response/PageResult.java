package com.example.movieplatform.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {

    private List<T> records;
    private long total;
    private int page;
    private int pageSize;
    private int totalPages;

    public static <T> PageResult<T> of(List<T> records, long total, int page, int pageSize) {
        PageResult<T> result = new PageResult<>();
        result.records = records;
        result.total = total;
        result.page = page;
        result.pageSize = pageSize;
        result.totalPages = (int) Math.ceil((double) total / pageSize);
        return result;
    }
}
