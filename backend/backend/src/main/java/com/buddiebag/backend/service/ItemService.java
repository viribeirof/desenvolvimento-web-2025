package com.buddiebag.backend.service;

import com.buddiebag.backend.dto.ItemDto;
import com.buddiebag.backend.enums.Status;
import com.buddiebag.backend.mapper.ItemMapper;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.ItemRepository;
import com.buddiebag.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ItemService {
    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<ItemDto> listarTodos() {
        return itemRepository.findAll()
                .stream()
                .map(ItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public Optional<ItemDto> buscarPorId(Long id) {
        return itemRepository.findById(id)
                .map(ItemMapper::toDto);
    }

    public ItemDto criarItem(Item item, Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        item.setUsuario(usuario);

        if (item.getStatus() == null) {
            item.setStatus(Status.DISPONIVEL);
        }

        Item salvo = itemRepository.save(item);
        return ItemMapper.toDto(salvo);
    }

    public Item atualizarItem(Long id, Item novoItem) {
        Item itemExistente = itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        itemExistente.setNome(novoItem.getNome());
        itemExistente.setDescricao(novoItem.getDescricao());
        itemExistente.setStatus(novoItem.getStatus());
        itemExistente.setFotoItem(novoItem.getFotoItem());
        itemExistente.setDataAtualizacao(LocalDateTime.now());

        return itemRepository.save(itemExistente);
    }

    // Deletar item
    public void deletarItem(Long id) {
        itemRepository.deleteById(id);
    }

    // Listar itens de um usuário específico
    public List<Item> listarPorUsuario(Long usuarioId) {
        return itemRepository.findByUsuarioId(usuarioId);
    }
}
