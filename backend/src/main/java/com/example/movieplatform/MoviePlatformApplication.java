package com.example.movieplatform;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MoviePlatformApplication {

    public static void main(String[] args) {
        // 自动加载 .env 文件，将变量设为系统属性供 Spring ${VAR} 占位符读取
        // 兼容从根目录和 backend/ 目录两种启动方式
        for (String dir : new String[]{"./", "./backend/"}) {
            try {
                Dotenv dotenv = Dotenv.configure()
                        .directory(dir)
                        .ignoreIfMissing()
                        .load();
                dotenv.entries().forEach(e ->
                    System.setProperty(e.getKey(), e.getValue())
                );
                break; // 找到一个就不继续了
            } catch (Exception ignored) { }
        }

        SpringApplication.run(MoviePlatformApplication.class, args);
    }
}
