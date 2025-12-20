package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import ru.itmo.se.is.cw.model.value.AccountRole;

@Data
@Schema(description = "Фильтр по сотрудникам")
public class EmployeeFilter {
    @Schema(description = "Фильтровать по роли сотрудника")
    private AccountRole role;
}
