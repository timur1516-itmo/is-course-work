package ru.itmo.se.is.cw.mapper;

import org.mapstruct.Mapper;
import ru.itmo.se.is.cw.conf.MapperConfig;
import ru.itmo.se.is.cw.dto.ClientResponseDto;
import ru.itmo.se.is.cw.model.ClientEntity;

@Mapper(config = MapperConfig.class)
public interface ClientMapper {
    ClientResponseDto toDto(ClientEntity entity);
}
