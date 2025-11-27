package com.buddiebag.backend.repository;

import com.buddiebag.backend.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUsuarioId(Long usuarioId);

    Page<Item> findByNomeContainingIgnoreCase(String nome, Pageable pageable);
}