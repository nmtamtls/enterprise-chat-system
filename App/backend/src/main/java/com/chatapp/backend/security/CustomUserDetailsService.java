// package com.chatapp.backend.security;

// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;
// import lombok.RequiredArgsConstructor;
// import org.springframework.security.core.userdetails.*;
// import org.springframework.stereotype.Service;

// @Service
// @RequiredArgsConstructor
// public class CustomUserDetailsService implements UserDetailsService {

//     private final UserRepository userRepository;

//     @Override
//     public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

//         return org.springframework.security.core.userdetails.User
//                 .withUsername(user.getUsername())
//                 .password(user.getPasswordHash())
//                 .roles(user.getRole()) // nhớ role dạng: "USER", "ADMIN"
//                 .build();
//     }
// }


package com.chatapp.backend.security;

import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole()) // 🔥 FIX
                .build();
    }
}