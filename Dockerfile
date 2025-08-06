# Base image (Node 20 là ổn định cho Next.js mới)
FROM node:20-alpine

# Cài pnpm global
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy file manifest trước để cache tốt hơn (giảm thời gian build lại)
COPY package.json pnpm-lock.yaml ./

# Cài dependencies
RUN pnpm install --frozen-lockfile

# Copy toàn bộ code vào
COPY . .

# Build app
RUN pnpm build

# Expose port (Next.js mặc định là 3000)
EXPOSE 3000

# Lệnh chạy production
CMD ["pnpm", "start"]
