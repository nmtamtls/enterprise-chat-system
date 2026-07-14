// package com.chatapp.backend.security.jwt;

// import io.jsonwebtoken.*;
// import io.jsonwebtoken.security.Keys;
// import org.springframework.stereotype.Component;

// import java.security.Key;
// import java.util.Date;

// @Component
// public class JwtUtil {

//     private final String SECRET = "secret-key-secret-key-secret-key-secret-key";
//     private final long EXPIRATION = 86400000; // 1 ngày

//     private Key getSignKey() {
//         return Keys.hmacShaKeyFor(SECRET.getBytes());
//     }

//     // tạo token
//     public String generateToken(String username) {
//         return Jwts.builder()
//                 .setSubject(username)
//                 .setIssuedAt(new Date())
//                 .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
//                 .signWith(getSignKey(), SignatureAlgorithm.HS256)
//                 .compact();
//     }

//     // lấy username từ token
//     public String extractUsername(String token) {
//         return parseClaims(token).getSubject();
//     }

//     // kiểm tra token còn hợp lệ không
//     public boolean validateToken(String token) {
//         try {
//             parseClaims(token);
//             return true;
//         } catch (Exception e) {
//             return false;
//         }
//     }

//     private Claims parseClaims(String token) {
//         return Jwts.parserBuilder()
//                 .setSigningKey(getSignKey())
//                 .build()
//                 .parseClaimsJws(token)
//                 .getBody();
//     }
// }



package com.chatapp.backend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET =
            "secret-key-secret-key-secret-key-secret-key";

    // 1 ngày
    private final long EXPIRATION =
            1000 * 60 * 60 * 24;

    private Key getSignKey() {

        return Keys.hmacShaKeyFor(
                SECRET.getBytes()
        );
    }

    // =====================================================
    // TẠO TOKEN
    // =====================================================

    public String generateToken(String username) {

        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + EXPIRATION
                        )
                )
                .signWith(
                        getSignKey(),
                        SignatureAlgorithm.HS256
                )
                .compact();
    }

    // =====================================================
    // LẤY USERNAME
    // =====================================================

    public String extractUsername(String token) {

        return parseClaims(token)
                .getSubject();
    }

    // =====================================================
    // VALIDATE TOKEN
    // =====================================================

    public boolean validateToken(String token) {

        try {

            parseClaims(token);

            return true;

        } catch (ExpiredJwtException e) {

            System.out.println(
                    "JWT hết hạn"
            );

        } catch (JwtException e) {

            System.out.println(
                    "JWT không hợp lệ"
            );
        }

        return false;
    }

    // =====================================================
    // PARSE CLAIMS
    // =====================================================

    private Claims parseClaims(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())

                // tránh lệch vài giây
                .setAllowedClockSkewSeconds(30)

                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}