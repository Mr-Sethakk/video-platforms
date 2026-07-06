package com.example.movieplatform.controller;

import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.dto.response.Result;
import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public Result<PageResult<Movie>> getMovies(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "12") Integer pageSize,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, name = "q") String keyword) {
        PageResult<Movie> result = movieService.getMovies(page, pageSize, genre, sort, keyword);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Movie> getMovieById(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        return Result.success(movie);
    }

    @GetMapping("/genres")
    public Result<List<String>> getGenres() {
        List<String> genres = movieService.getGenres();
        return Result.success(genres);
    }

    @GetMapping("/search")
    public Result<List<Movie>> searchMovies(@RequestParam(required = false, name = "q") String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Result.success(List.of());
        }
        List<Movie> movies = movieService.searchMovies(keyword.trim());
        return Result.success(movies);
    }

    /** 获取电影关联的视频信息 */
    @GetMapping("/{id}/video")
    public Result<Map<String, Object>> getMovieVideo(@PathVariable Long id) {
        Movie movie = movieService.getMovieById(id);
        if (!Boolean.TRUE.equals(movie.getHasVideo())) {
            return Result.success(Map.of("hasVideo", false));
        }
        return Result.success(Map.of(
            "hasVideo", true,
            "videoUrl", Optional.ofNullable(movie.getVideoUrl()).orElse(""),
            "requiredVipLevel", Optional.ofNullable(movie.getRequiredVipLevel()).orElse("USER"),
            "movieTitle", movie.getTitle()
        ));
    }
}
