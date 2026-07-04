package com.example.movieplatform.controller;

import com.example.movieplatform.dto.response.Result;
import com.example.movieplatform.entity.Watchlist;
import com.example.movieplatform.service.UserService;
import com.example.movieplatform.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserService userService;

    @GetMapping
    public Result<List<Watchlist>> getWatchlist() {
        Long userId = userService.getCurrentUser().getId();
        List<Watchlist> watchlist = watchlistService.getWatchlist(userId);
        return Result.success(watchlist);
    }

    @PostMapping
    public Result<Watchlist> addToWatchlist(@RequestBody Map<String, Long> body) {
        Long userId = userService.getCurrentUser().getId();
        Long movieId = body.get("movieId");
        Watchlist watchlist = watchlistService.addToWatchlist(userId, movieId);
        return Result.success("已加入收藏", watchlist);
    }

    @DeleteMapping("/{movieId}")
    public Result<Void> removeFromWatchlist(@PathVariable Long movieId) {
        Long userId = userService.getCurrentUser().getId();
        watchlistService.removeFromWatchlist(userId, movieId);
        return Result.success("已取消收藏", null);
    }

    @GetMapping("/check/{movieId}")
    public Result<Map<String, Boolean>> checkWatchlist(@PathVariable Long movieId) {
        Long userId = userService.getCurrentUser().getId();
        boolean inWatchlist = watchlistService.isInWatchlist(userId, movieId);
        return Result.success(Map.of("inWatchlist", inWatchlist));
    }
}
