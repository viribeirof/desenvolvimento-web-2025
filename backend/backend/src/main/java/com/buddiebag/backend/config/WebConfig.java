package com.buddiebag.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCachePeriod(3600);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // CORS para front-end
        registry.addMapping("/uploads/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowCredentials(false);

        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("ETag")
                .allowCredentials(true);

        registry.addMapping("/uploads/**")
                .allowedOrigins("https://buddiebag.vercel.app")
                .allowedMethods("GET", "HEAD", "OPTIONS")
                .allowCredentials(false);

        registry.addMapping("/api/**")
                .allowedOrigins("https://buddiebag.vercel.app")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("ETag")
                .allowCredentials(true);

        registry.addMapping("/auth/**")
                .allowedOrigins("https://buddiebag.vercel.app")
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("ETag")
                .allowCredentials(true);
    }



}
