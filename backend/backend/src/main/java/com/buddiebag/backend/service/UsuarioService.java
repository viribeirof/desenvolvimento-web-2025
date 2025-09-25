package com.buddiebag.backend.service;
import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.mapper.UsuarioMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {
    @Autowired
    private UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public List<UsuarioDto> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    public void criarUsuario(Usuario usuario) {
        usuario.setSenhaHash(passwordEncoder.encode(usuario.getSenhaHash()));
        usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }
}
