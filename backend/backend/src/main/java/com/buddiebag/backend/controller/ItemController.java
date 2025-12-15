package com.buddiebag.backend.controller;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import com.buddiebag.backend.dto.ItemDto;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.repository.ItemRepository;
import com.buddiebag.backend.service.ItemService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/itens")
public class ItemController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping
    public ResponseEntity<List<ItemDto>> listar(HttpServletRequest request) throws JsonProcessingException {
            List<ItemDto> lista = itemService.listarTodos();

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

    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> buscarPorId(@PathVariable Long id) {
        try {
            ItemDto item = itemService.buscarPorId(id);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> criarItem(
            @RequestParam String nome,
            @RequestParam String descricao,
            @RequestParam String status,
            @RequestParam(value = "imagem", required = false) MultipartFile imagem,
            Authentication authentication
    ) {
        String email = authentication.getName();
        System.out.println(email);
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        ItemDto dto = itemService.criarItem(nome, descricao, status, usuario.getId(), imagem);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemDto> atualizarItem(
            @PathVariable Long id,
            @RequestParam String nome,
            @RequestParam String descricao,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) MultipartFile imagem
    ) {
        try {
            ItemDto atualizado = itemService.atualizarItem(id, nome, descricao, status, imagem);
            return ResponseEntity.ok(atualizado);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletarItem(@PathVariable Long id) {
        itemService.deletarItem(id);
        return ResponseEntity.ok(Map.of("message", "Item deletado com sucesso!"));
    }


    @GetMapping("/usuario/{usuarioId}")
    public List<ItemDto> listarPorUsuario(@PathVariable Long usuarioId) {
        return itemService.listarPorUsuario(usuarioId);
    }

    @GetMapping("/{id}/foto")
    public ResponseEntity<byte[]> pegarFoto(@PathVariable Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item não encontrado"));

        if (item.getFotoItem() == null || item.getFotoItem().isBlank()) {
            return ResponseEntity.notFound().build();
        }

        byte[] bytes = Base64.getDecoder().decode(item.getFotoItem());
        String contentType = item.getFotoItemContentType() != null ? item.getFotoItemContentType() : "image/jpeg";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(bytes);
    }
}
