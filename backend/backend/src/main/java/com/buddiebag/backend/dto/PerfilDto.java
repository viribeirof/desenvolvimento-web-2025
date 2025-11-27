package com.buddiebag.backend.dto;

import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PerfilDto {
    private Usuario usuario;
    private List<Item> itens;
}
