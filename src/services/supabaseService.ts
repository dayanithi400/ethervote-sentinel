
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
 * District functions
 */
export const getDistricts = async (): Promise<District[]> => {
  try {
    const { data: districtsData, error: districtsError } = await supabase
      .from('districts')
      .select('*');

    if (districtsError) throw districtsError;

    // Fetch constituencies for each district
    const districts: District[] = [];
    
    for (const district of districtsData) {
      const { data: constituenciesData, error: constituenciesError } = await supabase
        .from('constituencies')
        .select('name')
        .eq('district_id', district.id);
        
      if (constituenciesError) throw constituenciesError;
      
      districts.push({
        id: district.id,
        name: district.name,
        constituencies: constituenciesData.map(c => c.name)
      });
    }
    
    return districts;
  } catch (error) {
    console.error('Error fetching districts:', error);
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
    // First, get district and constituency IDs
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
    
    // Now get candidates
    const { data: candidatesData, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('district_id', districtData.id)
      .eq('constituency_id', constituencyData.id);
    
    if (error) throw error;
    
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

export const getAllCandidates = async (): Promise<Candidate[]> => {
  try {
    const { data: candidatesData, error } = await supabase
      .from('candidates')
      .select(`
        *,
        districts(name),
        constituencies(name)
      `);
    
    if (error) throw error;
    
    return candidatesData.map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      district: c.districts.name,
      constituency: c.constituencies.name,
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
 * Upload candidate image to Supabase Storage
 */
export const uploadCandidateImage = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('candidate-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('candidate-images')
      .getPublicUrl(filePath);
      
    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

export const addCandidate = async (candidateData: Partial<Candidate>, imageFile?: File): Promise<Candidate | null> => {
  try {
    // Get district ID
    const { data: districtData } = await supabase
      .from('districts')
      .select('id')
      .eq('name', candidateData.district)
      .single();
      
    if (!districtData) return null;
    
    // Get constituency ID
    const { data: constituencyData } = await supabase
      .from('constituencies')
      .select('id')
      .eq('name', candidateData.constituency)
      .eq('district_id', districtData.id)
      .single();
      
    if (!constituencyData) return null;
    
    // Ensure we have a valid symbol (even if it's a custom one)
    const symbol = candidateData.symbol || '🏛️';
    
    // Upload image if provided
    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadCandidateImage(imageFile);
    }
    
    // Insert candidate
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
      .select(`
        *,
        districts(name),
        constituencies(name)
      `)
      .single();
    
    if (error) throw error;
    
    return {
      id: newCandidate.id,
      name: newCandidate.name,
      party: newCandidate.party,
      district: newCandidate.districts.name,
      constituency: newCandidate.constituencies.name,
      symbol: newCandidate.symbol,
      imageUrl: newCandidate.image_url,
      voteCount: newCandidate.vote_count || 0
    };
  } catch (error) {
    console.error('Error adding candidate:', error);
    return null;
  }
};

/**
 * Vote functions
 */
export const castVote = async (voteData: Partial<VoteData>): Promise<VoteData | null> => {
  try {
    // Begin transaction
    const { error: transactionError } = await supabase.rpc('begin_transaction');
    if (transactionError) throw transactionError;
    
    // Get user to check if already voted
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('has_voted')
      .eq('voter_id', voteData.voterId)
      .single();
      
    if (userError) throw userError;
    if (userData.has_voted) {
      throw new Error('User has already voted');
    }
    
    // Get district and constituency IDs
    const { data: districtData } = await supabase
      .from('districts')
      .select('id')
      .eq('name', voteData.district)
      .single();
      
    const { data: constituencyData } = await supabase
      .from('constituencies')
      .select('id')
      .eq('name', voteData.constituency)
      .single();
    
    // Create vote record
    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        voter_id: voteData.voterId || '',
        candidate_id: voteData.candidateId || '',
        district_id: districtData?.id || '',
        constituency_id: constituencyData?.id || '',
        timestamp: new Date().toISOString(),
        transaction_hash: voteData.transactionHash || '0x'
      })
      .select()
      .single();
      
    if (voteError) throw voteError;
    
    // Update candidate vote count
    const { error: updateError } = await supabase.rpc('increment_vote_count', {
      candidate_id: voteData.candidateId
    });
    
    if (updateError) throw updateError;
    
    // Update user has_voted status
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ has_voted: true })
      .eq('voter_id', voteData.voterId);
      
    if (userUpdateError) throw userUpdateError;
    
    // Commit transaction
    const { error: commitError } = await supabase.rpc('commit_transaction');
    if (commitError) throw commitError;
    
    return {
      voterId: newVote.voter_id,
      candidateId: newVote.candidate_id,
      district: voteData.district || '',
      constituency: voteData.constituency || '',
      timestamp: Date.parse(newVote.timestamp),
      transactionHash: newVote.transaction_hash
    };
  } catch (error) {
    // Rollback transaction
    await supabase.rpc('rollback_transaction');
    console.error('Error casting vote:', error);
    return null;
  }
};

export const getResults = async (): Promise<Candidate[]> => {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        districts(name),
        constituencies(name)
      `)
      .order('vote_count', { ascending: false });
    
    if (error) throw error;
    
    return data.map(c => ({
      id: c.id,
      name: c.name,
      party: c.party,
      district: c.districts.name,
      constituency: c.constituencies.name,
      symbol: c.symbol,
      imageUrl: c.image_url,
      voteCount: c.vote_count || 0
    }));
  } catch (error) {
    console.error('Error fetching results:', error);
    return [];
  }
};
