package com.example.movieplatform.controller;

import com.example.movieplatform.dto.response.Result;
import com.example.movieplatform.service.PosterRecognitionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/ai/poster")
@RequiredArgsConstructor
public class PosterRecognitionController {

    private final PosterRecognitionService posterRecognitionService;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/png", "image/jpeg", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping("/recognize")
    public Result<Map<String, Object>> recognize(@RequestParam("poster") MultipartFile file) {
        // 校验文件
        if (file.isEmpty()) {
            return Result.error(400, "请上传图片文件");
        }

        // 校验文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return Result.error(400, "仅支持 PNG、JPG、WEBP 格式的图片");
        }

        // 校验文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            return Result.error(400, "图片大小不能超过 10MB");
        }

        try {
            byte[] imageBytes = file.getBytes();

            // 如果图片分辨率过大，压缩到 2000px 宽
            // 注：后端不做压缩，因为需要解析图片维度的库，直接传给 AI 处理即可

            List<Map<String, Object>> results = posterRecognitionService.recognize(imageBytes, contentType);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("results", results);
            response.put("total", results.size());

            if (results.isEmpty()) {
                response.put("status", "no_match");
                return Result.success("没认出这是哪部电影，建议换一张更清晰的海报试试", response);
            } else if (results.size() == 1) {
                response.put("status", "single_match");
                return Result.success("找到啦！为你识别出：" + results.get(0).get("title"), response);
            } else {
                response.put("status", "multi_match");
                return Result.success("发现 " + results.size() + " 个相关版本，请选择你想看的", response);
            }

        } catch (IOException e) {
            log.error("读取上传文件失败", e);
            return Result.error(500, "文件读取失败，请重试");
        } catch (RuntimeException e) {
            log.error("海报识别业务异常: {}", e.getMessage());
            return Result.error(500, e.getMessage());
        }
    }
}
