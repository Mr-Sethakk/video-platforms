package com.example.movieplatform.controller;

import com.example.movieplatform.entity.Movie;
import com.example.movieplatform.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/posters")
@RequiredArgsConstructor
public class PosterController {

    private final MovieService movieService;

    @GetMapping("/{movieId}")
    public ResponseEntity<byte[]> getPoster(@PathVariable Long movieId) {
        Movie movie = movieService.getMovieById(movieId);
        byte[] data = movie.getPosterData();

        if (data == null || data.length == 0) {
            return ResponseEntity.notFound().build();
        }

        String contentType = movie.getPosterContentType();
        if (contentType == null || contentType.isEmpty()) {
            contentType = "image/webp";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CACHE_CONTROL, CacheControl.maxAge(7, TimeUnit.DAYS).cachePublic().getHeaderValue())
                .contentLength(data.length)
                .body(data);
    }
}
