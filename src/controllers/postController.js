const db = require('../config/db');

exports.getAllPosts = async (req, res) => {
  try {
    // Get approved posts, ordered by date descending
    const result = await db.query("SELECT * FROM posts WHERE status = 'approved' ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { targetName, profession, location, description } = req.body;
    // Handle file upload if present
    let imageUrl = null;
    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    } else {
        // Use random placeholder if no image provided
        imageUrl = "https://images.unsplash.com/photo-1505322022379-7c3353ee6291?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
    }

    const queryText = `
      INSERT INTO posts (target_name, profession, location, description, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [targetName, profession, location, description, imageUrl];
    
    const result = await db.query(queryText, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin only: Get all posts (including hidden)
exports.getAdminPosts = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM posts ORDER BY date DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM posts WHERE id = $1", [id]);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

exports.likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query("UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes", [id]);
        res.json({ likes: result.rows[0].likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
