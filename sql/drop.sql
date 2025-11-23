DROP TABLE IF EXISTS production_task_status CASCADE;
DROP TABLE IF EXISTS production_task CASCADE;
DROP TABLE IF EXISTS material_consumption CASCADE;
DROP TABLE IF EXISTS client_order_status CASCADE;
DROP TABLE IF EXISTS client_order CASCADE;
DROP TABLE IF EXISTS client_application_attachment CASCADE;
DROP TABLE IF EXISTS client_application CASCADE;
DROP TABLE IF EXISTS required_material CASCADE;
DROP TABLE IF EXISTS product_design_file CASCADE;
DROP TABLE IF EXISTS product_photo CASCADE;
DROP TABLE IF EXISTS product_catalog CASCADE;
DROP TABLE IF EXISTS product_design CASCADE;
DROP TABLE IF EXISTS purchase_order_receipt CASCADE;
DROP TABLE IF EXISTS purchase_order_material CASCADE;
DROP TABLE IF EXISTS purchase_order_status CASCADE;
DROP TABLE IF EXISTS purchase_order CASCADE;
DROP TABLE IF EXISTS material_balance CASCADE;
DROP TABLE IF EXISTS material CASCADE;
DROP TABLE IF EXISTS file_version CASCADE;
DROP TABLE IF EXISTS file CASCADE;
DROP TABLE IF EXISTS email_token CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS person CASCADE;
DROP TABLE IF EXISTS message CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS conversation CASCADE;
DROP TABLE IF EXISTS conversation_participant CASCADE;

-- Удаление VIEW
DROP VIEW IF EXISTS v_client_order_summary CASCADE;
DROP VIEW IF EXISTS v_conversation_participants CASCADE;
DROP VIEW IF EXISTS v_material_stock CASCADE;

-- Удаление функций
DROP FUNCTION IF EXISTS f_order_required_materials(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS f_order_material_shortage(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS f_client_order_status_history(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS f_production_task_status_history(BIGINT) CASCADE;
DROP FUNCTION IF EXISTS f_order_last_message(BIGINT) CASCADE;

-- Удаление триггерных функций
DROP FUNCTION IF EXISTS tg_set_client_order_current_status() CASCADE;
DROP FUNCTION IF EXISTS tg_set_production_task_current_status() CASCADE;
DROP FUNCTION IF EXISTS tg_set_purchase_order_current_status() CASCADE;
