package com.chatapp.backend.contact.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "contacts")
public class Contact {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "contact_user_id")
    private UUID contactUserId;

    private String status; // pending, accepted, blocked

    public Contact() {}

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public UUID getContactUserId() {
        return contactUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public void setContactUserId(UUID contactUserId) {
        this.contactUserId = contactUserId;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}