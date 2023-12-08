-- TABLE: gop_presupuesto_status
INSERT INTO `gop_presupuesto_status` (`id`, `const`) VALUES (1, 'Borrador');
INSERT INTO `gop_presupuesto_status` (`id`, `const`) VALUES (2, 'Por aprobar');
INSERT INTO `gop_presupuesto_status` (`id`, `const`) VALUES (3, 'Aprobado');
INSERT INTO `gop_presupuesto_status` (`id`, `const`) VALUES (4, 'Cerrado');
-- TABLE: divisa
INSERT INTO `divisa` (`sys_pk`, `sys_guid`, `sys_dtcreated`, `sys_timestamp`, `sys_info`, `sys_user`, `sys_lastuser`, `sys_exported`, `sys_dtexported`, `sys_recver`, `sys_deleted`, `sys_lock`, `codigo`, `descripcion`, `tcambio`) VALUES (1, 'bb108697026343a1ae27aae492ad8e8f', '2023-11-27 11:19:27', '2023-11-27 11:19:28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'MXN', 'Peso Mexicano', 1.00000000);
INSERT INTO `divisa` (`sys_pk`, `sys_guid`, `sys_dtcreated`, `sys_timestamp`, `sys_info`, `sys_user`, `sys_lastuser`, `sys_exported`, `sys_dtexported`, `sys_recver`, `sys_deleted`, `sys_lock`, `codigo`, `descripcion`, `tcambio`) VALUES (2, '96b1380c29e1421881b3357dc48e0b84', '2023-11-27 11:19:47', '2023-11-27 11:19:48', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'USD', 'Dolar estadounidense', 17.00000000);
