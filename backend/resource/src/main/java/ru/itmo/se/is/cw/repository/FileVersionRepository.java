package ru.itmo.se.is.cw.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.itmo.se.is.cw.model.FileVersionEntity;

@Repository
public interface FileVersionRepository extends JpaRepository<FileVersionEntity, Long> {
}
