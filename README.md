# Dark Coffee

Run locally and share on your LAN.

## Requirements
- Node.js >= 18.18 (Node 20+ recommended)
- npm

## Install
```bash
npm install
```

## Development
Local only:
```bash
npm run dev
```

Local + LAN (auto-binds 0.0.0.0 and picks a free port):
```bash
npm run lan
```

## Production
```bash
npm run build
npm run lan:prod
```

## Notes
- LAN URL will look like: `http://<your-ip>:<port>`
- If other devices cannot reach the site, allow the port in Windows Firewall (PowerShell as Administrator):
```powershell
New-NetFirewallRule -DisplayName "NextJS Port 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
```


