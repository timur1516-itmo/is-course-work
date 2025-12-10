package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.itmo.se.is.cw.dto.FileMetadata;
import ru.itmo.se.is.cw.dto.FileVersion;
import ru.itmo.se.is.cw.repository.FileRepository;
import ru.itmo.se.is.cw.repository.FileVersionRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FilesService {

    private final FileRepository fileRepository;
    private final FileVersionRepository fileVersionRepository;

    @Transactional
    public FileMetadata uploadFile(MultipartFile file) {
        // TODO: сохранить файл + версию, вернуть метаданные
        return null;
    }

    @Transactional(readOnly = true)
    public FileMetadata getFileMetadata(Long id) {
        // TODO: найти файл, замаппить
        return null;
    }

    @Transactional(readOnly = true)
    public List<FileVersion> getFileVersions(Long id) {
        // TODO: найти версии по fileId, замаппить
        return List.of();
    }

    @Transactional
    public FileVersion uploadNewFileVersion(Long id, MultipartFile file) {
        // TODO: новая версия для существующего файла
        return null;
    }
}
