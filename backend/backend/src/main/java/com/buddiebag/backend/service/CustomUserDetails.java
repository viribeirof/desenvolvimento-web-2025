package com.buddiebag.backend.service;

import com.buddiebag.backend.model.Usuario;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    @Getter
    private final Usuario usuario;
    private final List<GrantedAuthority> authorities;

    public CustomUserDetails(Usuario usuario) {
        this.usuario = usuario;
        String role = (usuario.getPapel() != null && usuario.getPapel() == 1) ? "ROLE_ADMIN" : "ROLE_USER";
        this.authorities = List.of(new SimpleGrantedAuthority(role));
    }

    public Long getId() {
        return usuario.getId();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return usuario.getSenhaHash();
    }

    @Override
    public String getUsername() {
        return usuario.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}
