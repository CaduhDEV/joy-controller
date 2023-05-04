# Projeto Joy

O Projeto JOY é uma solução inovadora para a gestão de membros de igrejas e suas famílias, que utiliza a tecnologia para oferecer uma experiência mais eficiente e personalizada. Com o assistente virtual JOY, disponível via WhatsApp, a liderança pastoral pode administrar as famílias que congregam no templo de forma automatizada e simplificada.

Os membros da igreja podem escanear um QR Code na entrada do culto, permitindo que JOY procure o cadastro correspondente. Caso o cadastro não seja encontrado, JOY inicia o processo de criação de um registro, coletando informações importantes sobre os membros e suas famílias.

Além disso, JOY oferece aos membros da igreja algumas ferramentas importantes para sua vida espiritual, como a possibilidade de enviar um pedido de oração, receber devocionais diários e estar atualizado sobre anúncios das redes sociais da igreja. Isso torna JOY uma ferramenta de comunicação eficaz e valiosa para os membros, que se sentem mais conectados à igreja e seus líderes.

![Status](https://img.shields.io/badge/Projeto%20JOY-Em%20BETA-brightgreen)
![version](https://img.shields.io/badge/Version-v1.2.5-red)
![Author](https://img.shields.io/badge/Author-%40Caduh.sz-important)

## Instalação

Para instalar o Projeto Joy, é necessário ter o Node.js instalado no computador. Em seguida, execute os seguintes comandos:

```console
git clone https://github.com/Mix-Church/Mix-bot.git
cd Mix-bot
npm install
```

## Como usar

Para usar o Projeto Joy, é necessário ter uma conta de WhatsApp Business e um smartphone com o aplicativo WhatsApp instalado. Depois de criar a conta de WhatsApp Business, siga as etapas abaixo:

1. Escaneie o código QR exibido na tela com o aplicativo WhatsApp em seu smartphone.
2. Inicie o servidor de testes digitando o seguinte comando:

```console
npm run dev  
```

3. Envie uma mensagem para o número de telefone associado à conta de WhatsApp Business e aguarde a resposta automática.

## APIs

O Projeto Joy utiliza as seguintes APIs:

- `wppconnect`: API para se conectar ao WhatsApp Business por meio do Node.js.
- `mysql`: API para interagir com bancos de dados MySQL.
- `axios`: API para fazer requisições HTTP.
- `moment`: API para manipular datas e horários em JavaScript.

## Configurações de mensagens
O arquivo messages.json contém as frases utilizadas pelo bot para a interação com os usuários. Segue abaixo um exemplo de sua estrutura:

```json
{
"text": "Aqui é o texto que o bot irá enviar",
"buttons": {
    "useTemplateButtons": false,
    "buttons": [ { "text": "Texto do botão" } ]
    }
}
```
## Criar banco de dados no SQL
Executar esse comando no mysql para criar as tabelas utilizadas pelo JOY:
```sql
CREATE DATABASE IF NOT EXISTS `mix`
USE `mix`;

CREATE TABLE IF NOT EXISTS `members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `contact` varchar(255) NOT NULL,
  `name` text NOT NULL,
  `instagram` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` varchar(255) NOT NULL,
  `birthday` varchar(255) NOT NULL,
  `staff` tinyint(4) NOT NULL DEFAULT 0,
  `createdin` varchar(255) NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4;
```

## Contribuidores

- `Gabriela`: responsável pelas falas, designer do avatar e personalidade de JOY.
- `Edvanda`: supervisora e apoiadora do projeto joy.

## Autor

O Projeto Joy foi criado por Carlos "Caduh" Eduardo.
