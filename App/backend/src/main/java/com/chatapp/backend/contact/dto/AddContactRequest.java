package com.chatapp.backend.contact.dto;

import java.util.UUID;

public class AddContactRequest {

    private UUID contactUserId;

    public UUID getContactUserId() {
        return contactUserId;
    }
}