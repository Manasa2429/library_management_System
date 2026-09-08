import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { getBookCoverUrl, DEFAULT_BOOK_COVER } from "../services/bookService";

function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`http://localhost:8081/api/books/${id}`);
        const data = await res.json();
        console.log(data);
        setBook(data);
      } catch (err) {
        console.error("Failed to fetch book details", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-4">Loading book details...</p>;
  }

  if (!book) {
    return <p className="text-center mt-4 text-danger">Book not found.</p>;
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">{book.title}</h2>
      <div className="row">
        {/* ✅ Book Image */}
        <div className="col-md-4 mb-3">
          {book.image ? (
            <img
              src={getBookCoverUrl(book.image)}
              alt={book.title}
              className="img-fluid rounded shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_BOOK_COVER;
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "300px",
                backgroundColor: "#eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "5px",
                fontSize: "0.9rem",
                color: "#888",
              }}
            >
              No Image
            </div>
          )}
        </div>

        {/* ✅ Book Details */}
        <div className="col-md-8">
          <h5>Description:</h5>
          <p>{book.description || "No description available"}</p>

          <h5>Author:</h5>
          <p><strong>Name:</strong> {book.author?.name || "Unknown"}</p>
          <p><strong>Bio:</strong> {book.author?.bio || "No bio available"}</p>

          <h5>Publisher:</h5>
          <p><strong>Name:</strong> {book.publisher?.name || "Unknown"}</p>
          <p><strong>Bio:</strong> {book.publisher?.bio || "No bio available"}</p>

          <h5>Book Details:</h5>
          <p><strong>Shelf:</strong> {book.shelf || "N/A"}</p>
          <p>
            <strong>Status:</strong>{" "}
            {book.status === "BORROWED"
              ? `Borrowed by ${book.borrowedBy}`
              : "Available"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;
