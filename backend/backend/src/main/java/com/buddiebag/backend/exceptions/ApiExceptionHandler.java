package com.buddiebag.backend.exceptions;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.toList());

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 400,
                "error", "Bad Request",
                "messages", errors,
                "path", request.getRequestURI()
        );

        return ResponseEntity.badRequest().body(body);
    }
    // =================== 422 Unprocessable Entity ===================
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException ex,
                                                      HttpServletRequest request) {

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 422,
                "error", "Unprocessable Entity",
                "message", ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage(),
                "path", request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }

    // =================== 404 Not Found ===================
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Object> handleNotFound(EntityNotFoundException ex,
                                                 HttpServletRequest request) {

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 404,
                "error", "Not Found",
                "message", ex.getMessage(),
                "path", request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // =================== 500 Internal Server Error ===================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAll(Exception ex, HttpServletRequest request) {

        Map<String, Object> body = Map.of(
                "timestamp", Instant.now().toString(),
                "status", 500,
                "error", "Internal Server Error",
                "message", ex.getMessage(),
                "path", request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    // =================== 200 OK e 201 Created ===================
    // Na prática, você não precisa de handler para 200/201.
    // Retorne diretamente no controller, por exemplo:
    // ResponseEntity.ok(Map.of("message", "Sucesso"))
    // ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Criado com sucesso!"))
}
