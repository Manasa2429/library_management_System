package com.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserProfileDto {

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 2, max = 100)
    private String name;

    private String phone;

    public UserProfileDto() {}

    public UserProfileDto(String name, String phone) {
        this.name = name;
        this.phone = phone;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
