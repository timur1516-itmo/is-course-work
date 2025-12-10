package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.repository.ProductCatalogRepository;
import ru.itmo.se.is.cw.repository.ProductPhotoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ProductCatalogRepository productCatalogRepository;
    private final ProductPhotoRepository productPhotoRepository;

    @Transactional(readOnly = true)
    public ProductCatalogPage getProducts(int page, int size, String category, String search) {
        // TODO: пейджинация, фильтрация, маппинг в ProductCatalogPage
        return null;
    }

    @Transactional
    public ProductCatalogItem createProduct(ProductCatalogItemCreateRequest request) {
        // TODO: создать ProductCatalogEntity
        return null;
    }

    @Transactional(readOnly = true)
    public ProductCatalogItem getProductById(Long id) {
        return null;
    }

    @Transactional
    public ProductCatalogItem updateProduct(Long id, ProductCatalogItemUpdateRequest request) {
        return null;
    }

    @Transactional
    public void deleteProduct(Long id) {
        // TODO: удалить
    }

    @Transactional(readOnly = true)
    public List<ProductPhoto> getProductPhotos(Long id) {
        return List.of();
    }
}

