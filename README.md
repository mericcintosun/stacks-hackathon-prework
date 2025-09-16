# 📝 Stacks Message Board

> A decentralized message board built on the Stacks blockchain, demonstrating smart contract interaction with a modern web interface.

[![Stacks](https://img.shields.io/badge/Stacks-Blockchain-purple?style=flat-square)](https://stacks.co)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Clarity](https://img.shields.io/badge/Clarity-Smart%20Contract-orange?style=flat-square)](https://clarity-lang.org)

## 🚀 Overview

Stacks Message Board is a decentralized application (dApp) that allows users to store and retrieve messages permanently on the Stacks blockchain. Each user can maintain one message at a time, demonstrating basic smart contract functionality with a professional web interface.

### ✨ Key Features

- **🔗 Wallet Integration** - Seamless connection with Leather and other Stacks wallets
- **📝 Message Storage** - Store up to 280 characters permanently on-chain
- **🔄 Real-time Updates** - Instant feedback and transaction status
- **🎨 Modern UI** - Clean, minimal design with excellent UX
- **⚡ Fast Transactions** - Optimized for Stacks testnet
- **🔒 Secure** - Non-custodial, your keys your data

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Smart Contract │    │   Stacks        │
│   (Next.js)     │◄──►│   (Clarity)     │◄──►│   Blockchain    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Smart Contract Functions

- `set-message` - Store a new message (max 280 chars)
- `get-my-message` - Retrieve your current message
- `get-message` - Read any user's message by address
- `clear-message` - Remove your message from the blockchain

## 🛠️ Tech Stack

**Smart Contract:**

- Clarity (Stacks smart contract language)
- Clarinet (Development environment)

**Frontend:**

- Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Stacks.js for blockchain interaction
- Leather Wallet integration

**Development:**

- Vitest for testing
- ESLint for code quality
- Git for version control

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- [Clarinet](https://docs.hiro.so/clarinet) for smart contract development
- [Leather Wallet](https://leather.io) browser extension

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/stacks-message-board.git
   cd stacks-message-board
   ```

2. **Install dependencies**

   ```bash
   # Install Clarinet dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Run smart contract tests**

   ```bash
   # From project root
   npm test
   ```

4. **Start development server**

   ```bash
   # From frontend directory
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🧪 Smart Contract Development

### Testing

```bash
# Run all tests
npm test

# Check contract syntax
clarinet check

# Deploy to devnet
clarinet integrate
```

### Contract Structure

```clarity
;; Constants
(define-constant ERR-EMPTY u101)
(define-constant ERR-TOO-LONG u100)

;; Data storage
(define-map messages principal (string-utf8 280))

;; Public functions
(define-public (set-message (content (string-utf8 280))))
(define-public (clear-message))

;; Read-only functions
(define-read-only (get-message (who principal)))
(define-read-only (get-my-message))
```

## 🌐 Frontend Development

### Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   └── styles/             # Global styles
├── public/                 # Static assets
└── package.json           # Dependencies
```

### Key Components

- `MessageBoard.tsx` - Main application interface
- `WalletConnection.tsx` - Wallet integration logic
- `TransactionStatus.tsx` - Transaction feedback

### Styling Philosophy

- **Minimal** - Clean, uncluttered interface
- **Accessible** - WCAG compliant, keyboard navigation
- **Responsive** - Mobile-first design
- **Professional** - Corporate-ready aesthetics

## 🚀 Deployment

### Smart Contract

```bash
# Deploy to testnet
clarinet deployments apply -p testnet

# Verify deployment
clarinet deployments describe -p testnet
```

### Frontend

```bash
# Build for production
npm run build

# Deploy to Vercel (recommended)
vercel --prod

# Or deploy to other platforms
npm run export
```

## 📖 Usage Guide

### For Users

1. **Connect Wallet** - Click "Connect Wallet" and approve connection
2. **Write Message** - Enter up to 280 characters
3. **Send to Blockchain** - Confirm transaction in your wallet
4. **View Message** - Your message is now stored permanently on-chain
5. **Update or Clear** - Modify or remove your message anytime

### For Developers

1. **Fork the Repository** - Start with this template
2. **Modify Smart Contract** - Add your business logic in Clarity
3. **Update Frontend** - Customize the UI for your use case
4. **Test Thoroughly** - Use the included test suite
5. **Deploy** - Launch on Stacks mainnet

## 🔧 Configuration

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST123...
NEXT_PUBLIC_CONTRACT_NAME=message-board
```

### Wallet Configuration

- Network: Stacks Testnet
- Get testnet STX: [Stacks Testnet Faucet](https://explorer.hiro.so/sandbox/faucet)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public functions
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Stacks Foundation](https://stacks.org) for the blockchain infrastructure
- [Hiro Systems](https://hiro.so) for development tools
- [Leather Wallet](https://leather.io) for wallet integration
- The Stacks community for inspiration and support

## 📞 Support

- **Documentation**: [Stacks Docs](https://docs.stacks.co)
- **Community**: [Stacks Discord](https://discord.gg/stacks)
- **Issues**: [GitHub Issues](https://github.com/yourusername/stacks-message-board/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/stacks-message-board/discussions)

---

<p align="center">
  <strong>Built with ❤️ for the Stacks ecosystem</strong>
</p>

<p align="center">
  <a href="https://stacks.co">🔗 Learn more about Stacks</a> •
  <a href="https://clarity-lang.org">📚 Clarity Documentation</a> •
  <a href="https://leather.io">💼 Get Leather Wallet</a>
</p>
