package com.example;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitMessagingTemplate;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.messaging.Message;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class DlqRecoverServiceApplication {

	private final RabbitMessagingTemplate messagingTemplate;

	public DlqRecoverServiceApplication(RabbitMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	public static void main(String[] args) {
		SpringApplication.run(DlqRecoverServiceApplication.class, args);
	}

	private final Logger log = LoggerFactory
			.getLogger(DlqRecoverServiceApplication.class);

	@RabbitListener(queues = "#{'${dlq.names}'.split(',')}")
	public void handleDlq(Message message) {
		log.info("recover " + message);
		deadLetters.put(message.getHeaders().getId().toString(), message);
	}

	Map<String, Message> deadLetters = new ConcurrentHashMap<>();

	@GetMapping
	Object deadLetters() {
		return deadLetters;
	}

	@GetMapping(path = "redeliver/{uuid}")
	String redeliver(@PathVariable("uuid") String uuid) {
		Message message = deadLetters.get(uuid);
		String queue = ((Map) (message.getHeaders().get("x-death", List.class).get(0)))
				.get("queue").toString();
		log.info("redeliver[{}] {}", queue, message);
		messagingTemplate.send(queue, message);
		deadLetters.remove(uuid);
		return "OK";
	}
}
