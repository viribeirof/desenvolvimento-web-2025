package com.buddiebag.backend.service;

import com.buddiebag.backend.dto.ItemDto;
import com.buddiebag.backend.enums.Status;
import com.buddiebag.backend.mapper.ItemMapper;
import com.buddiebag.backend.model.Item;
import com.buddiebag.backend.model.Usuario;
import com.buddiebag.backend.repository.ItemRepository;
import com.buddiebag.backend.repository.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FileStorageService fileStorageService;


    public List<ItemDto> listarTodos() {
        return itemRepository.findAll(Sort.by(Sort.Direction.DESC, "dataAtualizacao"))
                .stream()
                .map(ItemMapper::toDto)
                .collect(Collectors.toList());
    }

    public ItemDto buscarPorId(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item com id " + id + " não encontrado"));
        return ItemMapper.toDto(item);
    }


    public ItemDto criarItem(String nome, String descricao, String status, Long usuarioId, MultipartFile imagem) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado"));

        Item item = new Item();
        item.setNome(nome);
        item.setDescricao(descricao);
        item.setStatus(Status.valueOf(status));
        item.setUsuario(usuario);

        if (imagem != null && !imagem.isEmpty()) {
            String contentType = imagem.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("Arquivo enviado não é uma imagem");
            }
            if (imagem.getSize() > (3L * 1024 * 1024)) {
                throw new IllegalArgumentException("Imagem muito grande (máx 3MB)");
            }

            String filename = fileStorageService.store(imagem);

            String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
            String fileUrl = baseUrl + "/uploads/" + filename;

            item.setFotoItem(fileUrl);
            item.setFotoItemContentType(contentType);
        }

        Item salvo = itemRepository.save(item);
        return ItemMapper.toDto(salvo);
    }


    public ItemDto atualizarItem(
            Long id,
            String nome,
            String descricao,
            String status,
            MultipartFile imagem
    ) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item com id " + id + " não encontrado"));

        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("Nome não pode ser vazio");
        }
        if (descricao == null || descricao.isBlank()) {
            throw new IllegalArgumentException("Descrição não pode ser vazia");
        }

        item.setNome(nome);
        item.setDescricao(descricao);
        if (status != null) item.setStatus(Status.valueOf(status));

        if (imagem != null && !imagem.isEmpty()) {
            String oldUrl = item.getFotoItem();
            if (oldUrl != null && oldUrl.contains("/uploads/")) {
                String oldFilename = oldUrl.substring(oldUrl.lastIndexOf('/') + 1);
                boolean deleted = fileStorageService.delete(oldFilename);
                if (!deleted) {
                    throw new IllegalStateException("Não foi possível remover a imagem antiga: " + oldFilename);
                }
            }

            String filename = fileStorageService.store(imagem);
            String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString() + "/uploads/" + filename;
            item.setFotoItem(fileUrl);
            item.setFotoItemContentType(imagem.getContentType());
        }

        item.setDataAtualizacao(LocalDateTime.now());
        Item atualizado = itemRepository.save(item);

        return ItemMapper.toDto(atualizado);
    }

    public void deletarItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item com id " + id + " não encontrado"));
        itemRepository.delete(item);
    }

    public List<ItemDto> listarPorUsuario(Long usuarioId) {
        List<Item> itens = itemRepository.findByUsuarioId(usuarioId);
        return itens.stream().map(ItemMapper::toDto).toList();
    }

}
