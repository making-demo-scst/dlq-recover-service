package com.example;

import java.util.Collection;
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
import org.springframework.web.bind.annotation.*;

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

	@GetMapping(path = "dlqs")
	Collection<Message> deadLetters() {
		return deadLetters.values();
	}

	@DeleteMapping(path = "dlqs/{uuid}")
	void deleteDeadLetter(@PathVariable("uuid") String uuid) {
		deadLetters.remove(uuid);
	}

	@PostMapping(path = "redeliver")
	String redeliver(@RequestBody RecoverRequest req) {
		Message message = deadLetters.get(req.getUuid());
		String queue = ((Map) (message.getHeaders().get("x-death", List.class).get(0)))
				.get("queue").toString();
		log.info("redeliver[{}] {}", queue, message);
		messagingTemplate.send(queue, message);
		deadLetters.remove(req.getUuid());
		return "OK";
	}
}
