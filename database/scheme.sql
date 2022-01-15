-- phpMyAdmin SQL Dump
-- version 4.6.6deb4+deb9u2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 13, 2021 at 04:46 PM
-- Server version: 10.3.18-MariaDB-1:10.3.18+maria~stretch-log
-- PHP Version: 5.6.40-0+deb8u1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `salt_linjeforening`
--

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

CREATE TABLE IF NOT EXISTS `login` (
  `username` varchar(30) NOT NULL,
  `hash` blob NOT NULL,
  `salt` blob NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `study_programme`
--

CREATE TABLE IF NOT EXISTS `study_programme` (
  `study_programme_id` int(11) NOT NULL,
  `programme_code` varchar(45) NOT NULL,
  `name` varchar(60) NOT NULL,
  `length` int(11) NOT NULL,
  `active` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `terms_of_service`
--

CREATE TABLE IF NOT EXISTS `terms_of_service` (
  `id` int(11) NOT NULL,
  `text` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `student_email` varchar(45) NOT NULL,
  `private_email` varchar(45) DEFAULT NULL,
  `year_of_admission` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `email_verification_code` varchar(45) NOT NULL,
  `verified_student_email` tinyint(1) NOT NULL DEFAULT 0,
  `newsletter` tinyint(1) NOT NULL DEFAULT 0,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `vipps_transaction_id` varchar(30) DEFAULT NULL,
  `study_programme_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `login`
--
ALTER TABLE IF EXISTS `login`
  ADD PRIMARY KEY (`username`);

--
-- Indexes for table `study_programme`
--
ALTER TABLE IF EXISTS `study_programme`
  ADD PRIMARY KEY (`study_programme_id`);

--
-- Indexes for table `terms_of_service`
--
ALTER TABLE IF EXISTS `terms_of_service`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE IF EXISTS `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `vipps_transaction_id` (`vipps_transaction_id`),
  ADD KEY `fk_user_study_programme_idx` (`study_programme_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE IF EXISTS `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2247;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `user`
--
ALTER TABLE IF EXISTS `user`
  ADD CONSTRAINT `fk_user_study_programme` FOREIGN KEY (`study_programme_id`) REFERENCES `study_programme` (`study_programme_id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
