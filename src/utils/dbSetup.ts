
import { supabase } from "@/integrations/supabase/client";
import { MOCK_DISTRICTS, MOCK_USERS, MOCK_CANDIDATES } from "@/services/mockData";

export const setupDatabase = async () => {
  console.log("Checking database setup...");
  
  try {
    // Check if districts table is empty
    const { count: districtCount, error: countError } = await supabase
      .from('districts')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      throw countError;
    }
    
    // If no districts found, seed the database
    if (districtCount === 0) {
      console.log("Seeding database with initial data...");
      
      // Add RLS policies to candidates table for admin access
      try {
        // This is needed to ensure admins can add candidates
        await supabase.rpc('create_admin_policies');
        console.log("Admin policies created successfully");
      } catch (policyError) {
        console.log("Admin policies might already exist or failed to create:", policyError);
      }
      
      // Seed districts and constituencies
      for (const district of MOCK_DISTRICTS) {
        // Insert district
        const { data: newDistrict, error: districtError } = await supabase
          .from('districts')
          .insert({ name: district.name })
          .select()
          .single();
          
        if (districtError) throw districtError;
        
        // Insert constituencies for this district
        if (newDistrict) {
          for (const constituency of district.constituencies) {
            const { error: constituencyError } = await supabase
              .from('constituencies')
              .insert({
                name: constituency,
                district_id: newDistrict.id
              });
              
            if (constituencyError) throw constituencyError;
          }
        }
      }
      
      // Seed mock users
      for (const user of MOCK_USERS) {
        // We can't directly check for existing users with email in listUsers
        // So we'll first try to get the user and only create if not found
        let userId = user.id;
        
        try {
          // Check if a user with this email already exists in the users table
          const { data: existingUserData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();
            
          // If user exists in our table, skip to the next iteration
          if (existingUserData) {
            console.log(`User with email ${user.email} already exists, skipping`);
            continue;
          }
          
          // Create auth user
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            password: 'password123', // Default password for mock users
            email_confirm: true
          });
          
          if (authError) {
            console.error("Error creating auth user:", authError);
            continue;
          }
          
          if (authUser && authUser.user) {
            userId = authUser.user.id;
          }
        } catch (error) {
          console.error("Error checking existing user:", error);
          continue;
        }
        
        // Get district and constituency ids
        const { data: districtData } = await supabase
          .from('districts')
          .select('id')
          .eq('name', user.district)
          .single();
          
        if (!districtData) continue;
        
        const { data: constituencyData } = await supabase
          .from('constituencies')
          .select('id')
          .eq('name', user.constituency)
          .eq('district_id', districtData.id)
          .single();
          
        if (!constituencyData) continue;
        
        // Create user profile
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            name: user.name,
            voter_id: user.voterId,
            district: user.district,
            constituency: user.constituency,
            email: user.email,
            phone: user.phone,
            wallet_address: user.walletAddress,
            has_voted: user.hasVoted
          });
          
        if (userError) console.error("Error creating user profile:", userError);
      }
      
      // Seed candidates
      for (const candidate of MOCK_CANDIDATES) {
        // Get district ID
        const { data: districtData } = await supabase
          .from('districts')
          .select('id')
          .eq('name', candidate.district)
          .single();
          
        if (!districtData) continue;
        
        // Get constituency ID
        const { data: constituencyData } = await supabase
          .from('constituencies')
          .select('id')
          .eq('name', candidate.constituency)
          .eq('district_id', districtData.id)
          .single();
          
        if (!constituencyData) continue;
        
        // Create candidate
        const { error: candidateError } = await supabase
          .from('candidates')
          .insert({
            name: candidate.name,
            party: candidate.party,
            district_id: districtData.id,
            constituency_id: constituencyData.id,
            symbol: candidate.symbol,
            vote_count: candidate.voteCount
          });
          
        if (candidateError) console.error("Error creating candidate:", candidateError);
      }
      
      console.log("Database seeded successfully");
    } else {
      console.log("Database already set up");
    }
    
    return true;
  } catch (error) {
    console.error("Error setting up database:", error);
    return false;
  }
};
