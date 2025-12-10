package ru.itmo.se.is.cw.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.itmo.se.is.cw.dto.Employee;
import ru.itmo.se.is.cw.dto.EmployeeCreateRequest;
import ru.itmo.se.is.cw.model.value.AccountRole;
import ru.itmo.se.is.cw.repository.EmployeeRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EmployeeRepository employeeRepository;

    @Transactional
    public Employee createEmployee(EmployeeCreateRequest request) {
        // TODO: создать account + person + employee
        return null;
    }

    @Transactional(readOnly = true)
    public List<Employee> getEmployees(AccountRole role) {
        // TODO: фильтр по роли + маппинг
        return List.of();
    }
}
