package ru.itmo.se.is.cw.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.itmo.se.is.cw.conf.MapperConfig;
import ru.itmo.se.is.cw.dto.MessageResponseDto;
import ru.itmo.se.is.cw.model.MessageEntity;

@Mapper(config = MapperConfig.class)
public interface MessageMapper {

    @Mapping(target = "conversationId", source = "conversationParticipant.conversation.id")
    @Mapping(target = "authorId", source = "conversationParticipant.user.id")
    MessageResponseDto toDto(MessageEntity entity);
}
