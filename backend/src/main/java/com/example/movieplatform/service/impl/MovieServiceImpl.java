package com.example.movieplatform.service.impl;

import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.exception.BusinessException;
import com.example.movieplatform.repository.MovieRepository;
import com.example.movieplatform.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;

    @Override
    public PageResult<Movie> getMovies(Integer page, Integer pageSize, String genre, String sort, String keyword) {
        Sort sortObj = getSort(sort);
        Pageable pageable = PageRequest.of(page - 1, pageSize, sortObj);

        Page<Movie> moviePage;

        boolean hasGenre = genre != null && !genre.isEmpty();
        boolean hasKeyword = keyword != null && !keyword.isEmpty();

        if (hasGenre && hasKeyword) {
            moviePage = movieRepository.findByGenreAndTitleContainingAndDeleted(genre, keyword, 0, pageable);
        } else if (hasGenre) {
            moviePage = movieRepository.findByGenreAndDeleted(genre, 0, pageable);
        } else if (hasKeyword) {
            moviePage = movieRepository.findByTitleContainingAndDeleted(keyword, 0, pageable);
        } else {
            moviePage = movieRepository.findByDeleted(0, pageable);
        }

        return PageResult.of(moviePage.getContent(), moviePage.getTotalElements(), page, pageSize);
    }

    @Override
    public Movie getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "电影不存在"));
        if (movie.getDeleted() == 1) {
            throw new BusinessException(404, "电影已下架");
        }
        return movie;
    }

    @Override
    public List<String> getGenres() {
        return movieRepository.findDistinctGenres();
    }

    @Override
    public List<Movie> searchMovies(String keyword) {
        Page<Movie> page = movieRepository.findByTitleContainingAndDeleted(
                keyword, 0, PageRequest.of(0, 20));
        return page.getContent();
    }

    @Override
    public Movie createMovie(Movie movie) {
        movie.setDeleted(0);
        return movieRepository.save(movie);
    }

    @Override
    public Movie updateMovie(Long id, Movie movie) {
        Movie existing = getMovieById(id);
        existing.setTitle(movie.getTitle());
        existing.setDescription(movie.getDescription());
        existing.setRating(movie.getRating());
        existing.setYear(movie.getYear());
        existing.setGenre(movie.getGenre());
        existing.setDirector(movie.getDirector());
        existing.setActors(movie.getActors());
        existing.setPosterUrl(movie.getPosterUrl());
        existing.setDuration(movie.getDuration());
        existing.setCountry(movie.getCountry());
        return movieRepository.save(existing);
    }

    @Override
    public void deleteMovie(Long id) {
        Movie movie = getMovieById(id);
        movie.setDeleted(1);
        movieRepository.save(movie);
    }

    private Sort getSort(String sort) {
        if ("rating".equals(sort)) {
            return Sort.by(Sort.Direction.DESC, "rating");
        } else if ("year".equals(sort)) {
            return Sort.by(Sort.Direction.DESC, "year");
        } else if ("title".equals(sort)) {
            return Sort.by(Sort.Direction.ASC, "title");
        }
        return Sort.by(Sort.Direction.DESC, "createdAt");
    }
}
