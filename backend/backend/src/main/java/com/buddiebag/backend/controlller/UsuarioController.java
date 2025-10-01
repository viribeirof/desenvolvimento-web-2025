package com.buddiebag.backend.controlller;

import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.dto.UsuarioUpdateDto;
import com.buddiebag.backend.mapper.UsuarioMapper;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.service.UsuarioService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<Page<UsuarioDto>> listar(
            @PageableDefault(size = 5, sort = "nome", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UsuarioDto> page = usuarioService.listarTodos(pageable);
        return ResponseEntity.ok(page);
    }

    @PostMapping
    public ResponseEntity<Object> criar(@RequestBody Usuario usuario) {
        usuarioService.criarUsuario(usuario);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Usuário criado com sucesso!"));    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarPorId(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));
        return ResponseEntity.ok(UsuarioMapper.toDto(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateDto dto) {

        boolean atualizado = usuarioService.atualizarUsuario(id, dto);

        if (atualizado) {
            return ResponseEntity.ok(Map.of("message", "Usuário atualizado com sucesso!"));
        } else {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Usuário não encontrado"));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        boolean deletado = usuarioService.deletarUsuario(id);
        if (!deletado) {
            throw new EntityNotFoundException("Usuário não encontrado ou não pode ser deletado");
        }
        return ResponseEntity.ok(Map.of("message", "Usuário deletado com sucesso!"));
    }

}
