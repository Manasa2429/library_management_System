package com.library.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "members")
public class Member {

    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
    private String address;

    @JsonProperty("membership_date")
    private LocalDate membershipDate;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    public Member() {}

    public Member(String name, String email, String phone, String address, LocalDate membershipDate) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.membershipDate = membershipDate != null ? membershipDate : LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDate getMembershipDate() { return membershipDate; }
    public void setMembershipDate(LocalDate membershipDate) { this.membershipDate = membershipDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
