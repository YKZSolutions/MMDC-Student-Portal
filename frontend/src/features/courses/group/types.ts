// --- Student group definitions ---
export interface StudentGroup {
  id: string
  name: string
  memberIds: string[]  // current members (live state)
}

// --- Historical audit of group membership ---
export interface GroupMembership {
  studentId: string
  groupId: string
  joinedAt: string
  leftAt?: string
}