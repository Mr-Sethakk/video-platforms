package com.example.movieplatform.repository;

import com.example.movieplatform.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    Page<Movie> findByGenreAndDeleted(String genre, Integer deleted, Pageable pageable);

    Page<Movie> findByTitleContainingAndDeleted(String keyword, Integer deleted, Pageable pageable);

    Page<Movie> findByGenreAndTitleContainingAndDeleted(String genre, String keyword, Integer deleted, Pageable pageable);

    Page<Movie> findByDeleted(Integer deleted, Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.deleted = 0 ORDER BY m.rating DESC")
    Page<Movie> findAllOrderByRatingDesc(Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.deleted = 0 ORDER BY m.year DESC")
    Page<Movie> findAllOrderByYearDesc(Pageable pageable);

    @Query("SELECT DISTINCT m.genre FROM Movie m WHERE m.deleted = 0 AND m.genre IS NOT NULL")
    java.util.List<String> findDistinctGenres();
}
