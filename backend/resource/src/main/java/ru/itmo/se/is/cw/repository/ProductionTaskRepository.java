package ru.itmo.se.is.cw.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.itmo.se.is.cw.model.ProductionTaskEntity;

@Repository
public interface ProductionTaskRepository extends JpaRepository<ProductionTaskEntity, Long>, JpaSpecificationExecutor<ProductionTaskEntity> {

    @Modifying
    @Query(value = "call p_update_production_task_status_and_set_current(:taskId, :status)", nativeQuery = true)
    void updateStatusAndSetCurrent(@Param("taskId") Long taskId,
                                   @Param("status") String status);
}
