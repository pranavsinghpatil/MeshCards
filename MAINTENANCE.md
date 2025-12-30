# 🔧 Maintenance Mode - Quick Reference

## Enable Maintenance Mode

### Local:
```bash
# Edit frontend/.env
VITE_MAINTENANCE_MODE=true
```

### Vercel:
```
Dashboard → Settings → Environment Variables
Add: VITE_MAINTENANCE_MODE = true
Redeploy
```

## Disable Maintenance Mode

### Local:
```bash
# Edit frontend/.env
VITE_MAINTENANCE_MODE=false
```

### Vercel:
```
Dashboard → Settings → Environment Variables
Set: VITE_MAINTENANCE_MODE = false
Redeploy
```

## What's Included

✅ Beautiful animated design
✅ Developer quote & thoughts
✅ Buy Me a Coffee button
✅ Live elapsed timer
✅ Status updates (Upgrading, Features, Bugs)
✅ Contact information
✅ Estimated downtime
✅ Dark mode support
✅ Fully responsive

## Customize

**Quote**: Edit `MaintenancePage.tsx` line ~75
**Sponsor Link**: Edit `MaintenancePage.tsx` line ~123
**Email**: Edit `MaintenancePage.tsx` line ~157
**Time Estimate**: Edit `MaintenancePage.tsx` line ~167

## Files

- `frontend/src/pages/MaintenancePage.tsx`
- `frontend/src/App.tsx`
- `frontend/.env.example`

## Full Guide

See: `docs/maintenance-mode-guide.md`
