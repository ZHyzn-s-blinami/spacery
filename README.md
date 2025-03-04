# **BookingIT** 

### Описание проекта

Приложение предназначено для бронирования коворкинг-пространств. Пользователи могут выбрать подходящие место, бронировать его на определённое время и управлять своими бронированиями через веб-приложение.

    Backend: Java (Spring Boot)
    Database: PostgreSQL
    Frontend: React
    CI/CD: GitLab CI/CD, Docker

### Архитектура проекта

1. ### Описание взаимодействия

   #### Запрос от клиента:
   Пользователь заходит на сайт, и его HTTP/HTTPS запрос направляется на сервер Nginx. Nginx перенаправляет запрос либо к Frontend к REST API для дальнейшей обработки.
   
   #### Обращение к REST API:
   При загрузке страницы динамический функционал frontend инициирует асинхронные запросы к REST API для получения актуальных данных. В этом случае Nginx выполняет роль маршрутизатора, обеспечивая корректное направление запросов к соответствующему REST API сервису.
   
   #### Обработка запроса в backend:
   REST API передает запросы в backend, где реализована бизнес-логика приложения. Здесь выполняются необходимые вычисления и преобразования данных, а при необходимости происходит обращение к базе данных PostgreSQL для извлечения или модификации информации.
   
   #### Работа с базой данных:
   Backend формирует SQL-запросы, которые отправляются в PostgreSQL. База данных обеспечивает транзакционную целостность, выполняет обработку запросов и возвращает результаты, необходимые для формирования окончательного ответа.
   
   #### Формирование и возврат ответа:
   После получения данных из PostgreSQL, backend обрабатывает и агрегирует информацию, формируя итоговый ответ. Этот ответ передается обратно через REST API на frontend, где происходит обновление пользовательского интерфейса.
   
   #### Отправка email уведомлений:
   В случаях, когда необходимо уведомить пользователя (например, при регистрации или изменении статуса заказа), backend инициирует обращение к SMTP серверу. SMTP обеспечивает формирование и доставку email уведомлений, гарантируя своевременное информирование пользователя о произошедших событиях.


### 1. Backend-сервис (Java Spring)

- **Обработка бизнес-логики:**  
  Java Spring используется для реализации ключевых функций, таких как регистрация пользователей, бронирование и другие операции.  
  **Аргументация выбора:**
   - **Модульность и масштабируемость:** Spring Framework поддерживает модульную архитектуру, что позволяет легко разделять бизнес-логику на независимые компоненты.
   - **Обширная экосистема:** Наличие множества готовых решений и библиотек (например, Spring Boot, Spring Data) упрощает интеграцию с другими сервисами, включая PostgreSQL.
   - **Надежность и безопасность:** Встроенные инструменты для аутентификации, авторизации и обработки исключений повышают устойчивость приложения.

- **Интеграция с базой данных:**  
  Backend-сервис связывается с PostgreSQL для хранения и извлечения данных через ORM (например, Hibernate) или Spring Data.  
  **Аргументация выбора:**
   - **Производительность и надежность:** PostgreSQL обеспечивает транзакционную целостность и высокую скорость выполнения запросов.
   - **Расширяемость:** Возможность масштабирования и поддержки сложных структур данных удовлетворяет потребности растущей нагрузки.

- **Предоставление REST API:**  
  Backend предоставляет REST API для взаимодействия с фронтендом.  
  **Аргументация выбора:**
   - **Совместимость и гибкость:** REST API стандартизирует обмен данными, облегчая интеграцию с различными клиентскими приложениями.

### 2. Frontend (React)

- **Интерактивный пользовательский интерфейс (UI):**  
  React используется для создания динамичных и отзывчивых интерфейсов, которые позволяют пользователям работать с функционалом приложения (поиск коворкингов, бронирование, личный кабинет и т. д.).  
  **Аргументация выбора:**
   - **Компонентный подход:** Повышает переиспользуемость кода и упрощает тестирование компонентов.
   - **Высокая производительность:** Виртуальный DOM оптимизирует рендеринг, обеспечивая быстрый отклик интерфейса на действия пользователя.
   - **Широкое сообщество:** Большое количество библиотек и инструментов ускоряет разработку и интеграцию новых функций.

- **Обмен данными с backend:**  
  Frontend осуществляет асинхронные запросы через REST API для получения и отправки данных.  
  **Аргументация выбора:**
   - **Стандартизация взаимодействия:** Четко определенные контракты между клиентом и сервером упрощают поддержку и масштабирование приложения.

### 3. CI/CD

- **Автоматизация процессов сборки и деплоя:**  
  Налажен автоматический процесс сборки, тестирования и деплоя при каждом пуше кода или создании pull request.  
  **Аргументация выбора:**
   - **Снижение количества ошибок:** Автоматизированные проверки (тесты, линтинг и т. д.) позволяют выявлять проблемы на ранней стадии разработки.
   - **Быстрая интеграция изменений:** Постоянная интеграция ускоряет выпуск новых версий и обновлений.
   - **Надежный деплой:** Автоматический деплой минимизирует риск сбоев в продакшене за счет единообразного и проверенного процесса.

### 4. PostgreSQL

- **Хранение и управление данными:**  
  PostgreSQL выступает в роли реляционной базы данных, обеспечивая надежное хранение структурированных данных и выполнение сложных SQL-запросов.  
  **Аргументация выбора:**
   - **Транзакционная целостность и надежность:** Поддержка ACID-транзакций гарантирует сохранность данных при любых операциях, что критически важно для операций бронирования и регистрации.
   - **Масштабируемость:** Возможности масштабирования и оптимизации запросов позволяют базе данных эффективно работать даже при увеличении объема данных и нагрузки.
   - **Расширяемость функционала:** Дополнительные возможности, такие как репликация, кластеризация и индексация, делают PostgreSQL идеальным выбором для сложных и динамичных приложений.

### Структура проекта

```json
.
├── src
│   ├── main
│   │   ├── java
│   │   │   └── prod.last.mainbackend
│   │   │       ├── controller        // REST-контроллеры
│   │   │       ├── service           // Бизнес-логика
│   │   │       ├── repository        // Репозитории (DAO)
│   │   │       ├── model             // Сущности (JPA Entity)
│   │   │       └── config            // Конфигурационные классы Spring
│   │   └── resources
│   │      └──  application.yml       // Настройки Spring (подключение к БД и т.д.)
│   │       
│   └── test
│       └── java
│           └── prod.last.mainbackend
│               └── ...              // Тестовые классы
├── build.gradle
└── README.md
```

#### Основные модули/пакеты:

* **controller** – REST-контроллеры, отвечающие за приём HTTP-запросов и формирование HTTP-ответов.
* **service** – классы, содержащие бизнес-логику (например, логика бронирования).
* **repository** – интерфейсы, обеспечивающие взаимодействие с базой данных (Spring Data JPA).
* **model** – JPA-сущности, описывающие таблицы в базе данных.


### Структура базы данных
В проекте используется PostgreSQL. Ниже представлено описание сущностей и их взаимосвязей:

![exported_from_idea.drawio(1).png](exported_from_idea.drawio%281%29.png)

## CI/CD (GitLab CI/CD)

Мы используем GitLab CI/CD для автоматизации процессов сборки и деплоя, что позволяет обеспечить быстрый, надежный и воспроизводимый процесс обновления приложения.

### Основные этапы процесса:

- **Build:**
    - **Описание:**  
      На этапе сборки (build) проект собирается с использованием Dockerfile. Полученный Docker-образ затем пушится в Docker Registry.
    - **Аргументация выбора:**
        - Автоматизированная сборка позволяет оперативно обнаруживать и исправлять ошибки, обеспечивая стабильность кода.
        - Использование Dockerfile гарантирует создание консистентного и переносимого образа, который можно запускать в любой среде.
        - Публикация образа в Docker Registry упрощает последующий процесс деплоя.

- **Deploy:**
    - **Описание:**  
      На этапе деплоя (deploy) происходит подключение к продакшен серверу через SSH, где осуществляется pull нового Docker-образа из Docker Registry, после чего он запускается.
    - **Аргументация выбора:**
        - Автоматический деплой снижает риск человеческих ошибок и позволяет быстро обновлять приложение в продакшен-среде.
        - Использование SSH для подключения обеспечивает безопасное выполнение команд на сервере.
        - Автоматизация деплоя помогает поддерживать непрерывное обновление приложения, что особенно важно для быстрого реагирования на изменения и инциденты.


# Документация API и Тестовые Данные

## Swagger

Ознакомьтесь с документацией по API, используя [этот линк](https://prod-team-5-qnkvbg7c.final.prodcontest.ru/api/doc/swagger). Документация представлена в формате Swagger, что облегчает понимание работы эндпоинтов, их параметров и примеров запросов/ответов.

## Моковые данные и заготовленные пользователи

Для тестирования системы предоставлены следующие тестовые учетные данные. Логин и пароль указываются идентичными, что упрощает процесс проверки аутентификации и авторизации.

### Тестовые пользователи

| Тестовый пользователь | Email                 | Пароль |
|-----------------------|-----------------------|--------|
| Пользователь 1        | user1@prodcontest.ru  | 123123 |
| Пользователь 2        | user2@prodcontest.ru  | 123123 |
| Пользователь 3        | user3@prodcontest.ru  | 123123 |
| Админ 1               | admin1@prodcontest.ru | 123123 |
| Админ 2               | admin2@prodcontest.ru | 123123 |
| Админ 3               | admin3@prodcontest.ru | 123123 |

Дополнительно, для полноты тестового покрытия предусмотрены аналогичные наборы данных, что позволяет проводить тестирование в различных сценариях. Это обеспечивает более качественную проверку функционала системы и помогает выявить возможные ошибки в ранней стадии.

---

Эти данные предназначены для использования в тестовой среде и не должны применяться в продакшене.

### Unit и E2E тесты

В проекте реализованы unit-тесты для проверки отдельных компонентов и E2E-тесты для проверки работы системы в целом. Тесты покрывают основные сценарии использования и помогают обнаруживать проблемы на ранних этапах разработки.
[main-backend.html](main-backend.html)
