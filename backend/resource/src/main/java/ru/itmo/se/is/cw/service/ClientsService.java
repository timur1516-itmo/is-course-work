package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.Client;
import ru.itmo.se.is.cw.repository.ClientRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClientsService {

    private final ClientRepository clientRepository;

    @Transactional(readOnly = true)
    public List<Client> getClients() {
        // TODO: маппинг всех клиентов
        return List.of();
    }

    @Transactional(readOnly = true)
    public Client getClientById(Long id) {
        // TODO: поиск по id + маппинг или 404
        return null;
    }
}
