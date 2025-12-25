package ru.itmo.se.is.cw.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.itmo.se.is.cw.conf.MapperConfig;
import ru.itmo.se.is.cw.dto.ClientRegistrationRequestDto;
import ru.itmo.se.is.cw.dto.ClientResponseDto;
import ru.itmo.se.is.cw.model.ClientEntity;

@Mapper(config = MapperConfig.class)
public interface ClientMapper {
    ClientResponseDto toDto(ClientEntity entity);

    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "person.firstName", source = "firstName")
    @Mapping(target = "person.lastName", source = "lastName")
    ClientEntity toEntity(ClientRegistrationRequestDto dto);
}
