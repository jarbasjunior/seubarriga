# API REST em Node.js com TDD e JEST

Projeto de uma API REST (seubarriga) desenvolvida utilizando a metdoldologia TDD, utlizando o JEST para realização dos testes a nível de integração.

---

## Índice: 📋
- [Requisitos](#-requisitos)
  - [Node.js e NPM](#-node.js-e-npm)
  - [Express](#-express)
  - [Jest](#-jest)
  - [Supertest](#-supertest)
- [Opcionais recomendados](#-opcionais-recomendados)
  - [Eslint plugin](#-eslint-plugin)
  - [eslint](#-eslint)

---

## Requisitos: ❗

* [Node.js e NPM](https://nodejs.org/en/download) - Node.js como ambiente de execução para criar e executar aplicações em Javascript. E o NPM para: instalação de pacotes, gerenciamento de versões e dependências.

* [Express](https://www.npmjs.com/package/express) - Como servidor para a API.

  * ### Instalação do Express ⚙️

    - Execute o comando `npm i -S -E express@4.16.4` para instalar as dependências do **Express** na versão 4.16.0 sem atualização automática no futuro.


* [Jest](https://www.npmjs.com/package/jest) - Para criação de testes de API REST

  * ### Instalação do Jest ⚙️

    - Execute o comando `npm i -D jest@23.6.0 -E` para instalar no ambiente de DEV as dependências do **Jest** na versão 23.6.0 sem atualização automática no futuro.

    - Dentro do arquivo `package.json` altere o valor da chave `test` para `jest`.
      ```bash
      "scripts": {
        "test": "jest",
        "lint": "eslint test/** src/** --fix"
      }
      ```

    - No Jest é possível habilitar a execução de testes "assistida", trata-se de uma execução dos testes em tempo real a cada vez que o arquivo é salvo após sua alteração, de modo que tenhamos um *feedback* mais rápido sobre as mudanças de código que estão sendo realizadas, sejam elas da aplicação, ou da própria suíte de testes. Para isso, no arquivo `package.json` dentro da chave `scripts`, adicione a chave `"secure-mode": "jest --watchAll --verbose=true"`. E a partir da pasta raiz do projeto execute o comando `npm run secure-mode`.
    Após a execução, serão exibidas várias opções para uma nova execução, para sair digite `q`.
  
    - Caso você esteja utilizando o **eslint** (recomendado), no arquivo `.eslintrc.json` dentro da chave `env` adicione a chave `"jest": true`, como no exemplo abaixo:
    ```bash
      "env": {
        "commonjs": true,
        "es2021": true,
        "jest": true, # informa ao lint que estamos utilizando o jest
        "node": true
      }
    ```

    - Execute o comando `npm test` para verificar a eecução do Jest.

* [Supertest](https://www.npmjs.com/package/supertest) - Como módulo para realizar requisições HTTP para a API, além de assersações a nível de integração.

  * ### Instalação do Supertest ⚙️

    - Execute o comando `npm i -D -E supertest@3.3.0` para instalar no ambiente de DEV as dependências do **Supertest** na versão 3.3.0 sem atualização automática no futuro.

## Opcionais recomendados: ⚒️

* [Eslint plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
* [eslint](https://www.npmjs.com/package/eslint)

  * ### Instalação eslint ⚙️

    - Na pasta raiz do projeto **seubarriga**, execute o comando abaixo para instalar o eslint como uma dependência de desenvolvimento do projeto.
    ```
    npm i -D eslint
    ```
    - Na pasta raiz do projeto **seubarriga**, execute o comando `node_modules/.bin/eslint --init` abaixo para configurar o eslint, em seguida responda as seguintes perguntas abaixo, conforme respostas exibidas:

      | <center>PERGUNTA</center> | RESPOSTA |
      |-----------|:-----------:|
      | <span style="color:magenta">How would you like to use ESLint?</span> | <span style="color:cyan">To check syntax, find problems, and enforce code style</span>  |
      | <span style="color:magenta">What type of modules does your project use?</span> | <span style="color:cyan">CommonJS (require/exports)</span>  |
      | <span style="color:magenta">Which framework does your project use?</span> | <span style="color:cyan">None of these</span>  |
      | <span style="color:magenta">Does your project use TypeScript?</span> | <span style="color:cyan">No</span>  |
      | <span style="color:magenta">Where does your code run?</span> | <span style="color:cyan">Node (press `<i>` to invert selection)</span>  |
      | <span style="color:magenta">How would you like to define a style for your project?</span> | <span style="color:cyan">Use a popular style guide</span>  |
      | <span style="color:magenta">Which style guide do you want to follow?</span> | <span style="color:cyan">Airbnb: http://github.com/airbnb/javascript</span>  |
      | <span style="color:magenta">What format do you want your config file to be in?</span> | <span style="color:cyan">JSON</span>  |
      | <span style="color:magenta">Would you like to install them now with npm?</span> | <span style="color:cyan">Yes</span>  |

    - Abra o arquivo `.eslintrc.json` e adicione dentro da chave `rules` a outra chave `"no-console": "off"`, para que o lint não reclame do comando `console.log();`, pois durante o desenvolvimento ele poderá ser utilizado com frequencia.

    - Por fim, no arquivo `package.json`, adicione na chave `scripts`, o novo script: `"lint": "eslint test/** src/** --fix"`. Desta forma, quando for executado na raiz do projeto o comando `npm run lint`, serão corrigidas as infrações que o eslint considera como autocorrigível de acordo com o *guide* Airbnb que foi configurado anteriomente. 

