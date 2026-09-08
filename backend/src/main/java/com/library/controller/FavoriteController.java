package com.library.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.Book;
import com.library.security.UserDetailsImpl;
import com.library.service.FavoriteService;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @PostMapping("/toggle/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @PathVariable String bookId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isFav = favoriteService.toggleFavorite(userDetails.getId(), bookId);
        return ResponseEntity.ok(Map.of("favorite", isFav, "message", isFav ? "Added to favorites" : "Removed from favorites"));
    }

    @GetMapping("/check/{bookId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> checkFavorite(
            @PathVariable String bookId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isFav = favoriteService.isFavorite(userDetails.getId(), bookId);
        return ResponseEntity.ok(Map.of("favorite", isFav));
    }

    @GetMapping("/my-favorites")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Book>> getMyFavorites(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(favoriteService.getUserFavorites(userDetails.getId()));
    }
}
