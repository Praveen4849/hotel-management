-- Hotel Management Database Schema
-- Run this script to set up PostgreSQL database and tables manually if needed

CREATE DATABASE hotel_db;

\c hotel_db;

CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    image VARCHAR(500),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
