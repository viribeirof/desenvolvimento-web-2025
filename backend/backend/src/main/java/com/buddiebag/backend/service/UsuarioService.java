package com.buddiebag.backend.service;

import com.buddiebag.backend.dto.UsuarioCreateDto;
import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.dto.UsuarioUpdateDto;
import com.buddiebag.backend.exceptions.EmailJaExisteException;
import com.buddiebag.backend.mapper.UsuarioMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;

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

    public void criarUsuario(UsuarioCreateDto dto) {
        if (usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new EmailJaExisteException("Email já cadastrado");
        }

        if (dto.getSenhaHash() == null || dto.getSenhaHash().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenhaHash(passwordEncoder.encode(dto.getSenhaHash()));
        usuario.setFotoPerfil(dto.getFotoPerfil());

        usuarioRepository.save(usuario);
    }

    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário com id " + id + " não encontrado"));
    }

    public boolean atualizarUsuario(Long id, UsuarioUpdateDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário com id " + id + " não encontrado"));

        if (usuarioRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
            throw new EmailJaExisteException("Email já cadastrado por outro usuário");
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());

        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenhaHash(passwordEncoder.encode(dto.getSenha()));
        }

        usuario.setFotoPerfil(dto.getFotoPerfil());

        usuarioRepository.save(usuario);
        return true;
    }


    public void deletarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário com id " + id + " não encontrado"));
        usuarioRepository.delete(usuario);
    }

}
