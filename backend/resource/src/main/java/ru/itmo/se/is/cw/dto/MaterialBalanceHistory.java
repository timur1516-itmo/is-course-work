package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;

@Data
@Schema(description = "История баланса материала")
public class MaterialBalanceHistory {
    @Schema(description = "Информация о материале")
    private Material material;

    @Schema(description = "История изменений баланса")
    private List<BalanceEntry> balances;

    @Schema(description = "История расходов")
    private List<MaterialConsumptionRecord> consumptions;

    @Data
    public static class BalanceEntry {
        @Schema(description = "Уникальный идентификатор записи баланса", example = "1601")
        private Long id;

        @Schema(description = "Баланс", example = "15.5")
        private Double balance;

        @Schema(description = "Дата и время изменения", example = "2023-10-20T10:00:00Z")
        private ZonedDateTime changedAt;

        @Schema(description = "Уникальный идентификатор пользователя, изменившего баланс", example = "101")
        private Long changerId;
    }
}
