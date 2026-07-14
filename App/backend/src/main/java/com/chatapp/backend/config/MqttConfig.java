package com.chatapp.backend.config;

import jakarta.annotation.PreDestroy;
import lombok.Getter;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;

@Configuration
@Getter
public class MqttConfig {

    @Value("${mqtt.broker}")
    private String broker;

    private MqttClient client; // giữ reference để shutdown

    @Bean
    public MqttClient mqttClient() throws MqttException {

        client = new MqttClient(
                broker,
                MqttClient.generateClientId()
        );

        MqttConnectOptions options = new MqttConnectOptions();
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);
        options.setConnectionTimeout(10);
        options.setKeepAliveInterval(20);

        client.connect(options);

        System.out.println("MQTT Connected to: " + broker);

        return client;
    }

    // 🔥 QUAN TRỌNG: tự disconnect khi app shutdown
    @PreDestroy
    public void shutdown() {
        try {
            if (client != null && client.isConnected()) {
                client.disconnect();
                client.close();
                System.out.println("MQTT Disconnected!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}