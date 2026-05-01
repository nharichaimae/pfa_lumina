package com.example.pfa__springBoot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PfaSpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(PfaSpringBootApplication.class, args);
	}

}
