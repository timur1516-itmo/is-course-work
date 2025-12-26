package ru.itmo.se.is.cw.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
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

    @PatchMapping("/accounts/{id}/enable")
    void enableAccount(@PathVariable Long id);

    @PatchMapping("/accounts/{id}/disable")
    void disableAccount(@PathVariable Long id);

    @PatchMapping("/accounts/{id}/update-password")
    void enableAccount(@PathVariable Long id, UpdatePasswordRequestDto request);
}
