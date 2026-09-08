package com.library.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.library.model.School;
import com.library.repository.SchoolRepository;

@RestController
@RequestMapping("/api/school")
// @CrossOrigin(origins = "http://localhost:3000")
public class SchoolController {

    @Autowired
    public SchoolRepository sr;

    @GetMapping
    public List<School> getAllSchool(){
        return sr.findAll();
    }

    @GetMapping("{id}")
    public School getSchoolById(@PathVariable String id){
        return sr.findById(id).orElse(null);
    }

    @PostMapping
    public School createSchool(@RequestBody School s){
        return sr.save(s);
    }

    @PutMapping("{id}")
    public School updateSchool(@PathVariable String id,@RequestBody School s){
        School cs=sr.findById(id).orElse(null);
        if(cs!=null){
            cs.putName(s.getName());
            return sr.save(cs);
        }
        else{
            return null;
        }
    }

    @DeleteMapping("{id}")
    public void deleteSchool(@PathVariable String id){
        sr.deleteById(id);
    }
    


    
}
