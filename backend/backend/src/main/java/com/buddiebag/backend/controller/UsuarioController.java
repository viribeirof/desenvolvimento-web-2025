package com.buddiebag.backend.controller;

import com.buddiebag.backend.dto.PerfilDto;
import com.buddiebag.backend.dto.UsuarioCreateDto;
import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.dto.UsuarioUpdateDto;
import com.buddiebag.backend.exceptions.EmailJaExisteException;
import com.buddiebag.backend.mapper.UsuarioMapper;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.ItemRepository;
import com.buddiebag.backend.repository.UsuarioRepository;
import com.buddiebag.backend.service.UsuarioService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(
        origins = "http://localhost:5173",
        allowedHeaders = {"Content-Type", "If-None-Match"},
        exposedHeaders = {"ETag"}
)
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final UsuarioRepository usuarioRepository;
    private final ItemRepository itemRepository;

    public UsuarioController(UsuarioRepository usuarioRepository, ItemRepository itemRepository) {
        this.usuarioRepository = usuarioRepository;
        this.itemRepository = itemRepository;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDto>> listar(HttpServletRequest request) throws JsonProcessingException {
        List<UsuarioDto> lista = usuarioService.listar();

        String json = objectMapper.writeValueAsString(lista);
        String eTag = Integer.toHexString(json.hashCode());

        HttpServletRequest originalRequest = request;
        while (originalRequest instanceof HttpServletRequestWrapper) {
            originalRequest = (HttpServletRequest) ((HttpServletRequestWrapper) originalRequest).getRequest();
        }

        String ifNoneMatch = originalRequest.getHeader("If-None-Match");
        if (ifNoneMatch != null) {
            ifNoneMatch = ifNoneMatch.replaceAll("^\"+|\"+$", "");
        }

        if (eTag.equals(ifNoneMatch)) {
            return ResponseEntity.status(HttpStatus.NOT_MODIFIED)
                    .eTag(eTag)
                    .build();
        }

        return ResponseEntity.ok()
                .eTag(eTag)
                .body(lista);
    }

    @PostMapping
    public ResponseEntity<?> criarUsuario(@RequestBody UsuarioCreateDto dto) {
        try {
            usuarioService.criarUsuario(dto);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (EmailJaExisteException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> buscarPorId(@PathVariable Long id) {
        Usuario usuario = usuarioService.buscarPorId(id);
        return ResponseEntity.ok(UsuarioMapper.toDto(usuario));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioUpdateDto dto) {

        boolean atualizado = usuarioService.atualizarUsuario(id, dto);

        if (atualizado) {
            return ResponseEntity.ok(Map.of("message", "Item atualizado com sucesso!"));
        } else {
            return ResponseEntity.status(404)
                    .body(Map.of("message", "Item não encontrado"));
        }
    }
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {

        Usuario user = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Item> itens = itemRepository.findByUsuarioId(user.getId());

        return ResponseEntity.ok(new PerfilDto(user, itens));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deletar(@PathVariable Long id) {
        usuarioService.deletarUsuario(id);
        return ResponseEntity.ok(Map.of("message", "Usuário deletado com sucesso!"));
    }

}
