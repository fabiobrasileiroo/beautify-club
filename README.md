# 💇‍♀️ Beautify Club

> Um "Gympass" para salões de beleza e barbearias — acesso ilimitado a bem-estar, com tecnologia, dados e experiência integrada.

## ✨ Visão Geral

O Beautify Club é uma plataforma que conecta usuários a estabelecimentos de beleza e bem-estar, permitindo agendamentos ilimitados através de um sistema de assinatura. Inspirado no modelo do **Gympass**, com monetização por mensalidade, comissão de uso, workshops, e dashboards de gestão.

## 🛠️ Tecnologias Utilizadas

- **Next.js** – Framework React para SSR/SSG
- **Tailwind CSS** – Design com tema _Pastel Moderno_ (cores suaves, acolhedoras e elegantes)
- **Prisma ORM** – Acesso ao banco de dados MySQL com `snake_case` mappings
- **MySQL** – Banco de dados relacional
- **Mercado Pago** – Processamento de pagamentos
- **Clerk** – Autenticação e autorização com Google, LinkedIn e Apple

## 🎨 Paleta de Cores (Pastel Moderno)

| Função           | Cor (HEX) | Uso sugerido                             |
|------------------|-----------|-------------------------------------------|
| Primária         | #F3E8FF   | Fundo geral, seções principais            |
| Secundária       | #D8B4FE   | Componentes de navegação, cards           |
| Accent (Destaque)| #A78BFA   | Botões principais, links destacados       |
| Neutra Clara     | #FFFFFF   | Texto sobre fundos coloridos             |
| Neutra Escura    | #4C1D95   | Títulos e textos principais               |

## 📦 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/fabiobrasileiroo/beautify-club.git
   cd beautify-club
  ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Configure variáveis de ambiente**
   Crie um arquivo `.env.local` com base no `.env.example`:

   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/beautifyclub"
   CLERK_FRONTEND_API="..."
   CLERK_API_KEY="..."
   MP_ACCESS_TOKEN="..."
   ```

4. **Rode as migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

5. **Inicie o servidor**

   ```bash
   npm run dev
   ```

## 🔐 Autenticação

A autenticação é gerenciada com **Clerk**. Os usuários podem entrar com:

* Google
* LinkedIn
* Apple

As rotas e dados são protegidos com `userId`, garantindo que cada operação seja segura e isolada.

## 💳 Pagamentos

Integração com **Mercado Pago** para:

* Assinaturas
* Agendamentos pagos
* Workshops

Preferências de pagamento são criadas via SDK e integradas à experiência do usuário.

## 📊 Funcionalidades

* 🔐 Login com redes sociais
* 📍 Busca de salões parceiros
* 📅 Agendamentos ilimitados via assinatura
* 💰 Pagamentos e comissões automatizadas
* 🎓 Workshops e eventos
* 📈 Dashboards analíticos para parceiros

## 🧱 Estrutura de Diretórios (parcial)

```
📁 prisma/
   └── schema.prisma
📁 pages/
   ├── api/
   ├── dashboard/
   └── index.tsx
📁 components/
📁 styles/
   └── globals.css
.env.local
tailwind.config.js
```

## 🚀 Deploy

* Pode ser feito via **Vercel**, basta importar o projeto e configurar as variáveis de ambiente.
* Suporte nativo ao SSR e rotas protegidas via Clerk.

## 📄 Licença

Este projeto é open-source e pode ser usado para fins educacionais ou comerciais conforme os termos da [MIT License](LICENSE).

---

Desenvolvido com 💜 por Fábio Brasileiro

