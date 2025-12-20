package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.ClientApplicationAttachmentMapper;
import ru.itmo.se.is.cw.mapper.ClientApplicationMapper;
import ru.itmo.se.is.cw.mapper.FileMapper;
import ru.itmo.se.is.cw.model.ClientApplicationAttachmentEntity;
import ru.itmo.se.is.cw.model.ClientApplicationEntity;
import ru.itmo.se.is.cw.model.ClientEntity;
import ru.itmo.se.is.cw.model.FileEntity;
import ru.itmo.se.is.cw.model.value.AccountRole;
import ru.itmo.se.is.cw.repository.ClientApplicationAttachmentRepository;
import ru.itmo.se.is.cw.repository.ClientApplicationRepository;
import ru.itmo.se.is.cw.specs.ClientApplicationSpecification;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ClientApplicationsService {

    private final ClientApplicationRepository clientApplicationRepository;
    private final ClientApplicationAttachmentRepository attachmentRepository;
    private final ClientApplicationMapper clientApplicationMapper;
    private final ClientApplicationAttachmentMapper attachmentMapper;
    private final FileMapper fileMapper;
    private final FilesService filesService;
    private final ClientsService clientsService;
    private final DesignsService designsService;

    @Transactional
    public ClientApplicationResponseDto createApplication(ClientApplicationRequestDto request) {
        Long accountId = getCurrentAccountId();

        ClientApplicationEntity application = clientApplicationMapper.toEntity(request);
        application.setTemplateProductDesign(
                designsService.getById(request.getTemplateProductDesignId())
        );
        application.setClient(
                clientsService.getByAccountId(accountId)
        );
        request.getAttachmentFileIds().forEach(fileId -> {
            if (attachmentRepository.existsByFileId(fileId)) {
                throw new IllegalStateException("File " + fileId + " is already attached to another application");
            }
            ClientApplicationAttachmentEntity attachment = new ClientApplicationAttachmentEntity();
            attachment.setFile(
                    filesService.getById(fileId)
            );
            application.addAttachment(attachment);
        });

        return clientApplicationMapper.toDto(
                clientApplicationRepository.save(application)
        );
    }

    @Transactional(readOnly = true)
    public Page<ClientApplicationResponseDto> getApplications(Pageable pageable, ClientApplicationFilter filter) {
        ClientApplicationFilter effective = (filter == null) ? new ClientApplicationFilter() : filter;

        if (getCurrentRole() == AccountRole.CLIENT) {
            ClientEntity client = clientsService.getByAccountId(getCurrentAccountId());
            effective.setClientId(client.getId());
        }

        return clientApplicationRepository
                .findAll(ClientApplicationSpecification.byFilter(effective), pageable)
                .map(clientApplicationMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ClientApplicationResponseDto getApplicationById(Long id) {
        return clientApplicationMapper.toDto(getById(id));
    }

    @Transactional
    public void addAttachmentToApplication(Long id, AddAttachmentRequestDto request) {
        ClientApplicationEntity application = getById(id);
        FileEntity file = filesService.getById(request.getFileId());

        if (attachmentRepository.existsByFileId(file.getId())) {
            throw new IllegalStateException("File " + file.getId() + " is already attached to another application");
        }

        attachmentRepository.save(attachmentMapper.toEntity(application, file));
    }

    @Transactional(readOnly = true)
    public List<FileMetadataResponseDto> getApplicationAttachments(Long id) {
        ClientApplicationEntity application = getById(id);

        return application.getAttachments().stream()
                .map(ClientApplicationAttachmentEntity::getFile)
                .map(fileMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClientApplicationEntity getById(Long id) {
        ClientApplicationEntity application = clientApplicationRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ClientApplication with id " + id + " not found"));
        if (getCurrentRole() == AccountRole.CLIENT) {
            ClientEntity client = clientsService.getByAccountId(getCurrentAccountId());
            if (!Objects.equals(application.getClient().getId(), client.getId())) {
                throw new EntityNotFoundException("ClientApplication with id " + id + " not found");
            }
        }
        return application;
    }

    private AccountRole getCurrentRole() {
        return AccountRole.CLIENT; // TODO
    }

    private Long getCurrentAccountId() {
        return 1L; // TODO
    }
}
