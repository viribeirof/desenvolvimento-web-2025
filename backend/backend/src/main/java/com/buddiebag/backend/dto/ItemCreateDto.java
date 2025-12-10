package com.buddiebag.backend.dto;
import com.buddiebag.backend.enums.Status;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ItemCreateDto {

    @NotBlank(message = "O nome é obrigatório")
    private String nome;

    @NotBlank(message = "A descrição do item é obrigatória")
    private String descricao;

    private Status status;

    private String fotoItem;

    private String fotoItemContentType;

    private Long usuarioId;
}
