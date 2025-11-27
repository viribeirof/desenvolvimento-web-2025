package com.buddiebag.backend.controller;

import com.buddiebag.backend.enums.RequestStatus;
import com.buddiebag.backend.model.Request;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.UsuarioRepository;
import com.buddiebag.backend.service.RequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/requests")
public class RequestController {
    private final RequestService svc;
    private final UsuarioRepository usuarioRepo;
    public RequestController(RequestService svc, UsuarioRepository usuarioRepo){ this.svc = svc; this.usuarioRepo = usuarioRepo; }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String,String> body, Authentication auth){
        String principal = auth.getName();
        Usuario user = usuarioRepo.findByEmail(principal).orElseThrow(() -> new RuntimeException("Usuário não encontrado")); // adapte se principal já for id
        Long requesterId = user.getId();
        Long itemId = Long.valueOf(body.get("itemId"));
        String message = body.getOrDefault("message", "");
        Request created = svc.createRequest(requesterId, itemId, message);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/received")
    public ResponseEntity<?> received(Authentication auth){
        Usuario user = usuarioRepo.findByEmail(auth.getName())  .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(svc.listReceived(user.getId()));
    }

    @GetMapping("/sent")
    public ResponseEntity<?> sent(Authentication auth){
        Usuario user = usuarioRepo.findByEmail(auth.getName())  .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return ResponseEntity.ok(svc.listSent(user.getId()));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> respond(@PathVariable Long id, @RequestBody Map<String,String> body, Authentication auth){
        Usuario user = usuarioRepo.findByEmail(auth.getName())  .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        String action = body.get("action"); // "ACEITA" or "RECUSA"
        RequestStatus st = "ACEITA".equalsIgnoreCase(action) ? RequestStatus.ACEITA : RequestStatus.RECUSADA;
        Request updated = svc.respond(user.getId(), id, st);
        return ResponseEntity.ok(updated);
    }

}

