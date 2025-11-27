package com.buddiebag.backend.repository;

import com.buddiebag.backend.enums.RequestStatus;
import com.buddiebag.backend.model.Request;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByItemIdInOrderByCreatedAtDesc(List<Long> itemIds);
    List<Request> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    List<Request> findByItemIdAndStatus(Long itemId, RequestStatus status);

}