package com.buddiebag.backend.controlller;

import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.mapper.UsuarioMapper;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioDto> listar() {
        return usuarioService.listarTodos();
    }

    @PostMapping
    public ResponseEntity<String> criar(@RequestBody Usuario usuario) {
        usuarioService.criarUsuario(usuario);
        return ResponseEntity.status(201).body("Usuário criado com sucesso!");
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> buscarPorId(@PathVariable Long id) {
        return usuarioService.buscarPorId(id)
                .map(UsuarioMapper::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
