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
import ru.itmo.se.is.cw.dto.*;

import java.util.List;


@RestController
@RequestMapping("/client-applications")
@Tag(name = "ClientApplications", description = "Операции с клиентскими заявками")
public class ClientApplicationsController {

    @PostMapping
    @Operation(
            summary = "Создание клиентской заявки",
            description = "Создает новую клиентскую заявку, включая описание проблемы, пожелания и дополнительные данные."
    )
    @RequestBody(
            description = "Данные для создания клиентской заявки",
            required = true,
            content = @Content(
                    schema = @Schema(implementation = ClientApplicationCreateRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Заявка успешно создана",
                    content = @Content(
                            schema = @Schema(implementation = ClientApplication.class)
                    )
            )
    })
    public ResponseEntity<ClientApplication> createApplication(
            @RequestBody ClientApplicationCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{clientId}")
    @Operation(
            summary = "Список клиентских заявок",
            description = "Возвращает список заявок определённого клиента."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список заявок клиента",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ClientApplication.class))
                    )
            )
    })
    public ResponseEntity<List<ClientApplication>> getApplications(
            @PathVariable @Parameter(description = "Идентификатор клиента", required = true) Long clientId
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Детали клиентской заявки",
            description = "Возвращает полную информацию о заявке по её идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Заявка найдена",
                    content = @Content(
                            schema = @Schema(implementation = ClientApplication.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<ClientApplication> getApplicationById(
            @PathVariable @Parameter(description = "Идентификатор заявки", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/attachments")
    @Operation(
            summary = "Добавить вложение к заявке",
            description = "Добавляет файл или ссылку на файл в клиентскую заявку."
    )
    @RequestBody(
            description = "Описание файла, который нужно вложить в заявку",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AddAttachmentRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Вложение добавлено"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка или файл не найдены",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> addAttachmentToApplication(
            @PathVariable @Parameter(description = "Идентификатор заявки", required = true) Long id,

            @RequestBody AddAttachmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}/attachments")
    @Operation(
            summary = "Список вложений заявки",
            description = "Возвращает список всех вложенных файлов для указанной заявки."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список вложений",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = FileMetadata.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Заявка не найдена",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<List<FileMetadata>> getApplicationAttachments(
            @PathVariable @Parameter(description = "Идентификатор заявки", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
