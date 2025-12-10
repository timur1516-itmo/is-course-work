package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ProductDesign;
import ru.itmo.se.is.cw.dto.ProductDesignUpdateRequest;
import ru.itmo.se.is.cw.repository.ProductDesignRepository;

@Service
@RequiredArgsConstructor
public class DesignsService {

    private final ProductDesignRepository productDesignRepository;

    @Transactional(readOnly = true)
    public ProductDesign getDesignByOrderId(Long orderId) {
        // TODO: через client_order.product_design_id
        return null;
    }

    @Transactional
    public ProductDesign createOrUpdateDesignForOrder(Long orderId, ProductDesignUpdateRequest request) {
        // TODO: найти/создать design, связать с order
        return null;
    }
}

