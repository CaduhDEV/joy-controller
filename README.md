# Projeto Joy

O Projeto JOY é uma solução inovadora para a gestão de membros de igrejas e suas famílias, que utiliza a tecnologia para oferecer uma experiência mais eficiente e personalizada. Com o assistente virtual JOY, disponível via WhatsApp, a liderança pastoral pode administrar as famílias que congregam no templo de forma automatizada e simplificada.

Os membros da igreja podem escanear um QR Code na entrada do culto, permitindo que JOY procure o cadastro correspondente. Caso o cadastro não seja encontrado, JOY inicia o processo de criação de um registro, coletando informações importantes sobre os membros e suas famílias.

Além disso, JOY oferece aos membros da igreja algumas ferramentas importantes para sua vida espiritual, como a possibilidade de enviar um pedido de oração, receber devocionais diários e estar atualizado sobre anúncios das redes sociais da igreja. Isso torna JOY uma ferramenta de comunicação eficaz e valiosa para os membros, que se sentem mais conectados à igreja e seus líderes.

![Status](https://img.shields.io/badge/Joy%20Controller-Online-brightgreen)
![version](https://img.shields.io/badge/Version-v2.0.0-red)
![Author](https://img.shields.io/badge/Author-%40caduh.sz-important)
![npm type definitions](https://img.shields.io/npm/types/typescript)

## Instalação

Para instalar o Projeto Joy, é necessário ter o Node.js e a superset Typescript instalado no computador. Em seguida, execute os seguintes comandos:

```console
git clone https://github.com/CaduhDEV/joy-controller.git
cd joy-controller
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

- `typescript`: um superset para Javascript.
- `wppconnect`: Biblioteca para se conectar ao WhatsApp Business por meio do Node.js.
- `ffmpeg-static`: Biblioteca exigida pela wppconnect para envio de GIFs.
- `mysql2`: Biblioteca para interagir com bancos de dados MySQL.
- `axios`: Biblioteca para fazer requisições HTTP.
- `moment`: Biblioteca para manipular datas e horários em JavaScript.
- `moment-timezone`: Biblioteca para manipular o fuso horário da biblioteca moment.
- `nodemailer`: Biblioteca para automoção de envio de emails.

## Configurações de JOY
O arquivo interfaces.json contém a extrutura de interpretação de etapa de conversa de joy com o usuário, é totalmente configurável.

```json
"interface_name": {
    "msg": [
        { "type": "text", "text": "conteúdo da mensagem." },
        { "type": "image", "url": "https://your-image.com/image.png", "caption": "Descrição da imagem."},
        { "type": "gif", "caption": "gif com texto.", "url": "https://your-gif.com/yourgif.gif"},
        { "type": "contact", "name": "contact name", "phone": "559xxxxxxxx"},
        { "type": "location", "latitude": "-00.00", "longitude": "-00.000", "title": "titlo da localização"},
        { "type": "poll", "name": "Enquete Teste", "options": [ "Option 1", "Option 2", "Option 3"], "selectable": 1 },
        { "type": "reaction", "emoji": "1️⃣"},
        { "type": "contacts", "contacts": [ 
            { "id": "554384244218", "name": "teste1" },
            { "id": "554384244218", "name": "teste2" },
            { "id": "554384244218", "name": "teste3" }
        ]},
    ],
    "interacts": [
        { "emoji": "1️⃣", "title": "Voltar", "action": "main_menu" },
        { "emoji": "2️⃣", "title": "Voltar novamente", "action": "main_menu2" }
    ]
}
```

## Contribuidores

- `Gabriela Castro`: responsável pelas falas, designer do avatar e personalidade de JOY.
- `Edvanda Camargo`: supervisora e apoiadora do projeto joy.

## Autor
O Projeto Joy foi criado por Carlos "Caduh" Eduardo.
