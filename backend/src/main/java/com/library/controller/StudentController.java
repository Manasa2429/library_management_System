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

import com.library.model.Student;
import com.library.repository.StudentRepository;


@RestController
@RequestMapping("/api/students")
// @CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Student> getAllStudents(){
        return studentRepository.findAll();
    }
    
    @GetMapping("{id}")
    public Student getStudentById(@PathVariable String id){
        return studentRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }
    
    @PutMapping("{id}")
    public Student updateStudentById(@PathVariable String id,@RequestBody Student updateStudent){
        Student cstudent = studentRepository.findById(id).orElse(null);
        if(cstudent!=null){
            cstudent.putName(updateStudent.getName());
            cstudent.putPlace(updateStudent.getPlace());
            cstudent.putSchoolId(updateStudent.getSchoolId());
            return studentRepository.save(cstudent);
        }
        else{
            return null;
        }
    }

    @DeleteMapping("{id}")
    public void deleteStudent(@PathVariable String id){
        studentRepository.deleteById(id);
    }

    
}
