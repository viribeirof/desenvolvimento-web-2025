package com.buddiebag.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/funciona")
    public String funciona() {
        return "OK";
    }
}
