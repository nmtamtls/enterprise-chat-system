package com.chatapp.backend;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping
    public String test() {
        return "Backend OK";
    }
}