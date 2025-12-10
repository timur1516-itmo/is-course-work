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

import java.time.ZonedDateTime;
import java.util.List;


@RestController
@RequestMapping("/conversations")
@Tag(name = "Conversations", description = "Операции с диалогами")
public class ConversationsController {


    @GetMapping("/{id}")
    @Operation(
            summary = "Получить диалог по заказу",
            description = "Возвращает информацию о диалоге, связанном с указанным заказом."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Диалог найден",
                    content = @Content(
                            schema = @Schema(implementation = Conversation.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Диалог не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Conversation> getConversation(
            @PathVariable @Parameter(description = "Идентификатор диалога", required = true) Long id
    ) {
        // TODO: Реализовать логику получения диалога
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}/messages")
    @Operation(
            summary = "Сообщения диалога",
            description = "Возвращает список сообщений диалога с момента указанной даты."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список сообщений",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = Message.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Диалог не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<List<Message>> getMessages(
            @PathVariable @Parameter(description = "Идентификатор диалога", required = true) Long id,

            @Parameter(description = "Возвращать сообщения начиная с этой даты/времени", required = true)
            @RequestParam("since") ZonedDateTime since,

            @Parameter(description = "Максимальное количество сообщений", required = true)
            @RequestParam("limit") Integer limit
    ) {
        // TODO: Реализовать логику получения сообщений
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @PostMapping("/{id}/messages")
    @Operation(
            summary = "Отправить сообщение в диалог",
            description = "Добавляет новое сообщение в указанный диалог."
    )
    @RequestBody(
            description = "Данные отправляемого сообщения",
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = SendMessageRequest.class)
            )
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Сообщение отправлено",
                    content = @Content(
                            schema = @Schema(implementation = Message.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Диалог не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<Message> sendMessage(
            @PathVariable @Parameter(description = "Идентификатор диалога", required = true) Long id,

            @RequestBody SendMessageRequest request
    ) {
        // TODO: Реализовать логику отправки сообщения
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }


    @GetMapping("/{id}/participants")
    @Operation(
            summary = "Участники диалога",
            description = "Возвращает список всех участников указанного диалога."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Список участников диалога",
                    content = @Content(
                            array = @ArraySchema(schema = @Schema(implementation = ConversationParticipant.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Диалог не найден",
                    content = @Content(
                            schema = @Schema(implementation = ErrorResponse.class)
                    )
            )
    })
    public ResponseEntity<List<ConversationParticipant>> getParticipants(
            @PathVariable @Parameter(description = "Идентификатор диалога", required = true) Long id
    ) {
        // TODO: Реализовать логику получения участников диалога
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
}
