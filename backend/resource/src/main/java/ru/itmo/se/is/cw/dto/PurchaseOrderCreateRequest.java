package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Запрос на создание заявки на закупку")
public class PurchaseOrderCreateRequest {
    @Schema(description = "Список материалов в заявке")
    private List<PurchaseOrderMaterialItem> materials;
}
