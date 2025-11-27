package com.buddiebag.backend.controller;

import com.buddiebag.backend.dto.AuthRequest;
import com.buddiebag.backend.service.AuthService;
import com.buddiebag.backend.service.UsuarioDetailsService;
import com.buddiebag.backend.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {


    private final AuthService authService;
    private final UsuarioDetailsService uds;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UsuarioDetailsService uds, JwtUtil jwtUtil) {
        this.authService = authService;
        this.uds = uds;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest req, HttpServletResponse response) {
        try {
            UserDetails ud = authService.login(req.getEmail(), req.getSenha());

            String accessToken = jwtUtil.generateAccessToken(ud);
            String refreshToken = jwtUtil.generateRefreshToken(ud);

            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/auth")
                    .maxAge(7 * 24 * 60 * 60)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            return ResponseEntity.ok(Map.of("accessToken", accessToken));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("erro", ex.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String refreshToken = Arrays.stream(cookies)
                .filter(c -> "refreshToken".equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);

        if (refreshToken == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            String username = jwtUtil.extractUsername(refreshToken);
            UserDetails ud = uds.loadUserByUsername(username);
            if (!jwtUtil.isTokenValid(refreshToken, ud)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            String newAccess = jwtUtil.generateAccessToken(ud);
            return ResponseEntity.ok(Map.of("accessToken", newAccess));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

}
