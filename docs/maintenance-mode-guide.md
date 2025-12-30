# Maintenance Mode - Setup Guide

## 🎨 Beautiful Maintenance Page

A stunning, fully-featured maintenance page with:
- ✨ Animated background elements
- ⏱️ Live elapsed time counter
- 💭 Developer quote and thoughts
- ☕ Sponsor/Support button (Buy Me a Coffee)
- 📊 Status cards (Upgrading, New Features, Bug Fixes)
- 💌 Contact information
- 🎯 Estimated downtime display
- 🌓 Dark mode support
- 📱 Fully responsive design

## 🚀 Quick Setup

### Enable Maintenance Mode:

#### For Local Development:
Edit `frontend/.env`:
```env
VITE_MAINTENANCE_MODE=true
```

#### For Production (Vercel):
1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Add or update:
   - Variable: `VITE_MAINTENANCE_MODE`
   - Value: `true`
4. **Redeploy** the frontend

### Disable Maintenance Mode:
Simply set to `false` or remove the variable:
```env
VITE_MAINTENANCE_MODE=false
```

## 📋 How It Works

### Automatic Detection:
```tsx
const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

if (isMaintenanceMode) {
  return <MaintenancePage />;
}
```

### All Routes Covered:
- When enabled, **ALL routes** show the maintenance page
- No access to any part of the app
- Clean, professional user experience

## 🎨 Page Features

### 1. Animated Elements
- Pulsing background gradients
- Bouncing wrench icon
- Spinning clock indicator
- Smooth transitions

### 2. Live Timer
- Shows elapsed time since page load
- Format: `MM:SS`
- Updates every second

### 3. Developer Quote
```
"Building tools that make learning easier is my passion. 
Every line of code is written with students in mind."
— Pranav Singh Patil, Creator of MeshCards
```

### 4. Status Cards
- **🚀 Upgrading**: Performance improvements
- **✨ New Features**: Adding cool stuff
- **🔧 Bug Fixes**: Squashing bugs

### 5. Support Section
- **Buy Me a Coffee** button
- Links to: `https://www.buymeacoffee.com/htclodkzgo`
- Prominent yellow/orange design
- Hover effects and animations

### 6. Contact Information
- Email: `talktopranav@cc.cc`
- "Need urgent help?" message
- Clickable mailto link

### 7. Time Information
- Estimated downtime: 15-30 minutes
- Last updated timestamp (IST)
- Auto-updates on page load

## 🎯 Customization

### Update Developer Quote:
Edit `frontend/src/pages/MaintenancePage.tsx`:
```tsx
<blockquote className="...">
  Your custom quote here
</blockquote>
<p className="...">
  — Your Name, Your Title
</p>
```

### Change Sponsor Link:
```tsx
<a href="https://www.buymeacoffee.com/yourname">
```

### Adjust Estimated Time:
```tsx
<span className="font-bold text-foreground">
  Your estimated time
</span>
```

### Update Contact Email:
```tsx
<a href="mailto:your@email.com">
  your@email.com
</a>
```

## 📱 Responsive Design

### Mobile (< 768px):
- Single column layout
- Smaller text sizes
- Optimized spacing
- Touch-friendly buttons

### Tablet (768px - 1024px):
- 2-column grid for status cards
- Medium text sizes
- Balanced layout

### Desktop (> 1024px):
- 3-column grid for status cards
- Large text sizes
- Maximum visual impact

## 🌓 Dark Mode Support

Automatically adapts to user's theme preference:
- Light mode: Bright, cheerful colors
- Dark mode: Elegant, easy on eyes
- Smooth transitions between modes

## 🎨 Color Scheme

### Primary Colors:
- Background gradients
- Animated blobs
- Icon highlights

### Status Cards:
- Blue: Upgrading
- Green: New Features
- Purple: Bug Fixes

### Support Section:
- Yellow/Orange gradient
- High visibility
- Warm, inviting feel

## 📊 User Experience

### What Users See:
1. **Immediate Feedback**: Clear "Under Maintenance" message
2. **Transparency**: What's being worked on
3. **Time Estimate**: When to come back
4. **Support Option**: How to help the project
5. **Contact Info**: For urgent needs

### What Users Feel:
- **Informed**: Know what's happening
- **Valued**: See developer's dedication
- **Patient**: Understand it's temporary
- **Supportive**: Option to contribute

## 🔧 Testing

### Test Locally:
1. Set `VITE_MAINTENANCE_MODE=true` in `.env`
2. Run `npm run dev`
3. Visit any route
4. Should see maintenance page

### Test in Production:
1. Set variable in Vercel
2. Redeploy
3. Visit your domain
4. Verify maintenance page shows

## 📝 Best Practices

### Before Enabling:
1. ✅ Announce maintenance on social media
2. ✅ Send email to active users (if applicable)
3. ✅ Update status page (if you have one)
4. ✅ Set realistic time estimate

### During Maintenance:
1. ✅ Monitor for urgent issues
2. ✅ Check email for critical requests
3. ✅ Update time estimate if needed
4. ✅ Test thoroughly before re-enabling

### After Maintenance:
1. ✅ Disable maintenance mode
2. ✅ Verify app works correctly
3. ✅ Announce completion
4. ✅ Thank users for patience

## 🚨 Emergency Disable

If you need to disable maintenance mode immediately:

### Via Vercel Dashboard:
1. Settings → Environment Variables
2. Delete `VITE_MAINTENANCE_MODE` or set to `false`
3. Redeploy (or wait for auto-deploy)

### Via Git:
1. Update `.env` file
2. Commit and push
3. Vercel auto-deploys

## 📈 Analytics

Consider adding analytics to track:
- How many users hit maintenance page
- Average time spent on page
- Click-through rate on sponsor button
- Email link clicks

Example with Google Analytics:
```tsx
useEffect(() => {
  // Track maintenance page view
  gtag('event', 'page_view', {
    page_title: 'Maintenance Page',
    page_location: window.location.href
  });
}, []);
```

## 🎁 Bonus Features

### Add Countdown Timer:
```tsx
const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes

useEffect(() => {
  const interval = setInterval(() => {
    setTimeLeft(prev => Math.max(0, prev - 1));
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### Add Progress Bar:
```tsx
<div className="w-full bg-muted rounded-full h-2">
  <div 
    className="bg-primary h-2 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

### Add Social Links:
```tsx
<div className="flex gap-4 justify-center">
  <a href="https://twitter.com/yourhandle">
    <Twitter className="w-6 h-6" />
  </a>
  <a href="https://github.com/yourname">
    <Github className="w-6 h-6" />
  </a>
</div>
```

## 📚 Files Modified

- ✅ `frontend/src/pages/MaintenancePage.tsx` - Main maintenance page
- ✅ `frontend/src/App.tsx` - Maintenance mode check
- ✅ `frontend/.env.example` - Environment variable documentation

## 🎯 Summary

You now have a **professional, beautiful maintenance page** that:
- Shows your dedication to the project
- Keeps users informed
- Provides support options
- Maintains brand consistency
- Works flawlessly on all devices

Simply toggle `VITE_MAINTENANCE_MODE=true` when you need it! 🚀
