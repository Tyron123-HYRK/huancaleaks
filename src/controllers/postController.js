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
    // Feature disabled for resource optimization
    res.status(200).json({ message: "Feature disabled" });
    /*
    try {
        const { id } = req.params;
        const result = await db.query("UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes", [id]);
        res.json({ likes: result.rows[0].likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
    */
}

// Get Trends (Top locations and professions)
exports.getTrends = async (req, res) => {
    try {
        // Get top 5 locations
        const locations = await db.query(`
            SELECT location as name, COUNT(*) as count 
            FROM posts 
            WHERE status = 'approved'
            GROUP BY location 
            ORDER BY count DESC 
            LIMIT 5
        `);

        // Get top 5 professions/careers
        const professions = await db.query(`
            SELECT profession as name, COUNT(*) as count 
            FROM posts 
            WHERE status = 'approved'
            GROUP BY profession 
            ORDER BY count DESC 
            LIMIT 5
        `);

        res.json({
            locations: locations.rows,
            professions: professions.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
