const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
const User = require('../models/User');

router.post('/', auth, async (req, res) => {
  const { from, to } = req.body;

  if (!from || !to) {
    return res.status(400).json({ msg: 'Please provide "from" and "to" currencies.' });
  }

  const favoritePair = `${from.toUpperCase()}-${to.toUpperCase()}`;

  try {
    const user = await User.findById(req.user.id);
    
    // Using $addToSet to prevent duplicates
    await user.updateOne({ $addToSet: { favorites: favoritePair } });

    res.json({ msg: 'Favorite added successfully.', favorites: [...user.favorites, favoritePair] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user.favorites);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/', auth, async (req, res) => {
    const { from, to } = req.body;

    if (!from || !to) {
        return res.status(400).json({ msg: 'Please provide "from" and "to" currencies to remove' });
    }

    const favoritePair = `${from.toUpperCase()}-${to.toUpperCase()}`;

    try {
        const user = await User.findById(req.user.id);

        await user.updateOne({ $pull: { favorites: favoritePair }});

        res.json({ msg: 'Favorite removed successfully '});
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;