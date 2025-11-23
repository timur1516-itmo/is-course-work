BEGIN;

-- Сводка по заказу
CREATE OR REPLACE VIEW v_client_order_summary AS
SELECT
    co.id                AS order_id,
    co.created_at        AS order_created_at,
    co.price,
    ca.amount,
    cos.status           AS current_status,
    c.email              AS client_email,
    pc.name              AS product_name,
    a_manager.username   AS manager_username
FROM client_order co
         JOIN client_order_status cos ON cos.id = co.current_status_id
         JOIN client_application ca   ON ca.id = co.client_application_id
         JOIN client c                ON c.id = ca.client_id
         JOIN product_design pd       ON pd.id = co.product_design_id
         LEFT JOIN product_catalog pc ON pc.product_design_id = pd.id
         JOIN employee e_manager      ON e_manager.id = co.manager_id
         JOIN account a_manager       ON a_manager.id = e_manager.account_id;

-- 2. Требуемые материалы по заказу
CREATE OR REPLACE FUNCTION f_order_required_materials(p_order_id BIGINT)
    RETURNS TABLE (
                      material_id BIGINT,
                      material_name VARCHAR,
                      total_required NUMERIC
                  )
    LANGUAGE sql
    STABLE
AS $$
SELECT
    m.id,
    m.name,
    rm.amount * ca.amount AS total_required
FROM client_order co
         JOIN client_application ca ON ca.id = co.client_application_id
         JOIN product_design pd     ON pd.id = co.product_design_id
         JOIN required_material rm  ON rm.product_design_id = pd.id
         JOIN material m            ON m.id = rm.material_id
WHERE co.id = p_order_id;
$$;

-- Дефицит материалов по заказу (shortage)
CREATE OR REPLACE FUNCTION f_order_material_shortage(p_order_id BIGINT)
    RETURNS TABLE (
                      material_id BIGINT,
                      material_name VARCHAR,
                      required NUMERIC,
                      available NUMERIC,
                      shortage NUMERIC
                  )
    LANGUAGE sql
    STABLE
AS $$
WITH req AS (
    SELECT * FROM f_order_required_materials(p_order_id)
)
SELECT
    r.material_id,
    r.material_name,
    r.total_required AS required,
    mb.balance       AS available,
    GREATEST(r.total_required - mb.balance, 0) AS shortage
FROM req r
         JOIN material m ON m.id = r.material_id
         JOIN material_balance mb ON mb.id = m.current_balance_id;
$$;

-- История статусов заказа
CREATE OR REPLACE FUNCTION f_client_order_status_history(p_order_id BIGINT)
    RETURNS TABLE (
                      status VARCHAR(50),
                      set_at TIMESTAMPTZ
                  )
    LANGUAGE sql
    STABLE
AS $$
SELECT status, set_at
FROM client_order_status
WHERE client_order_id = p_order_id
ORDER BY set_at ASC, id ASC;
$$;

-- История статусов производственной задачи
CREATE OR REPLACE FUNCTION f_production_task_status_history(p_task_id BIGINT)
    RETURNS TABLE (
                      status VARCHAR(50),
                      set_at TIMESTAMPTZ
                  )
    LANGUAGE sql
    STABLE
AS $$
SELECT status, set_at
FROM production_task_status
WHERE production_task_id = p_task_id
ORDER BY set_at ASC, id ASC;
$$;

-- Последнее сообщение по заказу
CREATE OR REPLACE FUNCTION f_order_last_message(p_order_id BIGINT)
    RETURNS TABLE (
                      message_id BIGINT,
                      content TEXT,
                      sent_at TIMESTAMPTZ,
                      username VARCHAR(50)
                  )
    LANGUAGE sql
    STABLE
AS $$
SELECT m.id,
       m.content,
       m.sent_at,
       a.username
FROM conversation conv
         JOIN conversation_participant cp ON cp.conversation_id = conv.id
         JOIN message m ON m.conversation_participant_id = cp.id
         JOIN account a ON a.id = cp.user_id
WHERE conv.order_id = p_order_id
ORDER BY m.sent_at DESC, m.id DESC
LIMIT 1;
$$;

-- Участники диалогов
CREATE OR REPLACE VIEW v_conversation_participants AS
SELECT
    conv.id          AS conversation_id,
    conv.order_id    AS order_id,
    a.id             AS account_id,
    a.username,
    a.role,
    cp.joined_at
FROM conversation conv
         JOIN conversation_participant cp ON cp.conversation_id = conv.id
         JOIN account a ON a.id = cp.user_id;

-- Текущие остатки материалов
CREATE OR REPLACE VIEW v_material_stock AS
SELECT
    m.id,
    m.name,
    m.unit_of_measure,
    mb.balance,
    m.order_point,
    (mb.balance <= m.order_point) AS need_reorder
FROM material m
         LEFT JOIN material_balance mb ON mb.id = m.current_balance_id;

-- Триггеры для взаимных связей

-- client_order.current_status_id
CREATE OR REPLACE FUNCTION tg_set_client_order_current_status()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE client_order
    SET current_status_id = NEW.id
    WHERE id = NEW.client_order_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_client_order_status_set_current ON client_order_status;

CREATE TRIGGER trg_client_order_status_set_current
    AFTER INSERT ON client_order_status
    FOR EACH ROW
EXECUTE FUNCTION tg_set_client_order_current_status();

-- production_task.current_status_id
CREATE OR REPLACE FUNCTION tg_set_production_task_current_status()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE production_task
    SET current_status_id = NEW.id
    WHERE id = NEW.production_task_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_production_task_status_set_current ON production_task_status;

CREATE TRIGGER trg_production_task_status_set_current
    AFTER INSERT ON production_task_status
    FOR EACH ROW
EXECUTE FUNCTION tg_set_production_task_current_status();

-- purchase_order.current_status_id
CREATE OR REPLACE FUNCTION tg_set_purchase_order_current_status()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE purchase_order
    SET current_status_id = NEW.id
    WHERE id = NEW.purchase_order_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_purchase_order_status_set_current ON purchase_order_status;

CREATE TRIGGER trg_purchase_order_status_set_current
    AFTER INSERT ON purchase_order_status
    FOR EACH ROW
EXECUTE FUNCTION tg_set_purchase_order_current_status();

-- material.current_balance_id
CREATE OR REPLACE FUNCTION tg_set_material_current_balance()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE material
    SET current_balance_id = NEW.id
    WHERE id = NEW.material_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_material_balance_set_current ON material_balance;

CREATE TRIGGER trg_material_balance_set_current
    AFTER INSERT ON material_balance
    FOR EACH ROW
EXECUTE FUNCTION tg_set_material_current_balance();

-- file.current_version_id
CREATE OR REPLACE FUNCTION tg_set_file_current_version()
    RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE file
    SET current_version_id = NEW.id
    WHERE id = NEW.file_id;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_file_version_set_current ON file_version;

CREATE TRIGGER trg_file_version_set_current
    AFTER INSERT ON file_version
    FOR EACH ROW
EXECUTE FUNCTION tg_set_file_current_version();

COMMIT;
