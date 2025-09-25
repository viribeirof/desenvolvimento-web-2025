package com.buddiebag.backend.controlller;

import com.buddiebag.backend.dto.ItemDto;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/itens")
public class ItemController {
    @Autowired
    private ItemService itemService;

    @GetMapping
    public List<ItemDto> listar() {
        return itemService.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemDto> buscarPorId(@PathVariable Long id) {
        return itemService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ItemDto> criar(@RequestBody Item item,
                                         @RequestParam Long usuarioId) {
        ItemDto dto = itemService.criarItem(item, usuarioId);
        return ResponseEntity.status(201).body(dto);
    }

    @PutMapping("/{id}")
    public Item atualizarItem(@PathVariable Long id, @RequestBody Item item) {
        return itemService.atualizarItem(id, item);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarItem(@PathVariable Long id) {
        itemService.deletarItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Item> listarPorUsuario(@PathVariable Long usuarioId) {
        return itemService.listarPorUsuario(usuarioId);
    }
}
