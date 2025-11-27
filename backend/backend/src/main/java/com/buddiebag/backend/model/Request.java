package com.buddiebag.backend.model;

import com.buddiebag.backend.enums.RequestStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "item_requests")
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long itemId;
    @Column(columnDefinition = "TEXT")
    private String message;
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDENTE;

    private Instant createdAt;
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requester_id")
    @JsonIgnoreProperties({"requestsSent", "requestsReceived", "senha"})
    private Usuario requester;

    @PrePersist public void prePersist(){ createdAt = updatedAt = Instant.now(); }
    @PreUpdate public void preUpdate(){ updatedAt = Instant.now(); }

}
