package ru.itmo.se.is.cw.dto;

import lombok.Data;

@Data
public class UpdatePasswordRequestDto {
    String oldPassword;
    String newPassword;
}
