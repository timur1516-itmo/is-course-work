package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.itmo.se.is.cw.dto.Employee;
import ru.itmo.se.is.cw.dto.EmployeeCreateRequest;
import ru.itmo.se.is.cw.dto.ErrorResponse;
import ru.itmo.se.is.cw.model.value.AccountRole;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Операции администратора")
public class AdminController {

    @PostMapping("/employees")
    @Operation(
            summary = "Создание сотрудника",
            description = "Создание учетной записи сотрудника, персональных данных и назначение роли."
    )
    @RequestBody(
            description = "Данные нового сотрудника",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = EmployeeCreateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Сотрудник успешно создан",
                    content = @Content(
                            schema = @Schema(implementation = Employee.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректные данные",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещён",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Employee> createEmployee(
            @RequestBody EmployeeCreateRequest request
    ) {
        // TODO: Реализовать логику создания сотрудника
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/employees")
    @Operation(
            summary = "Список сотрудников",
            description = "Возвращает коллекцию сотрудников, отфильтрованную по роли."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Коллекция сотрудников",
                    content = @Content(
                            array = @ArraySchema(
                                    schema = @Schema(implementation = Employee.class)
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Некорректный параметр запроса",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Доступ запрещён",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<List<Employee>> getEmployees(
            @Parameter(
                    description = "Роль сотрудника для фильтрации",
                    required = true
            )
            @RequestParam("role") AccountRole role
    ) {
        // TODO: Реализовать логику получения списка сотрудников
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
