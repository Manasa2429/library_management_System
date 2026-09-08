package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.library.model.Book;

public interface BookRepository extends MongoRepository<Book, String> {

    boolean existsByTitleIgnoreCase(String title);
    boolean existsByIsbn(String isbn);
    Optional<Book> findByTitleIgnoreCase(String title);
    Optional<Book> findByIsbn(String isbn);

    @Query("{ '$or': [ " +
           "  { 'title': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'authorName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'publisherName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'categoryName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'isbn': { '$regex': ?0, '$options': 'i' } } " +
           "] }")
    List<Book> searchBooks(String keyword);

    @Query("{ '$or': [ " +
           "  { 'title': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'authorName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'publisherName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'categoryName': { '$regex': ?0, '$options': 'i' } }, " +
           "  { 'isbn': { '$regex': ?0, '$options': 'i' } } " +
           "] }")
    Page<Book> searchBooks(String keyword, Pageable pageable);

    List<Book> findByCategoryId(String categoryId);
    Page<Book> findByCategoryId(String categoryId, Pageable pageable);

    long countByCategoryId(String categoryId);
    long countByAuthorId(String authorId);

    List<Book> findByFeaturedTrue();
    List<Book> findTop10ByOrderByCreatedAtDesc();
}