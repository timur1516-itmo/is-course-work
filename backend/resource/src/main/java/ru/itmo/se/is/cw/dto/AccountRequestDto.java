package ru.itmo.se.is.cw.dto;

import lombok.Data;
import ru.itmo.se.is.cw.model.value.EmployeeRole;

@Data
public class AccountRequestDto {
    String username;
    String password;
    EmployeeRole role;
}
