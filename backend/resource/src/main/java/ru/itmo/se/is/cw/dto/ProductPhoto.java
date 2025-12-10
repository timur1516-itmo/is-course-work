package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Фото товара")
public class ProductPhoto {
    @Schema(description = "Уникальный идентификатор фото", example = "701")
    private Long id;

    @Schema(description = "Уникальный идентификатор связанного файла", example = "201")
    private Long fileId;

    @Schema(description = "URL фото", example = "https://api.example.com/api/v1/files/201/download")
    private String url;
}
