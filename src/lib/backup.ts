import { supabase } from "@/integrations/supabase/client";

export interface BackupData {
  version: string;
  exportedAt: string;
  userId: string;
  profile: {
    full_name: string;
    phone: string | null;
    email: string | null;
  } | null;
  tontines: Array<{
    id: string;
    name: string;
    description: string | null;
    amount: number;
    currency: string;
    frequency: string;
    total_members: number;
    start_date: string | null;
    created_at: string;
    members: Array<{
      id: string;
      name: string;
      phone: string | null;
      position: number;
      is_current_user: boolean | null;
    }>;
    contributions: Array<{
      id: string;
      from_member_id: string;
      to_member_id: string;
      amount: number;
      status: string;
      paid_at: string | null;
    }>;
  }>;
}

export async function exportBackup(userId: string): Promise<BackupData> {
  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("user_id", userId)
    .maybeSingle();

  // Fetch tontines with members
  const { data: tontines, error: tontinesError } = await supabase
    .from("tontines")
    .select(`
      id,
      name,
      description,
      amount,
      currency,
      frequency,
      total_members,
      start_date,
      created_at,
      tontine_members (
        id,
        name,
        phone,
        position,
        is_current_user
      )
    `)
    .eq("user_id", userId);

  if (tontinesError) throw tontinesError;

  // Fetch contributions for each tontine
  const tontinesWithContributions = await Promise.all(
    (tontines || []).map(async (tontine) => {
      const { data: contributions } = await supabase
        .from("contributions")
        .select("id, from_member_id, to_member_id, amount, status, paid_at")
        .eq("tontine_id", tontine.id);

      return {
        id: tontine.id,
        name: tontine.name,
        description: tontine.description,
        amount: Number(tontine.amount),
        currency: tontine.currency,
        frequency: tontine.frequency,
        total_members: tontine.total_members,
        start_date: tontine.start_date,
        created_at: tontine.created_at,
        members: tontine.tontine_members || [],
        contributions: (contributions || []).map((c) => ({
          ...c,
          amount: Number(c.amount),
        })),
      };
    })
  );

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    userId,
    profile,
    tontines: tontinesWithContributions,
  };
}

export function downloadBackup(data: BackupData, fileName: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(
  file: File,
  userId: string
): Promise<{ tontinesImported: number; membersImported: number }> {
  const text = await file.text();
  const data: BackupData = JSON.parse(text);

  // Validate backup file
  if (!data.version || !data.tontines) {
    throw new Error("Fichier de sauvegarde invalide");
  }

  let tontinesImported = 0;
  let membersImported = 0;

  // Import each tontine
  for (const tontine of data.tontines) {
    // Create tontine with new user_id
    const { data: newTontine, error: tontineError } = await supabase
      .from("tontines")
      .insert({
        user_id: userId,
        name: tontine.name,
        description: tontine.description,
        amount: tontine.amount,
        currency: tontine.currency,
        frequency: tontine.frequency,
        total_members: tontine.total_members,
        start_date: tontine.start_date,
      })
      .select()
      .single();

    if (tontineError) {
      console.error("Error importing tontine:", tontineError);
      continue;
    }

    tontinesImported++;

    // Map old member IDs to new ones
    const memberIdMap: Record<string, string> = {};

    // Import members
    for (const member of tontine.members) {
      const { data: newMember, error: memberError } = await supabase
        .from("tontine_members")
        .insert({
          tontine_id: newTontine.id,
          name: member.name,
          phone: member.phone,
          position: member.position,
          is_current_user: member.is_current_user,
        })
        .select()
        .single();

      if (!memberError && newMember) {
        memberIdMap[member.id] = newMember.id;
        membersImported++;
      }
    }

    // Import contributions with mapped member IDs
    for (const contribution of tontine.contributions) {
      const fromMemberId = memberIdMap[contribution.from_member_id];
      const toMemberId = memberIdMap[contribution.to_member_id];

      if (fromMemberId && toMemberId) {
        await supabase.from("contributions").insert({
          tontine_id: newTontine.id,
          from_member_id: fromMemberId,
          to_member_id: toMemberId,
          amount: contribution.amount,
          status: contribution.status,
          paid_at: contribution.paid_at,
        });
      }
    }
  }

  return { tontinesImported, membersImported };
}

export function parseBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Fichier invalide"));
      }
    };
    reader.onerror = () => reject(new Error("Erreur de lecture"));
    reader.readAsText(file);
  });
}
