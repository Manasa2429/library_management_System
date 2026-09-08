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
import com.library.model.Category;
import com.library.security.UserDetailsImpl;
import com.library.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/with-counts")
    public ResponseEntity<?> getAllCategoriesWithCounts() {
        return ResponseEntity.ok(categoryService.getAllCategoriesWithBookCounts());
    }

    @GetMapping("/{id}")
    public Category getCategoryById(@PathVariable String id) {
        return categoryService.getCategoryById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Category addCategory(@RequestBody Category category, @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return categoryService.addCategory(category, adminDetails.getEmail(), adminDetails.getId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Category updateCategory(@PathVariable String id, @RequestBody Category category,
                                   @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        return categoryService.updateCategory(id, category, adminDetails.getEmail(), adminDetails.getId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable String id, @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        categoryService.deleteCategory(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok("Category deleted successfully");
    }
}
