package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "student")
public class Student {
    
    @Id
    private String id;
    private String name;
    private String place;
    private School schoolID;

    public Student() {}

    public Student(String id, String name, String place, School schoolID) {
        this.id = id;
        this.name = name;
        this.place = place;
        this.schoolID = schoolID;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getPlace() { return place; }
    public School getSchoolId() { return schoolID; }

    public void putId(String id) { this.id = id; }
    public void putName(String name) { this.name = name; }
    public void putPlace(String place) { this.place = place; }
    public void putSchoolId(School schoolID) { this.schoolID = schoolID; }
}
