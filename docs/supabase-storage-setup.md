# Supabase Storage Setup for Deck Files

## Overview
MeshCards stores generated .apkg files differently based on environment:
- **Development**: Files stored in local `decks/` folder
- **Production**: Files stored in Supabase Storage

## Supabase Storage Setup

### 1. Create Storage Bucket

In your Supabase dashboard:

1. Go to **Storage** section
2. Click **New bucket**
3. Bucket name: `deck-files`
4. **Public bucket**: `No` (keep it private)
5. Click **Create bucket**

### 2. Set Up Row Level Security (RLS) Policies

Since we're storing files globally (not per-user access), we need a simple policy:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deck-files');

-- Allow service role to manage all files
CREATE POLICY "Service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'deck-files');
```

### 3. Environment Variables

Make sure your `.env` file has:

```env
ENV=production  # Set to 'production' to use Supabase Storage
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key-here
```

## How It Works

### File Storage Path
Files are stored with this structure:
```
deck-files/
├── user_id_1/
│   ├── 20251228_154500_Biology_Chapter_5.apkg
│   └── 20251228_160000_Chemistry_Notes.apkg
├── user_id_2/
│   └── 20251228_155000_Math_Formulas.apkg
└── anonymous/
    └── 20251228_154000_Test_Deck.apkg
```

### Storage Module (`backend/core/storage.py`)

The `DeckStorage` class automatically:
- Detects environment (dev vs prod)
- Stores locally in dev
- Stores to Supabase in prod
- Handles errors gracefully (won't break deck generation if storage fails)

### Usage in Code

```python
from backend.core.storage import get_deck_storage

# Store a deck
storage = get_deck_storage()
storage_path = storage.store_deck(
    file_path="/tmp/deck.apkg",
    deck_name="Biology_Chapter_5.apkg",
    user_id="user-uuid-here"
)

# Get download URL (production only)
download_url = storage.get_download_url(storage_path, user_id)
```

## Storage Limits

### Supabase Free Tier
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/month
- **File uploads**: Unlimited

### Recommendations
- Monitor storage usage in Supabase dashboard
- Consider implementing auto-cleanup for old files
- Average .apkg file: 1-5 MB
- Free tier can store ~200-1000 decks

## Troubleshooting

### Files not uploading to Supabase
1. Check `ENV=production` in `.env`
2. Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
3. Check Supabase dashboard for bucket existence
4. Review RLS policies

### Local storage not working
1. Check `decks/` folder exists
2. Verify write permissions
3. Check logs for error messages

## Future Enhancements

- [ ] Add deck history table to track all uploads
- [ ] Implement auto-cleanup of old decks
- [ ] Add user deck library feature
- [ ] Track storage usage per user
