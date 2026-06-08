import { Router, Request, Response } from 'express';
import { getCommitComments } from '../services/github';

const router = Router();

/**
 * GET /api/:owner/:repo/comments
 * Returns all commit comments with commenter details and commit SHA
 */
router.get('/:owner/:repo/comments', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo parameters are required' });
  }

  try {
    const comments = await getCommitComments(owner, repo);
    return res.json({
      repository: `${owner}/${repo}`,
      totalComments: comments.length,
      comments,
    });
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data: unknown }; message: string };
    console.error(`Error fetching comments for ${owner}/${repo}:`, err.message);

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
