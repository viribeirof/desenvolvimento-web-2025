package com.buddiebag.backend.dto;

import com.buddiebag.backend.enums.RequestStatus;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class RequestDto {
    private Long id;
    private Long itemId;
    private String itemNome;
    private String message;
    private RequestStatus status;
    private LocalDateTime createdAt;

    private Long requesterId;
    private String requesterNome;
}
