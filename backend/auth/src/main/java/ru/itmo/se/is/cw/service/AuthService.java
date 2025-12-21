package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import ru.itmo.se.is.cw.dto.AccountRegistrationRequestDto;
import ru.itmo.se.is.cw.dto.AccountRegistrationResponseDto;
import ru.itmo.se.is.cw.dto.ClientRegistrationRequestDto;
import ru.itmo.se.is.cw.dto.VerifyEmailRequestDto;
import ru.itmo.se.is.cw.model.AccountEntity;
import ru.itmo.se.is.cw.model.value.AccountRole;
import ru.itmo.se.is.cw.repository.AccountRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void register(ClientRegistrationRequestDto request) {
        if (accountRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username exists");
        }
        AccountEntity a = new AccountEntity();
        a.setUsername(request.getUsername());
        a.setPassword(passwordEncoder.encode(request.getPassword()));
        a.setEnabled(true);
        a.setRole(AccountRole.CLIENT);
        accountRepository.save(a);
    }

    @Transactional
    public AccountRegistrationResponseDto createAccount(AccountRegistrationRequestDto request) {
        AccountEntity a = new AccountEntity();
        a.setUsername(request.getUsername());
        a.setPassword(passwordEncoder.encode(request.getPassword()));
        a.setRole(request.getRole());
        a.setEnabled(true);

        a = accountRepository.save(a);
        AccountRegistrationResponseDto response = new AccountRegistrationResponseDto();
        response.setAccountId(a.getId());
        return response;
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequestDto request) {
        // TODO: проверить токен, активировать аккаунт
    }

}
