--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: booking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.booking (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    end_at timestamp(6) without time zone NOT NULL,
    place_id uuid NOT NULL,
    sent_notification boolean NOT NULL,
    start_at timestamp(6) without time zone NOT NULL,
    status character varying(255),
    updated_at timestamp(6) without time zone,
    user_id uuid NOT NULL,
    CONSTRAINT booking_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying, 'OVERDUE'::character varying])::text[])))
);


ALTER TABLE public.booking OWNER TO postgres;

--
-- Name: place; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.place (
    id uuid NOT NULL,
    capacity integer NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    description character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    place_id bigint NOT NULL,
    type character varying(255),
    CONSTRAINT place_type_check CHECK (((type)::text = ANY ((ARRAY['PERSONAL'::character varying, 'PERSONAL_PC'::character varying, 'MEETING'::character varying, 'AUDITORIUM'::character varying, 'CHILL_ZONE'::character varying, 'DEFAULT'::character varying])::text[])))
);


ALTER TABLE public.place OWNER TO postgres;

--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id uuid NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(255),
    place_id uuid NOT NULL,
    place_name character varying(255),
    status character varying(255),
    ticket_type character varying(255),
    updated_at timestamp(6) without time zone,
    user_id uuid NOT NULL,
    zone character(1),
    CONSTRAINT tickets_status_check CHECK (((status)::text = ANY ((ARRAY['OPEN'::character varying, 'IN_PROGRESS'::character varying, 'CLOSED'::character varying])::text[]))),
    CONSTRAINT tickets_ticket_type_check CHECK (((ticket_type)::text = ANY ((ARRAY['CLEANING'::character varying, 'TECHNICAL_PROBLEM'::character varying, 'FOOD'::character varying, 'PLACE_TAKEN'::character varying, 'OTHER'::character varying])::text[])))
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    active boolean,
    created_at timestamp(6) without time zone,
    description character varying(255),
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(255),
    token_uuid uuid,
    verified boolean,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ROLE_ANONYMOUS'::character varying, 'ROLE_USER'::character varying, 'ROLE_ADMIN'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: booking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.booking (id, created_at, end_at, place_id, sent_notification, start_at, status, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: place; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.place (id, capacity, created_at, description, name, place_id, type) FROM stdin;
714b2ee6-b365-4391-80b8-bbacf37f2910	0	2025-03-09 13:46:39.473219	Рабочее место	A11	40	PERSONAL
50ccfb44-1854-434f-9c1f-226d3e541116	0	2025-03-09 13:46:39.473245	Рабочее место	A12	41	PERSONAL
737e4836-e8ec-420f-a0b5-85fa2b5e0961	0	2025-03-09 13:46:39.473252	Рабочее место	A13	42	PERSONAL
402cc814-8ce9-4428-8113-e2bbf33b75e4	0	2025-03-09 13:46:39.473258	Рабочее место	A14	43	PERSONAL
acf5110f-1e46-406b-a8dc-19a08f7a01c5	0	2025-03-09 13:46:39.473265	Рабочее место	A15	44	PERSONAL
5fff8245-fb9b-4028-9d99-c1e2f2420efe	0	2025-03-09 13:46:39.47327	Рабочее место	A16	45	PERSONAL
83b7587f-a83c-4804-b7ee-7e7a5c8002b5	0	2025-03-09 13:46:39.473275	Рабочее место	A17	46	PERSONAL
9a916294-9b56-47b1-9cd6-6414a5bacf95	0	2025-03-09 13:46:39.473281	Рабочее место	A18	47	PERSONAL
d481a820-78e4-4f4d-a488-c5c469414292	0	2025-03-09 13:46:39.473286	Рабочее место	A19	48	PERSONAL
334eb269-2f59-4dad-832f-ae20586e4c1c	0	2025-03-09 13:46:39.473292	Рабочее место	A20	49	PERSONAL
a21e3822-e8c2-42ec-b57b-d437d80c478b	0	2025-03-09 13:46:39.473297	Рабочее место	A21	50	PERSONAL
c8547353-c6d0-4d89-9125-ba49d8a1e6db	0	2025-03-09 13:46:39.473303	Рабочее место	A22	51	PERSONAL
a461335f-fc62-443e-82c4-3713428ae9fb	0	2025-03-09 13:46:39.473308	Рабочее место	A23	52	PERSONAL
a46887f8-240f-424a-8b36-9dfae70f4475	0	2025-03-09 13:46:39.473313	Рабочее место	A24	53	PERSONAL
cfdf5548-4d56-4777-98e4-2d511ec428a5	0	2025-03-09 13:46:39.473318	Рабочее место	A25	54	PERSONAL
53f028c9-2cb0-40f5-b347-5b6a5d19c1f2	0	2025-03-09 13:46:39.473324	Рабочее место	A26	55	PERSONAL
f47091e4-7738-485c-8c43-f5d35591e3e6	0	2025-03-09 13:46:39.473334	Рабочее место	A27	56	PERSONAL
8ad16b0b-d5b1-406b-9e08-39ed93dbf10f	0	2025-03-09 13:46:39.473339	Рабочее место	A28	57	PERSONAL
6e6cf1d8-1e3d-480f-9342-dfe3aed1e800	0	2025-03-09 13:46:39.473345	Рабочее место	A29	58	PERSONAL
549aacc6-2613-4925-8c58-41591fc8b255	0	2025-03-09 13:46:39.47335	Рабочее место	A30	59	PERSONAL
9d567ed5-7d98-498e-8bc7-4da3bef9f925	0	2025-03-09 13:46:39.473355	Тихая зона	D7	60	PERSONAL
3e9bafc0-413f-4348-8db5-17e75d1c11ef	0	2025-03-09 13:46:39.473361	Тихая зона	D8	61	PERSONAL
7da82b46-7aca-42d4-811f-a1c2378b5c6c	0	2025-03-09 13:46:39.473366	Тихая зона	D9	62	PERSONAL
aedc061d-d651-478d-b498-0cf9c1a1347a	0	2025-03-09 13:46:39.473372	Тихая зона	D10	63	PERSONAL
3de66432-fdfa-41a1-87ae-a530e5785e2b	0	2025-03-09 13:46:39.473377	Тихая зона	D11	64	PERSONAL
06b521f6-1be1-40d6-8bca-35b53e0c54dd	0	2025-03-09 13:46:39.473382	Тихая зона	D12	65	PERSONAL
aee8e7a4-c820-4119-8bb4-6ab0ffff1d07	1	2025-03-09 13:46:52.034087	Рабочее место	A1	1	PERSONAL
82c9d7e4-fc03-4b82-ad8d-57d0236945d7	1	2025-03-09 13:46:52.03411	Рабочее место	A2	2	PERSONAL
432bad09-0261-453c-80fe-d774d465d7d8	1	2025-03-09 13:46:52.034117	Рабочее место	A3	3	PERSONAL
eaee31bc-e1ea-4546-91ca-7a558951fa91	1	2025-03-09 13:46:52.034123	Рабочее место	A4	4	PERSONAL
82d70515-18b8-448a-87e6-737d6b46e655	1	2025-03-09 13:46:52.034129	Рабочее место	A5	5	PERSONAL
0f7639a4-f311-4d1a-892b-4960ffce17ae	1	2025-03-09 13:46:52.034136	Рабочее место	A6	6	PERSONAL
1e0e919e-0b40-40f3-ae75-3eb570cd941a	1	2025-03-09 13:46:52.034144	Рабочее место	A7	7	PERSONAL
c3309c45-e1e0-41fe-a791-7e01943815ad	1	2025-03-09 13:46:52.034152	Рабочее место	A8	8	PERSONAL
95488f45-6bfb-4293-b68f-a0bedc6c674f	1	2025-03-09 13:46:52.034158	Рабочее место	A9	9	PERSONAL
94fe0a60-f2b2-4b94-8e5b-384ab0e99778	1	2025-03-09 13:46:52.034165	Рабочее место	A10	10	PERSONAL
09d685f3-0cbb-4775-bcfc-6462d7ffae03	4	2025-03-09 13:46:52.034171	Переговорная	C1	11	MEETING
93473d51-122d-4c7b-9f04-0581ae3971aa	4	2025-03-09 13:46:52.034177	Переговорная	C2	12	MEETING
4a549118-32f5-4a66-bb6a-d566a83b74e1	4	2025-03-09 13:46:52.034189	Переговорная	C3	13	MEETING
334929f4-c3e0-4f91-b905-368c74feb081	4	2025-03-09 13:46:52.034195	Переговорная	C4	14	MEETING
7813f877-b8de-45d9-bea2-4c0993730e6d	6	2025-03-09 13:46:52.034201	Переговорная	C5	15	MEETING
997d524c-fbef-4189-998e-17c10cd6352c	6	2025-03-09 13:46:52.034208	Переговорная	C6	16	MEETING
380955a7-8e64-4e06-9da2-47b9da8e33af	6	2025-03-09 13:46:52.034214	Переговорная	C7	17	MEETING
ec2aa44a-ebe8-4342-aa8d-cab0ea240360	6	2025-03-09 13:46:52.03422	Переговорная	C8	18	MEETING
d7118b4b-db6d-4c90-9a06-cd7a45a9b015	1	2025-03-09 13:46:52.034226	Тихое место	D1	19	PERSONAL
b1a9f9b0-c86c-46f1-b050-1492a98695eb	1	2025-03-09 13:46:52.034232	Тихое место	D2	20	PERSONAL
a6ecba98-470a-45cb-aeca-3777044d19c4	1	2025-03-09 13:46:52.034238	Тихое место	D3	21	PERSONAL
b7259d6d-9e42-4384-bd83-2ef3b12ba987	1	2025-03-09 13:46:52.034244	Тихое место	D4	22	PERSONAL
ec66e037-6503-4f9b-9daf-f415f97a1cc8	1	2025-03-09 13:46:52.03425	Тихое место	D5	23	PERSONAL
55f83214-f23c-4360-b4f3-d36170621af1	1	2025-03-09 13:46:52.034259	Тихое место	D6	24	PERSONAL
aa2efdce-792b-4721-80dc-d2509043910d	1	2025-03-09 13:46:52.034266	Зона отдыха	E1	25	CHILL_ZONE
e35fe1a7-55f9-4afd-921f-575ace609557	1	2025-03-09 13:46:52.034271	Зона отдыха	E2	26	CHILL_ZONE
5333c58d-26be-4fc3-a806-5ab06e7ef57a	1	2025-03-09 13:46:52.034278	Зона отдыха	E3	27	CHILL_ZONE
f1c9506e-00ed-4c58-9580-05a42d119e21	1	2025-03-09 13:46:52.034284	Зона отдыха	E4	28	CHILL_ZONE
dd645383-16db-40fb-b6d1-5d502ee06086	1	2025-03-09 13:46:52.034291	Зона отдыха	E5	29	CHILL_ZONE
aaa407b8-ddab-40db-ac05-10fee8c81c94	1	2025-03-09 13:46:52.034297	Зона отдыха	E6	30	CHILL_ZONE
b4882efe-fba2-4fe6-b46a-9270a2092b9c	1	2025-03-09 13:46:52.034303	Кабинет	B1	31	AUDITORIUM
4922cdce-b4b1-4c5c-a494-832e1c3df2fe	1	2025-03-09 13:46:52.034309	Кабинет	B2	32	AUDITORIUM
5b39e06e-f0d7-4b66-96cf-612726828441	1	2025-03-09 13:46:52.034314	Кабинет	B3	33	AUDITORIUM
ed7ff36e-a28d-426b-baf4-d45b1a6d2ec4	1	2025-03-09 13:46:52.03432	Кабинет	B4	34	AUDITORIUM
2934b97e-3669-49c1-ae39-0b7e43c598ad	1	2025-03-09 13:46:52.034326	Кабинет	B5	35	AUDITORIUM
3076c68f-0b60-434b-b6c5-2f7c8e4a23ad	1	2025-03-09 13:46:52.034333	Кабинет	B6	36	AUDITORIUM
eb9a4ba2-0eaa-4bc1-b367-dc4f24e46b1d	1	2025-03-09 13:46:52.034339	Кабинет	B7	37	AUDITORIUM
e241d505-a763-4430-93d3-4b1f027be975	1	2025-03-09 13:46:52.034345	Кабинет	B8	38	AUDITORIUM
5e374610-a728-48ad-a72e-784d790e685d	1	2025-03-09 13:46:52.034351	Кабинет	B9	39	AUDITORIUM
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, created_at, description, place_id, place_name, status, ticket_type, updated_at, user_id, zone) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, active, created_at, description, email, name, password, role, token_uuid, verified) FROM stdin;
367af6d4-be04-4811-9004-b58451dd1096	t	2025-03-09 13:39:25.884791	\N	admin@mail.ru	admin	$2a$10$oxIeZex5eLT4a/TkyqUYKe5EtchwAH/4kpJ4gb3mxJnzuxcYGUiEK	ROLE_ADMIN	6b784941-182f-4664-9877-6ea0cfa0546d	f
\.


--
-- Name: booking booking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.booking
    ADD CONSTRAINT booking_pkey PRIMARY KEY (id);


--
-- Name: place place_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.place
    ADD CONSTRAINT place_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

