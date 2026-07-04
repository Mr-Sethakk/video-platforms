package com.example.movieplatform.repository;

import com.example.movieplatform.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    Page<Comment> findByMovieIdOrderByCreatedAtDesc(Long movieId, Pageable pageable);

    List<Comment> findByMovieIdOrderByCreatedAtDesc(Long movieId);

    List<Comment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
