package ru.itmo.se.is.cw.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.se.is.cw.dto.ErrorResponse;
import ru.itmo.se.is.cw.dto.FileMetadata;
import ru.itmo.se.is.cw.dto.FileVersion;

import java.util.List;


@RestController
@RequestMapping("/files")
@Tag(name = "Files", description = "Операции с файлами")
public class FilesController {


    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Загрузка нового файла",
            description = "Загружает новый файл в систему и возвращает его метаданные."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Файл загружен",
                    content = @Content(
                            schema = @Schema(implementation = FileMetadata.class)
                    )
            )
    })
    public ResponseEntity<FileMetadata> uploadFile(
            @Parameter(description = "Загружаемый файл", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}")
    @Operation(
            summary = "Получить метаданные файла",
            description = "Возвращает метаданные файла по его идентификатору."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Метаданные файла",
                    content = @Content(
                            schema = @Schema(implementation = FileMetadata.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Файл не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<FileMetadata> getFileMetadata(
            @PathVariable @Parameter(description = "Идентификатор файла", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping(
            value = "/{id}/download",
            produces = MediaType.APPLICATION_OCTET_STREAM_VALUE
    )
    @Operation(
            summary = "Скачать файл",
            description = "Возвращает бинарное содержимое файла для скачивания."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Бинарное содержимое файла"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Файл не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> downloadFile(
            @PathVariable @Parameter(description = "Идентификатор файла", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}/versions")
    @Operation(
            summary = "Список версий файла",
            description = "Возвращает список всех доступных версий файла."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Версии файла",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = FileVersion.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Файл не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<List<FileVersion>> getFileVersions(
            @PathVariable @Parameter(description = "Идентификатор файла", required = true) Long id
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Загрузить новую версию файла",
            description = "Добавляет новую версию существующего файла."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Новая версия создана",
                    content = @Content(
                            schema = @Schema(implementation = FileVersion.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Файл не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<FileVersion> uploadNewFileVersion(
            @PathVariable @Parameter(description = "Идентификатор файла", required = true) Long id,

            @Parameter(description = "Новая версия файла", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping(
            value = "/{id}/versions/{versionId}/download",
            produces = MediaType.APPLICATION_OCTET_STREAM_VALUE
    )
    @Operation(
            summary = "Скачать конкретную версию файла",
            description = "Возвращает бинарное содержимое указанной версии файла."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Бинарное содержимое версии"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Файл или версия не найдены",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Void> downloadFileVersion(
            @PathVariable @Parameter(description = "Идентификатор файла", required = true) Long id,

            @PathVariable @Parameter(description = "Идентификатор версии файла", required = true) Long versionId
    ) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
