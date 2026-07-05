package com.example.movieplatform.controller;

import com.example.movieplatform.dto.request.CommentRequest;
import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.dto.response.Result;
import com.example.movieplatform.entity.Comment;
import com.example.movieplatform.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public Result<PageResult<Comment>> getComments(
            @RequestParam Long movieId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer pageSize) {
        PageResult<Comment> result = commentService.getCommentsByMovie(movieId, page, pageSize);
        return Result.success(result);
    }

    @PostMapping
    public Result<Comment> addComment(@RequestBody CommentRequest request,
                                       Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        Comment comment = commentService.addComment(userId, request);
        return Result.success("评论成功", comment);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteComment(@PathVariable Long id,
                                       Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        commentService.deleteComment(id, userId);
        return Result.success("评论已删除", null);
    }
}
