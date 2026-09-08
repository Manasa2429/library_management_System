package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Reservation;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
    List<Reservation> findByUserIdOrderByReservationDateDesc(String userId);
    List<Reservation> findByBookIdAndStatusOrderByReservationDateAsc(String bookId, Reservation.Status status);
    Optional<Reservation> findByUserIdAndBookIdAndStatus(String userId, String bookId, Reservation.Status status);
    List<Reservation> findByStatus(Reservation.Status status);
    long countByStatus(Reservation.Status status);
    long countByUserIdAndStatus(String userId, Reservation.Status status);
}
