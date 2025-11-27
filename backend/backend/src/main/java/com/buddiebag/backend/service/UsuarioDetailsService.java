package com.buddiebag.backend.service;

import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;

    public UsuarioDetailsService(UsuarioRepository repo) {
        this.repo = repo;
    }

    private String papelParaRole(Integer papel) {
        if (papel == null) return "USER";
        return switch (papel) {
            case 1 -> "ADMIN";
            default -> "USER";
        };
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario u = repo.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));

        String role = papelParaRole(u.getPapel());

        return org.springframework.security.core.userdetails.User.builder()
                .username(u.getEmail())
                .password(u.getSenhaHash()) // hash salvo no DB
                .roles(role)
                .build();
    }
}
