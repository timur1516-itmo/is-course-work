package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.*;
import ru.itmo.se.is.cw.repository.AccountRepository;
import ru.itmo.se.is.cw.repository.ClientRepository;
import ru.itmo.se.is.cw.repository.EmailTokenRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AccountRepository accountRepository;
    private final ClientRepository clientRepository;
    private final EmailTokenRepository emailTokenRepository;

    @Transactional
    public ClientRegistrationResponse register(ClientRegistrationRequest request) {
        // TODO: реализовать регистрацию, создание account + client + emailToken
        return null;
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        // TODO: проверить токен, активировать аккаунт
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // TODO: проверить пароль, выдать токен
        return null;
    }

    @Transactional(readOnly = true)
    public CurrentUser getCurrentUser() {
        // TODO: взять текущего из SecurityContext и отдать DTO
        return null;
    }
}
