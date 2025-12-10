package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ProductionTask;
import ru.itmo.se.is.cw.model.value.ProductionTaskStatus;
import ru.itmo.se.is.cw.repository.ProductionTaskRepository;
import ru.itmo.se.is.cw.repository.ProductionTaskStatusRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionTaskRepository productionTaskRepository;
    private final ProductionTaskStatusRepository productionTaskStatusRepository;

    @Transactional(readOnly = true)
    public List<ProductionTask> getProductionTasks(ProductionTaskStatus status) {
        return List.of();
    }

    @Transactional(readOnly = true)
    public ProductionTask getProductionTaskById(Long id) {
        return null;
    }

    @Transactional
    public void startProductionTask(Long id) {
    }

    @Transactional
    public void finishProductionTask(Long id) {
    }
}

