import { supabase } from '@/integrations/supabase/client';
import { Candidate, District } from '@/types';
import { toast } from 'sonner';

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
  party_leader: string | null;
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
        id, name, party, party_leader, district_id, constituency_id, symbol, image_url, vote_count,
        districts:district_id(name),
        constituencies:constituency_id(name)
      `);

    if (error) throw error;

    if (!candidatesData) return [];

    return candidatesData.map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      partyLeader: c.party_leader || undefined,
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
    console.log(`Fetching candidates for ${district}, ${constituency}`);
    const { data: districtData, error: districtError } = await supabase
      .from('districts')
      .select('id')
      .eq('name', district)
      .single();

    if (districtError) {
      console.error(`Error finding district '${district}':`, districtError);
      return [];
    }

    if (!districtData) {
      console.error(`District '${district}' not found`);
      return [];
    }

    const { data: constituencyData, error: constituencyError } = await supabase
      .from('constituencies')
      .select('id')
      .eq('name', constituency)
      .eq('district_id', districtData.id)
      .single();

    if (constituencyError) {
      console.error(`Error finding constituency '${constituency}' in district '${district}':`, constituencyError);
      return [];
    }

    if (!constituencyData) {
      console.error(`Constituency '${constituency}' not found in district '${district}'`);
      return [];
    }

    const { data: candidatesData, error } = await supabase
      .from('candidates')
      .select('id, name, party, party_leader, symbol, image_url, vote_count')
      .eq('district_id', districtData.id)
      .eq('constituency_id', constituencyData.id);

    if (error) {
      console.error('Error fetching candidates by constituency:', error);
      throw error;
    }

    if (!candidatesData) return [];

    console.log(`Found ${candidatesData.length} candidates`);
    
    return candidatesData.map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      partyLeader: c.party_leader || undefined,
      district: district,
      constituency: constituency,
      symbol: c.symbol,
      imageUrl: c.image_url,
      voteCount: c.vote_count || 0
    }));
  } catch (error) {
    console.error('Error fetching candidates by constituency:', error);
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
 * Gets all districts with constituencies
 */
export const getAllDistricts = async (): Promise<District[]> => {
  try {
    // First get all districts
    const { data: districtsData, error: districtError } = await supabase
      .from('districts')
      .select('*');
    
    if (districtError) {
      console.error('Error fetching districts:', districtError);
      throw districtError;
    }
    
    if (!districtsData || districtsData.length === 0) {
      console.log('No districts found in database');
      return [];
    }
    
    // Get constituencies for each district
    const districts: District[] = [];
    
    for (const district of districtsData) {
      const { data: constituenciesData, error: constituencyError } = await supabase
        .from('constituencies')
        .select('name')
        .eq('district_id', district.id);
      
      if (constituencyError) {
        console.error(`Error fetching constituencies for district ${district.name}:`, constituencyError);
        continue;
      }
      
      districts.push({
        id: district.id,
        name: district.name,
        constituencies: constituenciesData ? constituenciesData.map(c => c.name) : []
      });
    }
    
    console.log('Fetched districts from database:', districts);
    return districts;
  } catch (error) {
    console.error('Error fetching all districts:', error);
    return [];
  }
};

/**
 * Add Candidate
 */
export const addCandidate = async (candidateData: Partial<Candidate>, imageFile?: File): Promise<Candidate | null> => {
  try {
    console.log('Starting candidate registration with data:', candidateData);
    
    // Validate required fields
    if (!candidateData.name || !candidateData.party || 
        !candidateData.district || !candidateData.constituency) {
      toast.error('Incomplete Candidate Information', {
        description: 'Please fill in all required fields'
      });
      return null;
    }

    // Directly fetch district and constituency IDs
    const { data: districtData, error: districtError } = await supabase
      .from('districts')
      .select('id')
      .eq('name', candidateData.district)
      .single();

    if (districtError || !districtData) {
      toast.error('District Not Found', {
        description: `Could not find district: ${candidateData.district}`
      });
      return null;
    }

    const { data: constituencyData, error: constituencyError } = await supabase
      .from('constituencies')
      .select('id')
      .eq('name', candidateData.constituency)
      .eq('district_id', districtData.id)
      .single();

    if (constituencyError || !constituencyData) {
      toast.error('Constituency Not Found', {
        description: `Could not find constituency: ${candidateData.constituency}`
      });
      return null;
    }

    // Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadCandidateImage(imageFile);
    }

    // Prepare candidate data for insertion
    const candidateInsertData = {
      name: candidateData.name,
      party: candidateData.party,
      party_leader: candidateData.partyLeader || null,
      district_id: districtData.id,
      constituency_id: constituencyData.id,
      symbol: candidateData.symbol || '🏛️',
      image_url: imageUrl,
      vote_count: 0
    };

    // Insert candidate
    const { data: newCandidate, error: insertError } = await supabase
      .from('candidates')
      .insert(candidateInsertData)
      .select()
      .single();

    if (insertError) {
      toast.error('Candidate Registration Failed', {
        description: insertError.message
      });
      console.error('Candidate insertion error:', insertError);
      return null;
    }

    // Success toast
    toast.success('Candidate Registered', {
      description: `${newCandidate.name} has been successfully added`
    });

    // Return formatted candidate
    return {
      id: newCandidate.id,
      name: newCandidate.name,
      party: newCandidate.party,
      partyLeader: newCandidate.party_leader || undefined,
      district: candidateData.district,
      constituency: candidateData.constituency,
      symbol: newCandidate.symbol,
      imageUrl: newCandidate.image_url,
      voteCount: newCandidate.vote_count || 0
    };
  } catch (error) {
    console.error('Unexpected error in addCandidate:', error);
    toast.error('Registration Error', {
      description: 'An unexpected error occurred'
    });
    return null;
  }
};
