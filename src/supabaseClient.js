// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://guexeirmwxdocawfccph.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1ZXhlaXJtd3hkb2Nhd2ZjY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzODM0MTAsImV4cCI6MjA2ODk1OTQxMH0.LD0MhDFzchCq9hqBXUY6NDTQjx_hZTUGIukyVcAv0eI";

export const supabase = createClient(supabaseUrl, supabaseKey);

