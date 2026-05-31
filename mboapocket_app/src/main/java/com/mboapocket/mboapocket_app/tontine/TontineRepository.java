package com.mboapocket.mboapocket_app.tontine;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TontineRepository extends JpaRepository<Tontine, Long> {

    List<Tontine> findByCreatorId(Long creatorId);

    @Query("SELECT t FROM Tontine t JOIN TontineMember m ON t.id = m.tontineId WHERE m.userId = :userId")
    List<Tontine> findByMemberUserId(Long userId);
}
