package ru.itmo.se.is.cw.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.se.is.cw.model.ClientOrderStatusEntity;

@Repository
public interface ClientOrderStatusRepository extends JpaRepository<ClientOrderStatusEntity, Long> {
}
