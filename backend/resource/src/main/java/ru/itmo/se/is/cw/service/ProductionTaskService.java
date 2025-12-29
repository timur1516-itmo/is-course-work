package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ProductionTaskResponseDto;
import ru.itmo.se.is.cw.dto.filter.ProductionTaskFilter;
import ru.itmo.se.is.cw.dto.specification.ProductionTaskSpecification;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.ProductionTaskMapper;
import ru.itmo.se.is.cw.model.*;
import ru.itmo.se.is.cw.model.value.AccountRole;
import ru.itmo.se.is.cw.model.value.EmployeeRole;
import ru.itmo.se.is.cw.model.value.ProductionTaskStatus;
import ru.itmo.se.is.cw.repository.ProductionTaskRepository;
import ru.itmo.se.is.cw.repository.ProductionTaskStatusRepository;

import jakarta.persistence.EntityManager;
import java.time.ZonedDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductionTaskService {

    private final ProductionTaskRepository productionTaskRepository;
    private final ProductionTaskStatusRepository productionTaskStatusRepository;
    private final ProductionTaskMapper productionTaskMapper;
    private final EmployeesService employeesService;
    private final CurrentUserService currentUserService;
    private final ru.itmo.se.is.cw.service.MaterialsService materialsService;
    private final EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ProductionTaskEntity createProductionTask(ClientOrderEntity order) {
        System.out.println("createProductionTask called for order " + order.getId());
        
        if (productionTaskRepository.existsByClientOrderId(order.getId())) {
            System.out.println("Production task already exists for order " + order.getId());
            throw new IllegalStateException("Production task already exists for order " + order.getId());
        }

        EmployeeEntity operator = assignOperator();

        ProductionTaskEntity task = new ProductionTaskEntity();
        task.setClientOrder(order);
        task.setCncOperator(operator);
        task = productionTaskRepository.save(task);
        updateTaskStatus(task, ProductionTaskStatus.QUEUED);

        return task;
    }

    public EmployeeEntity assignOperator() {
        List<EmployeeEntity> operators = employeesService.getEmployeesByRole(EmployeeRole.CNC_OPERATOR);

        if (operators.isEmpty()) {
            throw new IllegalStateException("No CNC operators available");
        }

        EmployeeEntity selectedOperator = null;
        long minActiveTasks = Long.MAX_VALUE;

        for (EmployeeEntity operator : operators) {
            long activeTasksCount = productionTaskRepository.countByCncOperatorIdAndCurrentStatusStatusIn(
                    operator.getId(),
                    List.of(ProductionTaskStatus.QUEUED, ProductionTaskStatus.IN_PROGRESS)
            );

            if (activeTasksCount < minActiveTasks) {
                minActiveTasks = activeTasksCount;
                selectedOperator = operator;
            }
        }

        return selectedOperator;
    }

    public void updateTaskStatus(ProductionTaskEntity task, ProductionTaskStatus status) {
        ProductionTaskStatusEntity statusEntity = new ProductionTaskStatusEntity();
        statusEntity.setProductionTask(task);
        statusEntity.setStatus(status);
        statusEntity.setSetAt(ZonedDateTime.now());
        productionTaskStatusRepository.save(statusEntity);

        task.setCurrentStatus(statusEntity);

        if (status == ProductionTaskStatus.IN_PROGRESS && task.getStartedAt() == null) {
            task.setStartedAt(ZonedDateTime.now());
        } else if (status == ProductionTaskStatus.COMPLETED && task.getFinishedAt() == null) {
            task.setFinishedAt(ZonedDateTime.now());
            
            entityManager.refresh(task.getClientOrder());
            if (task.getClientOrder().getProductDesign() != null) {
                task.getClientOrder().getProductDesign().getRequiredMaterials().size();
            }
            
            try {
                materialsService.recordMaterialConsumptionForOrder(task.getClientOrder());
            } catch (Exception e) {
                System.err.println("Failed to record material consumption for order " + task.getClientOrder().getId() + ": " + e.getMessage());
                e.printStackTrace();
                throw e;
            }
        }

        productionTaskRepository.save(task);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateTaskStatusInNewTransaction(ProductionTaskEntity task, ProductionTaskStatus status) {
        ProductionTaskEntity finalTask = task;
        task = productionTaskRepository.findById(task.getId())
                .orElseThrow(() -> new EntityNotFoundException("Production task with id " + finalTask.getId() + " not found"));
        updateTaskStatus(task, status);
    }

    @Transactional(readOnly = true)
    public ProductionTaskEntity getByOrderId(Long orderId) {
        return productionTaskRepository.findByClientOrderId(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Production task not found for order " + orderId));
    }

    @Transactional(readOnly = true)
    public ProductionTaskEntity getById(Long id) {
        return productionTaskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Production task with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public Page<ProductionTaskResponseDto> getTasks(Pageable pageable, ProductionTaskFilter filter) {
        return productionTaskRepository
                .findAll(ProductionTaskSpecification.byFilter(filter), pageable)
                .map(productionTaskMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<ProductionTaskEntity> getTasksForCurrentOperator() {
        if (!currentUserService.hasRole(AccountRole.CNC_OPERATOR)) {
            throw new IllegalStateException("Current user is not a CNC operator");
        }

        EmployeeEntity operator = employeesService.getByAccountId(currentUserService.getAccountId());
        return productionTaskRepository.findByCncOperatorIdOrderByCreatedAtAsc(operator.getId());
    }

    @Transactional(readOnly = true)
    public ProductionTaskEntity getCurrentTaskForOperator(Long operatorId) {
        return productionTaskRepository
                .findFirstByCncOperatorIdAndCurrentStatusStatusInOrderByCreatedAtAsc(
                        operatorId,
                        List.of(ProductionTaskStatus.QUEUED, ProductionTaskStatus.IN_PROGRESS)
                )
                .orElse(null);
    }

    public ProductionTaskMapper getMapper() {
        return productionTaskMapper;
    }
}

