package com.example.movieplatform.service.impl;

import com.example.movieplatform.entity.Watchlist;
import com.example.movieplatform.exception.BusinessException;
import com.example.movieplatform.repository.WatchlistRepository;
import com.example.movieplatform.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;

    @Override
    public List<Watchlist> getWatchlist(Long userId) {
        return watchlistRepository.findByUserId(userId);
    }

    @Override
    public Watchlist addToWatchlist(Long userId, Long movieId) {
        // Check if already in watchlist
        if (watchlistRepository.existsByUserIdAndMovieId(userId, movieId)) {
            throw new BusinessException(400, "该电影已在收藏列表中");
        }

        Watchlist watchlist = Watchlist.builder()
                .userId(userId)
                .movieId(movieId)
                .build();

        return watchlistRepository.save(watchlist);
    }

    @Override
    public void removeFromWatchlist(Long userId, Long movieId) {
        if (!watchlistRepository.existsByUserIdAndMovieId(userId, movieId)) {
            throw new BusinessException(404, "该电影不在收藏列表中");
        }
        watchlistRepository.deleteByUserIdAndMovieId(userId, movieId);
    }

    @Override
    public boolean isInWatchlist(Long userId, Long movieId) {
        return watchlistRepository.existsByUserIdAndMovieId(userId, movieId);
    }
}
