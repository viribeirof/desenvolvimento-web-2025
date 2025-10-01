package com.buddiebag.backend.service;
import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.dto.UsuarioUpdateDto;
import com.buddiebag.backend.exceptions.EmailJaExisteException;
import com.buddiebag.backend.mapper.UsuarioMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<UsuarioDto> listarTodos(Pageable pageable) {
        return usuarioRepository.findAll(pageable)
                .map(UsuarioMapper::toDto);
    }

    public void criarUsuario(Usuario usuario) {
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            throw new EmailJaExisteException("Email já cadastrado");
        }
        usuario.setSenhaHash(passwordEncoder.encode(usuario.getSenhaHash()));
        usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }
    public boolean atualizarUsuario(Long id, UsuarioUpdateDto dto) {
        return usuarioRepository.findById(id).map(usuario -> {

            usuario.setNome(dto.getNome());
            usuario.setEmail(dto.getEmail());

            if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
                usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
            }

            usuario.setFotoPerfil(dto.getFotoPerfil());

            usuarioRepository.save(usuario);
            return true;
        }).orElse(false);
    }


    public boolean deletarUsuario(Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuarioRepository.delete(usuario);
            return true;
        }).orElse(false);
    }
}
