# Auto-Update Unresponded Status - Cron Job

## Deskripsi
Function ini akan secara otomatis mengubah status aplikasi menjadi "unresponded" jika dalam 35 hari tidak ada perubahan status untuk aplikasi dengan status:
- `none`
- `applied`  
- `interview`

## Cara Kerja

### 1. Deployment di Vercel (Otomatis)
Jika Anda deploy di Vercel, cron job sudah dikonfigurasi di `vercel.json` untuk berjalan setiap hari pukul 00:00 UTC.

**Langkah setup:**
1. Deploy aplikasi ke Vercel
2. Di Vercel Dashboard, masuk ke Settings → Environment Variables
3. Tambahkan environment variable:
   - Key: `CRON_SECRET`
   - Value: (generate random string yang aman, misalnya dengan `openssl rand -base64 32`)

Vercel akan otomatis menjalankan endpoint `/api/cron/update-unresponded` setiap hari.

### 2. Manual Trigger (Development/Testing)
Anda bisa test function ini secara manual dengan memanggil endpoint:

```bash
# Tanpa authentication (untuk development)
curl http://localhost:3000/api/cron/update-unresponded

# Dengan authentication (production)
curl -H "Authorization: Bearer your-cron-secret" \
  https://your-domain.com/api/cron/update-unresponded
```

### 3. Menggunakan Cron Service Eksternal
Jika tidak deploy di Vercel, Anda bisa menggunakan service seperti:
- [cron-job.org](https://cron-job.org)
- [EasyCron](https://www.easycron.com)
- GitHub Actions

Konfigurasi untuk memanggil:
- URL: `https://your-domain.com/api/cron/update-unresponded`
- Method: GET atau POST
- Header: `Authorization: Bearer your-cron-secret`
- Schedule: `0 0 * * *` (setiap hari jam 00:00)

## Response Example

### Success Response
```json
{
  "success": true,
  "message": "Successfully updated 5 applications to 'unresponded'",
  "updatedCount": 5,
  "checkedStatuses": ["none", "applied", "interview"],
  "dayThreshold": 35
}
```

### Error Response
```json
{
  "error": "Unauthorized"
}
```

## Konfigurasi

### Environment Variables
- `CRON_SECRET`: Secret key untuk mengamankan endpoint (opsional tapi sangat direkomendasikan)

### Mengubah Schedule (Vercel)
Edit file `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/update-unresponded",
      "schedule": "0 0 * * *"  // Ubah sesuai kebutuhan
    }
  ]
}
```

Format schedule menggunakan cron syntax:
- `0 0 * * *` - Setiap hari jam 00:00 UTC
- `0 */12 * * *` - Setiap 12 jam
- `0 0 * * 0` - Setiap Minggu
- `0 0 1 * *` - Setiap tanggal 1

### Mengubah Threshold Hari
Untuk mengubah dari 35 hari ke nilai lain, edit file `src/app/api/cron/update-unresponded/route.ts`:
```typescript
// Ubah angka 35 ke nilai yang diinginkan
thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);
```

## Testing

### Local Development
1. Pastikan aplikasi berjalan: `npm run dev`
2. Buka browser atau gunakan curl:
   ```bash
   curl http://localhost:3000/api/cron/update-unresponded
   ```
3. Cek response untuk melihat berapa aplikasi yang diupdate

### Production Testing  
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  https://your-domain.vercel.app/api/cron/update-unresponded
```

## Monitoring
- Di Vercel Dashboard → Cron Jobs, Anda bisa melihat execution logs
- Setiap eksekusi akan mengembalikan jumlah aplikasi yang diupdate
- Check database `updatedAt` field untuk verifikasi

## Security
- Endpoint dilindungi dengan `CRON_SECRET` untuk mencegah akses tidak sah
- Hanya Vercel Cron atau request dengan header `Authorization: Bearer {CRON_SECRET}` yang bisa mengakses
- Untuk production, pastikan `CRON_SECRET` adalah random string yang kuat
