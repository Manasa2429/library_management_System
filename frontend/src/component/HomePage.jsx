import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css"; // your custom CSS
import { getBookCoverUrl, DEFAULT_BOOK_COVER } from "../services/bookService";

function HomePage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const data = await fetch("http://localhost:8081/api/books");
        const fetchData = await data.json();
        const sorted = fetchData.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        // Limit to max 10 books
        setBooks(sorted.slice(0, 10));
      } catch (e) {
        console.error("Unable to fetch", e);
      }
    }
    fetchBooks();
  }, []);

  return (
    <div
      className="container mt-4"
      style={{
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h2
        className="text-center mb-4"
        style={{ color: "#000", textShadow: "1px 1px 2px #f5f5f5ff" }}
      >
        Latest Books
      </h2>

      {books.length === 0 ? (
        <p className="text-center" style={{ color: "#555" }}>
          No books available.
        </p>
      ) : (
        <div
          className="d-flex gap-3 overflow-auto"
          style={{
            width: "100%",
            paddingBottom: "10px",
            // Show only 5 cards in viewport
            scrollSnapType: "x mandatory",
          }}
        >
          {books.map((book) => (
            <Link
              to={`/books/${book.id}`}
              key={book.id}
              style={{
                textDecoration: "none",
                flex: "0 0 20%", // 5 cards per view
                scrollSnapAlign: "start",
              }}
            >
              <div className="book-card p-2 shadow-sm" style={{ minWidth: "200px", height: "400px" }}>
                {/* Book Image */}
                {book.image ? (
                  <img
                    src={getBookCoverUrl(book.image)}
                    alt={book.title}
                    style={{ width: "100%", height: "250px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_BOOK_COVER;
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: "250px",
                      backgroundColor: "#eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "8px",
                      fontSize: "0.9rem",
                      color: "#888",
                    }}
                  >
                    No Image
                  </div>
                )}

                {/* Title */}
                <h5 style={{ color: "#333", minHeight: "2.5rem" }}>{book.title}</h5>

                {/* Description */}
                <p style={{ color: "#555", fontSize: "0.85rem", minHeight: "3rem" }}>
                  {book.description || "No description available"}
                </p>

                {/* Shelf */}
                <p style={{ color: "#000000ff", fontSize: "0.8rem", fontWeight: "bold"}}>
                  Shelf: {book.shelf || "N/A"}
                </p>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;
