package com.library.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Category;
import com.library.repository.BookRepository;
import com.library.repository.CategoryRepository;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Map<String, Object>> getAllCategoriesWithBookCounts() {
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("name", c.getName());
            map.put("description", c.getDescription());
            map.put("createdAt", c.getCreatedAt());
            map.put("bookCount", bookRepository.countByCategoryId(c.getId()));
            return map;
        }).collect(Collectors.toList());
    }

    public Category getCategoryById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
    }

    public Category addCategory(Category category, String adminEmail, String adminId) {
        Category saved = categoryRepository.save(category);
        activityLogService.log(adminId, adminEmail, "CATEGORY_ADDED", "Added category: " + saved.getName());
        return saved;
    }

    public Category updateCategory(String id, Category updated, String adminEmail, String adminId) {
        Category existing = getCategoryById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        Category saved = categoryRepository.save(existing);
        activityLogService.log(adminId, adminEmail, "CATEGORY_UPDATED", "Updated category: " + saved.getName());
        return saved;
    }

    public void deleteCategory(String id, String adminEmail, String adminId) {
        Category existing = getCategoryById(id);
        long associatedBooks = bookRepository.countByCategoryId(id);
        if (associatedBooks > 0) {
            throw new BadRequestException("Cannot delete category '" + existing.getName() + "' because " +
                    associatedBooks + " books are associated with it. Reassign books before deleting.");
        }
        categoryRepository.deleteById(id);
        activityLogService.log(adminId, adminEmail, "CATEGORY_DELETED", "Deleted category: " + existing.getName());
    }
}
