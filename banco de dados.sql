-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.22-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.0.0.6468
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para joy
CREATE DATABASE IF NOT EXISTS `joy` /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE `joy`;

-- Copiando estrutura para tabela joy.board
CREATE TABLE IF NOT EXISTS `board` (
  `purpose` varchar(50) DEFAULT NULL,
  `fast` varchar(50) DEFAULT NULL,
  `book` varchar(50) DEFAULT NULL,
  `prayer` varchar(50) DEFAULT NULL,
  `start` date NOT NULL,
  `finish` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela joy.board: ~3 rows (aproximadamente)
INSERT INTO `board` (`purpose`, `fast`, `book`, `prayer`, `start`, `finish`) VALUES
	('Brasil', 'Doce', 'Jeremias', 'Igreja', '2023-11-08', '2023-11-30'),
	('Igreja', 'Refrigerante', 'Atos', 'Igreja', '2023-12-01', '2023-12-31');

-- Copiando estrutura para tabela joy.checkin
CREATE TABLE IF NOT EXISTS `checkin` (
  `id` int(11) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela joy.checkin: 0 rows
/*!40000 ALTER TABLE `checkin` DISABLE KEYS */;
/*!40000 ALTER TABLE `checkin` ENABLE KEYS */;

-- Copiando estrutura para tabela joy.devotionals
CREATE TABLE IF NOT EXISTS `devotionals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` longtext DEFAULT NULL,
  `datetime` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela joy.devotionals: 1 rows
/*!40000 ALTER TABLE `devotionals` DISABLE KEYS */;
INSERT INTO `devotionals` (`id`, `text`, `datetime`) VALUES
	(3, 'Hoje é uma dádiva de Deus. Comece o dia com gratidão no coração, reconhecendo Sua bondade e buscando Sua orientação em cada passo.', '2023-11-27'),
	(4, 'Deixe que a paz de Deus reine em seu coração hoje. Encontre força na certeza de que Ele está no controle, mesmo nas situações mais desafiadoras.', '2023-11-28'),
	(5, 'A Palavra de Deus é uma fonte de sabedoria. Dedique um tempo para mergulhar nela hoje, buscando direção e inspiração para sua jornada.', '2023-11-29'),
	(6, 'Ao enfrentar decisões difíceis, confie no Senhor de todo o coração. Ele promete guiar seus passos e iluminar o caminho à sua frente.', '2023-11-30'),
	(7, 'Aproxime-se de Deus em oração hoje. Fale com Ele sobre seus sonhos, preocupações e agradeça por Suas bênçãos. Ele ouve e responde.', '2023-12-01'),
	(8, 'Encontre alegria na presença de Deus. Sua graça é suficiente para fortalecer você em todas as circunstâncias. Confie em Sua fidelidade.', '2023-12-02'),
	(9, 'Lembre-se de ser um reflexo do amor de Deus ao interagir com os outros hoje. Seja gentil, compassivo e paciente, assim como Ele é conosco.', '2023-12-03'),
	(10, 'Hoje, reflita sobre a generosidade de Deus. 2 Coríntios 9:8 nos lembra que \'Deus é poderoso para fazer abundar em vós toda a graça, a fim de que, tendo sempre, em tudo, ampla suficiência, superabundeis em toda boa obra.\'', '2023-12-04'),
	(11, 'À medida que enfrenta desafios, lembre-se da promessa de Isaías 41:10 - \'Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.\'', '2023-12-05'),
	(12, 'Em momentos de incerteza, confie na providência de Deus. Provérbios 3:5-6 nos lembra: \'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.\'', '2023-12-06'),
	(13, 'Deus é a nossa rocha e fortaleza. Salmo 18:2 nos assegura que \'O Senhor é o meu rochedo, e o meu lugar forte, e o meu libertador; o meu Deus, a minha fortaleza, em quem confio; o meu escudo, a força da minha salvação, e o meu alto refúgio.\'', '2023-12-07'),
	(14, 'Ao iniciar o dia, busque a sabedoria de Deus. Tiago 1:5 nos encoraja: \'Se algum de vós tem falta de sabedoria, peça-a a Deus, que a todos dá liberalmente, e não o lança em rosto, e ser-lhe-á dada.\'', '2023-12-08'),
	(15, 'À medida que se aproxima do fim do ano, agradeça a Deus por Sua fidelidade. Salmo 100:5 declara: \'Porque o Senhor é bom, a sua misericórdia dura para sempre, e a sua fidelidade de geração em geração.\'', '2023-12-09'),
	(16, 'Hoje, medite na promessa de Romanos 8:28 - \'E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.\'', '2023-12-10'),
	(17, 'Neste novo dia, busque a face de Deus. Salmo 27:8 nos convida: \'Quando tu disseste: Buscai o meu rosto; o meu coração disse a ti: O teu rosto, Senhor, buscarei.\'', '2023-12-11'),
	(18, 'À medida que enfrenta desafios, lembre-se de Efésios 6:10 - \'Finalmente, fortalecei-vos no Senhor e na força do seu poder.\'', '2023-12-12'),
	(19, 'Deus é o nosso refúgio seguro. Salmo 46:1 nos assegura que \'Deus é o nosso refúgio e fortaleza, socorro bem presente na angústia.\'', '2023-12-13'),
	(20, 'Ao iniciar o dia, medite na promessa de João 16:33 - \'Tenho-vos dito isso, para que em mim tenhais paz; no mundo tereis aflições, mas tende bom ânimo; eu venci o mundo.\'', '2023-12-14'),
	(21, 'Em momentos de dúvida, confie na orientação de Deus. Provérbios 3:6 nos lembra: \'Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.\'', '2023-12-15'),
	(22, 'À medida que se aproxima do final do ano, agradeça a Deus por Sua graça. Efésios 2:8 nos lembra que \'pela graça sois salvos, por meio da fé, e isto não vem de vós, é dom de Deus.\'', '2023-12-16'),
	(23, 'Hoje, medite na promessa de Isaías 40:31 - \'Mas os que esperam no Senhor renovam as suas forças, sobem com asas como águias, correm e não se cansam, caminham e não se fatigam.\'', '2023-12-17'),
	(24, 'Deixe que a paz de Cristo reine em seu coração. Colossenses 3:15 nos lembra: \'E a paz de Cristo, para a qual também fostes chamados em um corpo, domine em vossos corações; e sede agradecidos.\'', '2023-12-18'),
	(25, 'Ao iniciar este dia, confie na fidelidade de Deus. Lamentações 3:22-23 declara: \'As misericórdias do Senhor são a causa de não sermos consumidos; porque as suas misericórdias não têm fim.\'', '2023-12-19'),
	(26, 'Neste dia, busque a presença de Deus. Salmo 16:11 nos lembra que \'na tua presença há plenitude de alegria; diante de tua face há delícias perpetuamente.\'', '2023-12-20');
/*!40000 ALTER TABLE `devotionals` ENABLE KEYS */;

-- Copiando estrutura para tabela joy.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `contact` varchar(50) DEFAULT NULL,
  `birthday` date NOT NULL,
  `age` int(11) NOT NULL,
  `email` varchar(50) NOT NULL,
  `gender` varchar(50) NOT NULL,
  `instagram` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `complement` varchar(50) NOT NULL,
  `language` varchar(50) NOT NULL,
  `role` int(11) NOT NULL,
  `createdin` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4;

-- Copiando dados para a tabela joy.users: 2 rows
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `name`, `full_name`, `contact`, `birthday`, `age`, `email`, `gender`, `instagram`, `address`, `complement`, `language`, `role`, `createdin`) VALUES
	(3, 'Carlos', 'Carlos Eduardo Da Silva Machado', '554384244218@c.us', '2002-02-05', 21, 'contato.caduh@hotmail.com', 'man', 'caduh.sz', 'Rua Natal Delalibera, 89 - Jardim Planalto Londrina PR - 86084-340', 'casa', 'ptbr', 2, '2023-11-27 15:40:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

-- Copiando estrutura para trigger joy.atualizar_idade_insert
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER atualizar_idade_insert
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.birthday, CURDATE());
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Copiando estrutura para trigger joy.atualizar_idade_update
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER atualizar_idade_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.age = TIMESTAMPDIFF(YEAR, NEW.birthday, CURDATE());
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
