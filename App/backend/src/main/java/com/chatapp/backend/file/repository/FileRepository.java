package com.chatapp.backend.file.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.chatapp.backend.file.entity.File;

@SuppressWarnings("rawtypes")
public interface FileRepository extends JpaRepository<File, UUID> {
}








// package com.chatapp.backend.file.repository;

// import java.util.UUID;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import com.chatapp.backend.file.entity.File;

// @Repository
// public interface FileRepository extends JpaRepository<File, UUID> {
// }