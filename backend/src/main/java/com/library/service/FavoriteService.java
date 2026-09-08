package com.library.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.model.Book;
import com.library.model.Favorite;
import com.library.repository.BookRepository;
import com.library.repository.FavoriteRepository;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private BookRepository bookRepository;

    public boolean toggleFavorite(String userId, String bookId) {
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndBookId(userId, bookId);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // Removed
        } else {
            Favorite favorite = new Favorite(userId, bookId);
            favoriteRepository.save(favorite);
            return true; // Added
        }
    }

    public boolean isFavorite(String userId, String bookId) {
        return favoriteRepository.existsByUserIdAndBookId(userId, bookId);
    }

    public List<Book> getUserFavorites(String userId) {
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        List<String> bookIds = favorites.stream().map(Favorite::getBookId).collect(Collectors.toList());
        return (List<Book>) bookRepository.findAllById(bookIds);
    }
}
