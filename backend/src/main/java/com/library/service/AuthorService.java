package com.library.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Author;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;

@Service
public class AuthorService {

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public List<Map<String, Object>> getAllAuthorsWithBookCounts() {
        List<Author> authors = authorRepository.findAll();
        return authors.stream().map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("name", a.getName());
            map.put("bio", a.getBio());
            map.put("createdAt", a.getCreatedAt());
            map.put("bookCount", bookRepository.countByAuthorId(a.getId()));
            return map;
        }).collect(Collectors.toList());
    }

    public Author getAuthorById(String id) {
        return authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found with ID: " + id));
    }

    public Author addAuthor(Author author, String adminEmail, String adminId) {
        Author saved = authorRepository.save(author);
        activityLogService.log(adminId, adminEmail, "AUTHOR_ADDED", "Added author: " + saved.getName());
        return saved;
    }

    public Author updateAuthor(String id, Author updated, String adminEmail, String adminId) {
        Author existing = getAuthorById(id);
        existing.setName(updated.getName());
        existing.setBio(updated.getBio());
        Author saved = authorRepository.save(existing);
        activityLogService.log(adminId, adminEmail, "AUTHOR_UPDATED", "Updated author: " + saved.getName());
        return saved;
    }

    public void deleteAuthor(String id, String adminEmail, String adminId) {
        Author existing = getAuthorById(id);
        authorRepository.deleteById(id);
        activityLogService.log(adminId, adminEmail, "AUTHOR_DELETED", "Deleted author: " + existing.getName());
    }
}
