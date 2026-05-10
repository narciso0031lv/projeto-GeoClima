# GeoClima API

> **Nota importante:** Este repositório contém tanto o Front-end quanto o Back-end da aplicação. Conforme solicitado nos requisitos do projeto, todas as funcionalidades obrigatórias, testes automatizados e coleções de API encontram-se detalhadamente implementados dentro da pasta **`/backend`**.

Este projeto orquestra dados de múltiplas fontes externas para entregar informações climáticas precisas e listagem de municípios brasileiros, focando em alta disponibilidade e tratamento rigoroso de erros.

---

## Tecnologias Utilizadas

O projeto foi construído utilizando o ecossistema moderno de JavaScript/TypeScript:

* **Node.js & Express:** Core da aplicação para criação das rotas.
* **TypeScript:** Garantia de tipagem estática e segurança de código.
* **Axios:** Cliente HTTP para consumo das APIs externas.
* **CORS:** Habilitado para integração segura com o Frontend.
* **Jest & Supertest:** Suíte de testes automatizados de integração.

---

## Arquitetura e Integrações

A API atua como um **Agregador de Serviços**, consumindo dados de:
1.  **Open-Meteo Geocoding:** Para converter nomes de cidades em coordenadas (Lat/Log).
2.  **Open-Meteo Forecast:** Para obter dados meteorológicos em tempo real.
3.  **BrasilAPI (IBGE):** Para listagem oficial de municípios por estado.

---

## Endpoints da API

A API roda por padrão em `http://localhost:3000`.

### 1. Clima Detalhado
* **Rota:** `GET /api/v1/clima/:cidade`
* **Exemplo:** `http://localhost:3000/api/v1/clima/Fortaleza`

### 2. Listagem de Cidades
* **Rota:** `GET /api/v1/cidades/:sigla_uf?limite=10`
* **Exemplo:** `http://localhost:3000/api/v1/cidades/CE?limite=5`

### 3. Health Check
* **Rota:** `GET /api/v1/health`
* **Descrição:** Verifica a saúde da API e conectividade com serviços externos.

---

## Testes Automatizados

Projeto desenvolvido com foco em qualidade de software, incluindo testes que validam:
* ✅ Respostas de sucesso (HTTP 200).
* ✅ Erros de entrada - Nome curto ou UF inválida (HTTP 400).
* ✅ Erros de busca - Cidade ou Estado não encontrado (HTTP 404).
* ✅ Resiliência - Falha em serviços externos (HTTP 503/Degraded).

---

## Como Rodar o Projeto

1.  **Clonar o repositório:**
    ```bash
    git clone https://github.com/ryssaes/projeto-GeoClima.git
    ```
2.  **Instalar dependências:**
    ```bash
    cd backend
    npm install
    ```
3.  **Executar os testes:**
    ```bash
    npm test
    ```
4.  **Iniciar o servidor:**
    ```bash
    npm start
    ```

---

## Estrutura do Repositório

```text
├── frontend/       # Interface da aplicação
├── backend/        # Implementação técnica obrigatória
│   ├── src/        # Código-fonte (Express + TS)
│   ├── tests/      # Testes de integração (Jest)
│   └── docs/       # Coleção Postman
├── README.md       # Documentação principal
└── INTEGRANTES.md   # Dados da equipe
