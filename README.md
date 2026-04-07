# ArcPay Treasury

ArcPay Treasury is a production-oriented Next.js dashboard for managing ARC Testnet USDC treasury activity with MetaMask and `ethers.js`.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Lucide React
- ethers.js

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env.local
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Environment variables

All runtime configuration is exposed through public environment variables because the wallet and chain settings are used in client-side code.

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_ARC_CHAIN_ID` | ARC Testnet chain ID |
| `NEXT_PUBLIC_ARC_CHAIN_NAME` | Chain label shown in the UI |
| `NEXT_PUBLIC_ARC_RPC_URL` | ARC RPC endpoint |
| `NEXT_PUBLIC_ARC_EXPLORER_URL` | Block explorer base URL |
| `NEXT_PUBLIC_ARC_NATIVE_CURRENCY_NAME` | Native fee token name |
| `NEXT_PUBLIC_ARC_NATIVE_CURRENCY_SYMBOL` | Native fee token symbol |
| `NEXT_PUBLIC_ARC_NATIVE_CURRENCY_DECIMALS` | Native fee token decimals |
| `NEXT_PUBLIC_ARC_USDC_ADDRESS` | ARC USDC contract address |
| `NEXT_PUBLIC_ARC_USDC_DECIMALS` | ARC USDC decimals |
| `NEXT_PUBLIC_ARC_USDC_SYMBOL` | Treasury token symbol |
| `NEXT_PUBLIC_ARC_HISTORY_BLOCK_WINDOW` | Number of recent blocks queried for transfer history |

## Quality checks

Run the production checks locally before deploying:

```bash
npm run typecheck
npm run build
```

Or run both together:

```bash
npm run check
```

## Vercel deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. In the Vercel project settings, add the variables from `.env.example`.
4. Set the Framework Preset to `Next.js` if Vercel does not detect it automatically.
5. Deploy.

Default Vercel settings are sufficient for this project:

- Build command: `npm run build`
- Output directory: `.next`
- Install command: `npm install`

## Production notes

- `reactStrictMode` is enabled for safer React behavior during development.
- `poweredByHeader` is disabled.
- Lucide imports are optimized in the Next.js build config.
- ARC network values have safe defaults, but Vercel environment variables should still be set explicitly for production.
