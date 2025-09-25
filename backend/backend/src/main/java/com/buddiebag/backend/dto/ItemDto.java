package com.buddiebag.backend.dto;
import com.buddiebag.backend.model.Item;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ItemDto {
    private Long id;
    private String nome;
    private String descricao;
    private String status;
    private String fotoItem;
    private Long usuarioId;
    private String nomeUsuario;
}
