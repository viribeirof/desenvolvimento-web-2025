package com.buddiebag.backend.model;

import com.buddiebag.backend.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity

public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    private Status status = Status.DISPONIVEL;

    private String fotoItem;

    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @PrePersist
    public void aoCriar() {
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();

        if (this.status == null) {
            this.status = Status.DISPONIVEL;
        }

    }

    @PreUpdate
    public void aoAtualizar() {
        this.dataAtualizacao = LocalDateTime.now();
    }

}
