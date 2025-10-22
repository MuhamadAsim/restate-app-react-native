import { createClient } from '@supabase/supabase-js'

// 🔑 Replace these with your Supabase credentials
const SUPABASE_URL = 'https://pwdzucndbodyjivocima.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZHp1Y25kYm9keWppdm9jaW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDcxMjAsImV4cCI6MjA3NjUyMzEyMH0.6boIXYA7iDCVJLqrRcVGIysVUx12L8bElJuDAtv8wzE'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
