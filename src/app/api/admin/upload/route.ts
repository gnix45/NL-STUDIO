import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/lib/supabase/server'

// Initialize Cloudinary with Env Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication Context securely using Supabase
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Session invalide ou non-autorisee' }, { status: 401 })
    }

    // 2. Extract file from the request
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier detecte.' }, { status: 400 })
    }

    // 3. Buffer Conversion
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 4. Cloudinary Stream Upload
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'nlstudio-assets', 
          // We can optionally format depending on what is uploaded but auto is perfect.
        },
        (error, result) => {
          if (error) {
             console.error("Cloudinary mapping error", error)
             reject(error)
          } else {
             resolve(result)
          }
        }
      )
      
      uploadStream.end(buffer)
    })

    return NextResponse.json({ url: (uploadResult as any).secure_url }, { status: 200 })

  } catch (error: any) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json({ error: error.message || 'Erreur interne de telechargement.' }, { status: 500 })
  }
}
