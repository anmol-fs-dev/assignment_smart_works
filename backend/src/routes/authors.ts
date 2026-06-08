import { Router, Request, Response } from 'express';
import { getAuthors } from '../services/github';

const router = Router();

/**
 * GET /api/:owner/:repo/authors
 * Returns unique commit authors with avatar, username, URL, and commit count
 */
router.get('/:owner/:repo/authors', async (req: Request, res: Response) => {
  const { owner, repo } = req.params;

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo parameters are required' });
  }

  try {
    const authors = await getAuthors(owner, repo);
    return res.json({
      repository: `${owner}/${repo}`,
      totalAuthors: authors.length,
      authors,
    });
  } catch (error: unknown) {
    const err = error as { response?: { status: number; data: unknown }; message: string };
    console.error(`Error fetching authors for ${owner}/${repo}:`, err.message);

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
