-- =========================================================
-- 1. СОЗДАНИЕ УЧЁТНЫХ ЗАПИСЕЙ СОТРУДНИКОВ
-- =========================================================
BEGIN;

-- 1.1. Менеджер по продажам
INSERT INTO account (username, password, enabled, role)
VALUES ('sales_manager', 'hashed_password_sales', TRUE, 'SALES_MANAGER');

INSERT INTO person (first_name, last_name)
VALUES ('Иван', 'Петров');

INSERT INTO employee (account_id, person_id)
VALUES ((SELECT id FROM account WHERE username = 'sales_manager'),
        (SELECT id FROM person WHERE first_name = 'Иван' AND last_name = 'Петров'));

-- 1.2. Конструктор
INSERT INTO account (username, password, enabled, role)
VALUES ('constructor1', 'hashed_password_constructor', TRUE, 'CONSTRUCTOR');

INSERT INTO person (first_name, last_name)
VALUES ('Пётр', 'Соколов');

INSERT INTO employee (account_id, person_id)
VALUES ((SELECT id FROM account WHERE username = 'constructor1'),
        (SELECT id FROM person WHERE first_name = 'Пётр' AND last_name = 'Соколов'));

-- 1.3. Оператор станка ЧПУ
INSERT INTO account (username, password, enabled, role)
VALUES ('cnc_operator1', 'hashed_password_cnc', TRUE, 'CNC_OPERATOR');

INSERT INTO person (first_name, last_name)
VALUES ('Сергей', 'Иванов');

INSERT INTO employee (account_id, person_id)
VALUES ((SELECT id FROM account WHERE username = 'cnc_operator1'),
        (SELECT id FROM person WHERE first_name = 'Сергей' AND last_name = 'Иванов'));

-- 1.4. Работник склада
INSERT INTO account (username, password, enabled, role)
VALUES ('warehouse1', 'hashed_password_warehouse', TRUE, 'WAREHOUSE_WORKER');

INSERT INTO person (first_name, last_name)
VALUES ('Анна', 'Смирнова');

INSERT INTO employee (account_id, person_id)
VALUES ((SELECT id FROM account WHERE username = 'warehouse1'),
        (SELECT id FROM person WHERE first_name = 'Анна' AND last_name = 'Смирнова'));

-- 1.5. Менеджер по снабжению
INSERT INTO account (username, password, enabled, role)
VALUES ('supply_manager1', 'hashed_password_supply', TRUE, 'SUPPLY_MANAGER');

INSERT INTO person (first_name, last_name)
VALUES ('Олег', 'Орлов');

INSERT INTO employee (account_id, person_id)
VALUES ((SELECT id FROM account WHERE username = 'supply_manager1'),
        (SELECT id FROM person WHERE first_name = 'Олег' AND last_name = 'Орлов'));

COMMIT;

-- =========================================================
-- 2. НАСТРОЙКА МАТЕРИАЛОВ И НАЧАЛЬНОГО ОСТАТКА
-- =========================================================
BEGIN;

-- 2.1. Основной материал: фанера 4мм
INSERT INTO material (name, unit_of_measure, order_point)
VALUES ('Фанера 4мм', 'лист', 10.00);

INSERT INTO material_balance (material_id, balance, previous_balance_id, changer_id)
VALUES ((SELECT id FROM material WHERE name = 'Фанера 4мм'),
        100.00,
        NULL,
        (SELECT id FROM account WHERE username = 'supply_manager1'));

-- 2.2. Второй материал: упаковка
INSERT INTO material (name, unit_of_measure, order_point)
VALUES ('Картон упаковочный', 'шт', 50.00);

INSERT INTO material_balance (material_id, balance, previous_balance_id, changer_id)
VALUES ((SELECT id FROM material WHERE name = 'Картон упаковочный'),
        200.00,
        NULL,
        (SELECT id FROM account WHERE username = 'supply_manager1'));

COMMIT;

-- =========================================================
-- 3. БАЗОВЫЙ ПРОДУКТ (БРЕЛОК) И КАТАЛОГ
-- =========================================================
BEGIN;

-- 3.1. Базовый дизайн брелка для ключей
INSERT INTO product_design (constructor_id, product_name)
VALUES (NULL,
        'Брелок для ключей из фанеры');

-- 3.2. Файл-фото брелка
INSERT INTO file (filename, content_type, owner_id)
VALUES ('keychain_photo.jpg',
        'image/jpeg',
        (SELECT id FROM account WHERE username = 'sales_manager'));

INSERT INTO file_version (creator_id, bucket, object_key, size_bytes, content_type, file_id)
VALUES ((SELECT id FROM account WHERE username = 'sales_manager'),
        'product-images',
        'keychain_photo_v1.jpg',
        123456,
        'image/jpeg',
        (SELECT id FROM file WHERE filename = 'keychain_photo.jpg'));

-- 3.3. Размещение брелка в каталоге
INSERT INTO product_catalog (name, description, product_design_id, price, minimal_amount, category)
VALUES ('Брелок для ключей "Дом"',
        'Брелок для ключей из фанеры 4мм с лазерной гравировкой',
        (SELECT id FROM product_design WHERE product_name = 'Брелок для ключей из фанеры'),
        500.00,
        1,
        'Брелоки');

INSERT INTO product_photo (file_id, product_catalog_id)
VALUES ((SELECT id FROM file WHERE filename = 'keychain_photo.jpg'),
        (SELECT id FROM product_catalog WHERE name = 'Брелок для ключей "Дом"'));

COMMIT;

-- =========================================================
-- 4. РЕГИСТРАЦИЯ КЛИЕНТА И EMAIL-КОД
-- =========================================================
BEGIN;

-- 4.1. Регистрация клиента
INSERT INTO account (username, password, enabled, role)
VALUES ('client1', 'hashed_password_client', FALSE, 'CLIENT');

INSERT INTO person (first_name, last_name)
VALUES ('Илья', 'Кузнецов');

INSERT INTO client (email, person_id, account_id, phone_number)
VALUES ('client1@example.com',
        (SELECT id FROM person WHERE first_name = 'Илья' AND last_name = 'Кузнецов'),
        (SELECT id FROM account WHERE username = 'client1'),
        '+7-900-000-00-01');

-- 4.2. Отправка email-кода подтверждения
INSERT INTO email_token (token, client_id, expiration_dt)
VALUES ('ABC123CONFIRM',
        (SELECT id FROM client WHERE email = 'client1@example.com'),
        NOW() + INTERVAL '1 day');

COMMIT;

-- =========================================================
-- 5. КЛИЕНТ ПОДТВЕРЖДАЕТ ПОЧТУ
-- =========================================================
BEGIN;

UPDATE account
SET enabled = TRUE
WHERE id = (SELECT account_id FROM client WHERE email = 'client1@example.com')
  AND EXISTS (SELECT 1
              FROM email_token et
              WHERE et.token = 'ABC123CONFIRM'
                AND et.client_id = (SELECT id FROM client WHERE email = 'client1@example.com')
                AND et.expiration_dt > NOW());

COMMIT;

-- =========================================================
-- 6. КЛИЕНТ ВХОДИТ В СИСТЕМУ
-- =========================================================
BEGIN;

SELECT id, username, role
FROM account
WHERE username = 'client1'
  AND password = 'hashed_password_client'
  AND enabled = TRUE;

COMMIT;

-- =========================================================
-- 7. КЛИЕНТ СМОТРИТ КАТАЛОГ
-- =========================================================
BEGIN;

SELECT pc.id, pc.name, pc.description, pc.price, pc.category
FROM product_catalog pc;

COMMIT;

-- =========================================================
-- 8. КЛИЕНТ СОЗДАЁТ ЗАЯВКУ НА БРЕЛОК
-- =========================================================
BEGIN;

-- 8.1. Клиент создаёт заявку
INSERT INTO client_application (client_id, description, template_product_design_id, amount)
VALUES ((SELECT id FROM client WHERE email = 'client1@example.com'),
        'Прошу изготовить 10 брелков для ключей с небольшими изменениями по рисунку.',
        (SELECT product_design_id FROM product_catalog WHERE name = 'Брелок для ключей "Дом"'),
        10);

-- 8.2. Клиент прикрепляет свой файл (эскиз)
INSERT INTO file (filename, content_type, owner_id)
VALUES ('client_sketch.dxf',
        'application/dxf',
        (SELECT account_id FROM client WHERE email = 'client1@example.com'));

INSERT INTO file_version (creator_id, bucket, object_key, size_bytes, content_type, file_id)
VALUES ((SELECT account_id FROM client WHERE email = 'client1@example.com'),
        'client-attachments',
        'client1/sketch_v1.dxf',
        20480,
        'application/dxf',
        (SELECT id FROM file WHERE filename = 'client_sketch.dxf'));

INSERT INTO client_application_attachment (client_application_id, file_id)
VALUES ((SELECT id
         FROM client_application
         WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')),
        (SELECT id FROM file WHERE filename = 'client_sketch.dxf'));

COMMIT;

-- =========================================================
-- 9. МЕНЕДЖЕР СОЗДАЁТ ЗАКАЗ И ЧАТ
-- =========================================================
BEGIN;

-- 9.1. Менеджер смотрит список заявок
SELECT ca.id, ca.description, ca.amount, c.email
FROM client_application ca
         JOIN client c ON ca.client_id = c.id;

-- 9.2. Создание заказа
INSERT INTO client_order (current_status_id, client_application_id, manager_id, product_design_id, price)
VALUES (NULL,
        (SELECT id
         FROM client_application
         WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')),
        (SELECT e.id
         FROM employee e
                  JOIN account a ON e.account_id = a.id
         WHERE a.username = 'sales_manager'),
        (SELECT template_product_design_id
         FROM client_application
         WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')),
        NULL);

-- 9.3. Установка статуса заказа "СОЗДАН"
INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'CREATED');

-- 9.4. Создание диалога по заказу
INSERT INTO conversation (order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'ACTIVE');

-- 9.5. Добавление менеджера и клиента в чат
INSERT INTO conversation_participant (conversation_id, user_id)
VALUES ((SELECT id
         FROM conversation
         WHERE order_id = (SELECT id
                           FROM client_order
                           WHERE client_application_id =
                                 (SELECT id
                                  FROM client_application
                                  WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')))),
        (SELECT id FROM account WHERE username = 'sales_manager'));

INSERT INTO conversation_participant (conversation_id, user_id)
VALUES ((SELECT id
         FROM conversation
         WHERE order_id = (SELECT id
                           FROM client_order
                           WHERE client_application_id =
                                 (SELECT id
                                  FROM client_application
                                  WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')))),
        (SELECT account_id FROM client WHERE email = 'client1@example.com'));

-- 9.6. Приветственное сообщение менеджера
INSERT INTO message (content, conversation_participant_id)
VALUES ('Здравствуйте! Ваш заказ на брелки создан, сейчас конструктор приступит к работе.',
        (SELECT id
         FROM conversation_participant
         WHERE user_id = (SELECT id FROM account WHERE username = 'sales_manager')
           AND conversation_id = (SELECT id
                                  FROM conversation
                                  WHERE order_id =
                                        (SELECT id
                                         FROM client_order
                                         WHERE client_application_id =
                                               (SELECT id
                                                FROM client_application
                                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))))));

COMMIT;

-- =========================================================
-- 10. КЛИЕНТ ОТВЕЧАЕТ В ЧАТЕ
-- =========================================================
BEGIN;

INSERT INTO message (content, conversation_participant_id)
VALUES ('Здравствуйте! Спасибо, жду предварительный макет брелка на согласование.',
        (SELECT id
         FROM conversation_participant
         WHERE user_id = (SELECT account_id FROM client WHERE email = 'client1@example.com')
           AND conversation_id = (SELECT id
                                  FROM conversation
                                  WHERE order_id =
                                        (SELECT id
                                         FROM client_order
                                         WHERE client_application_id =
                                               (SELECT id
                                                FROM client_application
                                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))))));

COMMIT;

-- =========================================================
-- 11. КОНСТРУКТОР ПРИКРЕПЛЯЕТСЯ К ЗАКАЗУ, СТАТУС "В ОБРАБОТКЕ"
-- =========================================================
BEGIN;

-- 11.1. Конструктор добавляется в чат
INSERT INTO conversation_participant (conversation_id, user_id)
VALUES ((SELECT id
         FROM conversation
         WHERE order_id = (SELECT id
                           FROM client_order
                           WHERE client_application_id =
                                 (SELECT id
                                  FROM client_application
                                  WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')))),
        (SELECT id FROM account WHERE username = 'constructor1'));

-- 11.2. Конструктор назначается в дизайне продукта
UPDATE product_design
SET constructor_id = (SELECT e.id
                      FROM employee e
                               JOIN account a ON e.account_id = a.id
                      WHERE a.username = 'constructor1')
WHERE id = (SELECT product_design_id
            FROM client_order
            WHERE client_application_id = (SELECT id
                                           FROM client_application
                                           WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')));

-- 11.3. Статус заказа "В ОБРАБОТКЕ"
INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'IN_PROGRESS');

COMMIT;

-- =========================================================
-- 12. КОНСТРУКТОР СКАЧИВАЕТ ФАЙЛЫ ЗАЯВКИ
-- =========================================================
BEGIN;

SELECT caa.*, f.filename
FROM client_application_attachment caa
         JOIN file f ON caa.file_id = f.id
WHERE caa.client_application_id =
      (SELECT id FROM client_application WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'));

COMMIT;

-- =========================================================
-- 13. КОНСТРУКТОР ЗАГРУЖАЕТ МОДЕЛЬ И НОРМЫ, СТАТУС "НА СОГЛАСОВАНИИ"
-- =========================================================
BEGIN;

-- 13.1. Файл 3D-модели брелка
INSERT INTO file (filename, content_type, owner_id)
VALUES ('keychain_model.step',
        'application/step',
        (SELECT id FROM account WHERE username = 'constructor1'));

INSERT INTO file_version (creator_id, bucket, object_key, size_bytes, content_type, file_id)
VALUES ((SELECT id FROM account WHERE username = 'constructor1'),
        'design-files',
        'constructor1/keychain_model_v1.step',
        409600,
        'application/step',
        (SELECT id FROM file WHERE filename = 'keychain_model.step'));

INSERT INTO product_design_file (product_design_id, file_id)
VALUES ((SELECT product_design_id
         FROM client_order
         WHERE client_application_id = (SELECT id
                                        FROM client_application
                                        WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        (SELECT id FROM file WHERE filename = 'keychain_model.step'));

-- 13.2. Файл норм расхода по брелку
INSERT INTO file (filename, content_type, owner_id)
VALUES ('keychain_bom.xlsx',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        (SELECT id FROM account WHERE username = 'constructor1'));

INSERT INTO file_version (creator_id, bucket, object_key, size_bytes, content_type, file_id)
VALUES ((SELECT id FROM account WHERE username = 'constructor1'),
        'design-files',
        'constructor1/keychain_bom_v1.xlsx',
        102400,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        (SELECT id FROM file WHERE filename = 'keychain_bom.xlsx'));

INSERT INTO product_design_file (product_design_id, file_id)
VALUES ((SELECT product_design_id
         FROM client_order
         WHERE client_application_id = (SELECT id
                                        FROM client_application
                                        WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        (SELECT id FROM file WHERE filename = 'keychain_bom.xlsx'));

-- 13.3. Заполнение норм расхода материалов
INSERT INTO required_material (material_id, product_design_id, amount)
VALUES ((SELECT id FROM material WHERE name = 'Фанера 4мм'),
        (SELECT product_design_id
         FROM client_order
         WHERE client_application_id = (SELECT id
                                        FROM client_application
                                        WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        0.05 -- условно листа фанеры на один брелок
       );

INSERT INTO required_material (material_id, product_design_id, amount)
VALUES ((SELECT id FROM material WHERE name = 'Картон упаковочный'),
        (SELECT product_design_id
         FROM client_order
         WHERE client_application_id = (SELECT id
                                        FROM client_application
                                        WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        1.00 -- одна упаковка на брелок
       );

-- 13.4. Статус заказа "НА СОГЛАСОВАНИИ"
INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'PENDING_APPROVAL');

-- 13.5. Уведомление клиенту в чат
INSERT INTO message (content, conversation_participant_id)
VALUES ('Мы подготовили 3D-модель брелка и спецификацию материалов, пожалуйста, ознакомьтесь и утвердите.',
        (SELECT id
         FROM conversation_participant
         WHERE user_id = (SELECT id FROM account WHERE username = 'constructor1')
           AND conversation_id = (SELECT id
                                  FROM conversation
                                  WHERE order_id =
                                        (SELECT id
                                         FROM client_order
                                         WHERE client_application_id =
                                               (SELECT id
                                                FROM client_application
                                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))))));

COMMIT;

-- =========================================================
-- 14. КЛИЕНТ ОТПРАВЛЯЕТ НА ДОРАБОТКУ, СТАТУС "НА ДОРАБОТКЕ"
-- =========================================================
BEGIN;

INSERT INTO message (content, conversation_participant_id)
VALUES ('Просьба изменить рисунок гравировки и переслать обновлённую модель брелка.',
        (SELECT id
         FROM conversation_participant
         WHERE user_id = (SELECT account_id FROM client WHERE email = 'client1@example.com')
           AND conversation_id = (SELECT id
                                  FROM conversation
                                  WHERE order_id =
                                        (SELECT id
                                         FROM client_order
                                         WHERE client_application_id =
                                               (SELECT id
                                                FROM client_application
                                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))))));

INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'REWORK');

COMMIT;

-- =========================================================
-- 15. КОНСТРУКТОР ВНОСИТ ИЗМЕНЕНИЯ И СНОВА "НА СОГЛАСОВАНИИ"
-- =========================================================
BEGIN;

-- Новая версия 3D-модели брелка
INSERT INTO file_version (creator_id, bucket, object_key, size_bytes, content_type, file_id)
VALUES ((SELECT id FROM account WHERE username = 'constructor1'),
        'design-files',
        'constructor1/keychain_model_v2.step',
        410000,
        'application/step',
        (SELECT id FROM file WHERE filename = 'keychain_model.step'));

-- Статус "НА СОГЛАСОВАНИИ"
INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'PENDING_APPROVAL');

COMMIT;

-- =========================================================
-- 16. КЛИЕНТ УТВЕРЖДАЕТ МОДЕЛЬ, СТАТУС "СОГЛАСОВАН"
-- =========================================================
BEGIN;

INSERT INTO message (content, conversation_participant_id)
VALUES ('Вариант брелка подходит, утверждаю модель и нормы расхода.',
        (SELECT id
         FROM conversation_participant
         WHERE user_id = (SELECT account_id FROM client WHERE email = 'client1@example.com')
           AND conversation_id = (SELECT id
                                  FROM conversation
                                  WHERE order_id =
                                        (SELECT id
                                         FROM client_order
                                         WHERE client_application_id =
                                               (SELECT id
                                                FROM client_application
                                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))))));

INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'APPROVED');

COMMIT;

-- =========================================================
-- 17. МЕНЕДЖЕР ВЫСТАВЛЯЕТ СЧЁТ, СТАТУС "ОЖИДАЕТ ОПЛАТЫ"
-- =========================================================
BEGIN;

UPDATE client_order
SET price = 7500.00
WHERE client_application_id =
      (SELECT id FROM client_application WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'));

INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'AWAITING_PAYMENT');

COMMIT;

-- =========================================================
-- 18. КЛИЕНТ ОПЛАЧИВАЕТ, СТАТУС "ОПЛАЧЕН"
-- =========================================================
BEGIN;

INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'PAID');

COMMIT;

-- =========================================================
-- 19. КОНСТРУКТОР ПРИКРЕПЛЯЕТ УП, СТАТУС "ГОТОВ К ИЗГОТОВЛЕНИЮ"
-- =========================================================
BEGIN;

INSERT INTO file (filename, content_type, owner_id)
VALUES ('keychain_nc_program.nc',
        'text/plain',
        (SELECT id FROM account WHERE username = 'constructor1'));

INSERT INTO file_version (creator_id, bucket, object_key, size_bytes, content_type, file_id)
VALUES ((SELECT id FROM account WHERE username = 'constructor1'),
        'nc-programs',
        'constructor1/keychain_nc_program_v1.nc',
        51200,
        'text/plain',
        (SELECT id FROM file WHERE filename = 'keychain_nc_program.nc'));


INSERT INTO product_design_file (product_design_id, file_id)
VALUES ((SELECT product_design_id
         FROM client_order
         WHERE client_application_id = (SELECT id
                                        FROM client_application
                                        WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        (SELECT id FROM file WHERE filename = 'keychain_nc_program.nc'));

INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'READY_FOR_PRODUCTION');

COMMIT;

-- =========================================================
-- 20. ОПЕРАТОР ЧПУ ВИДИТ ЗАКАЗЫ "ГОТОВ К ИЗГОТОВЛЕНИЮ"
-- =========================================================
BEGIN;

SELECT co.id, cos.status, ca.amount
FROM client_order co
         JOIN client_order_status cos ON cos.id = co.current_status_id
         JOIN client_application ca ON ca.id = co.client_application_id
WHERE cos.status = 'READY_FOR_PRODUCTION';

COMMIT;

-- =========================================================
-- 21. СОЗДАНИЕ ПРОИЗВОДСТВЕННОЙ ЗАДАЧИ, СТАТУС "В ОЧЕРЕДИ"
-- =========================================================
BEGIN;

INSERT INTO production_task (client_order_id, current_status_id, started_at, finished_at, cnc_operator_id)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        NULL,
        NULL,
        NULL,
        (SELECT e.id
         FROM employee e
                  JOIN account a ON e.account_id = a.id
         WHERE a.username = 'cnc_operator1'));

-- Статус задачи "В ОЧЕРЕДИ"
INSERT INTO production_task_status (production_task_id, status)
VALUES ((SELECT id
         FROM production_task
         WHERE client_order_id =
               (SELECT id
                FROM client_order
                WHERE client_application_id =
                      (SELECT id
                       FROM client_application
                       WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')))),
        'QUEUED');

COMMIT;

-- =========================================================
-- 22. ОПЕРАТОР НАЧИНАЕТ ИЗГОТОВЛЕНИЕ, СТАТУС "ВЫПОЛНЯЕТСЯ"
-- =========================================================
BEGIN;

UPDATE production_task
SET started_at = NOW()
WHERE client_order_id = (SELECT id
                         FROM client_order
                         WHERE client_application_id =
                               (SELECT id
                                FROM client_application
                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')));

INSERT INTO production_task_status (production_task_id, status)
VALUES ((SELECT id
         FROM production_task
         WHERE client_order_id =
               (SELECT id
                FROM client_order
                WHERE client_application_id =
                      (SELECT id
                       FROM client_application
                       WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')))),
        'IN_PROGRESS');

-- Статус заказа "В ПРОИЗВОДСТВЕ"
INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'IN_PRODUCTION');

COMMIT;

-- =========================================================
-- 23. ЗАВЕРШЕНИЕ ПРОИЗВОДСТВА, СТАТУС "ЗАВЕРШЕН"
-- =========================================================
BEGIN;

UPDATE production_task
SET finished_at = NOW() + INTERVAL '2 hours'
WHERE client_order_id = (SELECT id
                         FROM client_order
                         WHERE client_application_id =
                               (SELECT id
                                FROM client_application
                                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')));

INSERT INTO production_task_status (production_task_id, status)
VALUES ((SELECT id
         FROM production_task
         WHERE client_order_id =
               (SELECT id
                FROM client_order
                WHERE client_application_id =
                      (SELECT id
                       FROM client_application
                       WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com')))),
        'COMPLETED');

COMMIT;

-- =========================================================
-- 24. СПИСАНИЕ МАТЕРИАЛОВ И СТАТУС ЗАКАЗА "ГОТОВ"
-- =========================================================
BEGIN;

-- 24.1. Списание фанеры и картона
INSERT INTO material_consumption (client_order_id, material_id, amount)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        (SELECT id FROM material WHERE name = 'Фанера 4мм'),
        0.50 -- 0.05 * 10 брелков
       );

INSERT INTO material_consumption (client_order_id, material_id, amount)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        (SELECT id FROM material WHERE name = 'Картон упаковочный'),
        10.00 -- 1 упаковка на брелок
       );

-- 24.2. Обновляем остаток по фанере
INSERT INTO material_balance (material_id, balance, previous_balance_id, changer_id)
VALUES ((SELECT id FROM material WHERE name = 'Фанера 4мм'),
        (SELECT mb.balance - 0.50
         FROM material m
                  JOIN material_balance mb ON m.current_balance_id = mb.id
         WHERE m.name = 'Фанера 4мм'),
        (SELECT current_balance_id FROM material WHERE name = 'Фанера 4мм'),
        (SELECT id FROM account WHERE username = 'cnc_operator1'));

-- 24.3. Обновляем остаток по картону
INSERT INTO material_balance (material_id, balance, previous_balance_id, changer_id)
VALUES ((SELECT id FROM material WHERE name = 'Картон упаковочный'),
        (SELECT mb.balance - 10.00
         FROM material m
                  JOIN material_balance mb ON m.current_balance_id = mb.id
         WHERE m.name = 'Картон упаковочный'),
        (SELECT current_balance_id FROM material WHERE name = 'Картон упаковочный'),
        (SELECT id FROM account WHERE username = 'warehouse1'));

-- 24.4. Статус заказа "ГОТОВ"
INSERT INTO client_order_status (client_order_id, status)
VALUES ((SELECT id
         FROM client_order
         WHERE client_application_id =
               (SELECT id
                FROM client_application
                WHERE client_id = (SELECT id FROM client WHERE email = 'client1@example.com'))),
        'COMPLETED');

COMMIT;

-- =========================================================
-- 25. АВТОЗАЯВКА НА ЗАКУПКУ ПРИ ДОСТИЖЕНИИ ТОЧКИ ЗАКАЗА
-- =========================================================
BEGIN;

-- Предположим, что остаток фанеры после списания упал ниже точки заказа
INSERT INTO purchase_order (current_status_id, supply_manager_id)
VALUES (NULL,
        (SELECT e.id
         FROM employee e
                  JOIN account a ON e.account_id = a.id
         WHERE a.username = 'supply_manager1'));

INSERT INTO purchase_order_status (purchase_order_id, status)
VALUES ((SELECT id FROM purchase_order ORDER BY id DESC LIMIT 1),
        'CREATED');

-- Позиция по фанере в заказе
INSERT INTO purchase_order_material (material_id, purchase_order_id, amount, price_for_unit, supplier)
VALUES ((SELECT id FROM material WHERE name = 'Фанера 4мм'),
        (SELECT id FROM purchase_order ORDER BY id DESC LIMIT 1),
        50.00,
        1500.00,
        'ООО "ФанераСнаб"');

COMMIT;

-- =========================================================
-- 26. ПРИХОД МАТЕРИАЛОВ, ПРИЁМКА И СТАТУС "ПОЛУЧЕН"
-- =========================================================
BEGIN;

-- 26.1. Приёмка заказа складским работником
INSERT INTO purchase_order_receipt (purchase_order_id, warehouse_worker_id, invoice_number)
VALUES ((SELECT id FROM purchase_order ORDER BY id DESC LIMIT 1),
        (SELECT e.id
         FROM employee e
                  JOIN account a ON e.account_id = a.id
         WHERE a.username = 'warehouse1'),
        'INV-2025-0001');

-- 26.2. Обновление остатка по фанере (приход)
INSERT INTO material_balance (material_id, balance, previous_balance_id, changer_id)
VALUES ((SELECT id FROM material WHERE name = 'Фанера 4мм'),
        (SELECT mb.balance + 50.00
         FROM material m
                  JOIN material_balance mb ON m.current_balance_id = mb.id
         WHERE m.name = 'Фанера 4мм'),
        (SELECT current_balance_id FROM material WHERE name = 'Фанера 4мм'),
        (SELECT id FROM account WHERE username = 'warehouse1'));

-- 26.3. Статус закупочного заказа "ПОЛУЧЕН"
INSERT INTO purchase_order_status (purchase_order_id, status)
VALUES ((SELECT id FROM purchase_order ORDER BY id DESC LIMIT 1),
        'COMPLETED');

COMMIT;
