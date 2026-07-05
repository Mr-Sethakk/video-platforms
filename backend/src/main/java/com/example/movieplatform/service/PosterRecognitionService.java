package com.example.movieplatform.service;

import com.example.movieplatform.entity.Movie;

import java.util.List;
import java.util.Map;

public interface PosterRecognitionService {

    /**
     * 识别电影海报
     * @param imageBytes 图片字节数组
     * @param contentType 图片 MIME 类型
     * @return 识别结果列表（按匹配度排序）
     */
    List<Map<String, Object>> recognize(byte[] imageBytes, String contentType);
}
