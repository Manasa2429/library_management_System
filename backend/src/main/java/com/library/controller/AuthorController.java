package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.Author;
import com.library.security.UserDetailsImpl;
import com.library.service.AuthorService;

@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    @Autowired
    private AuthorService authorService;

    @GetMapping
    public List<Author> getAllAuthors() {
        return authorService.getAllAuthors();
    }

    @GetMapping("/with-counts")
    public ResponseEntity<?> getAllAuthorsWithCounts() {
        return ResponseEntity.ok(authorService.getAllAuthorsWithBookCounts());
    }

    @GetMapping("/{id}")
    public Author getAuthorById(@PathVariable String id) {
        return authorService.getAuthorById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Author addAuthor(@RequestBody Author author, @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return authorService.addAuthor(author, adminDetails.getEmail(), adminDetails.getId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Author updateAuthor(@PathVariable String id, @RequestBody Author author,
                               @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return authorService.updateAuthor(id, author, adminDetails.getEmail(), adminDetails.getId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAuthor(@PathVariable String id, @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        authorService.deleteAuthor(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok("Author deleted successfully");
    }
}
