export type Poll = {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  created_at: string;
};

export type Vote = {
  id: string;
  poll_id: string;
  option_index: number;
  voter_name: string;
  created_at: string;
};

export type StoredVote = {
  voted: true;
  voteId: string;
  voterName: string;
  optionIndex: number;
};
