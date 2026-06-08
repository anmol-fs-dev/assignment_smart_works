import { Router, Request, Response } from 'express';
import { getCommits } from '../services/github';

const router = Router();

/**
 * GET /api/:owner/:repo/commits
 * Returns all commits with author/committer details, title, and comment count
 */
router.get('/:owner/:repo/commits', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo parameters are required' });
  }

  try {
    const commits = await getCommits(owner, repo);
    return res.json({
      repository: `${owner}/${repo}`,
      totalCommits: commits.length,
      commits,
    });
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data: unknown }; message: string };
    console.error(`Error fetching commits for ${owner}/${repo}:`, err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        error: 'GitHub API error',
        details: err.response.data,
      });
    }

    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
