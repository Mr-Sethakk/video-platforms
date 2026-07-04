package com.example.movieplatform.service.impl;

import com.example.movieplatform.dto.request.CommentRequest;
import com.example.movieplatform.dto.response.PageResult;
import com.example.movieplatform.entity.Comment;
import com.example.movieplatform.entity.User;
import com.example.movieplatform.exception.BusinessException;
import com.example.movieplatform.repository.CommentRepository;
import com.example.movieplatform.repository.UserRepository;
import com.example.movieplatform.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    @Override
    public PageResult<Comment> getCommentsByMovie(Long movieId, Integer page, Integer pageSize) {
        Page<Comment> commentPage = commentRepository.findByMovieIdOrderByCreatedAtDesc(
                movieId, PageRequest.of(page - 1, pageSize));

        var comments = commentPage.getContent();
        for (Comment comment : comments) {
            try {
                userRepository.findById(comment.getUserId()).ifPresent(u -> {
                    comment.setUsername(u.getUsername());
                    comment.setAvatarUrl(u.getAvatarUrl());
                });
            } catch (Exception ignored) {}
        }

        return PageResult.of(comments, commentPage.getTotalElements(), page, pageSize);
    }

    @Override
    public Comment addComment(Long userId, CommentRequest request) {
        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            throw new BusinessException(400, "评论内容不能为空");
        }

        Comment comment = Comment.builder()
                .userId(userId)
                .movieId(request.getMovieId())
                .content(request.getContent().trim())
                .rating(request.getRating())
                .build();

        Comment saved = commentRepository.save(comment);

        // Populate username for immediate response
        userRepository.findById(userId).ifPresent(u -> saved.setUsername(u.getUsername()));

        return saved;
    }

    @Override
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new BusinessException(404, "评论不存在"));

        // Only comment author or admin can delete
        if (!comment.getUserId().equals(userId)) {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null || !"ADMIN".equals(user.getRole().name())) {
                throw new BusinessException(403, "无权删除此评论");
            }
        }

        commentRepository.delete(comment);
    }
}
