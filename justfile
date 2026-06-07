default:
    just --list

# -------------------------
# Install / setup
# -------------------------

install:
    pnpm install

prepare:
    pnpm run dev:prepare

# Run frontend + backend against cloud Supabase
run:
    pnpm run dev

# -------------------------
# Docker
# -------------------------

docker-build:
    pnpm --filter scripts docker-build

docker-compose-dev:
    docker compose -f backend/compose.dev.yml up -d

# -------------------------
# Clean up
# -------------------------

# Remove node_modules from every workspace folder + root
clean-modules:
    node -e "const fs=require('fs'); const paths=['node_modules','backend/node_modules','frontend/node_modules','scripts/node_modules','supabase/node_modules','cypress/node_modules','shared/node_modules']; for (const p of paths) { if (fs.existsSync(p)) { console.log('Removing', p); fs.rmSync(p,{recursive:true,force:true}); } }"

# Full dependency reset
reset-deps:
    just clean-modules
    pnpm install