package com.library.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Publisher;
import com.library.repository.PublisherRepository;

@Service
public class PublisherService {

    @Autowired
    private PublisherRepository publisherRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<Publisher> getAllPublishers() {
        return publisherRepository.findAll();
    }

    public Publisher getPublisherById(String id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Publisher not found with ID: " + id));
    }

    public Publisher addPublisher(Publisher publisher, String adminEmail, String adminId) {
        Publisher saved = publisherRepository.save(publisher);
        activityLogService.log(adminId, adminEmail, "PUBLISHER_ADDED", "Added publisher: " + saved.getName());
        return saved;
    }

    public Publisher updatePublisher(String id, Publisher updated, String adminEmail, String adminId) {
        Publisher existing = getPublisherById(id);
        existing.setName(updated.getName());
        existing.setBio(updated.getBio());
        Publisher saved = publisherRepository.save(existing);
        activityLogService.log(adminId, adminEmail, "PUBLISHER_UPDATED", "Updated publisher: " + saved.getName());
        return saved;
    }

    public void deletePublisher(String id, String adminEmail, String adminId) {
        Publisher existing = getPublisherById(id);
        publisherRepository.deleteById(id);
        activityLogService.log(adminId, adminEmail, "PUBLISHER_DELETED", "Deleted publisher: " + existing.getName());
    }
}
