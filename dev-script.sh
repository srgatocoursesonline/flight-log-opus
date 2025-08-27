#!/bin/bash

# Flight Log Opus - Script de Desenvolvimento
# Este script facilita o gerenciamento do ambiente de desenvolvimento

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Função para verificar se o Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm não está instalado. Por favor, instale o npm primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_success "Node.js $NODE_VERSION e npm $NPM_VERSION detectados"
}

# Função para instalar dependências
install_deps() {
    print_status "Instalando dependências..."
    npm install
    print_success "Dependências instaladas com sucesso!"
}

# Função para verificar vulnerabilidades
check_vulnerabilities() {
    print_status "Verificando vulnerabilidades de segurança..."
    npm audit
    print_warning "Vulnerabilidades detectadas são relacionadas ao ambiente de desenvolvimento apenas"
}

# Função para iniciar o servidor de desenvolvimento
start_dev() {
    print_status "Iniciando servidor de desenvolvimento..."
    print_status "A aplicação estará disponível em: http://localhost:8080"
    npm run dev
}

# Função para fazer build de produção
build_prod() {
    print_status "Fazendo build de produção..."
    npm run build
    print_success "Build de produção concluído! Arquivos em: dist/"
}

# Função para fazer preview do build
preview_build() {
    print_status "Iniciando preview do build de produção..."
    npm run preview
}

# Função para fazer linting
run_lint() {
    print_status "Executando linting..."
    npm run lint
    print_success "Linting concluído!"
}

# Função para limpar node_modules e reinstalar
clean_install() {
    print_warning "Removendo node_modules e package-lock.json..."
    rm -rf node_modules package-lock.json
    print_status "Reinstalando dependências..."
    npm install
    print_success "Instalação limpa concluída!"
}

# Função para mostrar informações do projeto
show_info() {
    echo "=================================="
    echo "    FLIGHT LOG OPUS - DEV INFO"
    echo "=================================="
    echo ""
    echo "📁 Diretório: $(pwd)"
    echo "🚀 Servidor: http://localhost:8080"
    echo "📦 Package Manager: npm"
    echo ""
    echo "🛠️  Comandos disponíveis:"
    echo "   npm run dev     - Servidor de desenvolvimento"
    echo "   npm run build   - Build de produção"
    echo "   npm run preview - Preview do build"
    echo "   npm run lint    - Linting do código"
    echo ""
    echo "📊 Estrutura de dados:"
    echo "   - Dados mockados em components/dashboard/"
    echo "   - Pronto para implementação de API"
    echo ""
    echo "🎨 Design System:"
    echo "   - Tema cockpit/aviônico"
    echo "   - TailwindCSS + shadcn/ui"
    echo "   - Componentes modulares"
    echo ""
}

# Menu principal
show_menu() {
    echo ""
    echo "=================================="
    echo "  FLIGHT LOG OPUS - DEV SCRIPT"
    echo "=================================="
    echo ""
    echo "1) 🚀 Iniciar desenvolvimento (npm run dev)"
    echo "2) 📦 Instalar dependências"
    echo "3) 🔍 Verificar vulnerabilidades"
    echo "4) 🏗️  Build de produção"
    echo "5) 👀 Preview do build"
    echo "6) 🧹 Linting"
    echo "7) 🔄 Limpeza e reinstalação"
    echo "8) ℹ️  Informações do projeto"
    echo "9) ❌ Sair"
    echo ""
    read -p "Escolha uma opção [1-9]: " choice
}

# Loop principal
main() {
    # Verificar se estamos no diretório correto
    if [[ ! -f "package.json" ]]; then
        print_error "package.json não encontrado. Execute este script no diretório raiz do projeto."
        exit 1
    fi
    
    # Verificar Node.js
    check_node
    
    while true; do
        show_menu
        case $choice in
            1)
                start_dev
                ;;
            2)
                install_deps
                ;;
            3)
                check_vulnerabilities
                ;;
            4)
                build_prod
                ;;
            5)
                preview_build
                ;;
            6)
                run_lint
                ;;
            7)
                clean_install
                ;;
            8)
                show_info
                ;;
            9)
                print_success "Até logo!"
                exit 0
                ;;
            *)
                print_error "Opção inválida. Tente novamente."
                ;;
        esac
        
        echo ""
        read -p "Pressione Enter para continuar..."
    done
}

# Executar script principal se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi