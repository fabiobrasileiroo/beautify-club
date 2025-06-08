-- AlterTable
ALTER TABLE `salons` ADD COLUMN `closing_time_salon` VARCHAR(191) NOT NULL DEFAULT '18:00:00',
    ADD COLUMN `opening_time_salon` VARCHAR(191) NOT NULL DEFAULT '09:00:00',
    ADD COLUMN `working_days_salon` JSON NULL;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `available_days_service` JSON NULL,
    ADD COLUMN `available_end_time_service` VARCHAR(191) NOT NULL DEFAULT '18:00:00',
    ADD COLUMN `available_start_time_service` VARCHAR(191) NOT NULL DEFAULT '09:00:00';

-- CreateTable
CREATE TABLE `time_slots` (
    `id_time_slot` VARCHAR(191) NOT NULL,
    `salon_id_time_slot` VARCHAR(191) NOT NULL,
    `service_id_time_slot` VARCHAR(191) NULL,
    `date_time_slot` DATETIME(3) NOT NULL,
    `start_time_time_slot` VARCHAR(191) NOT NULL,
    `end_time_time_slot` VARCHAR(191) NOT NULL,
    `is_available_time_slot` BOOLEAN NOT NULL DEFAULT true,
    `created_at_time_slot` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at_time_slot` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id_time_slot`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `time_slots` ADD CONSTRAINT `time_slots_salon_id_time_slot_fkey` FOREIGN KEY (`salon_id_time_slot`) REFERENCES `salons`(`id_salon`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_slots` ADD CONSTRAINT `time_slots_service_id_time_slot_fkey` FOREIGN KEY (`service_id_time_slot`) REFERENCES `services`(`id_service`) ON DELETE CASCADE ON UPDATE CASCADE;
