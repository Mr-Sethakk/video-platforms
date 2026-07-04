package com.example.movieplatform.service;

import com.example.movieplatform.dto.request.CommentRequest;
import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.entity.Comment;

public interface CommentService {

    PageResult<Comment> getCommentsByMovie(Long movieId, Integer page, Integer pageSize);

    Comment addComment(Long userId, CommentRequest request);

    void deleteComment(Long commentId, Long userId);
}
