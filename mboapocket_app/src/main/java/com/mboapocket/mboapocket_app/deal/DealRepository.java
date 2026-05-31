package com.mboapocket.mboapocket_app.deal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {

    List<Deal> findByCategorie(String categorie);

    // Haversine formula — retourne les deals dans un rayon donné (km)
    @Query(value = """
        SELECT *, (
          6371 * ACOS(
            COS(RADIANS(:lat)) * COS(RADIANS(latitude))
            * COS(RADIANS(longitude) - RADIANS(:lng))
            + SIN(RADIANS(:lat)) * SIN(RADIANS(latitude))
          )
        ) AS distance
        FROM deals
        WHERE (
          6371 * ACOS(
            COS(RADIANS(:lat)) * COS(RADIANS(latitude))
            * COS(RADIANS(longitude) - RADIANS(:lng))
            + SIN(RADIANS(:lat)) * SIN(RADIANS(latitude))
          )
        ) <= :rayon
        ORDER BY distance ASC
        """, nativeQuery = true)
    List<Deal> findNearby(@Param("lat") double lat,
                          @Param("lng") double lng,
                          @Param("rayon") double rayon);
}
