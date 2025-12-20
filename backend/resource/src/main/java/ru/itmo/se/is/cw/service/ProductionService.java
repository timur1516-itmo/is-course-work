package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ProductionTaskFilter;
import ru.itmo.se.is.cw.dto.ProductionTaskResponseDto;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.ProductionTaskMapper;
import ru.itmo.se.is.cw.model.ProductionTaskEntity;
import ru.itmo.se.is.cw.model.value.ProductionTaskStatus;
import ru.itmo.se.is.cw.repository.ProductionTaskRepository;
import ru.itmo.se.is.cw.specs.ProductionTaskSpecification;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionTaskRepository productionTaskRepository;
    private final ProductionTaskMapper productionTaskMapper;

    @Transactional(readOnly = true)
    public Page<ProductionTaskResponseDto> getProductionTasks(Pageable pageable, ProductionTaskFilter filter) {
        return productionTaskRepository
                .findAll(ProductionTaskSpecification.byFilter(filter), pageable)
                .map(productionTaskMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ProductionTaskEntity getById(Long id) {
        return productionTaskRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Production task with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public ProductionTaskResponseDto getProductionTaskById(Long id) {
        return productionTaskMapper.toDto(getById(id));
    }

    @Transactional
    public void startProductionTask(Long id) {
        changeStatus(id, ProductionTaskStatus.IN_PROGRESS);
    }

    @Transactional
    public void finishProductionTask(Long id) {
        changeStatus(id, ProductionTaskStatus.COMPLETED);
    }

    @Transactional
    public void changeStatus(Long id, ProductionTaskStatus newStatus) {
        getById(id);
        productionTaskRepository.updateStatusAndSetCurrent(id, newStatus.name());
    }
}

