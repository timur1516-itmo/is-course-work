package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.itmo.se.is.cw.dto.CurrentUserResponseDto;
import ru.itmo.se.is.cw.mapper.ClientMapper;
import ru.itmo.se.is.cw.mapper.EmployeeMapper;
import ru.itmo.se.is.cw.model.EmployeeEntity;
import ru.itmo.se.is.cw.model.value.AccountRole;
import ru.itmo.se.is.cw.security.CurrentUser;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final CurrentUser currentUser;
    private final ClientsService clientsService;
    private final ClientMapper clientMapper;
    private final EmployeesService employeesService;
    private final EmployeeMapper employeeMapper;

    public CurrentUserResponseDto getCurrentUser() {
        CurrentUserResponseDto currentUserResponseDto = new CurrentUserResponseDto();
        Long accountId = currentUser.accountId();
        currentUserResponseDto.setAccountId(accountId);
        currentUserResponseDto.setUsername("TODO");
        if (currentUser.hasRole(AccountRole.CLIENT.name())) {
            currentUserResponseDto.setRole(AccountRole.CLIENT);
            currentUserResponseDto.setClient(
                    clientMapper.toDto(
                            clientsService.getByAccountId(accountId)
                    )
            );
            return currentUserResponseDto;
        }
        if (currentUser.hasRole(AccountRole.ADMIN.name())) {
            currentUserResponseDto.setRole(AccountRole.ADMIN);
            return currentUserResponseDto;
        }
        EmployeeEntity employee = employeesService.getByAccountId(accountId);
        currentUserResponseDto.setEmployee(employeeMapper.toDto(employee));
        currentUserResponseDto.setRole(AccountRole.valueOf(employee.getRole().name()));
        return currentUserResponseDto;
    }
}
