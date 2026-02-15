package com.medtrack;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class MedtrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedtrackApplication.class, args);
    }
}
