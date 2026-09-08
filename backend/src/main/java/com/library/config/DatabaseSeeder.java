package com.library.config;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import com.library.model.ActivityLog;
import com.library.model.Author;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.model.Category;
import com.library.model.Fine;
import com.library.model.Publisher;
import com.library.model.SystemSetting;
import com.library.model.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.FineRepository;
import com.library.repository.PublisherRepository;
import com.library.repository.SystemSettingRepository;
import com.library.repository.UserRepository;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseSeeder.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PublisherRepository publisherRepository;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@library.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@123}")
    private String adminPassword;

    @Value("${app.admin.name:Library Administrator}")
    private String adminName;

    @Value("${app.admin.phone:+1234567890}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedReaders();
        seedSettings();
        seedSampleBooks();
        seedSampleFines();
    }

    private void seedAdmin() {
        if (!userRepository.existsByEmail(adminEmail.toLowerCase())) {
            User admin = new User(
                    adminName,
                    adminEmail.toLowerCase(),
                    adminPhone,
                    passwordEncoder.encode(adminPassword),
                    User.Role.ROLE_ADMIN
            );
            userRepository.save(admin);
            logger.info("Default ADMIN user seeded: email='{}', password='{}'", adminEmail, adminPassword);
        }

        // Ensure divyasreemuppuri@gmail.com is seeded/updated as ROLE_ADMIN with password admin@123
        String customAdminEmail = "divyasreemuppuri@gmail.com";
        userRepository.findByEmail(customAdminEmail).ifPresentOrElse(user -> {
            user.setPassword(passwordEncoder.encode("admin@123"));
            user.setRole(User.Role.ROLE_ADMIN);
            userRepository.save(user);
            logger.info("Updated admin user credentials for '{}'", customAdminEmail);
        }, () -> {
            User customAdmin = new User(
                    "Divyasree Muppuri",
                    customAdminEmail,
                    "+919876543210",
                    passwordEncoder.encode("admin@123"),
                    User.Role.ROLE_ADMIN
            );
            userRepository.save(customAdmin);
            logger.info("Default custom ADMIN user seeded: email='{}', password='admin@123'", customAdminEmail);
        });
    }

    private void seedReaders() {
        if (!userRepository.existsByEmail("reader@library.com")) {
            User reader = new User(
                    "Sarah Jenkins",
                    "reader@library.com",
                    "+1987654321",
                    passwordEncoder.encode("Reader@123"),
                    User.Role.ROLE_USER
            );
            userRepository.save(reader);
            logger.info("Default READER user seeded: email='reader@library.com', password='Reader@123'");
        }
        if (!userRepository.existsByEmail("alex.turner@library.com")) {
            User reader2 = new User(
                    "Alex Turner",
                    "alex.turner@library.com",
                    "+1987654322",
                    passwordEncoder.encode("Reader@123"),
                    User.Role.ROLE_USER
            );
            userRepository.save(reader2);
        }
    }

    private void seedSettings() {
        if (!systemSettingRepository.existsById("SYSTEM_SETTINGS")) {
            SystemSetting settings = new SystemSetting();
            settings.setId("SYSTEM_SETTINGS");
            settings.setFinePerDay(10.0);
            settings.setBorrowDurationDays(14);
            settings.setReservationExpiryDays(3);
            settings.setMaxBooksPerUser(5);
            systemSettingRepository.save(settings);
            logger.info("Default System Settings seeded.");
        }
    }

    private Category getOrCreateCategory(String name, String description) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> categoryRepository.save(new Category(name, description)));
    }

    private Author getOrCreateAuthor(String name, String bio) {
        return authorRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> authorRepository.save(new Author(name, bio)));
    }

    private Publisher getOrCreatePublisher(String name, String address) {
        return publisherRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> publisherRepository.save(new Publisher(name, address)));
    }

    private boolean seedBookIfAbsent(String title, String authorName, String pubName, String catName,
                                     String shelf, String description, String image, String isbn,
                                     int year, int totalCopies, boolean featured) {
        if (bookRepository.existsByTitleIgnoreCase(title) || (isbn != null && bookRepository.existsByIsbn(isbn))) {
            return false;
        }

        Category category = getOrCreateCategory(catName, catName + " collection");
        Author author = getOrCreateAuthor(authorName, "Renowned author of " + title);
        Publisher publisher = getOrCreatePublisher(pubName, "Global Publishing House");

        Book book = new Book(title, author.getName(), publisher.getName(), category.getName(), shelf, description, image);
        book.setAuthorId(author.getId());
        book.setPublisherId(publisher.getId());
        book.setCategoryId(category.getId());
        book.setIsbn(isbn);
        book.setPublicationYear(year);
        book.setTotalCopies(totalCopies);
        book.setAvailableCopies(totalCopies);
        book.setFeatured(featured);
        book.setStatus("AVAILABLE");
        bookRepository.save(book);

        try {
            activityLogRepository.save(new ActivityLog(
                    null,
                    "admin@library.com",
                    "CATALOG_ADD",
                    "Cataloged volume '" + title + "' (" + category.getName() + ") to shelf " + shelf
            ));
        } catch (Exception ignored) {}

        return true;
    }

    public Map<String, Object> seedSampleBooks() {
        int added = 0;

        // 1. Computer Science
        if (seedBookIfAbsent("Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Prentice Hall", "Computer Science",
                "CS-101", "Even bad code can function. But if code is not clean, it can bring a development organization to its knees. A handbook of agile software craftsmanship.",
                "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?q=80&w=800&auto=format&fit=crop", "978-0132350884", 2008, 5, true)) added++;

        if (seedBookIfAbsent("The Pragmatic Programmer: Your Journey to Mastery", "David Thomas & Andrew Hunt", "Addison-Wesley", "Computer Science",
                "CS-102", "One of the most significant books in software development, providing timeless guidance on code craftsmanship and architecture.",
                "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop", "978-0135957059", 2019, 4, true)) added++;

        if (seedBookIfAbsent("Designing Data-Intensive Applications", "Martin Kleppmann", "O'Reilly Media", "Computer Science",
                "CS-103", "The definitive guide to data system architectures, storage engines, distributed transactions, consistency, and replication.",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop", "978-1449373320", 2017, 6, true)) added++;

        if (seedBookIfAbsent("Introduction to Algorithms (CLRS)", "Thomas H. Cormen", "MIT Press", "Computer Science",
                "CS-104", "Comprehensive introduction to the modern study of computer algorithms, from sorting and data structures to dynamic programming.",
                "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop", "978-0262033848", 2009, 4, false)) added++;

        if (seedBookIfAbsent("Design Patterns: Elements of Reusable Object-Oriented Software", "Erich Gamma", "Addison-Wesley", "Computer Science",
                "CS-105", "The foundational Gang of Four reference cataloging 23 classic object-oriented software design patterns.",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop", "978-0201633610", 1994, 4, false)) added++;

        // 2. Classic Fiction
        if (seedBookIfAbsent("1984", "George Orwell", "Penguin Books", "Classic Fiction",
                "FIC-201", "The quintessential dystopian masterpiece examining totalitarianism, mass surveillance, and the manipulation of historical truth.",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop", "978-0451524935", 1949, 5, true)) added++;

        if (seedBookIfAbsent("Animal Farm", "George Orwell", "Penguin Books", "Classic Fiction",
                "FIC-202", "A legendary political satire and allegorical novella reflecting events leading up to the Russian Revolution of 1917.",
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop", "978-0451526342", 1945, 4, false)) added++;

        if (seedBookIfAbsent("To Kill a Mockingbird", "Harper Lee", "HarperCollins", "Classic Fiction",
                "FIC-203", "Pulitzer Prize-winning novel exploring racial injustice, courage, and moral integrity in the American South.",
                "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop", "978-0060935467", 1960, 5, true)) added++;

        if (seedBookIfAbsent("The Great Gatsby", "F. Scott Fitzgerald", "Scribner", "Classic Fiction",
                "FIC-204", "A striking portrait of the Roaring Twenties exploring wealth, obsession, illusion, and the American dream on Long Island.",
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop", "978-0743273565", 1925, 4, false)) added++;

        if (seedBookIfAbsent("Brave New World", "Aldous Huxley", "HarperCollins", "Classic Fiction",
                "FIC-205", "A gripping vision of an unequal, technologically driven future society governed by mass conditioning and state control.",
                "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=800&auto=format&fit=crop", "978-0060850524", 1932, 4, false)) added++;

        // 3. History & Biography
        if (seedBookIfAbsent("Sapiens: A Brief History of Humankind", "Yuval Noah Harari", "HarperCollins", "History & Biography",
                "HIST-301", "How Homo sapiens conquered Earth through cognitive, agricultural, and scientific revolutions.",
                "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop", "978-0062316097", 2014, 6, true)) added++;

        if (seedBookIfAbsent("Steve Jobs", "Walter Isaacson", "Simon & Schuster", "History & Biography",
                "HIST-302", "The exclusive biography of the visionary entrepreneur whose passion for perfection and design transformed multiple industries.",
                "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop", "978-1451648539", 2011, 4, false)) added++;

        if (seedBookIfAbsent("Guns, Germs, and Steel: The Fates of Human Societies", "Jared Diamond", "W. W. Norton & Company", "History & Biography",
                "HIST-303", "Pulitzer Prize-winning analysis of how environmental and geographical conditions shaped human history.",
                "https://images.unsplash.com/photo-1461360370896-922624d12aa1?q=80&w=800&auto=format&fit=crop", "978-0393317558", 1997, 3, false)) added++;

        // 4. Science & Technology
        if (seedBookIfAbsent("A Brief History of Time", "Stephen Hawking", "Bantam Books", "Science & Technology",
                "SCI-401", "Landmark exploration of cosmology, black holes, the Big Bang, and the fundamental laws governing our universe.",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop", "978-0553380163", 1988, 5, true)) added++;

        if (seedBookIfAbsent("Cosmos", "Carl Sagan", "Random House", "Science & Technology",
                "SCI-402", "The universe revealed: 15 billion years of cosmic evolution transforming matter into consciousness.",
                "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=800&auto=format&fit=crop", "978-0345539434", 1980, 4, false)) added++;

        if (seedBookIfAbsent("The Selfish Gene", "Richard Dawkins", "Oxford University Press", "Science & Technology",
                "SCI-403", "A groundbreaking perspective on evolutionary biology explaining how genes drive behavior and natural selection.",
                "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop", "978-0199291151", 1976, 3, false)) added++;

        // 5. Psychology & Self-Help
        if (seedBookIfAbsent("Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones", "James Clear", "Penguin Random House", "Psychology & Self-Help",
                "PSYC-501", "A proven framework for improving every day, teaching how tiny changes can lead to remarkable and compounding results.",
                "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop", "978-0735211292", 2018, 6, true)) added++;

        if (seedBookIfAbsent("Thinking, Fast and Slow", "Daniel Kahneman", "Farrar, Straus and Giroux", "Psychology & Self-Help",
                "PSYC-502", "Nobel laureate Daniel Kahneman's definitive analysis of the two cognitive systems that drive human judgment.",
                "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop", "978-0374533557", 2011, 5, false)) added++;

        if (seedBookIfAbsent("Deep Work: Rules for Focused Success in a Distracted World", "Cal Newport", "Grand Central Publishing", "Psychology & Self-Help",
                "PSYC-503", "A master guide to cultivating intense concentration and eliminating digital distractions to achieve extraordinary output.",
                "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop", "978-1455586691", 2016, 4, false)) added++;

        // 6. Business & Economics
        if (seedBookIfAbsent("The Psychology of Money: Timeless Lessons on Wealth, Greed, and Happiness", "Morgan Housel", "Harriman House", "Business & Economics",
                "BIZ-601", "Doing well with money is not necessarily about what you know. It is about how you behave. Nineteen captivating short stories.",
                "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop", "978-0857197689", 2020, 6, true)) added++;

        if (seedBookIfAbsent("Zero to One: Notes on Startups, or How to Build the Future", "Peter Thiel", "Crown Business", "Business & Economics",
                "BIZ-602", "Legendary entrepreneur Peter Thiel reveals how to build companies that create entirely new things from zero to one.",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop", "978-0804139298", 2014, 5, false)) added++;

        long totalCount = bookRepository.count();
        logger.info("Sample catalog check complete. Newly added: {}, Total volumes in database: {}", added, totalCount);

        Map<String, Object> result = new HashMap<>();
        result.put("newlyAdded", added);
        result.put("totalBooks", totalCount);
        result.put("message", "Catalog successfully synchronized with authentic sample volumes.");
        return result;
    }

    private void seedSampleFines() {
        if (fineRepository.countByStatus(Fine.Status.UNPAID) == 0) {
            List<Book> books = bookRepository.findAll();
            if (books.isEmpty()) return;

            // Seed fines for reader@library.com
            userRepository.findByEmail("reader@library.com").ifPresent(reader -> {
                Book book1 = books.get(0);
                createDummyFine(reader, book1, 5, 50.0);

                if (books.size() > 1) {
                    Book book2 = books.get(1);
                    createDummyFine(reader, book2, 3, 30.0);
                }
            });

            // Seed fine for alex.turner@library.com
            userRepository.findByEmail("alex.turner@library.com").ifPresent(reader2 -> {
                if (books.size() > 2) {
                    Book book3 = books.get(2);
                    createDummyFine(reader2, book3, 6, 60.0);
                }
            });
        }
    }

    private void createDummyFine(User reader, Book book, long overdueDays, double fineAmount) {
        Borrow sampleBorrow = new Borrow();
        sampleBorrow.setUserId(reader.getId());
        sampleBorrow.setUserName(reader.getName());
        sampleBorrow.setUserEmail(reader.getEmail());
        sampleBorrow.setBookId(book.getId());
        sampleBorrow.setBookTitle(book.getTitle());
        sampleBorrow.setBookCover(book.getImage());
        sampleBorrow.setStatus(Borrow.Status.RETURNED);
        sampleBorrow.setRequestDate(LocalDate.now().minusDays(14 + overdueDays));
        sampleBorrow.setIssueDate(LocalDate.now().minusDays(14 + overdueDays));
        sampleBorrow.setDueDate(LocalDate.now().minusDays(overdueDays));
        sampleBorrow.setReturnDate(LocalDate.now().minusDays(1));
        sampleBorrow.setFineAmount(fineAmount);
        sampleBorrow.setFineStatus(Borrow.FineStatus.UNPAID);
        Borrow savedBorrow = borrowRepository.save(sampleBorrow);

        Fine fine = new Fine(
                savedBorrow.getId(),
                reader.getId(),
                reader.getName(),
                reader.getEmail(),
                book.getId(),
                book.getTitle(),
                overdueDays,
                fineAmount
        );
        fineRepository.save(fine);
        logger.info("Sample fine seeded for reader '{}': ₹{} on book '{}'", reader.getEmail(), fineAmount, book.getTitle());
    }
}
