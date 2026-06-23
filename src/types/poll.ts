export type CoursePoll = {
  id: string;
  question: string;
  options: string[];
  is_active: boolean;
  created_at: string;
};

export type CourseVote = {
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

export function livepollVoteKey(pollId: string): string {
  return `livepoll_vote_${pollId}`;
}

export function aggregateVoteCounts(
  votes: Pick<CourseVote, "option_index">[],
  optionCount: number,
): number[] {
  const counts = Array.from({ length: optionCount }, () => 0);

  for (const vote of votes) {
    if (vote.option_index >= 0 && vote.option_index < optionCount) {
      counts[vote.option_index] += 1;
    }
  }

  return counts;
}
