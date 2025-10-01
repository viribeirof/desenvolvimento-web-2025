package com.buddiebag.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioUpdateDto {
    @NotBlank
    private String nome;

    @NotBlank
    @Email
    private String email;

    private String senha;

    private String fotoPerfil;
}
