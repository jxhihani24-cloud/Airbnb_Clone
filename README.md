# Hostera | Full-Stack Property Rental Platform

A full-stack property rental platform developed using ASP.NET Core Web API, PostgreSQL, Entity Framework Core, and modern web technologies.

This project simulates a real-world accommodation booking platform where guests can browse properties, make reservations, communicate with hosts, leave reviews, and manage bookings, while property owners can publish and manage rental listings.

The project demonstrates how object-oriented design, database management, and full-stack web development can be used to build a scalable property rental management system.

## Overview

This project implements a complete property rental platform inspired by modern accommodation booking services.

The system allows management of:

* users and property owners
* property listings
* reservations and bookings
* rental payments
* reviews and ratings
* messaging and conversations
* host profiles
* property availability
* image uploads
* booking history
* account management
* user authentication and authorization

The goal of the project is to demonstrate how a full-stack web application can be designed and implemented using modern software engineering principles and object-oriented architecture.

## Features

* User registration and login
* JWT-based authentication and authorization
* Property listing creation and management
* Property search and filtering
* Property image upload support
* Reservation and booking management
* Booking cancellation and status tracking
* Payment processing workflow
* Payment confirmation system
* Reviews and ratings
* Host profile management
* Messaging system between guests and hosts
* User account management
* Dark and light mode support
* Responsive web interface
* RESTful API integration

## Object-Oriented Design

The system follows fundamental OOP principles:

### Encapsulation

Sensitive information such as user credentials, booking details, payment records, and property information are protected inside dedicated classes and models.

### Inheritance

Application entities and models are structured to promote reusable functionality and shared behavior.

### Abstraction

Complex operations such as authentication, booking validation, payment processing, and database communication are separated from user-facing functionality.

### Polymorphism

Different entities within the platform can perform different actions depending on their role and responsibilities.

## Project Structure

Main system components included in the project:

### Backend Components

* Authentication Module – handles registration, login, and JWT token management
* User Module – manages user accounts and profile information
* Property Module – manages rental property listings and details
* Booking Module – handles reservations and booking workflows
* Payment Module – processes booking payments and confirmations
* Review Module – manages property reviews and ratings
* Messaging Module – handles conversations between guests and hosts
* Upload Module – manages property image uploads
* Entity Framework DbContext – handles database communication
* PostgreSQL Database – stores system data and relationships

### Frontend Components

* Home Page – property discovery and search
* Listings Page – displays available rental properties
* Property Details Page – displays property information and reviews
* Add Property Page – allows hosts to create and edit listings
* Login Page – user authentication
* Signup Page – user registration
* Account Page – user profile management
* Bookings Page – reservation tracking and management
* Payment Page – booking payment workflow
* Payment Confirmation Page – booking confirmation details
* Messages Page – communication between guests and hosts
* Host Profile Page – displays host information and listings

## Technologies Used

### Backend

* C#
* ASP.NET Core Web API
* Entity Framework Core
* PostgreSQL
* Npgsql
* JWT Authentication
* BCrypt Password Hashing
* Swagger / OpenAPI

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* Bootstrap 5
* Local Storage
* Responsive Web Design

### Software Engineering

* Object-Oriented Programming (OOP)
* RESTful APIs
* Client-Server Architecture
* CRUD Operations
* Authentication & Authorization
* Database Design

## System Architecture

The application follows a layered architecture consisting of:

* Presentation Layer (Frontend Interface)
* API Layer (ASP.NET Core Web API)
* Business Logic Layer
* Data Access Layer (Entity Framework Core)
* Database Layer (PostgreSQL)

This architecture improves maintainability, scalability, and separation of concerns throughout the system.

## Learning Outcomes

This project demonstrates practical experience with:

* Full-Stack Web Application Development
* ASP.NET Core API Development
* PostgreSQL Database Integration
* Entity Framework Core ORM
* Authentication and Authorization
* REST API Design
* Database Modeling
* Frontend–Backend Communication
* Property Rental System Development
* Booking and Payment Workflows
* Object-Oriented Analysis and Design
* Software Architecture Principles

## Future Improvements

Potential enhancements include:

* Real-time messaging using SignalR
* Email notifications and verification
* Payment gateway integration
* Advanced recommendation system
* Administrative dashboard
* Mobile application support
* Cloud deployment and scalability improvements
* Multi-language support
