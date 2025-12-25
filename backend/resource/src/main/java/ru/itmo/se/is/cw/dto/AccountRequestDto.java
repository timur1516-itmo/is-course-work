package ru.itmo.se.is.cw.dto;

import lombok.Data;

@Data
public class AccountRequestDto {
    String username;
    String password;
    String role;
}
