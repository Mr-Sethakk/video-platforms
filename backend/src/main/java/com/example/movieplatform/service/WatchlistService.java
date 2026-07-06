package com.example.movieplatform.service;

import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.entity.Watchlist;

import java.util.List;

public interface WatchlistService {

    /** 获取收藏的电影列表（返回 Movie 对象，非原始 Watchlist 记录） */
    List<Movie> getWatchlist(Long userId);

    Watchlist addToWatchlist(Long userId, Long movieId);

    void removeFromWatchlist(Long userId, Long movieId);

    boolean isInWatchlist(Long userId, Long movieId);
}
