
import { supabase } from '@/integrations/supabase/client';
import { User, Candidate, District, VoteData } from '@/types';

// Type for Supabase responses
type DbDistrict = {
  id: string;
  name: string;
  created_at: string;
};

type DbConstituency = {
  id: string;
  name: string;
  district_id: string;
  created_at: string;
};

type DbCandidate = {
  id: string;
  name: string;
  party: string;
  district_id: string;
  constituency_id: string;
  symbol: string;
  image_url: string | null;
  vote_count: number;
  created_at: string;
};

type DbUser = {
  id: string;
  name: string;
  voter_id: string;
  district: string;
  constituency: string;
  email: string;
  phone: string;
  wallet_address: string | null;
  has_voted: boolean | null;
  created_at: string;
};

type DbVote = {
  id: string;
  voter_id: string;
  candidate_id: string;
  district_id: string;
  constituency_id: string;
  timestamp: string;
  transaction_hash: string;
};

/**
 * Get all candidates with district and constituency names
 */
export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const { data: candidatesData, error } = await supabase
      .from('candidates')
      .select(`
        id, name, party, district_id, constituency_id, symbol, image_url, vote_count,
        districts:district_id(name),
        constituencies:constituency_id(name)
      `);

    if (error) throw error;

    if (!candidatesData) return [];

    return candidatesData.map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      district: c.districts?.name || '',
      constituency: c.constituencies?.name || '',
      symbol: c.symbol,
      imageUrl: c.image_url,
      voteCount: c.vote_count || 0
    }));
  } catch (error) {
    console.error('Error fetching all candidates:', error);
    return [];
  }
};

/**
 * Candidate functions
 */
export const getCandidatesByConstituency = async (
  district: string,
  constituency: string
): Promise<Candidate[]> => {
  try {
    const { data: districtData } = await supabase
      .from('districts')
      .select('id')
      .eq('name', district)
      .single();

    if (!districtData) return [];

    const { data: constituencyData } = await supabase
      .from('constituencies')
      .select('id')
      .eq('name', constituency)
      .eq('district_id', districtData.id)
      .single();

    if (!constituencyData) return [];

    const { data: candidatesData, error } = await supabase
      .from('candidates')
      .select('id, name, party, symbol, image_url, vote_count')
      .eq('district_id', districtData.id)
      .eq('constituency_id', constituencyData.id);

    if (error) throw error;

    if (!candidatesData) return [];

    return candidatesData.map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      district: district,
      constituency: constituency,
      symbol: c.symbol,
      imageUrl: c.image_url,
      voteCount: c.vote_count || 0
    }));
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

/**
 * Creates a storage bucket for candidate images if it doesn't exist
 */
const ensureCandidateImagesBucket = async (): Promise<void> => {
  try {
    // Check if bucket exists first
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'candidate-images');
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket('candidate-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif']
      });
      
      if (error) throw error;
      console.log('Created candidate-images bucket');
    }
  } catch (error) {
    console.error('Error ensuring candidate images bucket exists:', error);
  }
};

/**
 * Upload candidate image to Supabase Storage
 */
export const uploadCandidateImage = async (file: File): Promise<string | null> => {
  try {
    // Make sure the bucket exists
    await ensureCandidateImagesBucket();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('candidate-images')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error details:', error);
      throw error;
    }

    if (!data) {
      console.error('No data returned from upload');
      return null;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('candidate-images')
      .getPublicUrl(filePath);

    console.log('Uploaded image, public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Add Candidate
 */
export const addCandidate = async (candidateData: Partial<Candidate>, imageFile?: File): Promise<Candidate | null> => {
  try {
    const { data: districtData } = await supabase
      .from('districts')
      .select('id')
      .eq('name', candidateData.district)
      .single();

    if (!districtData) return null;

    const { data: constituencyData } = await supabase
      .from('constituencies')
      .select('id')
      .eq('name', candidateData.constituency)
      .eq('district_id', districtData.id)
      .single();

    if (!constituencyData) return null;

    const symbol = candidateData.symbol || '🏛️';
    let imageUrl = null;
    
    // Upload image if provided
    if (imageFile) {
      imageUrl = await uploadCandidateImage(imageFile);
      console.log("Image uploaded with URL:", imageUrl);
    }

    const { data: newCandidate, error } = await supabase
      .from('candidates')
      .insert({
        name: candidateData.name || '',
        party: candidateData.party || '',
        district_id: districtData.id,
        constituency_id: constituencyData.id,
        symbol: symbol,
        image_url: imageUrl,
        vote_count: 0
      })
      .select('id, name, party, symbol, image_url, vote_count')
      .single();

    if (error) throw error;

    if (!newCandidate) return null;

    return {
      id: newCandidate.id,
      name: newCandidate.name,
      party: newCandidate.party,
      district: candidateData.district || '',
      constituency: candidateData.constituency || '',
      symbol: newCandidate.symbol,
      imageUrl: newCandidate.image_url,
      voteCount: newCandidate.vote_count || 0
    };
  } catch (error) {
    console.error('Error adding candidate:', error);
    return null;
  }
};
