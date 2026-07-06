package com.example.movieplatform.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movie")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double rating;

    private Integer year;

    @Column(length = 50)
    private String genre;

    @Column(length = 200)
    private String director;

    @Column(columnDefinition = "TEXT")
    private String actors;

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @JsonIgnore
    @Column(name = "poster_data", columnDefinition = "LONGBLOB")
    @Lob
    @Basic(fetch = FetchType.LAZY)
    private byte[] posterData;

    @Column(name = "poster_content_type", length = 50)
    private String posterContentType;

    private Integer duration;

    @Column(length = 50)
    private String country;

    @Column(nullable = false)
    @Builder.Default
    private Integer deleted = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ========== Video playback fields ==========
    @Column(name = "has_video", nullable = false)
    @Builder.Default
    private Boolean hasVideo = false;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "required_vip_level", length = 20)
    @Builder.Default
    private String requiredVipLevel = "USER";
}
