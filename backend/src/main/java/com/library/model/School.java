package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "school")
public class School {

    @Id
    private String id;
    private String name;

    public School() {}

    public School(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public void putId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public void putName(String name) { this.name = name; }
}
