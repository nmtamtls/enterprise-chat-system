package com.chatapp.backend.presence.repository;

import com.chatapp.backend.presence.entity.Presence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PresenceRepository extends JpaRepository<Presence, UUID> {
}