DROP DATABASE IF EXISTS brain;
CREATE DATABASE brain;

DROP USER IF EXISTS 'brain'@'localhost';
CREATE USER 'brain'@'localhost' IDENTIFIED BY '123456';

GRANT ALL PRIVILEGES ON brain.* TO 'brain'@'localhost' WITH GRANT OPTION;

DROP TABLE IF EXISTS brain.Keys
CREATE TABLE Keys (
    deviceID int,
    public varchar(255),
    private varchar(255)
);