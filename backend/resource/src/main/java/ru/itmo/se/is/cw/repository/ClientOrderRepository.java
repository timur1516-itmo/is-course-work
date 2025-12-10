package ru.itmo.se.is.cw.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.se.is.cw.model.ClientOrderEntity;

@Repository
public interface ClientOrderRepository extends JpaRepository<ClientOrderEntity, Long> {
}
