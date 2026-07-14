// package com.chatapp.backend.security.jwt;

// import jakarta.servlet.FilterChain;
// import jakarta.servlet.ServletException;
// import jakarta.servlet.http.HttpServletRequest;
// import jakarta.servlet.http.HttpServletResponse;
// import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
// import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
// import org.springframework.stereotype.Component;
// import org.springframework.web.filter.OncePerRequestFilter;

// import java.io.IOException;

// @Component
// public class JwtFilter extends OncePerRequestFilter {

//     private final JwtUtil jwtUtil;
//     private final UserDetailsService userDetailsService;

//     public JwtFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
//         this.jwtUtil = jwtUtil;
//         this.userDetailsService = userDetailsService;
//     }

//     @Override
//     protected void doFilterInternal(
//             HttpServletRequest request,
//             HttpServletResponse response,
//             FilterChain filterChain
//     ) throws ServletException, IOException {

//         String authHeader = request.getHeader("Authorization");
//         String token = null;
//         String username = null;

//         if (authHeader != null && authHeader.startsWith("Bearer ")) {
//             token = authHeader.substring(7);
//             username = jwtUtil.extractUsername(token);
//         }

//         if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

//             UserDetails userDetails = userDetailsService.loadUserByUsername(username);

//             if (jwtUtil.validateToken(token)) {

//                 UsernamePasswordAuthenticationToken authToken =
//                         new UsernamePasswordAuthenticationToken(
//                                 userDetails,
//                                 null,
//                                 userDetails.getAuthorities()
//                         );

//                 authToken.setDetails(
//                         new WebAuthenticationDetailsSource().buildDetails(request)
//                 );

//                 SecurityContextHolder.getContext().setAuthentication(authToken);
//             }
//         }

//         filterChain.doFilter(request, response);
//     }
// }







package com.chatapp.backend.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final UserDetailsService userDetailsService;

    public JwtFilter(
            JwtUtil jwtUtil,
            UserDetailsService userDetailsService
    ) {

        this.jwtUtil = jwtUtil;
        this.userDetailsService =
                userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader =
                request.getHeader("Authorization");

        String token = null;

        String username = null;

        try {

            if (authHeader != null &&
                    authHeader.startsWith("Bearer ")) {

                token =
                        authHeader.substring(7);

                username =
                        jwtUtil.extractUsername(token);
            }

            if (username != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(username);

                if (jwtUtil.validateToken(token)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authToken);
                }
            }

        } catch (ExpiredJwtException e) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write("""
                    {
                      "error": "TOKEN_EXPIRED",
                      "message": "JWT đã hết hạn"
                    }
                    """);

            return;

        } catch (JwtException e) {

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write("""
                    {
                      "error": "INVALID_TOKEN",
                      "message": "Token không hợp lệ"
                    }
                    """);

            return;
        }

        filterChain.doFilter(
                request,
                response
        );
    }
}