package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.AddAttachmentRequest;
import ru.itmo.se.is.cw.dto.ClientApplication;
import ru.itmo.se.is.cw.dto.ClientApplicationCreateRequest;
import ru.itmo.se.is.cw.dto.FileMetadata;
import ru.itmo.se.is.cw.repository.ClientApplicationAttachmentRepository;
import ru.itmo.se.is.cw.repository.ClientApplicationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientApplicationsService {

    private final ClientApplicationRepository clientApplicationRepository;
    private final ClientApplicationAttachmentRepository attachmentRepository;

    @Transactional
    public ClientApplication createApplication(ClientApplicationCreateRequest request) {
        return null;
    }

    @Transactional(readOnly = true)
    public List<ClientApplication> getApplications(Long clientId) {
        return List.of();
    }

    @Transactional(readOnly = true)
    public ClientApplication getApplicationById(Long id) {
        return null;
    }

    @Transactional
    public void addAttachmentToApplication(Long id, AddAttachmentRequest request) {
        // TODO: создать связь client_application_attachment
    }

    @Transactional(readOnly = true)
    public List<FileMetadata> getApplicationAttachments(Long id) {
        return List.of();
    }
}
