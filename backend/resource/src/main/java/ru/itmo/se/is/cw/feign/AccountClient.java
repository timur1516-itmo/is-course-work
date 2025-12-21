package ru.itmo.se.is.cw.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import ru.itmo.se.is.cw.dto.AccountRequestDto;
import ru.itmo.se.is.cw.dto.AccountResponseDto;

@FeignClient(name = "account-client", url = "${app.feign.auth-url}")
public interface AccountClient {
    @PostMapping("/users")
    AccountResponseDto createAccount(@RequestBody AccountRequestDto accountRequestDto);
}
