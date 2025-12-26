package ru.itmo.se.is.cw.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "Запрос на отправку сообщения")
public class SendMessageRequestDto {
    // TODO: Хотелось бы еще, чтобы имя и фамилия отправителя передавались
    @Schema(description = "Содержание сообщения", example = "Новый комментарий.")
    private String content;
}
