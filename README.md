# GitHub Dev Analytics - Backend 🛠️

Este é o repositório do **Backend** da plataforma GitHub Dev Analytics, construído em **NestJS** (Node.js com TypeScript). Ele oferece serviços de autenticação JWT segura, persistência de dados no PostgreSQL e uma camada inteligente de consumo da API do GitHub com cache integrado.

---

## 👨‍💻 Dados de Contato

*   **Nome:** Júnior Dering
*   **E-mail:** juniordering@hotmail.com
*   **GitHub:** [https://github.com/orloke](https://github.com/orloke)

---

## 🛠️ Tecnologias Utilizadas e Justificativas

1.  **NestJS (v11)**:
    *   *Justificativa:* Framework robusto, escalável e opinativo que utiliza injeção de dependências e arquitetura modular (Controllers, Services, Modules). Facilita o desacoplamento de responsabilidades e garante código limpo.
2.  **Prisma ORM (v7)**:
    *   *Justificativa:* Um ORM moderno e 100% type-safe. No Prisma 7, a configuração foi desacoplada em `prisma.config.ts`, deixando o schema limpo e facilitando o gerenciamento do banco em ambientes dockerizados.
3.  **PostgreSQL**:
    *   *Justificativa:* Banco de dados relacional de alta confiabilidade, ideal para persistência de dados de usuários e credenciais de forma íntegra.
4.  **JWT & Passport**:
    *   *Justificativa:* Implementação de autenticação apátrida (stateless) padrão da indústria, garantindo segurança na troca de dados entre o frontend e a API.
5.  **NestJS Cache Manager (in-memory)**:
    *   *Justificativa:* Implementa um cache temporário (10 minutos) para requisições de perfil e repositórios do GitHub. Isso resolve o problema de **Rate Limiting** da API pública não autenticada do GitHub.
6.  **Bcrypt**:
    *   *Justificativa:* Biblioteca criptográfica padrão para hashing seguro de senhas de usuários.

---

## 📝 Descrição da Solução Proposta

O backend expõe uma API RESTful estruturada para atender às necessidades de autenticação e consulta de dados:
*   **Módulo de Autenticação (`/auth`)**: Rotas `/auth/register` (cadastro) e `/auth/login` (login) com validações rígidas de DTOs e geração de tokens JWT válidos por 1 dia.
*   **Módulo do GitHub (`/github`)**: Rota privada `/github/stats/:username` protegida por um Guard JWT que consome e consolida dados de perfil, quantidade de estrelas, forks, repositórios em destaque e faz a contagem de linguagens do usuário do GitHub.
*   **Módulo de Banco de Dados**: Serviços encapsulados para fácil manutenção e migração de esquemas.

---

## 🚀 Instruções de Instalação e Execução

### 1. Requisitos Prévios
*   **Node.js** (versão 20 ou superior)
*   **Docker** e **Docker Compose**

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz da pasta `backend`:
```env
PORT=3001
JWT_SECRET="tendencias_jwt_secret_key_123456!"
DATABASE_URL="postgresql://tendencias_user:tendencias_password@localhost:5433/tendencias_db?schema=public"
# Opcional (aumenta o limite de chamadas da API do GitHub):
# GITHUB_PAT="seu_personal_access_token_do_github"
```

### 3. Instalação e Geração do Prisma
```bash
npm install
npx prisma generate
```

### 4. Executar as Migrations
Com o container do PostgreSQL rodando (porta local 5433), crie as tabelas:
```bash
npx prisma migrate dev --name init
```

### 5. Iniciar o Servidor
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### 6. Executar via Docker Localmente
Se preferir rodar o backend encapsulado:
```bash
# Compilar a imagem
docker build -t tendencias-backend .

# Rodar o contêiner
docker run -p 8080:8080 -e DATABASE_URL="SUA_URL_DO_POSTGRESQL" tendencias-backend
```

---

## 📐 Arquitetura e Decisões Técnicas

*   **Validações e Validador Global**:
    A API rejeita qualquer corpo de requisição malformado usando o `ValidationPipe` do NestJS. O linter do TypeScript foi ajustado com boas práticas para evitar atribuições do tipo `any` sem tipagem definida.
*   **Separação por Módulos**:
    Módulos isolados (`AuthModule`, `UsersModule`, `GithubModule`, `PrismaModule`) que exportam apenas o necessário, facilitando a criação de testes de integração com `supertest` no futuro.
*   **Configurabilidade do Endpoint do GitHub**:
    A URL base do GitHub foi movida para uma propriedade de classe dinâmica que lê `process.env.GITHUB_API_URL || 'https://api.github.com'`. Isso permite simular a API com mocks locais em ambientes de teste.

---

## 📖 Documentação da API (Swagger)

A API possui documentação interativa automatizada com o **Swagger**. 

Ao rodar a aplicação, acesse a rota abaixo para visualizar todos os endpoints disponíveis, schemas e realizar requisições de teste diretamente da página:
👉 **[http://localhost:3001/api](http://localhost:3001/api)** *(ou porta correspondente em produção)*

