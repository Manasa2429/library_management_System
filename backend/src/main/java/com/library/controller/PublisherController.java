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
import com.library.model.Publisher;
import com.library.security.UserDetailsImpl;
import com.library.service.PublisherService;

@RestController
@RequestMapping("/api/publishers")
public class PublisherController {

    @Autowired
    private PublisherService publisherService;

    @GetMapping
    public List<Publisher> getAllPublishers() {
        return publisherService.getAllPublishers();
    }

    @GetMapping("/{id}")
    public Publisher getPublisherById(@PathVariable String id) {
        return publisherService.getPublisherById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Publisher addPublisher(@RequestBody Publisher publisher, @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return publisherService.addPublisher(publisher, adminDetails.getEmail(), adminDetails.getId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Publisher updatePublisher(@PathVariable String id, @RequestBody Publisher publisher,
                                     @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return publisherService.updatePublisher(id, publisher, adminDetails.getEmail(), adminDetails.getId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePublisher(@PathVariable String id, @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        publisherService.deletePublisher(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok("Publisher deleted successfully");
    }
}
