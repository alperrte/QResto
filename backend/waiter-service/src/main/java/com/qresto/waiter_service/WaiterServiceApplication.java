package com.qresto.waiter_service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WaiterServiceApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
			.ignoreIfMissing()
			.load();

		System.setProperty("SERVER_PORT_WAITER", dotenv.get("SERVER_PORT_WAITER"));
		System.setProperty("DB_HOST", dotenv.get("DB_HOST"));
		System.setProperty("DB_PORT", dotenv.get("DB_PORT"));
		System.setProperty("DB_NAME", dotenv.get("DB_NAME"));
		System.setProperty("DB_USER", dotenv.get("DB_USER"));
		System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		System.setProperty("AUTH_SERVICE_URL", dotenv.get("AUTH_SERVICE_URL"));
		System.setProperty("QR_SERVICE_URL", dotenv.get("QR_SERVICE_URL"));
		System.setProperty("KITCHEN_SERVICE_URL", dotenv.get("KITCHEN_SERVICE_URL"));

		SpringApplication.run(WaiterServiceApplication.class, args);
	}

}
