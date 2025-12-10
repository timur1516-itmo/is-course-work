package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.repository.MaterialBalanceRepository;
import ru.itmo.se.is.cw.repository.MaterialConsumptionRepository;
import ru.itmo.se.is.cw.repository.MaterialRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialsService {

    private final MaterialRepository materialRepository;
    private final MaterialBalanceRepository materialBalanceRepository;
    private final MaterialConsumptionRepository materialConsumptionRepository;

    @Transactional(readOnly = true)
    public List<Material> getMaterials() {
        return List.of();
    }

    @Transactional
    public Material createMaterial(MaterialCreateRequest request) {
        return null;
    }

    @Transactional(readOnly = true)
    public Material getMaterialById(Long id) {
        return null;
    }

    @Transactional
    public Material updateMaterial(Long id, MaterialUpdateRequest request) {
        return null;
    }

    @Transactional
    public void deleteMaterial(Long id) {
    }

    @Transactional(readOnly = true)
    public List<Material> getLowStockMaterials() {
        return List.of();
    }

    @Transactional(readOnly = true)
    public MaterialBalanceHistory getMaterialBalanceHistory(Long id) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<MaterialConsumptionRecord> getMaterialsConsumptionByOrder(Long orderId) {
        return List.of();
    }
}
