package com.example.movieplatform.service;

import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.entity.Movie;

import java.util.List;

public interface MovieService {

    PageResult<Movie> getMovies(Integer page, Integer pageSize, String genre, String sort, String keyword);

    Movie getMovieById(Long id);

    List<String> getGenres();

    List<Movie> searchMovies(String keyword);

    Movie createMovie(Movie movie);

    Movie updateMovie(Long id, Movie movie);

    void deleteMovie(Long id);
}
