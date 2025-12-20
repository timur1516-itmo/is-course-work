package ru.itmo.se.is.cw.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.itmo.se.is.cw.conf.MapperConfig;
import ru.itmo.se.is.cw.dto.FileVersion;
import ru.itmo.se.is.cw.model.FileVersionEntity;

@Mapper(config = MapperConfig.class)
public interface FileVersionMapper {

    @Mapping(target = "fileId", source = "file.id")
    @Mapping(target = "creatorId", source = "creator.id")
    FileVersion toDto(FileVersionEntity entity);
}
