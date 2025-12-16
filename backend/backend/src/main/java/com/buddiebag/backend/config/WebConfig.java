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

        // Frontend local + produção
        String[] allowedOrigins = {
                "http://localhost:5173",
                "https://buddiebag.vercel.app"
        };

        // API
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("ETag")
                .allowCredentials(true);

        // Auth
        registry.addMapping("/auth/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET","POST","OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

        // Uploads (imagens públicas)
        registry.addMapping("/uploads/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET","HEAD","OPTIONS")
                .allowCredentials(false);

        // Health check
        registry.addMapping("/funciona")
                .allowedOrigins("*")
                .allowedMethods("GET");
    }
}
