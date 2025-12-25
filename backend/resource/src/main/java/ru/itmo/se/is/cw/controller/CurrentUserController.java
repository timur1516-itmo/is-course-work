package ru.itmo.se.is.cw.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.itmo.se.is.cw.dto.CurrentUserResponseDto;
import ru.itmo.se.is.cw.service.CurrentUserService;

@RestController
@RequestMapping("/me")
@RequiredArgsConstructor
public class CurrentUserController {
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<CurrentUserResponseDto> getCurrentUser() {
        return ResponseEntity.ok(currentUserService.getCurrentUser());
    }
}
