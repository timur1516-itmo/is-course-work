package ru.itmo.se.is.cw.conf;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "BearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
@OpenAPIDefinition(
        info = @Info(
                title = "CNC Order Management – Resource API",
                version = "1.0.0",
                description = "REST API для подсистемы управления клиентскими заказами, конструкторскими работами, производством, складом и снабжением."
        ),
        servers = {
                @Server(
                        url = "/resource",
                        description = "Resource service через API gateway"
                )
        },
        security = {
                @SecurityRequirement(name = "BearerAuth")
        }
)
public class OpenApiConfig {
}
