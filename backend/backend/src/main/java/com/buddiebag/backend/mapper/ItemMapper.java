package com.buddiebag.backend.mapper;

import com.buddiebag.backend.dto.ItemDto;
import com.buddiebag.backend.model.Item;

public class ItemMapper {
    public static ItemDto toDto(Item item) {
        ItemDto dto = new ItemDto();
        dto.setId(item.getId());
        dto.setNome(item.getNome());
        dto.setDescricao(item.getDescricao());
        dto.setStatus(item.getStatus().name());
        dto.setFotoItem(item.getFotoItem());
        if (item.getUsuario() != null) {
            dto.setNomeUsuario(item.getUsuario().getNome());
            dto.setUserEmail(item.getUsuario().getEmail());
            dto.setUsuarioId(item.getUsuario().getId());
        }
        return dto;
    }
}
