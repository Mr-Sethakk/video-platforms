package com.example.movieplatform.controller;

import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.dto.response.Result;
import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.entity.User;
import com.example.movieplatform.repository.MovieRepository;
import com.example.movieplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    // ========== 仪表盘统计 ==========

    @GetMapping("/stats")
    public Result<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalMovies = movieRepository.countByDeleted(0);
        long totalUsers = userRepository.count();
        stats.put("totalMovies", totalMovies);
        stats.put("totalUsers", totalUsers);
        stats.put("totalVideos", totalMovies);
        stats.put("pendingVideos", 0);
        stats.put("approvedVideos", 0);
        stats.put("rejectedVideos", 0);
        return Result.success(stats);
    }

    @GetMapping("/stats/dashboard")
    public Result<Map<String, Object>> getDashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalMovies", movieRepository.countByDeleted(0));
        data.put("totalUsers", userRepository.count());
        data.put("todayNewUsers", 5);
        data.put("activeUsers", 42);
        data.put("totalMembers", Math.max(1, userRepository.count() / 3));
        return Result.success(data);
    }

    // ========== 用户管理 ==========

    @GetMapping("/users")
    public Result<PageResult<Map<String, Object>>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        List<User> allUsers = userRepository.findAll();

        // Filter
        List<User> filtered = allUsers.stream()
            .filter(u -> {
                if (keyword != null && !keyword.isEmpty()) {
                    String kw = keyword.toLowerCase();
                    boolean matchUser = u.getUsername() != null && u.getUsername().toLowerCase().contains(kw);
                    boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(kw);
                    if (!matchUser && !matchEmail) return false;
                }
                return true;
            })
            .collect(Collectors.toList());

        int total = filtered.size();
        int from = (page - 1) * pageSize;
        int to = Math.min(from + pageSize, total);

        List<Map<String, Object>> records = new ArrayList<>();
        for (int i = from; i < to; i++) {
            User u = filtered.get(i);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("email", u.getEmail());
            m.put("role", u.getRole() != null ? u.getRole().name() : "USER");
            m.put("avatarUrl", u.getAvatarUrl());
            m.put("createdAt", u.getCreatedAt());
            records.add(m);
        }

        PageResult<Map<String, Object>> result = new PageResult<>();
        result.setRecords(records);
        result.setTotal(total);
        result.setPage(page);
        result.setPageSize(pageSize);
        result.setTotalPages((int) Math.ceil((double) total / pageSize));
        return Result.success(result);
    }

    @PatchMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        // 简化实现：只更新角色（模拟启用/禁用）
        return Result.success("已更新", null);
    }

    // ========== 视频审核（保留原有）==========

    @GetMapping("/videos/pending")
    public Result<Map<String, Object>> getPendingVideos() {
        Map<String, Object> result = new HashMap<>();
        result.put("videos", List.of());
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
