
import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your actual Supabase project URL and Anon Key
// It is best practice to use environment variables (e.g., import.meta.env.VITE_SUPABASE_URL)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cvhdrzalwbficelkhvgs.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aGRyemFsd2JmaWNlbGtodmdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NzAyMTIsImV4cCI6MjA4MjE0NjIxMn0.kYuT6nNlAwEKfHnXjNt4rWsjwNpe-svhxRt_1StTN5Q'

export const supabase = createClient(supabaseUrl, supabaseKey)
