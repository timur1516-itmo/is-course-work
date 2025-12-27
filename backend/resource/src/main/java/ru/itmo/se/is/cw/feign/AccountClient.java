package ru.itmo.se.is.cw.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import ru.itmo.se.is.cw.dto.AccountRequestDto;
import ru.itmo.se.is.cw.dto.AccountResponseDto;
import ru.itmo.se.is.cw.dto.UpdatePasswordRequestDto;

@FeignClient(name = "account-client", url = "${app.feign.auth-url}")
public interface AccountClient {

    @PostMapping("/accounts")
    AccountResponseDto createAccount(@RequestBody AccountRequestDto request);

    @PostMapping("/accounts/{id}/enable")
    void enableAccount(@PathVariable Long id);

    @PostMapping("/accounts/{id}/disable")
    void disableAccount(@PathVariable Long id);

    @PostMapping("/accounts/{id}/update-password")
    void enableAccount(@PathVariable Long id, UpdatePasswordRequestDto request);
}
