package com.buddiebag.backend.enums;

public enum Papel {
    USUARIO(0),
    ADMIN(1);

    private final int valor;

    Papel(int valor) { this.valor = valor; }

    public int getValor() { return valor; }
}
