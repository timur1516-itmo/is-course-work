package ru.itmo.se.is.cw.conf;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI(
            @Value("${app.security.oauth2.authorization-url}") String authorizationUrl,
            @Value("${app.security.oauth2.token-url}") String tokenUrl,
            @Value("${app.swagger.server-url}") String serverUrl
    ) {
        var oauth2Scheme = new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .in(SecurityScheme.In.HEADER)
                .flows(new OAuthFlows()
                        .authorizationCode(new OAuthFlow()
                                .authorizationUrl(authorizationUrl)
                                .tokenUrl(tokenUrl)));

        return new OpenAPI()
                .info(new Info()
                        .title("CNC Order Management – Resource API")
                        .version("1.0.0")
                        .description("REST API для подсистемы управления клиентскими заказами, конструкторскими работами, производством, складом и снабжением."))
                .servers(List.of(new Server().url(serverUrl)))
                .components(new Components().addSecuritySchemes("oauth2", oauth2Scheme))
                .addSecurityItem(new SecurityRequirement().addList("oauth2"));
    }
}
