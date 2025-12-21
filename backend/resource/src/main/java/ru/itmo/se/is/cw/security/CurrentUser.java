package ru.itmo.se.is.cw.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CurrentUser {
    public Long accountId() {
        var jwtAuth = jwtAuth();
        Object claim = jwtAuth.getToken().getClaim("account_id");
        if (claim instanceof Number n) return n.longValue();
        if (claim instanceof String s) return Long.parseLong(s);
        throw new IllegalStateException("Missing/invalid account_id claim");
    }

    public Set<String> authorities() {
        return jwtAuth().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toUnmodifiableSet());
    }

    public boolean hasRole(String role) {
        String r1 = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return authorities().contains(r1);
    }

    private JwtAuthenticationToken jwtAuth() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (!(auth instanceof JwtAuthenticationToken jwtAuth)) {
            throw new IllegalStateException("No JWT authentication");
        }
        return jwtAuth;
    }
}
