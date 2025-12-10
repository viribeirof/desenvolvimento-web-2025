package com.buddiebag.backend.service;

import com.buddiebag.backend.dto.UsuarioCreateDto;
import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.dto.UsuarioUpdateDto;
import com.buddiebag.backend.exceptions.EmailJaExisteException;
import com.buddiebag.backend.mapper.UsuarioMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final ObjectMapper mapper = new ObjectMapper();

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder,
                          FileStorageService fileStorageService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
    }

    public List<UsuarioDto> listar() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void criarUsuario(UsuarioCreateDto dto) {
        String email = dto.getEmail() != null ? dto.getEmail().trim().toLowerCase() : null;
        String senha = dto.getSenha();

        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email é obrigatório");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailJaExisteException("Email já cadastrado");
        }

        if (!StringUtils.hasText(senha)) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }
        if (senha.length() < 6) {
            throw new IllegalArgumentException("Senha deve ter pelo menos 8 caracteres");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(senha));

        if (dto.getPapel() != null) {
            usuario.setPapel(dto.getPapel());
        }

        if (dto.getFotoPerfil() != null && !dto.getFotoPerfil().isBlank()) {
            String filename = fileStorageService.storeBase64AsFile(dto.getFotoPerfil(), dto.getFotoPerfilContentType());
            String url = fileStorageService.getFileUrl(filename);
            usuario.setFotoPerfil(url);
            usuario.setFotoPerfilContentType(dto.getFotoPerfilContentType());
        } else {
            usuario.setFotoPerfil(null);
            usuario.setFotoPerfilContentType(null);
        }

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

        if (dto.getFotoPerfil() != null && !dto.getFotoPerfil().isBlank()) {
            String oldUrl = usuario.getFotoPerfil();
            if (oldUrl != null && !oldUrl.isBlank()) {
                try {
                    fileStorageService.deleteByUrl(oldUrl);
                } catch (Exception ignored) {
                }
            }

            String filename = fileStorageService.storeBase64AsFile(dto.getFotoPerfil(), dto.getFotoPerfilContentType());
            String newUrl = fileStorageService.getFileUrl(filename);
            usuario.setFotoPerfil(newUrl);
            usuario.setFotoPerfilContentType(dto.getFotoPerfilContentType());
        }

        usuarioRepository.save(usuario);
        return true;
    }

    public void deletarUsuario(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário com id " + id + " não encontrado"));

        String url = usuario.getFotoPerfil();
        if (url != null && !url.isBlank()) {
            try {
                fileStorageService.deleteByUrl(url);
            } catch (Exception ignored) {
            }
        }

        usuarioRepository.delete(usuario);
    }
}
