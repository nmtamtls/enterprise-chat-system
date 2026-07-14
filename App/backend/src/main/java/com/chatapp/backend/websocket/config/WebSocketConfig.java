
package com.chatapp.backend.websocket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // ================= 1. CẤU HÌNH BROKER =================
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {

        // Queue cho notification cá nhân
        config.enableSimpleBroker("/topic", "/queue");

        // Client gửi lên backend
        config.setApplicationDestinationPrefixes("/app");

        // Prefix dành cho convertAndSendToUser
        config.setUserDestinationPrefix("/user");
    }

    // ================= 2. ĐĂNG KÝ ENDPOINT =================
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")

                // QUAN TRỌNG NHẤT
                // Gán Principal cho WebSocket session
                .setHandshakeHandler(new UserHandshakeHandler())

                .withSockJS();
    }

    // ================= 3. HANDSHAKE HANDLER =================
    static class UserHandshakeHandler
            extends DefaultHandshakeHandler {

        @Override
        protected Principal determineUser(
                ServerHttpRequest request,
                WebSocketHandler wsHandler,
                Map<String, Object> attributes
        ) {

            if (request instanceof ServletServerHttpRequest servletRequest) {

                // ws://localhost:8082/ws?userId=...
                String userId =
                        servletRequest.getServletRequest()
                                .getParameter("userId");

                if (userId != null) {

                    // Gán userId thành Principal
                    return new StompPrincipal(userId);
                }
            }

            return null;
        }
    }

    // ================= 4. PRINCIPAL =================
    static class StompPrincipal implements Principal {

        private final String name;

        public StompPrincipal(String name) {
            this.name = name;
        }

        @Override
        public String getName() {
            return name;
        }
    }
}

