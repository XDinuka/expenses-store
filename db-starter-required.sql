CREATE DATABASE IF NOT EXISTS `expenses`;
USE `expenses`;

CREATE TABLE IF NOT EXISTS `categories`
(
    `category_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `category`    varchar(100)     NOT NULL,
    PRIMARY KEY (`category_id`),
    UNIQUE KEY `uk_category` (`category`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 26
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `descriptions`
(
    `description` varchar(255) NOT NULL,
    `category`    varchar(100) NOT NULL,
    UNIQUE KEY `description` (`description`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `reimbursements`
(
    `reimbursement_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `amount`           decimal(12, 2)      NOT NULL,
    `transaction_id`   bigint(20) unsigned NOT NULL,
    `description`      varchar(255) DEFAULT NULL,
    `datetime`         datetime            NOT NULL,
    `source`           varchar(100) DEFAULT NULL,
    PRIMARY KEY (`reimbursement_id`),
    KEY `idx_transaction_id` (`transaction_id`),
    KEY `idx_datetime` (`datetime`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 2
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `sources`
(
    `reference` varchar(50) NOT NULL,
    `source`    varchar(50) NOT NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `transactions`
(
    `transaction_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    `amount`         decimal(12, 2)      NOT NULL,
    `description`    varchar(255)                 DEFAULT NULL,
    `category_id`    int(10) unsigned    NOT NULL,
    `datetime`       datetime            NOT NULL,
    `source`         varchar(100)        NOT NULL,
    `currency`       varchar(5)          NOT NULL DEFAULT 'LKR',
    PRIMARY KEY (`transaction_id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_datetime` (`datetime`)
) ENGINE = InnoDB
  AUTO_INCREMENT = 3645
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

INSERT INTO `categories` (`category_id`, `category`)
VALUES (1, 'Uncategorized');


