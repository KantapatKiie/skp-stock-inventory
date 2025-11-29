--
-- PostgreSQL database dump
--

\restrict NyATaz9bSCVvm5ejw6uIjYk4qS9ilEQJeCCFeL1iM5wgtNwICkNeEpvF2IBDpQ5

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

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

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public._prisma_migrations VALUES ('09561e22-0628-4d65-84bc-9ad92306c47e', 'f4222a637c9d7d2c18310302e105578ceb0ff121e3c355383be0d6515a2d286d', '2025-11-29 07:24:23.87104+00', '20251129053558_init', NULL, NULL, '2025-11-29 07:24:23.844316+00', 1);
INSERT INTO public._prisma_migrations VALUES ('0f40bcc2-bf68-4316-857b-b16a819e92f8', 'a5aab28056dd5abeb272e54f057222bee2c1acce92bfe2be2d8fffb4d54d9618', '2025-11-29 07:24:23.887474+00', '20251129_add_production_tracking', NULL, NULL, '2025-11-29 07:24:23.871281+00', 1);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.categories VALUES ('o5fftrdv2mik1d5fy', 'Raw Materials', 'วัตถุดิบต่างๆ', '2025-11-29 08:35:08.878', '2025-11-29 08:35:08.878');
INSERT INTO public.categories VALUES ('yrr07aaj6mik1d5fz', 'Components', 'ชิ้นส่วน/อุปกรณ์ประกอบ', '2025-11-29 08:35:08.879', '2025-11-29 08:35:08.879');
INSERT INTO public.categories VALUES ('p467ua65mmik1d5fz', 'Finished Goods', 'สินค้าสำเร็จรูป', '2025-11-29 08:35:08.879', '2025-11-29 08:35:08.879');
INSERT INTO public.categories VALUES ('828qjx3ismik1d5g0', 'Packaging', 'วัสดุบรรจุภัณฑ์', '2025-11-29 08:35:08.88', '2025-11-29 08:35:08.88');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('n6snhn8evmik1d5bc', 'admin@skp.com', '$2a$10$00wh4XOiv0r5vYcZjUdNUOcYG0AU1bC5S.D.nfJyHMnGWT0/xBYK2', 'Admin', 'User', 'ADMIN', true, '2025-11-29 08:35:08.771', '2025-11-29 08:35:08.771');
INSERT INTO public.users VALUES ('c1un205f1mik1d5d1', 'manager@skp.com', '$2a$10$.OgRl1iNSxj3/PuLrsRnBOoSF/psvouMkghaoNJIaHqdO8jmRtZR6', 'Manager', 'User', 'MANAGER', true, '2025-11-29 08:35:08.825', '2025-11-29 08:35:08.825');
INSERT INTO public.users VALUES ('7v7yjpl6jmik1d5eh', 'staff@skp.com', '$2a$10$.9pJenEKhDob1XkypZYm8urR3K3GVEylvaZPb9E0Ktz23KZSyMsQm', 'Staff', 'User', 'STAFF', true, '2025-11-29 08:35:08.877', '2025-11-29 08:35:08.877');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.products VALUES ('fh9t74vjqmik1d5g1', 'RM-001', 'RM-001-fh9t74vjqmik1d5g1', 'Raw Material 1', 'วัตถุดิบประเภทที่ 1', 'o5fftrdv2mik1d5fy', 'kg', 50, 1000, 110.00, 88.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.881', '2025-11-29 08:35:08.881');
INSERT INTO public.products VALUES ('6fg9a9qnwmik1d5g3', 'RM-002', 'RM-002-6fg9a9qnwmik1d5g3', 'Raw Material 2', 'วัตถุดิบประเภทที่ 2', 'o5fftrdv2mik1d5fy', 'kg', 50, 1000, 120.00, 96.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.883', '2025-11-29 08:35:08.883');
INSERT INTO public.products VALUES ('vgcu4b1ommik1d5g3', 'RM-003', 'RM-003-vgcu4b1ommik1d5g3', 'Raw Material 3', 'วัตถุดิบประเภทที่ 3', 'o5fftrdv2mik1d5fy', 'kg', 50, 1000, 130.00, 104.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.883', '2025-11-29 08:35:08.883');
INSERT INTO public.products VALUES ('k902vobd7mik1d5g4', 'RM-004', 'RM-004-k902vobd7mik1d5g4', 'Raw Material 4', 'วัตถุดิบประเภทที่ 4', 'o5fftrdv2mik1d5fy', 'kg', 50, 1000, 140.00, 112.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.884', '2025-11-29 08:35:08.884');
INSERT INTO public.products VALUES ('an1licxmqmik1d5g4', 'RM-005', 'RM-005-an1licxmqmik1d5g4', 'Raw Material 5', 'วัตถุดิบประเภทที่ 5', 'o5fftrdv2mik1d5fy', 'kg', 50, 1000, 150.00, 120.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.884', '2025-11-29 08:35:08.884');
INSERT INTO public.products VALUES ('o4x0lwgrimik1d5g5', 'COM-001', 'COM-001-o4x0lwgrimik1d5g5', 'Component 1', 'ชิ้นส่วนประเภทที่ 1', 'yrr07aaj6mik1d5fz', 'pcs', 100, 1000, 55.00, 44.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.885', '2025-11-29 08:35:08.885');
INSERT INTO public.products VALUES ('jjsuum44emik1d5g5', 'COM-002', 'COM-002-jjsuum44emik1d5g5', 'Component 2', 'ชิ้นส่วนประเภทที่ 2', 'yrr07aaj6mik1d5fz', 'pcs', 100, 1000, 60.00, 48.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.885', '2025-11-29 08:35:08.885');
INSERT INTO public.products VALUES ('9edbhcjh3mik1d5g5', 'COM-003', 'COM-003-9edbhcjh3mik1d5g5', 'Component 3', 'ชิ้นส่วนประเภทที่ 3', 'yrr07aaj6mik1d5fz', 'pcs', 100, 1000, 65.00, 52.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.886', '2025-11-29 08:35:08.886');
INSERT INTO public.products VALUES ('04zcu87xcmik1d5g6', 'COM-004', 'COM-004-04zcu87xcmik1d5g6', 'Component 4', 'ชิ้นส่วนประเภทที่ 4', 'yrr07aaj6mik1d5fz', 'pcs', 100, 1000, 70.00, 56.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.886', '2025-11-29 08:35:08.886');
INSERT INTO public.products VALUES ('drkx8e23emik1d5g6', 'COM-005', 'COM-005-drkx8e23emik1d5g6', 'Component 5', 'ชิ้นส่วนประเภทที่ 5', 'yrr07aaj6mik1d5fz', 'pcs', 100, 1000, 75.00, 60.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.886', '2025-11-29 08:35:08.886');
INSERT INTO public.products VALUES ('8530a0da0mik1d5g7', 'COM-006', 'COM-006-8530a0da0mik1d5g7', 'Component 6', 'ชิ้นส่วนประเภทที่ 6', 'yrr07aaj6mik1d5fz', 'pcs', 100, 1000, 80.00, 64.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.887', '2025-11-29 08:35:08.887');
INSERT INTO public.products VALUES ('7jzgur3z4mik1d5g7', 'FG-001', 'FG-001-7jzgur3z4mik1d5g7', 'Finished Product 1', 'สินค้าสำเร็จรูปรุ่นที่ 1', 'p467ua65mmik1d5fz', 'unit', 20, 1000, 550.00, 440.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.887', '2025-11-29 08:35:08.887');
INSERT INTO public.products VALUES ('dtiwqdqcmmik1d5g8', 'FG-002', 'FG-002-dtiwqdqcmmik1d5g8', 'Finished Product 2', 'สินค้าสำเร็จรูปรุ่นที่ 2', 'p467ua65mmik1d5fz', 'unit', 20, 1000, 600.00, 480.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.888', '2025-11-29 08:35:08.888');
INSERT INTO public.products VALUES ('4a1itptzimik1d5g8', 'FG-003', 'FG-003-4a1itptzimik1d5g8', 'Finished Product 3', 'สินค้าสำเร็จรูปรุ่นที่ 3', 'p467ua65mmik1d5fz', 'unit', 20, 1000, 650.00, 520.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.888', '2025-11-29 08:35:08.888');
INSERT INTO public.products VALUES ('k4ufilt7pmik1d5g9', 'FG-004', 'FG-004-k4ufilt7pmik1d5g9', 'Finished Product 4', 'สินค้าสำเร็จรูปรุ่นที่ 4', 'p467ua65mmik1d5fz', 'unit', 20, 1000, 700.00, 560.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.889', '2025-11-29 08:35:08.889');
INSERT INTO public.products VALUES ('oo0o39cn4mik1d5g9', 'FG-005', 'FG-005-oo0o39cn4mik1d5g9', 'Finished Product 5', 'สินค้าสำเร็จรูปรุ่นที่ 5', 'p467ua65mmik1d5fz', 'unit', 20, 1000, 750.00, 600.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.889', '2025-11-29 08:35:08.889');
INSERT INTO public.products VALUES ('ai1vhqwkxmik1d5ga', 'PKG-001', 'PKG-001-ai1vhqwkxmik1d5ga', 'Packaging 1', 'วัสดุบรรจุภัณฑ์ประเภทที่ 1', '828qjx3ismik1d5g0', 'box', 200, 1000, 40.00, 33.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.89', '2025-11-29 08:35:08.89');
INSERT INTO public.products VALUES ('a0bkf38j8mik1d5ga', 'PKG-002', 'PKG-002-a0bkf38j8mik1d5ga', 'Packaging 2', 'วัสดุบรรจุภัณฑ์ประเภทที่ 2', '828qjx3ismik1d5g0', 'box', 200, 1000, 50.00, 41.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.89', '2025-11-29 08:35:08.89');
INSERT INTO public.products VALUES ('p4wbnwzy9mik1d5gb', 'PKG-003', 'PKG-003-p4wbnwzy9mik1d5gb', 'Packaging 3', 'วัสดุบรรจุภัณฑ์ประเภทที่ 3', '828qjx3ismik1d5g0', 'box', 200, 1000, 60.00, 49.00, NULL, true, 'n6snhn8evmik1d5bc', 'n6snhn8evmik1d5bc', '2025-11-29 08:35:08.891', '2025-11-29 08:35:08.891');


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.warehouses VALUES ('x728jcdjfmik1d5g0', 'WH-MAIN', 'Main Warehouse', 'Building A', NULL, true, '2025-11-29 08:35:08.88', '2025-11-29 08:35:08.88');
INSERT INTO public.warehouses VALUES ('ldc5m4s52mik1d5g1', 'WH-PROD', 'Production Warehouse', 'Building B - Floor 2', NULL, true, '2025-11-29 08:35:08.881', '2025-11-29 08:35:08.881');


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.inventory VALUES ('m9v9svbj3mik1d5gb', 'fh9t74vjqmik1d5g1', 'x728jcdjfmik1d5g0', 280, 0, 280, NULL, NULL, '2025-11-29 08:35:08.891', '2025-11-29 08:35:08.891');
INSERT INTO public.inventory VALUES ('zoxbdt0tomik1d5gc', '6fg9a9qnwmik1d5g3', 'x728jcdjfmik1d5g0', 220, 0, 220, NULL, NULL, '2025-11-29 08:35:08.892', '2025-11-29 08:35:08.892');
INSERT INTO public.inventory VALUES ('kxvv6stsfmik1d5gc', '6fg9a9qnwmik1d5g3', 'ldc5m4s52mik1d5g1', 97, 0, 97, NULL, NULL, '2025-11-29 08:35:08.892', '2025-11-29 08:35:08.892');
INSERT INTO public.inventory VALUES ('w5hzq50hrmik1d5gd', 'vgcu4b1ommik1d5g3', 'x728jcdjfmik1d5g0', 383, 0, 383, NULL, NULL, '2025-11-29 08:35:08.893', '2025-11-29 08:35:08.893');
INSERT INTO public.inventory VALUES ('kbp1plgjfmik1d5gd', 'vgcu4b1ommik1d5g3', 'ldc5m4s52mik1d5g1', 194, 0, 194, NULL, NULL, '2025-11-29 08:35:08.893', '2025-11-29 08:35:08.893');
INSERT INTO public.inventory VALUES ('iuvijvp5emik1d5ge', 'k902vobd7mik1d5g4', 'x728jcdjfmik1d5g0', 123, 0, 123, NULL, NULL, '2025-11-29 08:35:08.894', '2025-11-29 08:35:08.894');
INSERT INTO public.inventory VALUES ('ksiddeyhrmik1d5ge', 'k902vobd7mik1d5g4', 'ldc5m4s52mik1d5g1', 138, 0, 138, NULL, NULL, '2025-11-29 08:35:08.894', '2025-11-29 08:35:08.894');
INSERT INTO public.inventory VALUES ('mgdfcjm9dmik1d5ge', 'an1licxmqmik1d5g4', 'x728jcdjfmik1d5g0', 440, 0, 440, NULL, NULL, '2025-11-29 08:35:08.894', '2025-11-29 08:35:08.894');
INSERT INTO public.inventory VALUES ('5uyvx4hijmik1d5gf', 'an1licxmqmik1d5g4', 'ldc5m4s52mik1d5g1', 79, 0, 79, NULL, NULL, '2025-11-29 08:35:08.895', '2025-11-29 08:35:08.895');
INSERT INTO public.inventory VALUES ('8syuhjmbsmik1d5gf', 'o4x0lwgrimik1d5g5', 'x728jcdjfmik1d5g0', 482, 0, 482, NULL, NULL, '2025-11-29 08:35:08.895', '2025-11-29 08:35:08.895');
INSERT INTO public.inventory VALUES ('u8fxidsmnmik1d5gf', 'jjsuum44emik1d5g5', 'x728jcdjfmik1d5g0', 232, 0, 232, NULL, NULL, '2025-11-29 08:35:08.895', '2025-11-29 08:35:08.895');
INSERT INTO public.inventory VALUES ('sx6yk1cdqmik1d5gg', 'jjsuum44emik1d5g5', 'ldc5m4s52mik1d5g1', 72, 0, 72, NULL, NULL, '2025-11-29 08:35:08.896', '2025-11-29 08:35:08.896');
INSERT INTO public.inventory VALUES ('6hh5l4xx5mik1d5gg', '9edbhcjh3mik1d5g5', 'x728jcdjfmik1d5g0', 306, 0, 306, NULL, NULL, '2025-11-29 08:35:08.896', '2025-11-29 08:35:08.896');
INSERT INTO public.inventory VALUES ('9om0anhwqmik1d5gg', '9edbhcjh3mik1d5g5', 'ldc5m4s52mik1d5g1', 142, 0, 142, NULL, NULL, '2025-11-29 08:35:08.896', '2025-11-29 08:35:08.896');
INSERT INTO public.inventory VALUES ('8vpjvrkpkmik1d5gh', '04zcu87xcmik1d5g6', 'x728jcdjfmik1d5g0', 169, 0, 169, NULL, NULL, '2025-11-29 08:35:08.897', '2025-11-29 08:35:08.897');
INSERT INTO public.inventory VALUES ('0g4qco30cmik1d5gh', '04zcu87xcmik1d5g6', 'ldc5m4s52mik1d5g1', 52, 0, 52, NULL, NULL, '2025-11-29 08:35:08.897', '2025-11-29 08:35:08.897');
INSERT INTO public.inventory VALUES ('2dzhau8znmik1d5gh', 'drkx8e23emik1d5g6', 'x728jcdjfmik1d5g0', 104, 0, 104, NULL, NULL, '2025-11-29 08:35:08.897', '2025-11-29 08:35:08.897');
INSERT INTO public.inventory VALUES ('m8xkec74zmik1d5gi', 'drkx8e23emik1d5g6', 'ldc5m4s52mik1d5g1', 107, 0, 107, NULL, NULL, '2025-11-29 08:35:08.898', '2025-11-29 08:35:08.898');
INSERT INTO public.inventory VALUES ('o32vf7xa9mik1d5gi', '8530a0da0mik1d5g7', 'x728jcdjfmik1d5g0', 485, 0, 485, NULL, NULL, '2025-11-29 08:35:08.898', '2025-11-29 08:35:08.898');
INSERT INTO public.inventory VALUES ('4koa0ga64mik1d5gi', '8530a0da0mik1d5g7', 'ldc5m4s52mik1d5g1', 75, 0, 75, NULL, NULL, '2025-11-29 08:35:08.898', '2025-11-29 08:35:08.898');
INSERT INTO public.inventory VALUES ('uatt9kv33mik1d5gj', '7jzgur3z4mik1d5g7', 'x728jcdjfmik1d5g0', 186, 0, 186, NULL, NULL, '2025-11-29 08:35:08.899', '2025-11-29 08:35:08.899');
INSERT INTO public.inventory VALUES ('j6lulqwyymik1d5gj', 'dtiwqdqcmmik1d5g8', 'x728jcdjfmik1d5g0', 213, 0, 213, NULL, NULL, '2025-11-29 08:35:08.899', '2025-11-29 08:35:08.899');
INSERT INTO public.inventory VALUES ('xtbzoyy5emik1d5gj', '4a1itptzimik1d5g8', 'x728jcdjfmik1d5g0', 452, 0, 452, NULL, NULL, '2025-11-29 08:35:08.899', '2025-11-29 08:35:08.899');
INSERT INTO public.inventory VALUES ('beihwpirgmik1d5gk', 'k4ufilt7pmik1d5g9', 'x728jcdjfmik1d5g0', 185, 0, 185, NULL, NULL, '2025-11-29 08:35:08.9', '2025-11-29 08:35:08.9');
INSERT INTO public.inventory VALUES ('crlxm3otvmik1d5gk', 'k4ufilt7pmik1d5g9', 'ldc5m4s52mik1d5g1', 127, 0, 127, NULL, NULL, '2025-11-29 08:35:08.9', '2025-11-29 08:35:08.9');
INSERT INTO public.inventory VALUES ('5sxyfndaxmik1d5gk', 'oo0o39cn4mik1d5g9', 'x728jcdjfmik1d5g0', 300, 0, 300, NULL, NULL, '2025-11-29 08:35:08.9', '2025-11-29 08:35:08.9');
INSERT INTO public.inventory VALUES ('rp9v2070hmik1d5gl', 'oo0o39cn4mik1d5g9', 'ldc5m4s52mik1d5g1', 202, 0, 202, NULL, NULL, '2025-11-29 08:35:08.901', '2025-11-29 08:35:08.901');
INSERT INTO public.inventory VALUES ('n28ecsed8mik1d5gl', 'ai1vhqwkxmik1d5ga', 'x728jcdjfmik1d5g0', 355, 0, 355, NULL, NULL, '2025-11-29 08:35:08.901', '2025-11-29 08:35:08.901');
INSERT INTO public.inventory VALUES ('nlt5cput1mik1d5gl', 'a0bkf38j8mik1d5ga', 'x728jcdjfmik1d5g0', 277, 0, 277, NULL, NULL, '2025-11-29 08:35:08.901', '2025-11-29 08:35:08.901');
INSERT INTO public.inventory VALUES ('kp79r6g11mik1d5gl', 'p4wbnwzy9mik1d5gb', 'x728jcdjfmik1d5g0', 461, 0, 461, NULL, NULL, '2025-11-29 08:35:08.901', '2025-11-29 08:35:08.901');


--
-- Data for Name: inventory_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.transactions VALUES ('94l1ko1f0mik1d5gm', 'ADJUSTMENT', 'COMPLETED', 'k4ufilt7pmik1d5g9', 'x728jcdjfmik1d5g0', NULL, 27, 'Test transaction 1', NULL, 'n6snhn8evmik1d5bc', '2025-11-03 04:50:27.388', '2025-11-29 08:35:08.902');
INSERT INTO public.transactions VALUES ('slz74c6x1mik1d5gn', 'IN', 'COMPLETED', 'k902vobd7mik1d5g4', 'x728jcdjfmik1d5g0', NULL, 48, 'Test transaction 2', NULL, 'n6snhn8evmik1d5bc', '2025-11-15 09:52:20.439', '2025-11-29 08:35:08.903');
INSERT INTO public.transactions VALUES ('hqn7j33p1mik1d5gn', 'OUT', 'COMPLETED', 'p4wbnwzy9mik1d5gb', 'x728jcdjfmik1d5g0', NULL, 54, 'Test transaction 3', NULL, 'n6snhn8evmik1d5bc', '2025-11-02 11:47:20.335', '2025-11-29 08:35:08.903');
INSERT INTO public.transactions VALUES ('tf0w5zj0smik1d5gn', 'IN', 'COMPLETED', 'fh9t74vjqmik1d5g1', 'x728jcdjfmik1d5g0', NULL, 57, 'Test transaction 4', NULL, 'n6snhn8evmik1d5bc', '2025-11-28 15:09:23.398', '2025-11-29 08:35:08.903');
INSERT INTO public.transactions VALUES ('ns0od70afmik1d5go', 'IN', 'COMPLETED', '7jzgur3z4mik1d5g7', 'x728jcdjfmik1d5g0', NULL, 48, 'Test transaction 5', NULL, 'n6snhn8evmik1d5bc', '2025-11-06 23:37:26.296', '2025-11-29 08:35:08.904');
INSERT INTO public.transactions VALUES ('ttegpegx9mik1d5go', 'ADJUSTMENT', 'COMPLETED', 'fh9t74vjqmik1d5g1', 'x728jcdjfmik1d5g0', NULL, 43, 'Test transaction 6', NULL, 'n6snhn8evmik1d5bc', '2025-11-18 11:38:53.926', '2025-11-29 08:35:08.904');
INSERT INTO public.transactions VALUES ('g2j1doeppmik1d5go', 'ADJUSTMENT', 'COMPLETED', '9edbhcjh3mik1d5g5', 'x728jcdjfmik1d5g0', NULL, 15, 'Test transaction 7', NULL, 'n6snhn8evmik1d5bc', '2025-11-24 22:38:40.94', '2025-11-29 08:35:08.904');
INSERT INTO public.transactions VALUES ('c5nf5hauymik1d5gp', 'ADJUSTMENT', 'COMPLETED', '4a1itptzimik1d5g8', 'x728jcdjfmik1d5g0', NULL, 44, 'Test transaction 8', NULL, 'n6snhn8evmik1d5bc', '2025-11-02 15:10:46.846', '2025-11-29 08:35:08.905');
INSERT INTO public.transactions VALUES ('qucvtblmimik1d5gp', 'OUT', 'COMPLETED', 'jjsuum44emik1d5g5', 'x728jcdjfmik1d5g0', NULL, 10, 'Test transaction 9', NULL, 'n6snhn8evmik1d5bc', '2025-10-31 19:33:29.459', '2025-11-29 08:35:08.905');
INSERT INTO public.transactions VALUES ('4gbwjy4womik1d5gp', 'OUT', 'COMPLETED', '04zcu87xcmik1d5g6', 'x728jcdjfmik1d5g0', NULL, 14, 'Test transaction 10', NULL, 'n6snhn8evmik1d5bc', '2025-11-01 03:32:27.832', '2025-11-29 08:35:08.905');


--
-- PostgreSQL database dump complete
--

\unrestrict NyATaz9bSCVvm5ejw6uIjYk4qS9ilEQJeCCFeL1iM5wgtNwICkNeEpvF2IBDpQ5

