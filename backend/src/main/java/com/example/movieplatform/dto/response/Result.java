package com.example.movieplatform.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Result<T> {

    private boolean success;
    private int code;
    private String message;
    private T data;
    private long timestamp;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.success = true;
        result.code = 200;
        result.message = "操作成功";
        result.data = data;
        result.timestamp = System.currentTimeMillis();
        return result;
    }

    public static <T> Result<T> success(String message, T data) {
        Result<T> result = new Result<>();
        result.success = true;
        result.code = 200;
        result.message = message;
        result.data = data;
        result.timestamp = System.currentTimeMillis();
        return result;
    }

    public static <T> Result<T> error(int code, String message) {
        Result<T> result = new Result<>();
        result.success = false;
        result.code = code;
        result.message = message;
        result.timestamp = System.currentTimeMillis();
        return result;
    }

    public static <T> Result<T> error(String message) {
        return error(500, message);
    }
}
