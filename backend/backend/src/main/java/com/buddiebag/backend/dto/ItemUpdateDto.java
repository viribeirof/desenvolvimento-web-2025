package com.buddiebag.backend.dto;

import com.buddiebag.backend.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemUpdateDto {

    private String nome;

    private String descricao;

    private Status status;

    private String fotoItem;

    private String fotoItemContentType;
}

