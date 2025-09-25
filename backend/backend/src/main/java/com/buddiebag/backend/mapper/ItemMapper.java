package com.buddiebag.backend.mapper;

import com.buddiebag.backend.dto.ItemDto;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.enums.Status;

public class ItemMapper {
    public static ItemDto toDto(Item item) {
        ItemDto dto = new ItemDto();
        dto.setId(item.getId());
        dto.setNome(item.getNome());
        dto.setDescricao(item.getDescricao());
        dto.setStatus(item.getStatus().name());
        dto.setFotoItem(item.getFotoItem());
        if (item.getUsuario() != null) {
            dto.setUsuarioId(item.getUsuario().getId());
            dto.setNomeUsuario(item.getUsuario().getNome());
        }
        return dto;
    }
}
