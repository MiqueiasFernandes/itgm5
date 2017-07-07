package com.itgm.repository;

import com.itgm.domain.Prognose;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Spring Data JPA repository for the Prognose entity.
 */
@SuppressWarnings("unused")
public interface PrognoseRepository extends JpaRepository<Prognose,Long> {

    @Query("select distinct prognose from Prognose prognose left join fetch prognose.modeloExclusivos")
    List<Prognose> findAllWithEagerRelationships();

    @Query("select prognose from Prognose prognose left join fetch prognose.modeloExclusivos where prognose.id =:id")
    Prognose findOneWithEagerRelationships(@Param("id") Long id);

    @Query("select prognose from Prognose prognose where prognose.ajuste.projeto.user.login = ?#{principal.username}")
    Page<Prognose> findByUserIsCurrentUser(Pageable pageable);

}
