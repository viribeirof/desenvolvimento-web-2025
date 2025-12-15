package com.buddiebag.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Base64;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private final String baseUrl;

    public FileStorageService(
            @Value("${app.upload.dir:/mnt/data/uploads}") String uploadDir,
            @Value("${app.base-url:http://localhost:8080}") String baseUrl) {


        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;

        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar a pasta de uploads: " + this.uploadDir, e);
        }
    }

    /**
     * Salva o MultipartFile no disco e retorna o filename gerado (UUID + extensão).
     * Use getFileUrl(filename) para obter a URL pública.
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Arquivo vazio");

        String original = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String ext = "";
        int i = original.lastIndexOf('.');
        if (i >= 0) ext = original.substring(i);

        String filename = UUID.randomUUID().toString() + ext;
        Path target = uploadDir.resolve(filename).normalize();

        try {
            // garante diretório
            Files.createDirectories(uploadDir);

            try (var in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
    }

    /**
     * Decodifica base64 (opcionalmente com prefixo data:) e salva como arquivo.
     * Retorna o filename gerado (UUID.ext).
     */
    public String storeBase64AsFile(String base64, String contentType) {
        if (base64 == null || base64.isBlank()) throw new IllegalArgumentException("Base64 vazio");

        // remove data URL prefix se existir
        int comma = base64.indexOf(',');
        if (comma >= 0) base64 = base64.substring(comma + 1);

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Base64 inválido", e);
        }

        // valida tam (exemplo 5MB)
        long maxBytes = 5L * 1024 * 1024;
        if (bytes.length > maxBytes) {
            throw new IllegalArgumentException("Imagem muito grande. Máx 5MB");
        }

        String ext = deduceExtension(contentType);
        String filename = UUID.randomUUID().toString() + "." + ext;
        Path target = uploadDir.resolve(filename).normalize();

        try {
            Files.createDirectories(uploadDir);
            Files.write(target, bytes, StandardOpenOption.CREATE_NEW);
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo base64", e);
        }
    }

    /**
     * Remove arquivo pelo filename.
     */
    public boolean delete(String filename) {
        if (filename == null || filename.isBlank()) return false;
        try {
            Path file = uploadDir.resolve(filename).normalize();
            return Files.deleteIfExists(file);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Remove arquivo a partir de uma URL pública (extrai filename).
     */
    public boolean deleteByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return false;
        // presume que a URL termina com /uploads/<filename>
        int idx = fileUrl.lastIndexOf('/');
        if (idx < 0) return false;
        String filename = fileUrl.substring(idx + 1);
        return delete(filename);
    }

    /**
     * Retorna Path absoluto para um filename.
     */
    public Path getPath(String filename) {
        return uploadDir.resolve(filename).normalize();
    }

    /**
     * Monta a URL pública para o filename (ex: http://host/uploads/<filename>)
     */
    public String getFileUrl(String filename) {
        if (filename == null) return null;
        return baseUrl + "/uploads/" + filename;
    }

    // deduz extensão simples a partir do contentType
    private String deduceExtension(String contentType) {
        if (contentType == null) return "bin";
        String ct = contentType.toLowerCase();
        if (ct.contains("png")) return "png";
        if (ct.contains("jpeg") || ct.contains("jpg")) return "jpg";
        if (ct.contains("webp")) return "webp";
        if (ct.contains("gif")) return "gif";
        return "bin";
    }
}
