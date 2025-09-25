package com.buddiebag.backend.mapper;

import com.buddiebag.backend.dto.UsuarioDto;
import com.buddiebag.backend.model.Usuario;

public class UsuarioMapper {

    public static UsuarioDto toDto(Usuario usuario) {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        return dto;
    }
}
