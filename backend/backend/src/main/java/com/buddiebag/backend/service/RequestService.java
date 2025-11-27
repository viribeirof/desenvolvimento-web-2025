package com.buddiebag.backend.service;

import com.buddiebag.backend.enums.RequestStatus;
import com.buddiebag.backend.enums.Status;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.model.Request;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.ItemRepository;
import com.buddiebag.backend.repository.RequestRepository;
import com.buddiebag.backend.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@Transactional
public class RequestService {
    private final RequestRepository reqRepo;
    private final ItemRepository itemRepo;
    private final UsuarioRepository usuarioRepo;

    public RequestService(RequestRepository reqRepo, ItemRepository itemRepo,
                          UsuarioRepository usuarioRepo){
        this.reqRepo = reqRepo;
        this.itemRepo = itemRepo;
        this.usuarioRepo = usuarioRepo;
    }

    public Request createRequest(Long requesterId, Long itemId, String message){
        Item item = itemRepo.findById(itemId).orElseThrow(() -> new EntityNotFoundException("Item não encontrado"));
        if (item.getUsuario() == null) {
            throw new EntityNotFoundException("Dono do item não encontrado");
        }
        if (Objects.equals(item.getUsuario().getId(), requesterId)) {
            throw new IllegalArgumentException("Não pode solicitar seu próprio item");
        }
        Usuario requester = usuarioRepo.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Request r = new Request();
        r.setRequester(requester);
        r.setItemId(itemId);
        r.setMessage(message);
        r.setStatus(RequestStatus.PENDENTE);
        r = reqRepo.save(r);
        return r;
    }

    public List<Request> listReceived(Long userId){
        List<Item> mine = itemRepo.findByUsuarioId(userId);
        if (mine == null || mine.isEmpty()) return List.of();
        List<Long> ids = mine.stream().map(Item::getId).collect(Collectors.toList());
        return reqRepo.findByItemIdInOrderByCreatedAtDesc(ids);
    }

    public List<Request> listSent(Long requesterId){
        return reqRepo.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    @Transactional
    public Request respond(Long userId, Long requestId, RequestStatus action) {
        Request r = reqRepo.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request não encontrada"));
        Item item = itemRepo.findById(r.getItemId())
                .orElseThrow(() -> new EntityNotFoundException("Item não encontrado"));

        if (item.getUsuario() == null) {
            throw new EntityNotFoundException("Dono do item não encontrado");
        }

        Usuario owner = item.getUsuario();
        if (!Objects.equals(owner.getId(), userId)) {
            throw new AccessDeniedException("Somente dono pode responder");
        }

        if (action == RequestStatus.ACEITA) {
            item.setStatus(Status.INDISPONIVEL);
            itemRepo.save(item);

            r.setStatus(RequestStatus.ACEITA);
            reqRepo.save(r);

            List<Request> pendentes = reqRepo.findByItemIdAndStatus(item.getId(), RequestStatus.PENDENTE);
            for (Request other : pendentes) {
                if (!other.getId().equals(r.getId())) {
                    other.setStatus(RequestStatus.RECUSADA);
                    reqRepo.save(other);
                }
            }

        } else {
            r.setStatus(RequestStatus.RECUSADA);
        }

        return r;
    }
}
