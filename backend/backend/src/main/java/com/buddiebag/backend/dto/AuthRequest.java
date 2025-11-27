package com.buddiebag.backend.dto;


import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AuthRequest {
    private String email;

    @Size(min = 6, message = "A senha deve ter no mínimo 6 caracteres")
    private String senha;
}
