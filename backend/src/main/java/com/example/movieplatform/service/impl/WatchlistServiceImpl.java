package com.example.movieplatform.service.impl;

import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.entity.Watchlist;
import com.example.movieplatform.exception.BusinessException;
import com.example.movieplatform.repository.MovieRepository;
import com.example.movieplatform.repository.WatchlistRepository;
import com.example.movieplatform.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final MovieRepository movieRepository;

    @Override
    public List<Movie> getWatchlist(Long userId) {
        // 获取用户的收藏记录，映射为完整的 Movie 对象
        List<Watchlist> entries = watchlistRepository.findByUserId(userId);
        return entries.stream()
                .map(w -> movieRepository.findById(w.getMovieId()).orElse(null))
                .filter(m -> m != null)
                .collect(Collectors.toList());
    }

    @Override
    public Watchlist addToWatchlist(Long userId, Long movieId) {
        if (watchlistRepository.existsByUserIdAndMovieId(userId, movieId)) {
            throw new BusinessException(409, "该电影已在收藏列表中");
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
