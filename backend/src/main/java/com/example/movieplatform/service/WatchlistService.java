package com.example.movieplatform.service;

import com.example.movieplatform.entity.Watchlist;

import java.util.List;

public interface WatchlistService {

    List<Watchlist> getWatchlist(Long userId);

    Watchlist addToWatchlist(Long userId, Long movieId);

    void removeFromWatchlist(Long userId, Long movieId);

    boolean isInWatchlist(Long userId, Long movieId);
}
