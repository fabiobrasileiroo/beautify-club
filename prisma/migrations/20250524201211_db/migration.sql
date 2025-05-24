/*
  Warnings:

  - The primary key for the `appointments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `price_charged` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `salon_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_at` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `appointments` table. All the data in the column will be lost.
  - The primary key for the `commissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amount` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `appointment_id` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `paid_flag` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `salon_id` on the `commissions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `commissions` table. All the data in the column will be lost.
  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amount` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paid_at` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `subscription_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `payments` table. All the data in the column will be lost.
  - The primary key for the `salons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `contact_info` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `pix_key` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `pix_key_type` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `rejection_reason` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `salons` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `salons` table. All the data in the column will be lost.
  - The primary key for the `services` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `base_price` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `duration_min` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `salon_id` on the `services` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `services` table. All the data in the column will be lost.
  - The primary key for the `subscription_plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `max_services_per_month` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `subscription_plans` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subscription_plans` table. All the data in the column will be lost.
  - The primary key for the `subscriptions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `plan_id` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `subscriptions` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `clerk_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.
  - The primary key for the `workshop_registrations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `workshop_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `registered_at` on the `workshop_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `workshop_registrations` table. All the data in the column will be lost.
  - You are about to drop the column `workshop_id` on the `workshop_registrations` table. All the data in the column will be lost.
  - The primary key for the `workshops` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `capacity` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_at` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `workshops` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `workshops` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[appointment_id_commission]` on the table `commissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id_salon]` on the table `salons` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_id_user]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email_user]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - The required column `id_appointment` was added to the `appointments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `price_charged_appointment` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salon_id_appointment` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_at_appointment` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service_id_appointment` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_appointment` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id_appointment` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_commission` to the `commissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appointment_id_commission` to the `commissions` table without a default value. This is not possible if the table is not empty.
  - The required column `id_commission` was added to the `commissions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `salon_id_commission` to the `commissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_commission` to the `commissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount_payment` to the `payments` table without a default value. This is not possible if the table is not empty.
  - The required column `id_payment` was added to the `payments` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `method_payment` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscription_id_payment` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_payment` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_info_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - The required column `id_salon` was added to the `salons` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `latitude_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id_salon` to the `salons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `base_price_service` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_service` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration_min_service` to the `services` table without a default value. This is not possible if the table is not empty.
  - The required column `id_service` was added to the `services` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name_service` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salon_id_service` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_service` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `features_subscription_plan` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - The required column `id_subscription_plan` was added to the `subscription_plans` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name_subscription_plan` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_subscription_plan` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_subscription_plan` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date_subscription` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - The required column `id_subscription` was added to the `subscriptions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `plan_id_subscription` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date_subscription` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_subscription` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id_subscription` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerk_id_user` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email_user` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `id_user` was added to the `users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `name_user` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_user` to the `users` table without a default value. This is not possible if the table is not empty.
  - The required column `id_workshop_registration` was added to the `workshop_registrations` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `user_id_workshop_registration` to the `workshop_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workshop_id_workshop_registration` to the `workshop_registrations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity_workshop` to the `workshops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description_workshop` to the `workshops` table without a default value. This is not possible if the table is not empty.
  - The required column `id_workshop` was added to the `workshops` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `price_workshop` to the `workshops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_at_workshop` to the `workshops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title_workshop` to the `workshops` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at_workshop` to the `workshops` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_salon_id_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `appointments` DROP FOREIGN KEY `appointments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `commissions_appointment_id_fkey`;

-- DropForeignKey
ALTER TABLE `commissions` DROP FOREIGN KEY `commissions_salon_id_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_subscription_id_fkey`;

-- DropForeignKey
ALTER TABLE `salons` DROP FOREIGN KEY `salons_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `services` DROP FOREIGN KEY `services_salon_id_fkey`;

-- DropForeignKey
ALTER TABLE `subscriptions` DROP FOREIGN KEY `subscriptions_plan_id_fkey`;

-- DropForeignKey
ALTER TABLE `subscriptions` DROP FOREIGN KEY `subscriptions_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `workshop_registrations` DROP FOREIGN KEY `workshop_registrations_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `workshop_registrations` DROP FOREIGN KEY `workshop_registrations_workshop_id_fkey`;

-- DropIndex
DROP INDEX `appointments_salon_id_fkey` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_service_id_fkey` ON `appointments`;

-- DropIndex
DROP INDEX `appointments_user_id_fkey` ON `appointments`;

-- DropIndex
DROP INDEX `commissions_appointment_id_key` ON `commissions`;

-- DropIndex
DROP INDEX `commissions_salon_id_fkey` ON `commissions`;

-- DropIndex
DROP INDEX `payments_subscription_id_fkey` ON `payments`;

-- DropIndex
DROP INDEX `salons_user_id_key` ON `salons`;

-- DropIndex
DROP INDEX `services_salon_id_fkey` ON `services`;

-- DropIndex
DROP INDEX `subscriptions_plan_id_fkey` ON `subscriptions`;

-- DropIndex
DROP INDEX `subscriptions_user_id_fkey` ON `subscriptions`;

-- DropIndex
DROP INDEX `users_clerk_id_key` ON `users`;

-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- DropIndex
DROP INDEX `workshop_registrations_user_id_fkey` ON `workshop_registrations`;

-- DropIndex
DROP INDEX `workshop_registrations_workshop_id_fkey` ON `workshop_registrations`;

-- AlterTable
ALTER TABLE `appointments` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    DROP COLUMN `price_charged`,
    DROP COLUMN `salon_id`,
    DROP COLUMN `scheduled_at`,
    DROP COLUMN `service_id`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `created_at_appointment` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_appointment` VARCHAR(191) NOT NULL,
    ADD COLUMN `price_charged_appointment` DOUBLE NOT NULL,
    ADD COLUMN `salon_id_appointment` VARCHAR(50) NOT NULL,
    ADD COLUMN `scheduled_at_appointment` DATETIME(3) NOT NULL,
    ADD COLUMN `service_id_appointment` VARCHAR(50) NOT NULL,
    ADD COLUMN `status_appointment` ENUM('SCHEDULED', 'COMPLETED', 'CANCELED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
    ADD COLUMN `updated_at_appointment` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id_appointment` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id_appointment`);

-- AlterTable
ALTER TABLE `commissions` DROP PRIMARY KEY,
    DROP COLUMN `amount`,
    DROP COLUMN `appointment_id`,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    DROP COLUMN `paid_at`,
    DROP COLUMN `paid_flag`,
    DROP COLUMN `salon_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `amount_commission` DOUBLE NOT NULL,
    ADD COLUMN `appointment_id_commission` VARCHAR(50) NOT NULL,
    ADD COLUMN `created_at_commission` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_commission` VARCHAR(191) NOT NULL,
    ADD COLUMN `paid_at_commission` DATETIME(3) NULL,
    ADD COLUMN `paid_flag_commission` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `salon_id_commission` VARCHAR(50) NOT NULL,
    ADD COLUMN `updated_at_commission` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_commission`);

-- AlterTable
ALTER TABLE `payments` DROP PRIMARY KEY,
    DROP COLUMN `amount`,
    DROP COLUMN `created_at`,
    DROP COLUMN `id`,
    DROP COLUMN `method`,
    DROP COLUMN `paid_at`,
    DROP COLUMN `status`,
    DROP COLUMN `subscription_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `amount_payment` DOUBLE NOT NULL,
    ADD COLUMN `created_at_payment` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_payment` VARCHAR(191) NOT NULL,
    ADD COLUMN `method_payment` VARCHAR(50) NOT NULL,
    ADD COLUMN `paid_at_payment` DATETIME(3) NULL,
    ADD COLUMN `status_payment` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `subscription_id_payment` VARCHAR(50) NOT NULL,
    ADD COLUMN `updated_at_payment` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_payment`);

-- AlterTable
ALTER TABLE `salons` DROP PRIMARY KEY,
    DROP COLUMN `address`,
    DROP COLUMN `contact_info`,
    DROP COLUMN `created_at`,
    DROP COLUMN `description`,
    DROP COLUMN `id`,
    DROP COLUMN `latitude`,
    DROP COLUMN `longitude`,
    DROP COLUMN `name`,
    DROP COLUMN `pix_key`,
    DROP COLUMN `pix_key_type`,
    DROP COLUMN `rejection_reason`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `address_salon` VARCHAR(255) NOT NULL,
    ADD COLUMN `contact_info_salon` VARCHAR(100) NOT NULL,
    ADD COLUMN `created_at_salon` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description_salon` TEXT NULL,
    ADD COLUMN `id_salon` VARCHAR(191) NOT NULL,
    ADD COLUMN `latitude_salon` DOUBLE NOT NULL,
    ADD COLUMN `longitude_salon` DOUBLE NOT NULL,
    ADD COLUMN `name_salon` VARCHAR(100) NOT NULL,
    ADD COLUMN `pix_key_salon` VARCHAR(50) NULL,
    ADD COLUMN `pix_key_type_salon` VARCHAR(50) NULL,
    ADD COLUMN `rejection_reason_salon` TEXT NULL,
    ADD COLUMN `status_salon` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `updated_at_salon` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id_salon` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id_salon`);

-- AlterTable
ALTER TABLE `services` DROP PRIMARY KEY,
    DROP COLUMN `base_price`,
    DROP COLUMN `created_at`,
    DROP COLUMN `description`,
    DROP COLUMN `duration_min`,
    DROP COLUMN `id`,
    DROP COLUMN `name`,
    DROP COLUMN `salon_id`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `base_price_service` DOUBLE NOT NULL,
    ADD COLUMN `created_at_service` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description_service` TEXT NOT NULL,
    ADD COLUMN `duration_min_service` INTEGER NOT NULL,
    ADD COLUMN `id_service` VARCHAR(191) NOT NULL,
    ADD COLUMN `name_service` VARCHAR(100) NOT NULL,
    ADD COLUMN `salon_id_service` VARCHAR(50) NOT NULL,
    ADD COLUMN `updated_at_service` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_service`);

-- AlterTable
ALTER TABLE `subscription_plans` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `features`,
    DROP COLUMN `id`,
    DROP COLUMN `max_services_per_month`,
    DROP COLUMN `name`,
    DROP COLUMN `price`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `created_at_subscription_plan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `features_subscription_plan` TEXT NOT NULL,
    ADD COLUMN `id_subscription_plan` VARCHAR(191) NOT NULL,
    ADD COLUMN `max_services_per_month_subscription_plan` INTEGER NULL,
    ADD COLUMN `name_subscription_plan` VARCHAR(100) NOT NULL,
    ADD COLUMN `price_subscription_plan` DOUBLE NOT NULL,
    ADD COLUMN `updated_at_subscription_plan` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_subscription_plan`);

-- AlterTable
ALTER TABLE `subscriptions` DROP PRIMARY KEY,
    DROP COLUMN `created_at`,
    DROP COLUMN `end_date`,
    DROP COLUMN `id`,
    DROP COLUMN `plan_id`,
    DROP COLUMN `start_date`,
    DROP COLUMN `status`,
    DROP COLUMN `updated_at`,
    DROP COLUMN `user_id`,
    ADD COLUMN `created_at_subscription` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `end_date_subscription` DATETIME(3) NOT NULL,
    ADD COLUMN `id_subscription` VARCHAR(191) NOT NULL,
    ADD COLUMN `plan_id_subscription` VARCHAR(50) NOT NULL,
    ADD COLUMN `start_date_subscription` DATETIME(3) NOT NULL,
    ADD COLUMN `status_subscription` ENUM('ACTIVE', 'CANCELED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `updated_at_subscription` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id_subscription` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id_subscription`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `clerk_id`,
    DROP COLUMN `created_at`,
    DROP COLUMN `email`,
    DROP COLUMN `id`,
    DROP COLUMN `name`,
    DROP COLUMN `role`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `clerk_id_user` VARCHAR(50) NOT NULL,
    ADD COLUMN `created_at_user` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `email_user` VARCHAR(255) NOT NULL,
    ADD COLUMN `id_user` VARCHAR(191) NOT NULL,
    ADD COLUMN `name_user` VARCHAR(50) NOT NULL,
    ADD COLUMN `role_user` ENUM('CLIENT', 'PARTNER', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    ADD COLUMN `updated_at_user` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_user`);

-- AlterTable
ALTER TABLE `workshop_registrations` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    DROP COLUMN `registered_at`,
    DROP COLUMN `user_id`,
    DROP COLUMN `workshop_id`,
    ADD COLUMN `id_workshop_registration` VARCHAR(191) NOT NULL,
    ADD COLUMN `registered_at_workshop_registration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `user_id_workshop_registration` VARCHAR(50) NOT NULL,
    ADD COLUMN `workshop_id_workshop_registration` VARCHAR(50) NOT NULL,
    ADD PRIMARY KEY (`id_workshop_registration`);

-- AlterTable
ALTER TABLE `workshops` DROP PRIMARY KEY,
    DROP COLUMN `capacity`,
    DROP COLUMN `created_at`,
    DROP COLUMN `description`,
    DROP COLUMN `id`,
    DROP COLUMN `price`,
    DROP COLUMN `scheduled_at`,
    DROP COLUMN `title`,
    DROP COLUMN `updated_at`,
    ADD COLUMN `capacity_workshop` INTEGER NOT NULL,
    ADD COLUMN `created_at_workshop` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `description_workshop` TEXT NOT NULL,
    ADD COLUMN `id_workshop` VARCHAR(191) NOT NULL,
    ADD COLUMN `price_workshop` DOUBLE NOT NULL,
    ADD COLUMN `scheduled_at_workshop` DATETIME(3) NOT NULL,
    ADD COLUMN `title_workshop` VARCHAR(100) NOT NULL,
    ADD COLUMN `updated_at_workshop` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`id_workshop`);

-- CreateIndex
CREATE UNIQUE INDEX `commissions_appointment_id_commission_key` ON `commissions`(`appointment_id_commission`);

-- CreateIndex
CREATE UNIQUE INDEX `salons_user_id_salon_key` ON `salons`(`user_id_salon`);

-- CreateIndex
CREATE UNIQUE INDEX `users_clerk_id_user_key` ON `users`(`clerk_id_user`);

-- CreateIndex
CREATE UNIQUE INDEX `users_email_user_key` ON `users`(`email_user`);

-- AddForeignKey
ALTER TABLE `salons` ADD CONSTRAINT `salons_user_id_salon_fkey` FOREIGN KEY (`user_id_salon`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_salon_id_service_fkey` FOREIGN KEY (`salon_id_service`) REFERENCES `salons`(`id_salon`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_subscription_fkey` FOREIGN KEY (`user_id_subscription`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_subscription_fkey` FOREIGN KEY (`plan_id_subscription`) REFERENCES `subscription_plans`(`id_subscription_plan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_user_id_appointment_fkey` FOREIGN KEY (`user_id_appointment`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_service_id_appointment_fkey` FOREIGN KEY (`service_id_appointment`) REFERENCES `services`(`id_service`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_salon_id_appointment_fkey` FOREIGN KEY (`salon_id_appointment`) REFERENCES `salons`(`id_salon`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_subscription_id_payment_fkey` FOREIGN KEY (`subscription_id_payment`) REFERENCES `subscriptions`(`id_subscription`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_appointment_id_commission_fkey` FOREIGN KEY (`appointment_id_commission`) REFERENCES `appointments`(`id_appointment`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commissions` ADD CONSTRAINT `commissions_salon_id_commission_fkey` FOREIGN KEY (`salon_id_commission`) REFERENCES `salons`(`id_salon`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workshop_registrations` ADD CONSTRAINT `workshop_registrations_user_id_workshop_registration_fkey` FOREIGN KEY (`user_id_workshop_registration`) REFERENCES `users`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workshop_registrations` ADD CONSTRAINT `workshop_registrations_workshop_id_workshop_registration_fkey` FOREIGN KEY (`workshop_id_workshop_registration`) REFERENCES `workshops`(`id_workshop`) ON DELETE RESTRICT ON UPDATE CASCADE;
