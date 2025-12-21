package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.ClientResponseDto;
import ru.itmo.se.is.cw.dto.filter.ClientFilter;
import ru.itmo.se.is.cw.dto.specification.ClientSpecification;
import ru.itmo.se.is.cw.exception.EntityNotFoundException;
import ru.itmo.se.is.cw.mapper.ClientMapper;
import ru.itmo.se.is.cw.model.ClientEntity;
import ru.itmo.se.is.cw.repository.ClientRepository;

@Service
@RequiredArgsConstructor
public class ClientsService {

    private final ClientRepository clientRepository;
    private final ClientMapper clientMapper;

    @Transactional(readOnly = true)
    public Page<ClientResponseDto> getClients(Pageable pageable, ClientFilter filter) {
        return clientRepository
                .findAll(ClientSpecification.byFilter(filter), pageable)
                .map(clientMapper::toDto);
    }

    @Transactional(readOnly = true)
    public ClientResponseDto getClientById(Long id) {
        return clientMapper.toDto(getById(id));
    }

    @Transactional(readOnly = true)
    public ClientEntity getById(Long id) {
        return clientRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client with id " + id + " not found"));
    }

    @Transactional(readOnly = true)
    public ClientEntity getByAccountId(Long accountId) {
        return clientRepository
                .findByAccountId(accountId)
                .orElseThrow(() -> new EntityNotFoundException("Client with accountId " + accountId + " not found"));
    }
}
