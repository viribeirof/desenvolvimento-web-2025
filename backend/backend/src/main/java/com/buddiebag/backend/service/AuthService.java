package com.buddiebag.backend.service;

import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Service
public class AuthService {


    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final UsuarioDetailsService uds; // para converter Usuario em UserDetails

    public AuthService(UsuarioRepository usuarioRepo,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authManager,
                       UsuarioDetailsService uds) {
        this.usuarioRepo = usuarioRepo;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.uds = uds;
    }

    public UserDetails login(String email, String senha) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(email, senha));
        } catch (BadCredentialsException ex) {
            throw new IllegalArgumentException("Email ou senha incorretos");
        }
        return uds.loadUserByUsername(email);
    }

}
