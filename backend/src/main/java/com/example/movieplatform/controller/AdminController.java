package com.example.movieplatform.controller;

import com.example.movieplatform.dto.response.Result;
import com.example.movieplatform.repository.MovieRepository;
import com.example.movieplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMovies", movieRepository.count());
        stats.put("totalUsers", userRepository.count());
        stats.put("pendingVideos", 0);
        stats.put("approvedVideos", 0);
        stats.put("rejectedVideos", 0);
        return Result.success(stats);
    }

    @GetMapping("/videos/pending")
    public Result<Map<String, Object>> getPendingVideos() {
        Map<String, Object> result = new HashMap<>();
        result.put("videos", java.util.List.of());
        result.put("total", 0);
        return Result.success(result);
    }

    @PutMapping("/videos/{id}/approve")
    public Result<Void> approveVideo(@PathVariable Long id) {
        return Result.success("审核通过", null);
    }

    @PutMapping("/videos/{id}/reject")
    public Result<Void> rejectVideo(@PathVariable Long id) {
        return Result.success("已拒绝", null);
    }
}
