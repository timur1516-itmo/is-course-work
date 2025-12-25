package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.itmo.se.is.cw.dto.AccountResponseDto;
import ru.itmo.se.is.cw.dto.AuthClientRegistrationRequestDto;
import ru.itmo.se.is.cw.dto.ClientRegistrationRequestDto;
import ru.itmo.se.is.cw.feign.AccountClient;
import ru.itmo.se.is.cw.mapper.ClientMapper;
import ru.itmo.se.is.cw.model.ClientEntity;
import ru.itmo.se.is.cw.repository.ClientRepository;

@Service
@RequiredArgsConstructor
public class RegistrationService {
    private final ClientMapper clientMapper;
    private final AccountClient accountClient;
    private final ClientRepository clientRepository;

    public void register(ClientRegistrationRequestDto request) {
        ClientEntity client = clientMapper.toEntity(request);

        AuthClientRegistrationRequestDto accountRequestDto = new AuthClientRegistrationRequestDto();
        accountRequestDto.setPassword(request.getPassword());
        accountRequestDto.setUsername(request.getUsername());

        AccountResponseDto responseDto = accountClient.registerClient(accountRequestDto);

        client.setAccountId(responseDto.getAccountId());

        clientRepository.save(client);
    }
}
